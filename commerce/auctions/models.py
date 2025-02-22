from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.timezone import now


class User(AbstractUser):
    pass


class Listing(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    starting_bid = models.DecimalField(max_digits=10, decimal_places=2)
    highest_bid = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    # // URL for the user to upload image for the listing
    imageURL = models.URLField(max_length=200, blank=True, null=True)
    
    # Let's limit the types of listing supported on our site

    CATEGORY_OPTIONS = [
        
        ('TOYS', 'Toys'),
        ('FASHION', 'Fashion'),
        ('BOOKS', 'Books'),
        ('ELECTRONICS', 'Electronics'),
        ('HOME', 'Home & Living'),
        ('OTHERS', 'Others'),    
    ]

    category = models.CharField(max_length=64, choices=CATEGORY_OPTIONS, default='OTHERS', blank=True, null=True)

    STATE_OPTIONS = [

        ('UNLISTED', 'Unlisted'),
        ('ACTIVE', 'Active'),
        ('SOLD', 'Sold'),

    ]

    state = models.CharField(max_length=64, choices=STATE_OPTIONS, default='UNLISTED')

    # Add how I want to format my listing
    def __str__(self):
        return f"{self.title}"


class Bid(models.Model):

    user = models.ForeignKey(User, on_delete=models.CASCADE)  # The user who placed the bid
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='bids')  # The listing being bid on
    bid_amount = models.DecimalField(max_digits=10, decimal_places=2)  # The bid amount

    # // auto_now_add isa  django function to automatically set the current date 
    # and time when a new object is created

    placed_at = models.DateTimeField(auto_now_add=True)  # Timestamp of the bid

    class Meta:
        ordering = ['-bid_amount']  # Order bids by highest amount first

    def __str__(self):
        return f"{self.user.username} - {self.listing.title} - ${self.bid_amount}"


class Comment(models.Model):

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments_by_user')
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='comments_by_list')
    comment_text = models.TextField()
    comment_date = models.DateTimeField(auto_now_add=True)
    
    def days_since_posted(self):
        # Returns the number of days since the comment was posted.
        delta = now() - self.comment_date
        return delta.days
    
    def __str__(self):
        return f"{self.user.username} on {self.listing.title[:15]}: {self.comment_text[:50]}" 



class Watchlist(models.Model):

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='watched_by_user')
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='watchlist_by_product')
    add_on = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'listing')  # Prevent duplicate entries

    def __str__(self):
        return f"{self.user.username} added {self.listing.title[:15]} to watchlist"