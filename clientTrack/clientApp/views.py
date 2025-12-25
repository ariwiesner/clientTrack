from rest_framework import viewsets
from .models import Client, System, AmountToPay
from .serializers import ClientSerializer, SystemSerializer, AmountToPaySerializer

#ModelViewSet gives automatically list, create, retrieve, update, destroy
class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer

class SystemViewSet(viewsets.ModelViewSet):
    queryset = System.objects.all()
    serializer_class = SystemSerializer

class TimeEntryViewSet(viewsets.ModelViewSet):
    queryset = AmountToPay.objects.all()
    serializer_class = AmountToPaySerializer