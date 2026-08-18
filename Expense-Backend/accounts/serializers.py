from django.contrib.auth import authenticate
from django.db.models import Q
from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "full_name", "email", "role", "status", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["id", "full_name", "email", "password", "confirm_password", "role", "status"]
        read_only_fields = ["id"]
        extra_kwargs = {
            "role": {"required": True},
            "status": {"required": True},
        }

    def validate_role(self, value):
        if value != User.Role.STANDARD:
            raise serializers.ValidationError("Only Standard Users can be created through this endpoint.")
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("confirm_password")
        password = validated_data.pop("password")
        return User.objects.create_user(password=password, **validated_data)

class UserUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, min_length=8)

    class Meta:
        model = User
        fields = ["id", "full_name", "email", "role", "status", "password", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]
        extra_kwargs = {"role": {"required": False}}

    def validate_role(self, value):
        if value != User.Role.STANDARD:
            raise serializers.ValidationError("User management endpoint is for Standard Users.")
        return value

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for key, value in validated_data.items():
            setattr(instance, key, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

class LoginSerializer(serializers.Serializer):
    # Accepts either the account's email address or its full name (used as a
    # username) in the same field, so the frontend can offer a single
    # "Email or Username" input.
    identifier = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        identifier = attrs["identifier"].strip()

        try:
            user = User.objects.get(
                Q(email__iexact=identifier) | Q(full_name__iexact=identifier)
            )
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email/username or password.")
        except User.MultipleObjectsReturned:
            raise serializers.ValidationError(
                "Multiple accounts match that username. Please sign in with your email."
            )

        authenticated = authenticate(email=user.email, password=attrs["password"])
        if not authenticated:
            raise serializers.ValidationError("Invalid email/username or password.")
        if not authenticated.is_active or authenticated.status != User.Status.ACTIVE:
            raise serializers.ValidationError("This account is inactive.")

        attrs["user"] = authenticated
        return attrs
