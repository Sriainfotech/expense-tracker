import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ledgerly.settings")
import django
django.setup()

from accounts.models import User
from finance.models import Investment, Expense, ExpenseCategory
from datetime import date

DEFAULT_EXPENSE_CATEGORIES = [
    "Travel", "Operations", "Marketing", "Payroll", "Equipment", "Software",
    "Utilities", "Office", "Other",
]
for name in DEFAULT_EXPENSE_CATEGORIES:
    ExpenseCategory.objects.get_or_create(name=name)

def upsert_user(full_name, email, password, role):
    user, _ = User.objects.get_or_create(email=email, defaults={
        "full_name": full_name,
        "role": role,
        "status": User.Status.ACTIVE,
    })
    user.full_name = full_name
    user.role = role
    user.status = User.Status.ACTIVE
    user.set_password(password)
    user.save()
    return user

admin = upsert_user("Administrator", "admin@example.com", "admin123", User.Role.ADMIN)
kavya = upsert_user("Kavya", "user@example.com", "user123", User.Role.STANDARD)
ravi = upsert_user("Ravi", "ravi@example.com", "ravi12345", User.Role.STANDARD)

if not Investment.objects.filter(user=kavya).exists():
    Investment.objects.create(user=kavya, investor_source="Company Capital", amount=50000, investment_date=date(2026, 8, 1), description="Initial capital", status="active")

if not Investment.objects.filter(user=ravi).exists():
    Investment.objects.create(user=ravi, investor_source="Personal Capital", amount=75000, investment_date=date(2026, 8, 2), description="Initial capital", status="active")

# Expenses are shared/company-wide — not tied to any particular user.
if not Expense.objects.filter(category="Travel").exists():
    Expense.objects.create(category="Travel", description="Business travel", amount=10000, expense_date=date(2026, 8, 13), payment_method="UPI", status="active")
if not Expense.objects.filter(category="Office").exists():
    Expense.objects.create(category="Office", description="Office supplies", amount=20000, expense_date=date(2026, 8, 12), payment_method="Card", status="active")

print("Demo data created.")
print("Admin: admin@example.com / admin123")
print("Kavya: user@example.com / user123")
print("Ravi: ravi@example.com / ravi12345")
