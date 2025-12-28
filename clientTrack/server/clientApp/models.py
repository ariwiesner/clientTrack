from datetime import timedelta
from decimal import Decimal
from django.db import models
from django.db.models import Sum, F, ExpressionWrapper, fields

class Client(models.Model):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    address = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=10, null=True, blank=True)
    job = models.CharField(max_length=30)
    status = models.CharField(max_length=30)
    # how much we get paid for hour
    hourly_rate = models.DecimalField(max_digits=6, decimal_places=2)

    def __str__(self):
        return f'{self.first_name, self.last_name}'
    
    @property
    def total_hours_unpaid(self):
        '''
        this function is calculating the hours we dont get paid for them.
        the decorator 'property' allow us to save this method as a field in the db -
        instead of creating field called total_hours_unpaid that need to change every time we working on this client, 
        this function calculate the amount for us and save the real amount in the db  
        '''
        unpaid_work = self.session.filter(is_billed=False, end_time__isnull=False)
        # aggregate returns dictionary
        duration_qs = unpaid_work.aggregate(
            total_duration=Sum(
                ExpressionWrapper(
                    F('end_time') - F('start_time'),
                    output_field=fields.DurationField() 
                )
            )
        )
        total_td = duration_qs.get('total_duration') or timedelta(0)
        
        #convert the total duration from seconds to hours (divided by 3600 seconds in hour)
        return round(total_td.total_seconds() / 3600.0, 2)
    
    @property
    def amount_to_pay(self):
        """
        the function calculates the total amount based on hourly_rate for unpaid hours.
        """
        total_hours = self.total_hours_unpaid
        
        # multiply total hours by the stored hourly rate
        amount = Decimal(str(total_hours)) * self.hourly_rate
        
        # round the result to two decimal places for currency
        return round(amount, 2)
    
    def time_breakdown(self):
        unpaid_work = self.session.filter(is_billed=False, end_time__isnull=False)
        breakdown = unpaid_work.values('system__name').annotate(
            total_seconds = Sum(
                ExpressionWrapper(
                    F('end_time') - F('start_time'),
                    output_field=fields.DurationField()
                )
            )
            # show the longest time usage first
        ).order_by('-total_seconds')

        results = []
        for item in breakdown:
            total_hours = item['total_seconds'].total_seconds() / 3600.0
            
            results.append({
                'system': item['system__name'],
                'hours': round(total_hours, 2)
            })
            
        return results

class System(models.Model):
    name = models.CharField(max_length=30, unique=True)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='systems', blank=True, null=True)

    def __str__(self):
        return self.name

class AmountToPay(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='session')
    system = models.ForeignKey(System, on_delete=models.SET_NULL, null=True, related_name='system_used')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(blank=True, null=True)
    is_billed = models.BooleanField(default=False)

    def __str__(self):
        system_name = self.system.name if self.system else 'System Deleted' 
        return f'{self.client.first_name} on {system_name} ({self.start_time.strftime("%Y-%m-%d %H:%M")})'
