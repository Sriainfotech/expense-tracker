from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import User
from .permissions import IsAdminRole
from .serializers import LoginSerializer, UserSerializer, UserCreateSerializer, UserUpdateSerializer

class LoginView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserSerializer(user).data,
        })

class MeView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class UserListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdminRole]
    queryset = User.objects.filter(role=User.Role.STANDARD).order_by("-created_at")
    filterset_fields = ["status"]
    search_fields = ["full_name", "email"]
    ordering_fields = ["created_at", "full_name", "email"]
    pagination_class = None

    def get_serializer_class(self):
        return UserCreateSerializer if self.request.method == "POST" else UserSerializer

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminRole]
    queryset = User.objects.filter(role=User.Role.STANDARD)

    def get_serializer_class(self):
        return UserUpdateSerializer if self.request.method in ["PUT", "PATCH"] else UserSerializer

    def perform_destroy(self, instance):
        instance.delete()
