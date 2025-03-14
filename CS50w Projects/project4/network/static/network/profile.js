// Async compute this at the beginning whenever this page is load
// Meaning: Always load all the post details the first time this page loads
document.addEventListener("DOMContentLoaded", function () {
  // Try to get the user id from the URL
  // windown.location.pathname.split("/") wil separate all the elements and arrange them into an array
  // so it will return [profile, 1]
  // then I can use pop to get the ID because pop get the last element of an array
  const userID = window.location.pathname.split("/").pop();
  show_profile_view(userID);

  // Get all posts from userID

  // Show the user profile section
});

function show_profile_view(userID) {
    fetch(`/get/${userID}`)
    .then((response) => response.json())
    .then((data) => {

        console.log(data);

        profile_container = document.createElement("div");
        profile_container.className = "profile-container";
    
        profile_container.innerHTML = `
            <div class="profile-header">
                <img src="${data.profile_picture}" alt="Profile Picture" class="profile-picture-full">
                <h1 class="profile-username">@${data.username}</h1>
            </div>
    
            <div class="profile-stats">
                <div class="stat">
                    <span class="stat-number">${data.follower}</span>
                    <span class="stat-label">Followers</span>
                </div>
                <div class="stat">
                    <span class="stat-number">${data.follow}</span>
                    <span class="stat-label">Following</span>
                </div>
            </div>
            `;

        // Logic to display Edit Profile button or not

        if (data.user_own_account) { // Show Edit Profile if this is the user profile

            const editProfileBtn = document.createElement("button");
            editProfileBtn.className = "edit-btn";
            editProfileBtn.innerText = "Edit Profile"

            profile_container.querySelector(".profile-header").append(editProfileBtn);

        } else { // Show Follow/Unfollow button if this is other users

            // Logic to toggle Follow or Unfollow button
            const followBtn = document.createElement("button");
            followBtn.className = "follow-btn";

            let followBtnText = (data.following_this_user) ? "Unfollow" : "Follow";
            
            followBtn.innerText = followBtnText;

            profile_container.querySelector(".profile-header").append(followBtn);

        }

        document.querySelector(".container").append(profile_container);

    });

}


function all_post_from_user() {

//     <div class="profile-posts">
//     <h2>User's Posts</h2>
//     <div class="post-container">
//         <p class="post-content">This is an example post...</p>
//     </div>
// </div>

}