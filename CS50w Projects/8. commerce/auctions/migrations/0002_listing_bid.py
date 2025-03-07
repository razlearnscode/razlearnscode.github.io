# Generated by Django 5.1.6 on 2025-02-16 05:31

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("auctions", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Listing",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("title", models.CharField(max_length=255)),
                ("description", models.TextField()),
                ("starting_bid", models.DecimalField(decimal_places=2, max_digits=10)),
                (
                    "highest_bid",
                    models.DecimalField(
                        blank=True, decimal_places=2, max_digits=10, null=True
                    ),
                ),
                ("imageURL", models.URLField(blank=True, null=True)),
                (
                    "category",
                    models.CharField(
                        blank=True,
                        choices=[
                            ("TOYS", "Toys"),
                            ("FASHION", "Fashion"),
                            ("BOOKS", "Books"),
                            ("ELECTRONICS", "Electronics"),
                            ("HOME", "Home & Living"),
                            ("OTHERS", "Others"),
                        ],
                        default="OTHERS",
                        max_length=64,
                        null=True,
                    ),
                ),
                (
                    "state",
                    models.CharField(
                        choices=[
                            ("UNLISTED", "Unlisted"),
                            ("ACTIVE", "Active"),
                            ("SOLD", "Sold"),
                        ],
                        default="UNLISTED",
                        max_length=64,
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="Bid",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("bid_amount", models.DecimalField(decimal_places=2, max_digits=10)),
                ("placed_at", models.DateTimeField(auto_now_add=True)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "listing",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="bids",
                        to="auctions.listing",
                    ),
                ),
            ],
            options={
                "ordering": ["-bid_amount"],
            },
        ),
    ]
