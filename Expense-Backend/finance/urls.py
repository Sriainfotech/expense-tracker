from rest_framework.routers import DefaultRouter
from .views import (
    InvestmentViewSet, ExpenseViewSet, FinancialSummaryViewSet, DashboardViewSet,
    ExpenseCategoryViewSet,
)

router = DefaultRouter()
router.register("investments", InvestmentViewSet, basename="investment")
router.register("expenses", ExpenseViewSet, basename="expense")
router.register("expense-categories", ExpenseCategoryViewSet, basename="expense-category")
router.register("balance", FinancialSummaryViewSet, basename="balance")
router.register("dashboard", DashboardViewSet, basename="dashboard")

urlpatterns = router.urls
