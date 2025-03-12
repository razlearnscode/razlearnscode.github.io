// Async compute this at the beginning whenever this page is load
// Meaning: Always load all the post details the first time this page loads
document.addEventListener("DOMContentLoaded", function () {
  // By default, show all posts
  show_all_post_view();
});

function show_all_post_view() {
  // POST API to get all posts
  fetch("/posts/all_posts")
    .then((response) => response.json())
    .then((get_all_posts) => {
      get_all_posts.forEach((singlePost) => {
        console.log(singlePost);

        // Create a new div to parse the value

        const post_card = document.createElement("div");
        post_card.className = "post-container";

        // Remember: I'm getting the info from the json instead (what is defined
        // from serialize(), and not from the Class model.
        // Therefore instead of post.user, I need to use post.content_onwer
        post_card.innerHTML = `
              
              <div class="post-header">
                  <div class="profile-picture">
                      <img src="${singlePost.profile_picture}"/>
                  </div>

                  <div class="post-content">
                      <div class="post-content-top">
                          <span class="post-username">${singlePost.content_owner}</span>
                          <span class="post-timestamp">${singlePost.timestamp}</span>
                          <div class="socials-btn-container"></div>
                      </div>

                      <div class="post-body-container">
                        <p class="post-body">${singlePost.body}</p>
                        <textarea class="textarea-body" style="display: none;">${singlePost.body}</textarea>
                      </div>

                      <div class="post-action">
                          <div class="like-container"></div>
                          <div class="follower-container">
                              <button class="social-action-bn">☹︎</button>
                              <span class="socials-count"">X</span>
                          </div>
                      </div>
                  </div>
              </div>
          
          `;


        const socials_btn = post_card.querySelector(".socials-btn-container");

        // Display Edit or Follow button depending on the logged in users
        if (singlePost.can_edit) {
          socials_btn.innerHTML = `<button class="edit-btn">Edit</button>`;
        } else {
          socials_btn.innerHTML = `<button class="follow-btn">Follow</button>`;
        }

        // Handle click event for Edit button
        const edit_button = socials_btn.querySelector(".edit-btn");

        // Only proceeds if the edit button is available
        if (edit_button) {
            // Handle the click event on the Edit button
            edit_button.addEventListener("click", function () {

                // Only after entering save mode, create the new Save button
                const save_button = document.createElement("button");
                save_button.className = "save-edit-btn";
                save_button.innerHTML = `Save`;
                socials_btn.append(save_button);

                // Concurrently, hide the edit button
                edit_button.style.display = "none";

                // First, hide the post content. Make the edit box visible again
                post_card.querySelector(".post-body").style.display = "none";
                post_card.querySelector(".textarea-body").style.display = "block";

                // After all this, handle when the user attempts to save

                save_button.addEventListener("click", function () {
                    // Get the content of the text area
                    const textarea_input = post_card.querySelector(".textarea-body");
                    const updated_post_content = textarea_input.value.trim();

                    // Call the API to update the content 
                    fetch(`edit_post/${singlePost.id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ content: updated_post_content }),
                    })
                    .then(response => response.json())
                    .then(data => {

                        const post_updated = post_card.querySelector(".post-body");

                        if (data.action == "updated") { // If updated, then save
                            post_card.querySelector(".textarea-body").style.display = "none"; // Hide the textarea
                            post_card.querySelector(".post-body").style.display = "block"; // display the post content again
                            edit_button.style.display = "block";
                            save_button.style.display = "none";

                            // Most importantly, I need to reload the latest content again
                            post_updated.innerText = updated_post_content; // temporarily populate the data locally, avoid unnecssary server requests
                        }
                    })
                    .catch(error => console.error("Error:", error));

                });

          });
        }

        // DISPLAY for LIKE/FOLLOWS
        // Add display
        const like_action = document.createElement("form");

        if (singlePost.has_liked_post) {
          like_action.innerHTML = `<input type="submit" class="social-action-bn" value="❤️">`;
        } else {
          like_action.innerHTML = `<input type="submit" class="social-action-bn" value="♡">`;
        }

        // Also add the like counter in the like action section
        post_card.querySelector(".like-container").append(like_action);

        like_action.innerHTML += `<span class="socials-count":>${singlePost.like_count}</span>
          `;

        // I want to target the like-container class inside the post_card component

        document.querySelector("body").append(post_card);

        // Handle the event when the social button is clicked
        // Notice that i'm not targeting the button (or input), instead, since submit
        // is the event of the form, I reference the form like_action instead!
        like_action.addEventListener("submit", function (event) {
          // By right, when the form is submit, the page is refreshed by default
          // However, we don't want this to happen (we just want the counter to be incremented/decrease)
          // so we need to use this event.preventDefaultt to prevent the page from automatically reloading
          // this stops the form from submission and let javascript handle it instead
          event.preventDefault();
          process_like(singlePost.id, like_action); // passing like_action because I want to update it's value dynamically
        });
      });
    });
}

function process_like(postID, like_action) {
  // Once the like button is clicked, then call the POST API to update the like
  fetch(`/like_post/${postID}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.json()) // format response as json file
    .then((data) => {
      // pass on all the data from the response for further processing

      const like_button = like_action.querySelector(".social-action-bn");
      const updated_like_count = like_action.querySelector(".socials-count");

      if (data.action == "add") {
        like_button.value = "❤️"; // change to Unlike button if like is added
      } else {
        like_button.value = "♡"; // chagne to Like button if like is removed
      }

      updated_like_count.innerHTML = data.like_count;
    })
    .catch((error) => console.error("Error:", error));
}

function edit_post(post_card) {


}
