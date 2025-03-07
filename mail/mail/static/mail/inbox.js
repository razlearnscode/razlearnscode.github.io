document.addEventListener("DOMContentLoaded", function () {
  // Use buttons to toggle between views
  document
    .querySelector("#inbox")
    .addEventListener("click", () => load_mailbox("inbox"));
  document
    .querySelector("#sent")
    .addEventListener("click", () => load_mailbox("sent"));
  document
    .querySelector("#archived")
    .addEventListener("click", () => load_mailbox("archive"));
  document.querySelector("#compose").addEventListener("click", compose_email);

  // By default, load the inbox
  load_mailbox("inbox");
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";

  // Remove all the potential event from previous sessions
  document
    .querySelector("#compose-form")
    .removeEventListener("submit", send_email);

  // Add a new event handler for the Submit button
  // Unlike button, input element has a submit event instead of click, so I'll use 'submit here instead
  document
    .querySelector("#compose-form")
    .addEventListener("submit", send_email);
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";

  // Show the mailbox name
  document.querySelector("#emails-view").innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;

  // const email_view = document.querySelector("#emails-view");

  // GET emails from mailbox
  fetch(`/emails/${mailbox}`)
    .then((response) => response.json())
    .then((emails) => {
      // Display the snapshot for each email
      emails.forEach((singleEmail) => {
        // Individual email works here because I define a new const everytime this is iterated

        console.log(singleEmail);
        console.log(`${singleEmail.read}`);

        const email_card = document.createElement("div");

        // Check if the card has been read or not. Depending on the result,a assign a new class to display the email card to its corresponding status
        (singleEmail.read === true) ? email_card.className = "email-card" : email_card.className = "email-card-unread";

        // Display the snapshot of the email content
        email_card.innerHTML = `
          <div class="email-header">
            <div>
            <span class="email-sender">${singleEmail.sender}</span>
              <span class="email-recipients">→ ${singleEmail.recipients.join(
                ", "
              )}</span>
            </div>
            <span class="email-timestamp">${singleEmail.timestamp}</span>
          </div>
          <div class="email-subject">${singleEmail.subject}</div>
      `;

        // Make each email card clickable, and trigger the redirection to view the individual emails
        // And since the API to fetch individual emails only require id, so I'll only need to send the ID here
        // Very important, it's useful to have the view_email function inside another function, so that it is not called immediately for every iteration

        email_card.addEventListener("click", function () {
          

          // Clear the view before showing the individual email
          document.querySelector("#emails-view").innerHTML = "";
          view_email(singleEmail.id);
        });

        document.querySelector("#emails-view").append(email_card);
      });
    });
}

function send_email(event) {
  event.preventDefault();

  // Get all the required components from the form
  const email_recipient = document.querySelector("#compose-recipients").value;
  const email_subject = document.querySelector("#compose-subject").value;
  const email_body = document.querySelector("#compose-body").value;

  // Sending email using POST API to send email via the submit button
  fetch("/emails", {
    method: "POST",
    body: JSON.stringify({
      recipients: email_recipient,
      subject: email_subject,
      body: email_body,
    }),
  })
    .then((response) => response.json())
    .then((result) => {
      // Print result
      console.log(result);

      // After successful submission, make sure to clear all the input again
      document.querySelector("#compose-recipients").value = "";
      document.querySelector("#compose-subject").value = "";
      document.querySelector("#compose-body").value = "";
    });
}

function view_email(email_id) {
  // Show the email and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";

  // Get the details from the email


  fetch(`/emails/${email_id}`)
    .then((response) => response.json())
    .then((email) => {

      // After the email is clicked. Make sure to update the read status to true
      // I can update by using the POST API
      fetch(`/emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      })

      // Create a new div to record all the email content
      const email_detail = document.createElement("div");
      email_detail.className = "email-container";

      // Populate the email content to the page
      email_detail.innerHTML = `
        <div class="email-header">
            <h1>Email read is ${email.read}</h1>
            <h2 id="email-subject">${email.subject}</h2>
            <span id="email-timestamp">${email.timestamp}</span>
        </div>
        
        <div class="email-info">
            <p><strong>From:</strong> <span id="email-sender">${email.sender}</span></p>
            <p><strong>To:</strong> <span id="email-recipients">${email.recipients}</span></p>
        </div>

        <div class="email-body">
            <p id="email-content">${email.body}</p>
        </div>

        <div class="email-actions">
            <button id="reply-btn">Reply</button>
            <button id="archive-btn">Archive</button>
        </div>
      `;

      // Add the email content to the DOM

      document.querySelector("#emails-view").append(email_detail);
    });

}
