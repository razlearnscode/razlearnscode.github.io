let logged_in_user = null; // get the user info globally

document.addEventListener("DOMContentLoaded", async () => {
    // Having await helps that I don't have to wait for user to load, I can still proceed with the below function call
    logged_in_user = await get_user(); // Fetch one and reuse for all functions
    start_work_out();
});


function get_user() {
    return fetch("/user").then((response) => response.json())
}

function start_work_out() {
  // Start a blank workout
  const new_workout = document.createElement("div");
  new_workout.className = "workout-container";

  new_workout.innerHTML = WORKOUT_FORM_HTML;
  document.querySelector(".container").append(new_workout);

  const workout_form = new_workout.querySelector(".workout-form");
  const add_exercise_btn = new_workout.querySelector(".add-exercise-btn");
  const exercise_list = new_workout.querySelector(".exercise-list"); // I need to input into this so my buttons can be at the bottom

  // --- CLICK EVENTS --- //
  // 1. Add Exercise Event
  add_exercise_btn.addEventListener("click", function (event) {
    event.preventDefault(); // ✅ Prevent form from submitting
    const new_exercise = add_exercise();
    exercise_list.append(new_exercise); // add new exercises to the exercise-list
  });

  // Form Submission
  workout_form.addEventListener("submit", function(event) {
    event.preventDefault(); // ✅ Prevent form from submitting
    
    user = logged_in_user;
    console.log(user);

    // Get the user information

  });

}

// Add new exericse when the "+ Add Exercise" button is clicked
function add_exercise() {
  // Assume for the MVP, users won't be able to select existing exercises
  // Thus, we will generate new exercises from scratch

  // Requirement: New exercise will automatically create 3 sets
  const exercise_container = document.createElement("div");
  exercise_container.className = "exercise-container";

  exercise_container.innerHTML = EXERCISE_HEADER_HTML;

  const set_body = exercise_container.querySelector(".set-body");

  // Default: Add 1 set for each new exercise
  create_set_row(set_body);

  // Auto index and add new set when + Add set button is clicked
  exercise_container
    .querySelector(".add-set-btn")
    .addEventListener("click", function () {
      // Also note to prefill the character based on the last input within this
      create_set_row(set_body);
    });

  return exercise_container;
}

function save_workout() {
    console.log("I was clicked!");

    // get the logged in user info

}


// -- Global Functions -- //
function create_set_row(set_body) {
  const row = document.createElement("tr");
  row.className = "set-row";

  row.innerHTML = SET_ROW_HTML;

  set_body.append(row);

  // Add key functionalities to each row
  setup_set_row(row, set_body); // Functionality: Freeze + Delete
  update_set_index(set_body); // Functionality: Reindex every row
  copy_latest_input(set_body); // Functionality: Mimic latest input
}

// freeze event, delete event, reindexing, mimic last value= //
function setup_set_row(row, set_body) {
  const freeze_button = row.querySelector(".set-status");
  const delete_button = row.querySelector(".delete-btn");

  // Freeze toggle\
  freeze_button.removeEventListener("click", toggleFreeze);
  freeze_button.addEventListener("click", toggleFreeze);

  // Delete row
  delete_button.addEventListener("click", function (event) {
    event.preventDefault(); // ✅ Prevent form from submitting1
    row.remove();
    update_set_index(set_body); // re-index all the rows after remove
  });
}

// 1. Reupdate all the index everytime this function is called
function update_set_index(set_body) {
  const rows = set_body.querySelectorAll("tr");

  rows.forEach((row, index) => {
    row.querySelector(".set-number").textContent = index + 1;
    // +1 because index starts at zero. So to represent the correct order, each index needs to add 1
  });
}

// 2. Auto copy/paste the last input when creating the new set
function copy_latest_input(set_body) {
  const rows = set_body.querySelectorAll("tr");

  // if first row, then pull from best record
  let bestValue = 0;
  let bestRep = 0;

  rows.forEach((row, index) => {
    if (index === 0) return; // skip the first row

    const prevValue = rows[index - 1].querySelector(".set-value").value; // get previous value
    const prevRep = rows[index - 1].querySelector(".set-rep").value; // get previous rep

    // Default to current best
    row.querySelector(".set-value").placeholder = bestValue;
    row.querySelector(".set-rep").placeholder = bestRep;

    // Get the best record input (if prevValue exists and is greater than bestRep, then update)
    if (prevValue && +(+prevValue) > bestValue) bestValue = +prevValue;
    if (prevRep && +(+prevRep) > bestRep) bestRep = +prevRep;

    // Update the placeholders again with the latest record (if available)
    row.querySelector(".set-value").placeholder = bestValue;
    row.querySelector(".set-rep").placeholder = bestRep;
  });
}

// 3. Toggle on/off to freeze set when save status
function toggleFreeze(event) {
  event.currentTarget.closest("tr").classList.toggle("freeze");
}

// -- HTML Structure -- //

const WORKOUT_FORM_HTML = `
        <form class="workout-form">
            <input type="submit" class="small-button finish-button" value="Finish">
            <input type="text" class="workout-name" placeholder="New Workout">
            <textarea placeholder="Notes" id="workout-notes" class="workout-notes" name="workout-notes" rows="4"></textarea>
            <div class="exercise-list"></div>
            <button class="full-button add-exercise-btn">+ Add Exercises</button>
            <button class="full-button cancel-btn">Cancel Workout</button>
        </form>   

    `;

const EXERCISE_HEADER_HTML = `
        <input type="text" class="exercise-name" placeholder="Name Your Exercise">
        <table class="set-table">
            <thead>
                <tr>
                    <th>Set</th>
                    <th>Description</th>
                    <th>Weight (kg)</th>
                    <th>Rep(s)</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody class="set-body">
                <!-- Rows will be generated dynamically -->
            </tbody>
        </table>
        <button type="button" class="full-button add-set-btn">+ Add Set</button>
    `;

const SET_ROW_HTML = `
    <td class="set-number"></td> 
    <td class="set-description">-</td>
    <td><input type="number" class="set-value" placeholder="0"></td>
    <td><input type="number" class="set-rep" placeholder="0"></td> 
    <td><button type="button" class="set-status">✓</button></td>
    <td><button type="button" class="small-button delete-btn">x</button></td>
    `;
