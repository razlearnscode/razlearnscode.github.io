from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.urls import reverse
from .models import Buses, Passengers

# Create your views here.

def index(request):
    return render(request, "buses/index.html", {
        "buses": Buses.objects.all()
    })

def buses(request, bus_id):
    bus = Buses.objects.get(pk=bus_id)

    # alternatively, I can also replace id with "pk" interchangably, 
    # pk stands for primary key
    # bus = Buses.objects.get(id=bus_id)

    # Note that buses here refers to the folder in the templates folder
    return render(request, "buses/bus.html", {
        # here I want to pass the bus input to this page
        "bus": bus,
        "passengers": bus.passenger.all(),

        # now i only want to show passengers who have already
        # been assigned to this bus
        "non_passengers": Passengers.objects.exclude(assigned_bus=bus).all()
    })
    
def book(request, bus_id):
    
    # Since we are going to use this function to manipulate
    # the data for bus (by adding customers), we will need
    # to use a Post request here to get the data from the form

    if request.method == "POST":
        bus = Buses.objects.get(pk=bus_id)
        
        # the below means that the data about which passengerID we
        # want to register on this bus will be passed via a form which
        # input is called passengers
        passenger = Passengers.objects.get(pk=int(request.POST["passenger"]))
        
        # Adding a new passenger to the bus
        passenger.assigned_bus.add(bus)

        # redirect user back to the assigned bus html and the corresponding
        # bus.id (args = arguments)

        # *** Notice here, the args=(bus.id,), the comma is used to make
        # (bus.id,) a tuple
        return HttpResponseRedirect(reverse("bus", args=(bus.id,)))