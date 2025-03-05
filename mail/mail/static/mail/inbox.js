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
  .querySelector("#compose-form").removeEventListener("submit", send_email);

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

  const email_view = document.querySelector("#emails-view");

  // GET emails from mailbox
  fetch(`/emails/${mailbox}`)
    .then((response) => response.json())
    .then((emails) => {

      // Display the snapshot for each email
      emails.forEach((email) => {
        email_view.innerHTML += `
        <div class="email-card">
          <div class="email-header">
            <div>
              <span class="email-sender">${email.sender}</span>
              <span class="email-recipients">→ ${email.recipients.join(", ")}</span>
            </div>
            <span class="email-timestamp">${email.timestamp}</span>
          </div>
          <div class="email-subject">${email.subject}</div>
        </div>
      `;
      });

      // Embed a redirect link to all the individual emails
      document.querySelectorAll('email-card').forEach(email => {
          email.onclick = function() {
              console.log(this.id)
          }
      }),

      // Print all emails
      console.log(emails);
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

function view_email(email) {
  
}