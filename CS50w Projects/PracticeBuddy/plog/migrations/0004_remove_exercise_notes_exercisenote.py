# Generated by Django 5.2 on 2025-04-21 14:53

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("plog", "0003_log_template"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="exercise",
            name="notes",
        ),
        migrations.CreateModel(
            name="ExerciseNote",
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
                ("content", models.TextField(blank=True)),
                ("pinned", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "exercise",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="notes",
                        to="plog.exercise",
                    ),
                ),
                (
                    "log",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="exercise_notes",
                        to="plog.log",
                    ),
                ),
            ],
            options={
                "ordering": ["-pinned", "-created_at"],
            },
        ),
    ]
