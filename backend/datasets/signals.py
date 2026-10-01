from django.db.models.signals import pre_delete
from django.dispatch import receiver

from .models import Dataset


@receiver(pre_delete, sender=Dataset)
def delete_dataset_file(sender, instance, **kwargs):
    # Fail the deletion if storage fails, so cleanup can retry the record.
    if instance.file:
        instance.file.delete(save=False)
