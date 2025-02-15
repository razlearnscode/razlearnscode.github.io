from django import forms
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

test_quotes = [
    # "Khong co tien cap dat ma an",
    # "Dinh noc, kich tran, bay phap phoi",
    # "Can cu bu sieng nang, co lam thi moi co an"
]

# Create a new class that inherits from forms.Form
class NewTaskForm(forms.Form):
    # CharField because i want this to be character
    quote1 = forms.CharField(label="New Task")


def add(request):
    
    # Check if the page receive any Post method (e.g. from the form)
    if request.method == "POST": 
        
        # Then take all the information from the request to create a new form variable
        form = NewTaskForm(request.POST)
        if form.is_valid():
            
            # give me access to all the data the user submits. Use that to create a new quote
            # (I use quote1 here to make it clearer that this is referencing the name of my class definition above)
            new_quote = form.cleaned_data["quote1"]
            request.session["test_quotes"] += [new_quote]

            # To redirect the user to the homepage after successfully submitting a new quote
            return HttpResponseRedirect(reverse("daoly:index"))

        else:
            return render(request, "daoly/addQuote.html", {
                
                # If no request, then just returns the existing form
                "form": form
            })

    
    return render(request, "daoly/addQuote.html", {
        
        # This means I want to pass into the add page this specific form
        "form": NewTaskForm()
    })



# Create your views here.
def index(request):
    
    # Used the below supposed I want to have each session (user) have a different set of quotes
    if "test_quotes" not in request.session:
        request.session["test_quotes"] = []
    
    return render(request, "daoly/index.html", {
        # Keep the below line if I want to have the same list of quotes for all users
        # "quotes": test_quotes

        # However, since I want each user to have a different set of quotes, i'll refer to the request session instead
        "quotes": request.session["test_quotes"]
    })
    
