from django.contrib import admin
from .models import Investment, Expense, ExpenseCategory

@admin.register(ExpenseCategory)
class ExpenseCategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "created_by", "created_at")
    search_fields = ("name",)

@admin.register(Investment)
class InvestmentAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "investor_source", "amount", "investment_date", "status", "created_at")
    list_filter = ("status", "investment_date")
    search_fields = ("user__full_name", "user__email", "investor_source", "description")

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "category", "amount", "expense_date", "payment_method", "status", "created_at")
    list_filter = ("status", "category", "payment_method", "expense_date")
    search_fields = ("user__full_name", "user__email", "category", "description")
