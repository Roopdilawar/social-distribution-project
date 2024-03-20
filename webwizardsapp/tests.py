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
        
        # Accessing the items key, which now contains a nested OrderedDict
        items_data = response.data['items']
        self.assertIsInstance(items_data, dict)  # Since OrderedDict is a subclass of dict
        
        self.assertIn('count', items_data)
        self.assertEqual(items_data['count'], 1)
        self.assertIsNone(items_data['next'])
        self.assertIsNone(items_data['previous'])
        
       
        self.assertIn('results', items_data)
        results = items_data['results']
        self.assertIsInstance(results, list)
        self.assertTrue(results)  # Check if the list is not empty
        first_item = results[0]
        self.assertIsInstance(first_item, dict)  # Checking if it's an OrderedDict or dict
        self.assertEqual(first_item['type'], 'author')
        self.assertEqual(first_item['id'], 'http://localhost:8000/authors/1')
        self.assertEqual(first_item['url'], 'http://localhost:8000/authors/1')
        self.assertEqual(first_item['host'], 'http://localhost:8000/')
        self.assertEqual(first_item['displayName'], 'testuser')
        self.assertIsNone(first_item['github'])  # Since 'github' is None now, not an empty string
        self.assertEqual(first_item['profileImage'], 'https://imgur.com/a/i9xknax')
        
class AuthorTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create(
            username="testuser",
            email="testuser@example.com")

    def test_author_get(self):
        # Making a request to the 'author-detail' endpoint with the primary key of the user
        response = self.client.get(reverse('author-detail', kwargs={'pk': 1}))
       
        # Check if the response status code is 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Since the structure you've shown in your new response data is consistent,
        # the direct key-value checks should work fine, but ensure the 'id' and 'github' values are updated
        self.assertEqual(response.data['type'], 'author')
        # Ensure the 'id' value matches your new URL structure
        self.assertEqual(response.data['id'], 'http://localhost:8000/authors/1')
        self.assertEqual(response.data['url'], 'http://localhost:8000/authors/1')
        self.assertEqual(response.data['host'], 'http://localhost:8000/')
        self.assertEqual(response.data['displayName'], 'testuser')
        # 'github' should be checked for None since that's what your new response seems to be returning
        self.assertIsNone(response.data['github'])
        # The 'profileImage' assertion should remain unchanged if the value is consistent
        self.assertEqual(response.data['profileImage'], 'https://imgur.com/a/i9xknax')

                         
    
    def test_Author_update(self):
        # Data to update the user
        updated_data = {
            "displayName": "Updated User",
            
        }
        response = self.client.patch(reverse('author-detail', args=[1]), updated_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        updated_user = response.data
        self.assertEqual(updated_user['displayName'], 'Updated User')
    
    
    def test_Author_delete(self):
        # Make a DELETE request to delete the user
        response = self.client.delete(reverse('author-detail', args=[1]))
        
        # Check if the response status code is 204 No Content (indicating successful deletion)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)


class PostTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create(
            username="testuser",
            email="testuser@example.com")
        
class AuthorPostsViewTestCase(APITestCase):

    def setUp(self):
        # Create a test author
        self.test_author = User.objects.create(
            username="Test Author",
            email="testauthor@example.com"
        )
        
        # Create some test posts
        self.post1 = Post.objects.create(
            title="Test Post 1",
            content="Content of test post 1",
            author=self.test_author
        )
        self.post2 = Post.objects.create(
            title="Test Post 2",
            content="Content of test post 2",
            author=self.test_author
        )

    def test_get_author_posts_without_pagination(self):
        response = self.client.get(reverse('author-posts', kwargs={'author_id': self.test_author.id}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)  # Expecting 2 posts
        serializer = PostSerializer([self.post1, self.post2], many=True)
        self.assertEqual(response.data, serializer.data)  # Compare with serialized data

    # def test_get_author_posts_with_pagination(self):
    #     # Assuming default page_size is 1 for the test
    #     response = self.client.get(reverse('author-posts', kwargs={'author_id': self.test_author.id}) + '?page=1')
    #     self.assertEqual(response.status_code, status.HTTP_200_OK)
    #     self.assertIn("pagination", response.data)
    #     self.assertEqual(len(response.data["items"]), 2)  
    #     self.assertEqual(response.data["pagination"]["total_items"], 2)  # Total items should be 2

    def test_get_author_posts_with_invalid_author_id(self):
        response = self.client.get(reverse('author-posts', kwargs={'author_id': 100}))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [])
        
    
    def test_post_update(self):
        # Data to update the post
        updated_data = {
            "title": "Updated Post",
            "content": "Content of updated post"
        }
        response = self.client.patch(reverse('single-post', args=[1]), updated_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        updated_post = response.data
        self.assertEqual(updated_post['title'], 'Updated Post')
        self.assertEqual(updated_post['content'], 'Content of updated post')
        
    def test_post_delete(self):
        # Make a DELETE request to delete the post
        response = self.client.delete(reverse('single-post', args=[1]))
        
        # Check if the response status code is 204 No Content (indicating successful deletion)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
    
    

class GetImageViewTestCase(APITestCase):

    def setUp(self):
        self.sample_image_base64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="
        _, imgstr = self.sample_image_base64.split(';base64,')
        self.content_type = "image/base64"
        self.user= User.objects.create(
            username="testuser",
            email="test@gmail.com")
        self.post = Post.objects.create(
            author=self.user,
            title="Test Post with Image",
            content=self.sample_image_base64,
            content_type=self.content_type
        )

    def test_get_image_success(self):
        response = self.client.get(reverse('get_image', kwargs={'post_id': self.post.id}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'image/png')  # Expecting PNG image

    def test_get_image_failure_not_found(self):
        response = self.client.get(reverse('get_image', kwargs={'post_id': 999}))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_get_image_failure_wrong_content_type(self):
        post = Post.objects.create(
            author=self.user,
            title="Non-Image Post",
            content="This is not an image.",
            content_type="text/plain"
        )
        response = self.client.get(reverse('get_image', kwargs={'post_id': post.id}))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        
        
# class AddCommentViewTestCase(APITestCase):
    
#         def setUp(self):
#             self.user = User.objects.create(
#                 username="testuser",
#                 email="testbh@gmau.com")
#             self.post = Post.objects.create(
#                 author=self.user,
#                 title="Test Post",
#                 content="Content of test post"
#             )
#             self.comment = Comments.objects.create(
#                 post=self.post,
#                 author=self.user,
#                 content="This is a test comment"
#             )
#         def test_get_comments(self):
#             response = self.client.get(reverse('list_comments', kwargs={'post_id': self.post.id}))
#             self.assertEqual(response.status_code, status.HTTP_200_OK)
    
#             # Assert the top-level structure
#             self.assertEqual(response.data['type'], 'comments')
#             self.assertIsInstance(response.data['items'], list)
#             self.assertEqual(len(response.data['items']), 1)  # Assuming there's one comment for simplicity
            
#             # Dive into the details of the first comment
#             comment = response.data['items'][0]
#             self.assertEqual(comment['id'], 1)
#             self.assertEqual(comment['post'], 1)
            
#             # Assert the structure and content of the author field
#             author = comment['author']
#             self.assertEqual(author['type'], 'author')
#             self.assertEqual(author['id'], 'http://localhost:8000/authors/1')
#             self.assertEqual(author['url'], 'http://localhost:8000/authors/1')
#             self.assertEqual(author['host'], 'http://localhost:8000/')
#             self.assertEqual(author['displayName'], 'testuser')
#             self.assertIsNone(author['github'])  # Assuming the 'github' field can be None
#             self.assertEqual(author['profileImage'], 'https://imgur.com/a/i9xknax')
            
#             # Continue with other fields
#             self.assertEqual(comment['content'], 'This is a test comment')
#             self.assertEqual(comment['likes'], 0)
            
#         def test_delete_comment(self):
#             response = self.client.delete(reverse('comment-detail', kwargs={'post_id': self.post.id, 'comment_id': self.comment.id}))
#             self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        