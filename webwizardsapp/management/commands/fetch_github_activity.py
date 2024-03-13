# fetch_github_activity.py
import requests
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils.timezone import now, make_aware
from datetime import datetime
import os
from webwizardsapp.models import Post 

User = get_user_model()

LAST_UPDATE_FILE = 'last_github_update.txt'

class Command(BaseCommand):
    help = 'Fetches public GitHub activity for all users with a GitHub username and creates posts'

    def get_last_update_time(self):
        try:
            with open(LAST_UPDATE_FILE, 'r') as f:
                last_update_str = f.read().strip()
                return make_aware(datetime.strptime(last_update_str, '%Y-%m-%dT%H:%M:%SZ'))
        except FileNotFoundError:
            return make_aware(datetime.min)

    def set_last_update_time(self, last_update_time):
        with open(LAST_UPDATE_FILE, 'w') as f:
            f.write(last_update_time.strftime('%Y-%m-%dT%H:%M:%SZ'))

    def handle(self, *args, **options):
        last_update_time = self.get_last_update_time()
        current_update_time = now()

        users_with_github = User.objects.exclude(github__isnull=True).exclude(github__exact='')

        for user in users_with_github:
            username = user.github.split('/')[3]  # Assuming user.github is the full URL
            url = f'https://api.github.com/users/{username}/events/public'
            response = requests.get(url)
            if response.status_code == 200:
                activities = response.json()

                for activity in activities:
                    activity_time = make_aware(datetime.strptime(activity['created_at'], '%Y-%m-%dT%H:%M:%SZ'))
                    if activity_time > last_update_time:
                        Post.objects.create(
                            type='post',  
                            title=f"GitHub Activity: {activity['type']}",
                            source=url,  
                            origin=url,
                            description=f"Github Post",
                            content_type='text/plain',  
                            content=f"Repository: {activity.get('repo', {}).get('name', 'N/A')}; Details: {activity.get('payload', {}).get('commits', 'N/A')}",
                            author=user,  
                            visibility='PUBLIC',  
                        )
                self.stdout.write(self.style.SUCCESS(f'Successfully fetched and created posts for GitHub activity of user "{username}"'))
            else:
                self.stdout.write(self.style.ERROR(f'Failed to fetch GitHub activity for user "{username}"'))

        self.set_last_update_time(current_update_time)

