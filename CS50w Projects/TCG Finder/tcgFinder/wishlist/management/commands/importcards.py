import json
import shutil
from pathlib import Path

from django.core.management.base import BaseCommand
from django.conf import settings

from wishlist.models import Deck, Card


class Command(BaseCommand):
    help = 'Import card data from a JSON file and move images to media/'

    def add_arguments(self, parser):
        parser.add_argument(
            '--file',
            type=str,
            help='Path to the JSON file (e.g. cards_data.json)',
            default='A2.json'
        )

    def handle(self, *args, **options):
        file_path = Path(options['file'])

        if not file_path.exists():
            self.stdout.write(self.style.ERROR(f"❌ File not found: {file_path}"))
            return

        try:
            with open(file_path, "r") as f:
                data = json.load(f)
        except json.JSONDecodeError as e:
            self.stdout.write(self.style.ERROR(f"❌ JSON decode error: {e}"))
            return

        imported = 0
        skipped = 0
        copied_images = 0

        for entry in data:
            # Get or create deck
            deck, _ = Deck.objects.get_or_create(deck_id=entry["deck_id"])

            # Clean and normalize fields
            name = entry["name"]
            card_id = entry["card_id"]

            # Normalize and map type
            raw_type = entry["type"].strip().lower()
            if 'trainer' in raw_type:
                type_value = 'TRAINER'
            elif 'pokemon' in raw_type:
                type_value = 'POKÉMON'
            else:
                type_value = None

            # Normalize and map stage
            raw_stage = (entry.get("stage") or "").lstrip("- ").strip().lower()
            if 'basic' in raw_stage:
                stage_value = 'BASIC'
            elif 'stage 1' in raw_stage:
                stage_value = 'STAGE1'
            elif 'stage 2' in raw_stage:
                stage_value = 'STAGE2'
            elif 'supporter' in raw_stage:
                stage_value = 'OTHERS'
            else:
                stage_value = None


            image_url = entry["image_url"]

            # Handle local image copying
            local_image_path = entry.get("local_image_path", "")
            image_filename = Path(local_image_path).name
            media_relative_path = f"card_images/{image_filename}"
            media_full_path = Path(settings.MEDIA_ROOT) / media_relative_path

            # Source path: where your scraped images are currently located
            source_path = Path("card_images") / image_filename
            if source_path.exists() and not media_full_path.exists():
                media_full_path.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy(source_path, media_full_path)
                copied_images += 1

            # Create card
            card, created = Card.objects.get_or_create(
                deck=deck,
                card_id=card_id,
                defaults={
                    "name": name,
                    "type": type_value,
                    "stage": stage_value,
                    "image_url": image_url,
                    "local_image_path": media_relative_path
                }
            )

            if created:
                imported += 1
                self.stdout.write(self.style.SUCCESS(f"✅ Created: {card.name}"))
            else:
                skipped += 1
                self.stdout.write(self.style.WARNING(f"⏭️ Skipped (exists): {card.name}"))

        self.stdout.write(self.style.SUCCESS(
            f"\n🎉 Import finished! Cards imported: {imported}, skipped: {skipped}, images copied: {copied_images}"
        ))
