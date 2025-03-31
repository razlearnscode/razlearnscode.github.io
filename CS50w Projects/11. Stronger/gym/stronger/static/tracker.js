let logged_in_user = null; // get the user info globally

document.addEventListener("DOMContentLoaded", async () => {
    // Having await helps that I don't have to wait for user to load, I can still proceed with the below function call
    logged_in_user = await get_user(); // Fetch one and reuse for all functions
    load_template_view(); // start by showing users the list of templates
    start_work_out();
});

function load_template_view() {
  const template_view = document.createElement("div");
  template_view.className = "template-container";

  template_view.innerHTML = TEMPLATE_VIEW_HTML;

  document.querySelector(".template-view").append(template_view);
};



function get_user() {
    return fetch("/user").then((response) => response.json())
}

function start_work_out() {
  // Start a blank workout
  const new_workout = document.createElement("div");
  new_workout.className = "workout-container";

  new_workout.innerHTML = WORKOUT_FORM_HTML;
  document.querySelector(".workout-view").append(new_workout);

  const workout_form = new_workout.querySelector(".workout-form");
  const add_exercise_btn = new_workout.querySelector(".add-exercise-btn");
  const exercise_list = new_workout.querySelector(".exercise-list"); // I need to input into this so my buttons can be at the bottom

  // --- CLICK EVENTS --- //
  // 1. Add Exercise Event
  add_exercise_btn.addEventListener("click", function (event) {
    event.preventDefault(); // ✅ Prevent form from submitting
    const new_exercise = add_exercise();
    exercise_list.append(new_exercise); // add new exercises to the exercise-list
    // since I already appended all the details in the exercise_list, I can already reference it in other functions
  });

  // Form Submission
  workout_form.addEventListener("submit", function(event) {
    event.preventDefault(); // ✅ Prevent form from submitting
    save_workout(new_workout);

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

function save_workout(new_workout) {

    // Workout Data // 
    const workoutName = new_workout.querySelector(".workout-name").value.trim(); 
    const workoutNotes = new_workout.querySelector(".workout-notes").value.trim();

    const exercises = [];
    

    const allExercises = new_workout.querySelectorAll(".exercise-container");

    allExercises.forEach((single_exercise) => {
        const exerciseName = single_exercise.querySelector(".exercise-name").value;
        const exerciseType = single_exercise.querySelector("#exercise-value").value || "None";
        const allSets = single_exercise.querySelectorAll(".set-row");

        const sets = [];

        allSets.forEach((row) => {
          if (row.classList.contains("freeze")) { // Only send sets that were frozen (or saved)
            
            const desc = row.querySelector(".set-description").value.trim();
            const reps = parseInt(row.querySelector(".set-rep").value) || 0;
            const value = row.querySelector(".set-value").value || 0;

            sets.push({
              desc: desc,
              value: parseFloat(value),
              reps: parseInt(reps)
            });
          }
        });

        const notes = "";
        const category = "OTHERS"; // default to this now. I'll update this later

        exercises.push({
          name: exerciseName,
          type: exerciseType,
          notes: notes,
          category: category,
          sets: sets
        });
        
    });


    const workoutData = {
      workout: workoutName,
      notes: workoutNotes,
      exercises,
    };
    
    
    // Make POST request to submit saved information
    fetch("/save_workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workoutData),
    })
    .then((response) => response.json())
    .then((data) => {
      console.log("Workout saved:", data);
      alert("Workout saved!");

      // Clear old form and regenerate a new one
      document.querySelector(".workout-container").remove();
      start_work_out(); // call this function to create a new form again
    })
    .catch((error) => {
      console.error("Error saving workout:", error);
      alert("There was an error saving your workout.");
    });

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

// freeze event, delete event, reindexing, mimic last value //
function setup_set_row(row, set_body) {
  const freeze_button = row.querySelector(".set-status");
  const delete_button = row.querySelector(".delete-btn");

  // Freeze toggle\
  freeze_button.removeEventListener("click", toggleFreeze);
  freeze_button.addEventListener("click", function(event) {
    toggleFreeze(event);
    autofill_set_desc(row);
  });

  // Delete row
  delete_button.addEventListener("click", function (event) {
    event.preventDefault(); // ✅ Prevent form from submitting1
    row.remove();
    update_set_index(set_body); // re-index all the rows after remove
  });
}

// 1. Reupdate all the index everytime this function is called
function update_set_index(set_body) {
  const rows = set_body.querySelectorAll(".set-row");

  rows.forEach((row, index) => {
    row.querySelector(".set-number").textContent = index + 1;
    // +1 because index starts at zero. So to represent the correct order, each index needs to add 1
  });
}

// 2. Auto copy/paste the last input when creating the new set
function copy_latest_input(set_body) {
  const rows = set_body.querySelectorAll(".set-row");

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

function autofill_set_desc(row) {
    const set_desc = row.querySelector(".set-description");
    const set_value = row.querySelector(".set-value").value;
    const set_rep = row.querySelector(".set-rep").value;

    set_desc.value = `${set_value} x ${set_rep} rep(s) `;
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
                    <th>
                      <select name="exercise-value" id="exercise-value">
                        <option value="weight">Weight (kg)</option>
                        <option value="duration">Duration (min)</option>
                      </select>
                    </th>
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
    <td class="long-cell"><input type="text" class="set-description" placeholder="-"></td>
    <td class="long-cell"><input type="number" class="numInput set-value" placeholder="0"></td>
    <td class="long-cell"><input type="number" class="numInput set-rep" placeholder="0"></td> 
    <td class="short-cell"><button type="button" class="set-status">✓</button></td>
    <td class="short-cell"><button type="button" class="small-button delete-btn">x</button></td>
    `;


const TEMPLATE_VIEW_HTML = `
  <div class="page-title">
    <h1>Start Workout</h1>
  </div>
  <div class="empty-workout-container">
    <h3>Quick Start</h3>
    <button class="full-button">Start an Empty Workout</button>
  </div>
  <div class="my-template-container">
    <div class="my-template-header">
      <h2>Templates</h2>
      <button class="widget-button">+ Template</button>
    </div>
    <h3>My Templates</h3>
  </div>
  <div class="template-cards-container">
    
    <div class="template-card">
      <h3>1. Upper 1</h3>
      <p>Display the list of all exercises in the template</p>
      <p>Last session: 2 days ago</p>
    </div>
        <div class="template-card">
      <h3>1. Upper 1</h3>
      <p>Display the list of all exercises in the template</p>
      <p>Last session: 2 days ago</p>
    </div>
        <div class="template-card">
      <h3>1. Upper 1</h3>
      <p>Display the list of all exercises in the template adding more text to see if it is eclipse</p>
      <p>Last session: 2 days ago</p>
    </div>
        <div class="template-card">
      <h3>1. Upper 1</h3>
      <p>Display the list of all exercises in the template</p>
      <p>Last session: 2 days ago</p>
    </div>
  </div>


`;
