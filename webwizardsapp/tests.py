from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import User,Post,Comments
from .serializers import RegisterSerializer,AuthorSerializer,PostSerializer,CommentSerializer
import json


class RegisterUserTestCase(APITestCase):
    """
    Test case for the CustomUser model and API endpoints.
    """

    def setUp(self):
        self.user = User.objects.create(
            username="testuser",
            email="testuser@example.com",
            
        )

    def test_user_get(self):
    # Assuming reverse('authors-list') corresponds to your API endpoint
        response = self.client.get(reverse('authors-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check if 'type' key exists and has the correct value
        self.assertIn('type', response.data)
        self.assertEqual(response.data['type'], 'authors')
        self.assertIn('items', response.data)
        self.assertIsInstance(response.data['items'], list)
        self.assertTrue(response.data['items'])  # Check if the list is not empty
        first_item = response.data['items'][0]
        self.assertEqual(first_item['type'], 'author')
        self.assertEqual(first_item['id'], 'http://127.0.0.1:5454/authors/1')
        self.assertEqual(first_item['url'], 'url')
        self.assertEqual(first_item['host'], 'host')
        self.assertEqual(first_item['displayName'], 'testuser')
        self.assertEqual(first_item['github'], '')
        self.assertEqual(first_item['profileImage'], 'https://imgur.com/a/i9xknax')
        
        
# class AuthorTestCase(APITestCase):
#     def setUp(self):
#         self.user = User.objects.create(
#             username="testuser",
#             email="testuser@example.com")
        
        
#     def test_author_get(self):
#         response = self.client.get(reverse('author-detail', kwargs={'pk': 1}))
#         self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        
#         # Check if 'type' key exists and has the correct value
#         response = self.client.get(reverse('author-detail', args=[1]))
    
#     # Check if the response status code is 200 OK
#         self.assertEqual(response.status_code, status.HTTP_200_OK)

#         # Check individual fields
#         self.assertEqual(response.data['type'], 'author')
#         self.assertEqual(response.data['id'], 'http://127.0.0.1:5454/authors/1')
#         self.assertEqual(response.data['url'], 'url')
#         self.assertEqual(response.data['host'], 'host')
#         self.assertEqual(response.data['displayName'], 'testuser')
#         self.assertEqual(response.data['github'], '')
#         self.assertEqual(response.data['profileImage'], 'https://imgur.com/a/i9xknax')
                         
    
#     def test_Author_update(self):
#         # Data to update the user
#         updated_data = {
#             "displayName": "Updated User",
            
#         }
#         response = self.client.patch(reverse('author-detail', args=[1]), updated_data, format='json')
#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#         updated_user = response.data
#         self.assertEqual(updated_user['displayName'], 'Updated User')
    
    
#     def test_Author_delete(self):
#         # Make a DELETE request to delete the user
#         response = self.client.delete(reverse('author-detail', args=[1]))
        
#         # Check if the response status code is 204 No Content (indicating successful deletion)
#         self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)


# class PostTestCase(APITestCase):
#     def setUp(self):
#         self.user = User.objects.create(
#             username="testuser",
#             email="testuser@example.com")

    
#     def test_post_get(self):
#         response = self.client.get(reverse('posts-list'))
        
#         assert response.status_code == 200
#         assert response.data['type'] == 'posts'
#         assert response.data['items']==[]
        

        
        
#     def test_posts_post(self):
#         new_post_data = {
#             "title": "random post",
#             "id":"http://127.0.0.1:5454/authors/1/posts/1",
#             "source": "https://uofa-cmput404.github.io/general/project.html",
#             "origin": "https://uofa-cmput404.github.io/general/project.html",
#             "description": "This is a post",
#             "content_type": "text/markdown",
#             "content": "nwefkqnfk qefqneflm qwkf sefegegsb rgrgew",
#             "author": {
#                 "type": "author",
#                 "id": "http://127.0.0.1:5454/authors/1",
#                 "url": "url",
#                 "host": "host",
#                 "displayName": "testuser",
#                 "github": "https://uofa-cmput404.github.io/general/project.html",
#                 "profileImage": "https://imgur.com/a/i9xknax"
#             },
#             "comment_counts": 0,
#             "likes": 0,
#             "published": "2024-02-21T01:46:16Z",
#             "visibility": "PUBLIC"
#         }

#         response = self.client.post(reverse('posts-list'), data=json.dumps(new_post_data), content_type='application/json')
        
#         assert response.status_code == 201
#         assert response.data['title'] == 'random post'
#         assert response.data['description'] == 'This is a post'
#         assert response.data['content_type'] == 'text/markdown'
#         assert response.data['content'] == 'nwefkqnfk qefqneflm qwkf sefegegsb rgrgew'
#         assert response.data['author']['displayName'] !='kannan' and response.data['author']['displayName'] =='testuser'
#         assert response.data['visibility'] == 'PUBLIC'
#         assert response.data['likes'] == 0
#         assert response.data['Comment_counts'] == 0
#         assert response.data['published'] == "2024-02-21T01:46:16Z"
#         assert response.data['origin'] == "https://uofa-cmput404.github.io/general/project.html"
#         assert response.data['source'] == "https://uofa-cmput404.github.io/general/project.html"
#         assert response.data['id'] == "http://127.0.0.1:5454/authors/1/posts/1"
        
    
        
        
        
#     def test_posts_update(self):
#         self.test_posts_post()
#         updated_post_data = {
#             "title": "updated random post",
#         }
        
#         response = self.client.patch(reverse('single-post', args=[1]), updated_post_data, format='json')
#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#         updated_post = response.data
#         self.assertEqual(updated_post['title'], 'updated random post')
#         self.assertEqual(updated_post['description'], 'This is a post')
#         self.assertEqual(updated_post['content_type'], 'text/markdown')
#         self.assertEqual(updated_post['content'], 'nwefkqnfk qefqneflm qwkf sefegegsb rgrgew')
#         self.assertEqual(updated_post['visibility'], 'PUBLIC')
#         self.assertEqual(updated_post['likes'], 0)
#         self.assertEqual(updated_post['Comment_counts'], 0)
#         self.assertEqual(updated_post['published'], "2024-02-21T01:46:16Z")
#         self.assertEqual(updated_post['origin'], "https://uofa-cmput404.github.io/general/project.html")
#         self.assertEqual(updated_post['source'], "https://uofa-cmput404.github.io/general/project.html")
#         self.assertEqual(updated_post['id'], "http://127.0.0.1:5454/authors/1/posts/1"),
#         self.assertEqual(updated_post['author']['displayName'], 'testuser')
                         

    
       
#     def test_posts_delete(self):
#         self.test_posts_post()
#         response = self.client.delete(reverse('single-post', args=[1]))
#         self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
    