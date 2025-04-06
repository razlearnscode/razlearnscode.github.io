from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.core.serializers.json import DjangoJSONEncoder
import json
from wishlist.models import Deck


# Create your views here.
def index(request):
    decks = Deck.objects.prefetch_related('cards').all()

    data = []
    for deck in decks:
        data.append({
            "deck_id": deck.name,
            "cards": [
                {
                    "id": card.id,
                    "name": card.name,
                    "type": card.type,
                    "stage": card.stage,
                    "image_url": card.image_url,
                    "local_image_path": card.local_image_path
                }
                for card in deck.cards.all()
            ]
        })

    # Pass as JSON string
    return render(request, "wishlist/index.html", {
        "decks_json": json.dumps(data, cls=DjangoJSONEncoder)
    })