from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from .models import ContactMessage


class ContactMessageAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.User = get_user_model()
        self.admin = self.User.objects.create_user(username='admin1', password='pass12345', role='admin')

    def test_contact_message_create_and_admin_list(self):
        # Anonymous can create
        r = self.client.post('/api/contact/', {"name": "Ali", "email": "ali@test.com", "message": "سلام"}, format='json')
        self.assertEqual(r.status_code, 201)
        self.assertEqual(ContactMessage.objects.count(), 1)

        # Anonymous cannot list
        r = self.client.get('/api/contact/')
        self.assertIn(r.status_code, [401, 403])

        # Admin can list
        self.client.force_authenticate(user=self.admin)
        r = self.client.get('/api/contact/')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(len(r.json()), 1)
        self.assertEqual(r.json()[0]['email'], 'ali@test.com')
