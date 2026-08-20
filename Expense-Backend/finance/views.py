from django.db.models import Sum, Max, Count
from rest_framework import viewsets, status as http_status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from accounts.models import User
from accounts.permissions import IsAdminRole, IsStandardUser
from .models import Investment, Expense, ExpenseCategory
from .permissions import IsAdminOrReadOnlyOwner, IsAdminOrReadOnly
from .serializers import (
    InvestmentSerializer, ExpenseSerializer,
    UserMiniSerializer, ExpenseCategorySerializer,
)
from .services import user_financial_summary, overall_financial_summary

class ExpenseCategoryViewSet(viewsets.ModelViewSet):
    """
    Read/create only — categories are shared across every user, so editing or
    deleting one here could silently break other people's expense history.
    Any authenticated user (admin or standard) can list the catalog and add a
    new category inline from the expense form.
    """
    serializer_class = ExpenseCategorySerializer
    permission_classes = [IsAuthenticated]
    queryset = ExpenseCategory.objects.all()
    http_method_names = ["get", "post", "head", "options"]
    pagination_class = None

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class InvestmentViewSet(viewsets.ModelViewSet):
    serializer_class = InvestmentSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnlyOwner]
    filterset_fields = ["user", "status", "investment_date"]
    search_fields = ["investor_source", "description", "user__full_name", "user__email"]
    ordering_fields = ["amount", "investment_date", "created_at"]
    pagination_class = None

    def get_queryset(self):
        qs = Investment.objects.select_related("user")
        if self.request.user.role == User.Role.ADMIN:
            return qs.all()
        return qs.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        if request.user.role != User.Role.ADMIN:
            return Response({"detail": "Standard users cannot create investments."}, status=http_status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if request.user.role != User.Role.ADMIN:
            return Response({"detail": "Standard users cannot update investments."}, status=http_status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        if request.user.role != User.Role.ADMIN:
            return Response({"detail": "Standard users cannot update investments."}, status=http_status.HTTP_403_FORBIDDEN)
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if request.user.role != User.Role.ADMIN:
            return Response({"detail": "Standard users cannot delete investments."}, status=http_status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def summary(self, request):
        qs = self.get_queryset().filter(status=Investment.Status.ACTIVE)
        data = qs.aggregate(total=Sum("amount"), count=Count("id"))
        latest = qs.order_by("-investment_date", "-created_at").first()
        return Response({
            "total_investment": data["total"] or 0,
            "number_of_investments": data["count"],
            "latest_investment": InvestmentSerializer(latest).data if latest else None,
        })

class ExpenseViewSet(viewsets.ModelViewSet):
    """
    Expenses are shared/company-wide (see the Expense model docstring) — every
    authenticated user can list/view the full expense history; only admin can
    create, update, or delete.
    """
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    filterset_fields = ["category", "payment_method", "status", "expense_date"]
    search_fields = ["category", "description", "payment_method"]
    ordering_fields = ["amount", "expense_date", "created_at"]
    pagination_class = None

    def get_queryset(self):
        return Expense.objects.all()

    def create(self, request, *args, **kwargs):
        if request.user.role != User.Role.ADMIN:
            return Response({"detail": "Standard users cannot create expenses."}, status=http_status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if request.user.role != User.Role.ADMIN:
            return Response({"detail": "Standard users cannot update expenses."}, status=http_status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        if request.user.role != User.Role.ADMIN:
            return Response({"detail": "Standard users cannot update expenses."}, status=http_status.HTTP_403_FORBIDDEN)
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if request.user.role != User.Role.ADMIN:
            return Response({"detail": "Standard users cannot delete expenses."}, status=http_status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def summary(self, request):
        qs = self.get_queryset().filter(status=Expense.Status.ACTIVE)
        data = qs.aggregate(total=Sum("amount"), count=Count("id"), highest=Max("amount"))
        return Response({
            "total_expenses": data["total"] or 0,
            "number_of_expenses": data["count"],
            "highest_expense": data["highest"] or 0,
        })

class FinancialSummaryViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        if request.user.role == User.Role.ADMIN:
            data = overall_financial_summary()
        else:
            data = user_financial_summary(request.user)
        return Response(data)

    @action(detail=False, methods=["get"], url_path="users")
    def users_summary(self, request):
        if request.user.role != User.Role.ADMIN:
            return Response({"detail": "Administrator access is required."}, status=http_status.HTTP_403_FORBIDDEN)

        users = User.objects.filter(role=User.Role.STANDARD).order_by("full_name")
        result = []
        for user in users:
            summary = user_financial_summary(user)
            result.append({
                "user": UserMiniSerializer(user).data,
                **summary,
            })
        return Response(result)

    @action(detail=True, methods=["get"], url_path="user")
    def user_summary(self, request, pk=None):
        if request.user.role != User.Role.ADMIN:
            return Response({"detail": "Administrator access is required."}, status=http_status.HTTP_403_FORBIDDEN)
        try:
            user = User.objects.get(pk=pk, role=User.Role.STANDARD)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=http_status.HTTP_404_NOT_FOUND)
        return Response({
            "user": UserMiniSerializer(user).data,
            **user_financial_summary(user),
        })

class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        if request.user.role == User.Role.ADMIN:
            summary = overall_financial_summary()
            return Response({
                **summary,
                "total_users": User.objects.filter(role=User.Role.STANDARD).count(),
            })
        return Response(user_financial_summary(request.user))
