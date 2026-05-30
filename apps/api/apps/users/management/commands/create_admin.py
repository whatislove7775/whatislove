import hashlib
from django.core.management.base import BaseCommand
from apps.users.models import User


class Command(BaseCommand):
    help = "Create default admin user (root / root)"

    def handle(self, *args, **options):
        salt = "ANON_PSY_EMAIL_SALT_v1"
        email = "root@localhost"
        email_hash = hashlib.sha256(f"{salt}:{email}".encode()).hexdigest()

        if User.objects.filter(email_hash=email_hash).exists():
            self.stdout.write("Admin already exists, skipping.")
            return

        user = User(
            email_hash=email_hash,
            alias="root",
            role=User.Role.ADMIN,
            is_staff=True,
            is_superuser=True,
        )
        user.set_password("root")
        user.save()
        self.stdout.write(self.style.SUCCESS(
            f"Admin created. Login: {email_hash[:16]}... / root"
        ))
