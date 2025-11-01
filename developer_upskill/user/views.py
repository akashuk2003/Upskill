from rest_framework.response import Response
from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated # NEW


from .serializers import RegistrationSerializer, UserDetailSerializer


class RegisterView(APIView):
    serializer_class = RegistrationSerializer
    def post(self, request):
        serializer=self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User registered successfully"}, status=201)
        else:
            return Response(serializer.errors, status=400)
        
        
class ProfileView(generics.RetrieveUpdateAPIView):
    """
    API endpoint for the logged-in user to view and update their profile.
    """
    serializer_class = UserDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # The object is simply the user attached to the current request
        return self.request.user