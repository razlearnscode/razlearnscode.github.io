# Generated by Django 5.2 on 2025-04-25 08:14

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("plog", "0007_exercise_user"),
    ]

    operations = [
        migrations.AddField(
            model_name="session",
            name="log",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="sessions",
                to="plog.log",
            ),
        ),
    ]
