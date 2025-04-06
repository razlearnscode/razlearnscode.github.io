from django.db import models

# Create your models here.
class Deck(models.Model):
    deck_id = models.CharField(max_length=10, unique=True)  # e.g. "A2b"
    name = models.CharField(max_length=100, blank=True)     # Optional: human-readable name

    def __str__(self):
        return self.name or self.deck_id


class Card(models.Model):

    TYPES = [
        ('TRAINER', 'Trainer'),
        ('POKÉMON', 'Pokémon'),
    ]

    STAGES = [
        ("BASIC", "Basic"),
        ("STAGE1", "Stage 1"),
        ("STAGE2", "Stage 2"),
        ("OTHERS", "Others"),
    ]
    
    card_id = models.IntegerField()  # Unique within the deck
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=64, choices=TYPES, default='Pokémon', blank=True, null=True)
    stage = models.CharField(max_length=64, choices=STAGES, default='Pokémon', blank=True, null=True)
    image_url = models.URLField(max_length=500)
    local_image_path = models.CharField(max_length=255, blank=True, null=True)
    
    deck = models.ForeignKey(Deck, on_delete=models.CASCADE, related_name='cards')

    class Meta:
            unique_together = ('deck', 'card_id')

    def __str__(self):
        return f"{self.name} (Deck {self.deck.deck_id} #{self.card_id})"
    
    

class Wishlist(models.Model):

    # Use 1 to 1 relationship to make sure that no duplicated cards are added

    card = models.OneToOneField(Card, on_delete=models.CASCADE, related_name='wishlist_entry')
    added_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.card.name} in wishlist"