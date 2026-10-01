from datetime import timedelta

from django.utils import timezone

from datasets.models import Dataset


def delete_expired_datasets():
    expired = Dataset.objects.filter(created_at__lte=timezone.now() - timedelta(hours=24))
    count = expired.count()
    expired.delete()
    return count
