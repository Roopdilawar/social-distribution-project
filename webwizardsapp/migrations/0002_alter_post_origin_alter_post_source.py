# Generated by Django 5.0.1 on 2024-04-04 20:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('webwizardsapp', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='post',
            name='origin',
            field=models.CharField(default='https://social-distribution-95d43f28bb8f.herokuapp.com', max_length=200),
        ),
        migrations.AlterField(
            model_name='post',
            name='source',
            field=models.URLField(default='https://social-distribution-95d43f28bb8f.herokuapp.com'),
        ),
    ]
