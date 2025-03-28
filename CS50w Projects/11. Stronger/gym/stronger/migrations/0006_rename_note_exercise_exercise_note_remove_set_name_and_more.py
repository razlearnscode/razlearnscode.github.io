# Generated by Django 5.1.6 on 2025-03-23 08:19

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("stronger", "0005_set_completed_at_set_desc"),
    ]

    operations = [
        migrations.RenameField(
            model_name="exercise",
            old_name="note",
            new_name="exercise_note",
        ),
        migrations.RemoveField(
            model_name="set",
            name="name",
        ),
        migrations.RemoveField(
            model_name="workout",
            name="start_date",
        ),
        migrations.AlterField(
            model_name="set",
            name="completed_at",
            field=models.DateTimeField(
                auto_now_add=True, default=django.utils.timezone.now
            ),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name="set",
            name="desc",
            field=models.CharField(default="", max_length=255),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name="workout",
            name="completed_at",
            field=models.DateTimeField(
                auto_now_add=True, default=django.utils.timezone.now
            ),
            preserve_default=False,
        ),
    ]
