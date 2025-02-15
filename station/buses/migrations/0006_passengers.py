# Generated by Django 5.1.6 on 2025-02-13 08:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("buses", "0005_alter_buses_end_alter_buses_start"),
    ]

    operations = [
        migrations.CreateModel(
            name="Passengers",
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
                ("first_name", models.CharField(max_length=64)),
                ("last_name", models.CharField(max_length=64)),
                (
                    "assigned_bus",
                    models.ManyToManyField(
                        blank=True, related_name="passenger", to="buses.buses"
                    ),
                ),
            ],
        ),
    ]
