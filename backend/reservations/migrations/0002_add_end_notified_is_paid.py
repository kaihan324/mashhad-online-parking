from django.db import migrations, models



class Migration(migrations.Migration):



    dependencies = [

        ('reservations', '0001_initial'),

    ]



    operations = [

        migrations.AddField(

            model_name='reservation',

            name='end_notified',

            field=models.BooleanField(default=False),

        ),

        migrations.AddField(

            model_name='reservation',

            name='is_paid',

            field=models.BooleanField(default=False),

        ),

    ]

