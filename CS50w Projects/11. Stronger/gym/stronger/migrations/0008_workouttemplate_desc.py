# Generated by Django 5.1.6 on 2025-04-03 15:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("stronger", "0007_remove_workouttemplate_exercises_exercisetemplate_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="workouttemplate",
            name="desc",
            field=models.CharField(blank=True, max_length=500, null=True),
        ),
    ]
