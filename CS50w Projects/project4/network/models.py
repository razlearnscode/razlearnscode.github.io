from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MaxLengthValidator


class User(AbstractUser):
    profile_picture = models.URLField(max_length=200, blank=True, null=True)

    def serialize(self):
        return {
            "username": self.username,
            "profile_picture": self.profile_picture,
        }


class Post(models.Model):

    # Unlike in the email project, I can use only one property for user here, instead of
    # both users and senders. The reason is because:
    # - all users see the same posts (unlike email where each user saves a separate record)
    # - I want all the posts related to an user to also be deleted if the user account is deleted
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="posts")
    
    # For my body, I use TextField instead of CharField because I want to allow
    # line breaks in my post. And TextField doesn't have max_length, so I need to use
    # maxLengthValidator instead
    body = models.TextField(validators=[MaxLengthValidator(500)])
    timestamp = models.DateTimeField(auto_now_add=True)

    # for later: Likes 
    # Challenge: Comments and Replies


    # There's user here because in my all_post_views call in views.py,
    # I include the request.user as a parameter
    # As such, when I get back the API response, I can access the request user information
    # for instance, i can check if the user has liked the  post, or whether they can edit post
    def serialize(self, request_user_from_views):
        return {
            "id": self.id,
            "content_owner": self.user.username,
            "body": self.body,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "like_count": self.post_likes.count(),
            "profile_picture": self.user.profile_picture,
            "has_liked_post": self.post_likes.filter(user=request_user_from_views).exists(), # return boolean if the user has liked the post
            "can_edit": request_user_from_views == self.user
        }
    
class Like(models.Model):

    # I should not have a Count attribute here. Instead, I want to store
    # individual like action, which I can then query by using the user and post information
    # this is especially the cases because one user can only like a post a maximum once
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="user_likes")
    post = models.ForeignKey("Post", on_delete=models.CASCADE, related_name="post_likes")
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'post')  # Ensures a user can like a post only once

    def __str__(self):
        return f"{self.user.username} liked {self.post.id}"
    

class Follow(models.Model):

    # user who performs the follow action
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="following")
    
    # users who receive the follow action (who are followed
    target_user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="followers")
    
    timestamp = models.DateTimeField(auto_now_add=True)

    # prevent users from following the same person twice
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'target_user'], name='unique_follow')
        ]

    def __str__(self):
        return f"{self.user.username} liked {self.post.id}"