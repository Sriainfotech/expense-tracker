from decimal import Decimal
from rest_framework import serializers
from accounts.models import User
from .models import Investment, Expense, ExpenseCategory

class UserMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "full_name", "email"]

class ExpenseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseCategory
        fields = ["id", "name", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Category name is required.")
        if ExpenseCategory.objects.filter(name__iexact=value).exists():
            raise serializers.ValidationError("This category already exists.")
        return value

class InvestmentSerializer(serializers.ModelSerializer):
    user_detail = UserMiniSerializer(source="user", read_only=True)

    class Meta:
        model = Investment
        fields = [
            "id", "user", "user_detail", "investor_source", "amount",
            "investment_date", "description", "status", "created_at", "updated_at"
        ]
        read_only_fields = ["id", "created_at", "updated_at", "user_detail"]

    def validate_user(self, user):
        if user.role != User.Role.STANDARD:
            raise serializers.ValidationError("Investment must belong to a Standard User.")
        if user.status != User.Status.ACTIVE:
            raise serializers.ValidationError("Cannot create financial records for an inactive user.")
        return user

    def validate_amount(self, amount):
        if amount <= Decimal("0"):
            raise serializers.ValidationError("Investment amount must be greater than 0.")
        return amount

class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = [
            "id", "category", "description", "amount",
            "expense_date", "payment_method", "status", "created_at", "updated_at"
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_category(self, value):
        if not value.strip():
            raise serializers.ValidationError("Expense category is required.")
        return value

    def validate_payment_method(self, value):
        if not value.strip():
            raise serializers.ValidationError("Payment method is required.")
        return value

    def validate_amount(self, amount):
        if amount <= Decimal("0"):
            raise serializers.ValidationError("Expense amount must be greater than 0.")
        return amount

class UserFinancialSummarySerializer(serializers.Serializer):
    user = UserMiniSerializer()
    total_investment = serializers.DecimalField(max_digits=14, decimal_places=2)
    total_expenses = serializers.DecimalField(max_digits=14, decimal_places=2)
    remaining_balance = serializers.DecimalField(max_digits=14, decimal_places=2)
