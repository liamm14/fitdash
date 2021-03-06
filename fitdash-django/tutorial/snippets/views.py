from snippets.models import Mfp, MfpMeals
from snippets.serializers import MfpSerializer, MfpMealsSerializer
from rest_framework import generics, authentication, exceptions, status
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from rest_framework.views import APIView
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
import myfitnesspal
import logging
import datetime
from datetime import timedelta, datetime
import requests

class GetMeals(APIView):
    def get(self, response, *args, **kwargs):
        jwt = response.META.get('HTTP_AUTHORIZATION')

        url = 'http://fitdash-api:3011/userDetails'
        headers = {'Authorization': jwt}
        r = requests.get(url, headers=headers)

        username = r.json()['username']
        mfpUsername = r.json()['mfpUsername']
        # userData = MfpMeals.objects.filter(username=username)

        mfp_password = ''
        with open('../../config.env', 'r') as file:
            mfp_password=file.read()

        client = myfitnesspal.Client(mfpUsername, password=mfp_password)

        endDate = datetime.now().date()
        startDate = endDate - timedelta(days=2)

        days = []

        while startDate <= endDate:
            day = client.get_date(startDate)

            entries = []
            for meal in day.meals:
                foods = []
                for food in meal:
                    foods.append({
                        'name': food.name,
                        'totals': food.totals
                    })
                entries.append({
                    'name': meal.name,
                    'entry': foods
                })

            days.append({
                'date': str(day.date),
                'meals': entries,
                'totals': day.totals,
                'goals': day.goals
            })
            startDate += timedelta(days=1)

        data = {
            "username": username,
            "days": days
        }

        serializer = MfpMealsSerializer(data=data)

        if serializer.is_valid():
            # serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GetWeek(APIView):
    def get(self, response, *args, **kwargs):
        jwt = response.META.get('HTTP_AUTHORIZATION')

        url = 'http://fitdash-api:3011/userDetails'
        headers = {'Authorization': jwt}
        r = requests.get(url, headers=headers)
        
        username = r.json()['username']
        userData = Mfp.objects.filter(username=username)
        if userData:
            userData = userData[len(userData)-1]

        mfp_password = ''
        with open('../../config.env', 'r') as file:
            mfp_password=file.read()

        if userData:
            serializer = MfpSerializer(userData)
            if datetime.now().date() > datetime.strptime(list(serializer.data["mfpData"][len(serializer.data["mfpData"]) - 1].items())[0][1], '%Y-%m-%d').date():
                return return_week(mfp_password, username)
            else:
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return return_week(mfp_password, username)

def return_week(mfp_password, username):
    client = myfitnesspal.Client('premiumliam', password=mfp_password)

    endDate = datetime.now().date()
    startDate = endDate - timedelta(days=7)

    days = []

    while startDate <= endDate:
        day = client.get_date(startDate)
        days.append({
            'date': str(day.date),
            'totals': day.totals,
            'goals': day.goals
        })
        startDate += timedelta(days=1)

    data = {
        "username": username,
        "mfpData": days
    }

    serializer = MfpSerializer(data=data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
