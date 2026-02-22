from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('parkings', '0003_alter_parkingreview_unique_together_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='parking',
            name='image_url',
            field=models.CharField(blank=True, max_length=300, null=True),
        ),
    ]
