from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MaxLengthValidator


class User(AbstractUser):
    profile_picture = models.URLField(max_length=200, blank=True, null=True)


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

    def serialize(self):
        return {
            "id": self.id,
            "content_owner": self.user.username,
            "body": self.body,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p")
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