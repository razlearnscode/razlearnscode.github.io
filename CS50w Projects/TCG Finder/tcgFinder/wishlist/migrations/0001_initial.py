# Generated by Django 5.1.6 on 2025-04-06 11:10

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Deck",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("deck_id", models.CharField(max_length=10, unique=True)),
                ("name", models.CharField(blank=True, max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name="Card",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("card_id", models.IntegerField()),
                ("name", models.CharField(max_length=100)),
                (
                    "type",
                    models.CharField(
                        blank=True,
                        choices=[("TRAINER", "Trainer"), ("POKÉMON", "Pokémon")],
                        default="Pokémon",
                        max_length=64,
                        null=True,
                    ),
                ),
                (
                    "stage",
                    models.CharField(
                        blank=True,
                        choices=[
                            ("BASIC", "Basic"),
                            ("STAGE1", "Stage 1"),
                            ("STAGE2", "Stage 2"),
                            ("OTHERS", "Others"),
                        ],
                        default="Pokémon",
                        max_length=64,
                        null=True,
                    ),
                ),
                ("image_url", models.URLField(max_length=500)),
                (
                    "local_image_path",
                    models.CharField(blank=True, max_length=255, null=True),
                ),
                (
                    "deck",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="cards",
                        to="wishlist.deck",
                    ),
                ),
            ],
            options={
                "unique_together": {("deck", "card_id")},
            },
        ),
        migrations.CreateModel(
            name="Wishlist",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("added_at", models.DateTimeField(auto_now_add=True)),
                (
                    "card",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="wishlist_entry",
                        to="wishlist.card",
                    ),
                ),
            ],
        ),
    ]
