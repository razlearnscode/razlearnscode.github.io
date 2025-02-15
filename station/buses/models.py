from django.db import models

# Create your models here.

class MRTStation(models.Model):
    code = models.CharField(max_length=3)
    address = models.CharField(max_length=64)
    color = models.CharField(max_length=64)

    def __str__(self):
        return f"{self.id} - {self.address} - Color Code({self.color})"

class Buses(models.Model):

    #specify all the properties that a bus has

    # start = models.CharField(max_length=64)
    # end = models.CharField(max_length=64)
    start = models.ForeignKey(MRTStation, on_delete=models.CASCADE, related_name="departure")
    end = models.ForeignKey(MRTStation, on_delete=models.CASCADE, related_name="arrival")
    stops = models.IntegerField()

    def __str__(self):
        return f"{self.id}: {self.start} to {self.end}"


class Passengers(models.Model):
    first_name = models.CharField(max_length=64)
    last_name = models.CharField(max_length=64)
    
    # many-to-many relationships with Buses 
    # (many passengers can have multiple bus)
    # blank = true to allow the possibility of passengers with no flight
    # related_name = passengers, so that bus can have attributes 
    # passengers to find the corresponding passenger
    assigned_bus = models.ManyToManyField(Buses, blank=True, related_name="passenger")

    def __str__(self):
        return f"{self.first_name} {self.last_name}"