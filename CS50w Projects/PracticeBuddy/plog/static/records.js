let logged_in_user = null; // get the user info globally

document.addEventListener("DOMContentLoaded", async () => {
    // Having await helps that I don't have to wait for user to load, I can still proceed with the below function call
    logged_in_user = await get_user(); // Fetch one and reuse for all functions
    show_records_view();
});

function get_user() {
    return fetch("/user").then((response) => response.json());
  }

function show_records_view() {

    const records_view_container = document.querySelector(".records-view-container");
  
    const records_content = document.createElement("div");
    records_content.className = "records-view-content";
    records_content.innerHTML = RECORDS_CONTENT_HTML;
  
    records_view_container.append(records_content);
  
  }

const RECORDS_CONTENT_HTML = `
<h3>Select your exercise</h3>
<select name="exercise-selector">
    <option value="">-- Select an exercise --</option>
</select>
`;

