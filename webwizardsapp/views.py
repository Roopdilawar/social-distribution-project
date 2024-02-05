from django.http import HttpResponse # Make sure to include this import


def index(request):
    return HttpResponse("This is the main page of webwizards app.")