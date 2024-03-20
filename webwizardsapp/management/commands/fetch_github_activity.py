# fetch_github_activity.py
import requests
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils.timezone import now, make_aware
from datetime import datetime
import os
from webwizardsapp.models import Post 
from webwizardsapp.models import GitHubLastUpdate


User = get_user_model()

class Command(BaseCommand):
    help = 'Fetches public GitHub activity for all users with a GitHub username and creates posts'

    def get_last_update_time(self):
        return GitHubLastUpdate.get_last_update_time() or make_aware(datetime.min)

    def set_last_update_time(self, last_update_time):
        GitHubLastUpdate.set_last_update_time(last_update_time)

    def handle(self, *args, **options):
        last_update_time = self.get_last_update_time()
        current_update_time = now()

        users_with_github = User.objects.exclude(github__isnull=True).exclude(github__exact='')

        for user in users_with_github:
            username = user.github.split('/')[3] 
            url = f'https://api.github.com/users/{username}/events/public'
            response = requests.get(url)
            if response.status_code == 200:
                activities = response.json()

                from django.utils.html import format_html

                for activity in activities:
                    activity_time = make_aware(datetime.strptime(activity['created_at'], '%Y-%m-%dT%H:%M:%SZ'))
                    if activity_time <= last_update_time:
                        continue
                    
                    content = ""
                    if activity['type'] == 'PushEvent':
                        repo_name = activity.get('repo', {}).get('name', 'N/A')
                        commits = activity.get('payload', {}).get('commits', [])
                        commit_messages = "; ".join([commit['message'] for commit in commits])
                        content = format_html(
                            "Pushed to {}: {}",
                            repo_name,
                            commit_messages or "No commit messages available"
                        )
                    elif activity['type'] == 'PullRequestEvent':
                        pr_action = activity.get('payload', {}).get('action', 'N/A')
                        pr_number = activity.get('payload', {}).get('number', 'N/A')
                        content = format_html(
                            "Pull Request #{} {}",
                            pr_number,
                            pr_action
                        )
                    elif activity['type'] == 'CreateEvent':
                        ref_type = activity.get('payload', {}).get('ref_type', 'N/A')
                        ref_name = activity.get('payload', {}).get('ref', 'N/A')
                        content = format_html(
                            "Created a new {}: {}",
                            ref_type,
                            ref_name
                        )
                    else:
                        content = "Performed an action: {}".format(activity['type'])
                    
                    Post.objects.create(
                        type='post',  
                        title=f"GitHub Activity: {activity['type']}",
                        source=url,  
                        origin=url,
                        description="GitHub Activity",
                        content_type='text/plain',  
                        content=content,
                        author=user,  
                        visibility='PUBLIC',  
                    )

                self.stdout.write(self.style.SUCCESS(f'Successfully fetched and created posts for GitHub activity of user "{username}"'))
            else:
                self.stdout.write(self.style.ERROR(f'Failed to fetch GitHub activity for user "{username}"'))

        self.set_last_update_time(current_update_time)

