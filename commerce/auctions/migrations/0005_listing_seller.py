# Generated by Django 5.1.6 on 2025-02-27 06:06

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("auctions", "0004_watchlist"),
    ]

    operations = [
        migrations.AddField(
            model_name="listing",
            name="seller",
            field=models.ForeignKey(
                default=1,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="seller",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
