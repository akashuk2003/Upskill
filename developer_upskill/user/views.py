from rest_framework.response import Response
from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView

from .serializers import RegistrationSerializer


class RegisterView(APIView):
    serializer_class = RegistrationSerializer
    def post(self, request):
        serializer=self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User registered successfully"}, status=201)
        else:
            return Response(serializer.errors, status=400)