from django.core.management.base import BaseCommand
from wishlist.models import Card


class Command(BaseCommand):
    help = 'Clean and normalize type and stage values for existing cards'

    def handle(self, *args, **options):
        updated = 0

        for card in Card.objects.all():
            original_type = card.type
            original_stage = card.stage

            # Fix type
            type_value = (card.type or "").strip().lower()
            if "trainer" in type_value:
                card.type = "TRAINER"
            elif "pokemon" in type_value:
                card.type = "POKÉMON"
            else:
                card.type = None

            # Fix stage
            stage_value = (card.stage or "").strip().lower()
            if "basic" in stage_value:
                card.stage = "BASIC"
            elif "stage 1" in stage_value:
                card.stage = "STAGE1"
            elif "stage 2" in stage_value:
                card.stage = "STAGE2"
            elif "supporter" in stage_value:
                card.stage = "OTHERS"
            else:
                card.stage = None

            if card.type != original_type or card.stage != original_stage:
                card.save()
                updated += 1
                self.stdout.write(f"✅ Updated: {card.name} (id: {card.id})")

        self.stdout.write(self.style.SUCCESS(f"\n🎉 Cleanup complete! {updated} cards updated."))
