document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Add a new event handler for the Submit button
  // Unlike button, input element has a submit event instead of click, so I'll use 'submit here instead
  document.querySelector('#compose-form').addEventListener('submit', send_email);

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  console.log(mailbox);

  fetch('/emails/sent')
  .then(response => response.json())
  .then(emails => {
    // Print all emails
    console.log(emails);
  });


  // Get mails from Sent Mailbox


  // Get mails from Archive Mailbox
}

function send_email(event) {

  event.preventDefault();

  // Get all the required components from the form
  const email_recipient = document.querySelector('#compose-recipients').value;
  const email_subject = document.querySelector('#compose-subject').value;
  const email_body = document.querySelector('#compose-body').value;

  
  // Sending email using POST API to send email via the submit button
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: email_recipient,
        subject: email_subject,
        body: email_body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
  });

  // Load the user Sent mailbox after sending the email
  
}