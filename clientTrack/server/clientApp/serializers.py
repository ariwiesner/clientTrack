from rest_framework import serializers
from .models import Client, System, AmountToPay

class SystemSerializer(serializers.ModelSerializer):
    class Meta:
        model = System
        fields = '__all__'
class ClientSerializer(serializers.ModelSerializer):
    # this ReadOnlyField tells django to search for method with this name and show har return
    total_hours_unpaid = serializers.ReadOnlyField()
    amount_to_pay = serializers.ReadOnlyField()
    # this SerializerMethodField tells django to search for a function that do the logic for the breakdown field. 
    breakdown = serializers.SerializerMethodField()
    # the list of systems for client
    systems = SystemSerializer(many=True, read_only=True, source='systems_set')
    
    class Meta:
        model = Client
        fields = '__all__'
    
    def get_breakdown(self, obj):
        return obj.time_breakdown()
    
class AmountToPaySerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.first_name', read_only=True)
    system_name = serializers.CharField(source='system.name', read_only=True)

    class Meta:
        model = AmountToPay
        fields = '__all__'
