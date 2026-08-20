from decimal import Decimal
from django.db.models import Sum
from .models import Investment, Expense

def user_financial_summary(user):
    """
    total_investment is this user's own contribution. Expenses are shared —
    all capital sits in one pool — so total_expenses/remaining_balance are
    the company-wide figures, identical for every user.
    """
    investment_total = (
        Investment.objects.filter(user=user, status=Investment.Status.ACTIVE)
        .aggregate(total=Sum("amount"))["total"] or Decimal("0.00")
    )
    overall = overall_financial_summary()
    return {
        "total_investment": investment_total,
        "total_expenses": overall["total_expenses"],
        "remaining_balance": overall["remaining_balance"],
    }

def overall_financial_summary():
    investment_total = (
        Investment.objects.filter(status=Investment.Status.ACTIVE)
        .aggregate(total=Sum("amount"))["total"] or Decimal("0.00")
    )
    expense_total = (
        Expense.objects.filter(status=Expense.Status.ACTIVE)
        .aggregate(total=Sum("amount"))["total"] or Decimal("0.00")
    )
    return {
        "total_investment": investment_total,
        "total_expenses": expense_total,
        "remaining_balance": investment_total - expense_total,
    }
