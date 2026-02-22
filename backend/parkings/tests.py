from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Parking, ParkingReview


class ParkingReviewsAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.User = get_user_model()
        self.u1 = self.User.objects.create_user(username='u1', password='pass12345', role='user', email='u1@test.com')
        self.u2 = self.User.objects.create_user(username='u2', password='pass12345', role='user', email='u2@test.com')

        self.parking = Parking.objects.create(
            name='پارکینگ دانشگاه فردوسی',
            city='مشهد',
            address='بلوار وکیل آباد',
            total_capacity=100,
            price_per_hour=20000,
            image_url='/images/parkings/parking-ferdowsi-university.jpg',
        )

    def test_reviews_are_public_and_persist(self):
        # Anonymous can list parkings
        r = self.client.get('/api/parkings/')
        self.assertEqual(r.status_code, 200)

        # Anonymous can see reviews (empty)
        r = self.client.get(f'/api/parkings/{self.parking.id}/reviews/')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json(), [])

        # Anonymous cannot post review
        r = self.client.post(f'/api/parkings/{self.parking.id}/reviews/', {"rating": 5, "title": "عالی", "comment": "ok"}, format='json')
        self.assertIn(r.status_code, [401, 403])

        # User1 posts a review
        self.client.force_authenticate(user=self.u1)
        r = self.client.post(
            f'/api/parkings/{self.parking.id}/reviews/',
            {"rating": 5, "title": "عالی", "comment": "خیلی خوب بود"},
            format='json',
        )
        self.assertEqual(r.status_code, 201)
        review_id = r.json().get('id')
        self.assertTrue(ParkingReview.objects.filter(id=review_id).exists())

        # User1 posts again => should update same review (HTTP 200)
        r = self.client.post(
            f'/api/parkings/{self.parking.id}/reviews/',
            {"rating": 4, "title": "خوب", "comment": "بهتر شد"},
            format='json',
        )
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json().get('id'), review_id)

        # Another user can see it
        self.client.force_authenticate(user=None)
        r = self.client.get(f'/api/parkings/{self.parking.id}/reviews/')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(len(r.json()), 1)
        self.assertEqual(r.json()[0]['comment'], 'بهتر شد')
