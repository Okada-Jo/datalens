import time

from django.core.management.base import BaseCommand
from django.db import close_old_connections

from datasets.services.retention import delete_expired_datasets


class Command(BaseCommand):
    help = "Permanently delete uploads and metadata older than 24 hours."

    def add_arguments(self, parser):
        parser.add_argument("--watch", action="store_true", help="Continuously clean up every second.")

    def handle(self, *args, **options):
        while True:
            close_old_connections()
            try:
                count = delete_expired_datasets()
                if count or not options["watch"]:
                    self.stdout.write(f"Deleted {count} expired dataset(s).")
            except Exception as exc:
                if not options["watch"]:
                    raise
                self.stderr.write(f"Cleanup failed; retrying: {exc}")
            if not options["watch"]:
                return
            time.sleep(1)
