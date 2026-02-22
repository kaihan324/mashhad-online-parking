from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('parkings', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='parking',
            name='latitude',
            field=models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True),
        ),
        migrations.AddField(
            model_name='parking',
            name='longitude',
            field=models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True),
        ),
        migrations.AddField(
            model_name='parking',
            name='image_url',
            field=models.URLField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='parking',
            name='gallery',
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name='parking',
            name='description',
            field=models.TextField(blank=True, default=''),
        ),
        migrations.AddField(
            model_name='parking',
            name='amenities',
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.CreateModel(
            name='ParkingReview',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('rating', models.PositiveSmallIntegerField()),
                ('title', models.CharField(blank=True, default='', max_length=120)),
                ('comment', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('admin_reply', models.TextField(blank=True, default='')),
                ('replied_at', models.DateTimeField(blank=True, null=True)),
                ('parking', models.ForeignKey(on_delete=models.deletion.CASCADE, related_name='reviews', to='parkings.parking')),
                ('user', models.ForeignKey(on_delete=models.deletion.CASCADE, related_name='parking_reviews', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.AlterUniqueTogether(
            name='parkingreview',
            unique_together={('parking', 'user', 'comment')},
        ),
    ]
