let logged_in_user = null; // get the user info globally

document.addEventListener("DOMContentLoaded", async () => {
  // Having await helps that I don't have to wait for user to load, I can still proceed with the below function call
  logged_in_user = await get_user(); // Fetch one and reuse for all functions

  // show template view by default
  show_template_view();

  select_template_view(); // start by showing users the list of templates

});

function get_user() {
  return fetch("/user")
    .then((response) => response.json()); 
}

function get_saved_templates(template_container) {
  
  const template_cards_container = template_container.querySelector(".template-cards-container");
  
  fetch(`/templates/${logged_in_user.id}`)
  .then((response) => response.json())
  .then((saved_templates) => {
    
    saved_templates.forEach((singleTemplate) => {
      
      const fill_in_html = TEMPLATE_CARD_HTML
        .replace(/__ID__/g, singleTemplate.id)
        .replace(/__NAME__/g, singleTemplate.name)
        .replace(/__DESC__/g, singleTemplate.desc || "")
        .replace(/__DAYS__/g, singleTemplate.days_since_updated === 0 ? 'Today' : `${singleTemplate.days_since_updated} days ago`);


      const template_card = document.createElement("div");
      template_card.className = "template-card";

      template_card.innerHTML = fill_in_html;
      template_cards_container.append(template_card);
    });

  });
  
}

function show_template_view() {
  document.querySelector(".template-view").style.display = 'block';
  document.querySelector(".workout-view").style.display = 'none';
  document.querySelector(".create-template-view").style.display = 'none';
}

function show_workout_view() {
  document.querySelector(".workout-view").style.display = 'block';
  document.querySelector(".template-view").style.display = 'none';
  document.querySelector(".create-template-view").style.display = 'none';
}

function show_create_template_view() {
  document.querySelector(".workout-view").style.display = 'none';
  document.querySelector(".template-view").style.display = 'none';
  document.querySelector(".create-template-view").style.display = 'block';
}


function select_template_view() {
  const template_view = document.querySelector(".template-view");
  const workout_view = document.querySelector(".workout-view");
  const create_template_view = document.querySelector(".create-template-view");

  const template_container = document.createElement("div");
  template_container.className = "template-container";

  template_container.innerHTML = TEMPLATE_VIEW_HTML;

  template_view.append(template_container);

  get_saved_templates(template_container);

  const new_workout_btn = template_container.querySelector(".new-workout-button");
  const create_template_btn = template_container.querySelector(".create-template");

  new_workout_btn.addEventListener("click", function(event) {
    show_workout_view();
    start_work_out();
  });

  create_template_btn.addEventListener("click", function(event) {
    show_create_template_view();
    create_template();
  });

  show_template_toggle();

}

function show_template_toggle() {
  document.addEventListener("click", function(event) {
    const isToggle = event.target.classList.contains("dropdown-toggle"); // select all DOM that has dropdown toggle

    // Close all existing dropdown first
    document.querySelectorAll(".dropdown").forEach(drop => { // drop is just a name I refer to the toggle that I would drop
      drop.classList.remove("open"); // identify all those dropdown toggle, and remove the toggle from its class
    });

    if (isToggle) {
      event.stopPropagation(); // Don't let parent elements also react to this event. Think of this like stopeventlistner
      const dropdown = event.target.closest(".dropdown") // find the nearest dropdown instance
      dropdown.classList.toggle("open");
    }
  });
}

function start_workout_from_template(templateId) {

  console.log("Start workout for template:", templateId);
  show_workout_view();

  fetch(`/start_workout/${templateId}`)
  .then((response) => response.json())
  .then((data) => {

    const workoutName = data.name;
    const workoutNotes = data.desc;
    const all_exercises = data.exercises;

    // Start workout with prefilled HTML
    start_work_out();

    const workout_container = document.querySelector(".workout-container");
    const exercise_list = workout_container.querySelector(".exercise-list");

    // Fill in workout name and notes
    workout_container.querySelector(".workout-name").placeholder = workoutName;
    workout_container.querySelector(".workout-notes").placeholder = workoutNotes;

    all_exercises.forEach((exerciseData) => {

      const exercise_element = add_exercise(PREFILLED_EXERCISE_HEADER_HTML, PREFILLED_SET_ROW_HTML, exerciseData);
      exercise_list.append(exercise_element);
    });

  });

}



// It's possible to create a create_form function that I can use for both template and workout
// But it can be quite a hassle to refactor, so I'll probably won't do it here
function create_template() {
  
  const new_template_view = document.querySelector(".create-template-view");

  const new_template = document.createElement("div");
  new_template.className = "new-template-container";

  new_template.innerHTML = NEW_TEMPLATE_WORKOUT_HTML;
  new_template_view.append(new_template);

  const template_form = new_template.querySelector(".new-template-form");
  const add_exercise_btn = new_template.querySelector(".add-exercise-btn");
  const exercise_list = new_template.querySelector(".exercise-list");

  // --- CLICK EVENTS --- //
  add_exercise_btn.addEventListener("click", function(event) {
    event.preventDefault();
    const new_exercise = add_exercise(NEW_TEMPLATE_EXERCISE_HTML, NEW_TEMPLATE_SET_ROW_HTML);    
    exercise_list.append(new_exercise);
  });

  // --- FORM SUBMISSION --- //
  template_form.addEventListener("submit", function(event) {
    console.log("I want to save my template");
    event.preventDefault();
    save_template(new_template);
  });



}


function save_template(new_template) {
  
  const templateName = new_template.querySelector(".template-name").value.trim();
  const templateNotes = new_template.querySelector(".template-notes").value.trim();

  const exercisesTemplate = [];
  const allExercises = new_template.querySelectorAll(".exercise-container");

  allExercises.forEach((single_exercise) => {
    const exerciseName = single_exercise.querySelector(".exercise-name").value;
    const exerciseType =
      single_exercise.querySelector("#exercise-value").value || "None";
    const allSets = single_exercise.querySelectorAll(".set-row");

    const sets = [];

    allSets.forEach((row) => {
      const desc = row.querySelector(".set-description").value.trim();
      const reps = parseInt(row.querySelector(".set-rep").value) || 0;
      const value = row.querySelector(".set-value").value || 0;

      sets.push({
        desc: desc,
        value: parseFloat(value),
        reps: parseInt(reps),
      });
    });

    const notes = "";
    const category = "OTHERS"; // default to this now. I'll update this later

    exercisesTemplate.push({
      name: exerciseName,
      type: exerciseType,
      notes: notes,
      category: category,
      sets: sets,
    });

  });

  const templateData = {
    template: templateName,
    notes: templateNotes,
    exercisesTemplate,
  };

  // Make POST request to submit saved information
  fetch("/save_template", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(templateData),
  })
  .then((response) => response.json())
  .then((data) => {
    console.log("New Template saved:", data);
    alert("Template saved!");

    // Clear existing form and redirect back to index
    document.querySelector(".new-template-container").remove();
    show_template_view();
  })
  .catch((error) => {
    console.error("Error saving template:", error);
    alert("There was an error saving your template.");
  });

};


function start_work_out() {

  const workout_view = document.querySelector(".workout-view");

  // Start a blank workout
  const new_workout = document.createElement("div");
  new_workout.className = "workout-container";

  new_workout.innerHTML = WORKOUT_FORM_HTML;
  workout_view.append(new_workout);

  const workout_form = new_workout.querySelector(".workout-form");
  const exercise_list = new_workout.querySelector(".exercise-list"); // I need to input into this so my buttons can be at the bottom
  const add_exercise_btn = new_workout.querySelector(".add-exercise-btn");
  const cancel_btn = new_workout.querySelector(".cancel-btn");

  // --- CLICK EVENTS --- //
  // 1. Add Exercise Event
  add_exercise_btn.addEventListener("click", function (event) {
    event.preventDefault(); // ✅ Prevent form from submitting
    const new_exercise = add_exercise(EXERCISE_HEADER_HTML, SET_ROW_HTML);
    exercise_list.append(new_exercise); // add new exercises to the exercise-list
    // since I already appended all the details in the exercise_list, I can already reference it in other functions
  });

  // Form Submission
  workout_form.addEventListener("submit", function (event) {
    event.preventDefault(); // ✅ Prevent form from submitting
    save_workout(new_workout);
  });

  cancel_btn.addEventListener("click", function(event) {
    event.preventDefault(); 
    show_template_view();
    new_workout.remove(); // clear workout after just submitted
  });
}

function save_workout(new_workout) {
  // Workout Data //
  const workoutName = new_workout.querySelector(".workout-name").value.trim();
  const workoutNotes = new_workout.querySelector(".workout-notes").value.trim();

  const exercises = [];

  const allExercises = new_workout.querySelectorAll(".exercise-container");

  allExercises.forEach((single_exercise) => {
    const exerciseName = single_exercise.querySelector(".exercise-name").value;
    const exerciseType =
      single_exercise.querySelector("#exercise-value").value || "None";
    const allSets = single_exercise.querySelectorAll(".set-row");

    const sets = [];

    allSets.forEach((row) => {
      if (row.classList.contains("freeze")) {
        // Only send sets that were frozen (or saved)

        const desc = row.querySelector(".set-description").value.trim();
        const reps = parseInt(row.querySelector(".set-rep").value) || 0;
        const value = row.querySelector(".set-value").value || 0;

        sets.push({
          desc: desc,
          value: parseFloat(value),
          reps: parseInt(reps),
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
      sets: sets,
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
      show_template_view(); // reopen index after saved the workout, unless I have a separate "Completed" page
    })
    .catch((error) => {
      console.error("Error saving workout:", error);
      alert("There was an error saving your workout.");
    });
}

// Add new exericse when the "+ Add Exercise" button is clicked
// I still need to pass the innerHTML to the add_exercise function
// because I have 2 separate templates, one for workout, and the other for template
function add_exercise(exerciseHTML, setHTML, exerciseData = null) {

  // Requirement: New exercise will automatically create 3 sets
  const exercise_container = document.createElement("div");
  exercise_container.className = "exercise-container";

  exercise_container.innerHTML = exerciseHTML;

  const set_body = exercise_container.querySelector(".set-body");

  // Set exercise name if available
  if (exerciseData) {
    if (exerciseData.exercise_name) {exercise_container.querySelector(".exercise-name").value = exerciseData.exercise_name;}

  
    // Prefill the unit selection based on the exercise type
    const exercise_type = exerciseData.exercise_type;
    exercise_container.querySelector("#exercise-value").value = exercise_type;
  
    // If exerciseData has sets (and make sure that it's an array), add them
    if (exerciseData && Array.isArray(exerciseData.sets) && exerciseData.sets.length > 0) {
      exerciseData.sets.forEach((set) => {
        create_set_row(set_body, setHTML, set, exercise_type);
      });
    };
  
  } else {
    // If this is an empty workout (no sets passed), create a single blank set row
    create_set_row(set_body, setHTML);
  };
 

  // Auto index and add new set when + Add set button is clicked
  exercise_container
    .querySelector(".add-set-btn")
    .addEventListener("click", function () {
      // Also note to prefill the character based on the last input within this
      create_set_row(set_body, setHTML);
    });

  return exercise_container;
}

// -- Global Functions -- //
function create_set_row(set_body, setHTML, setData = null, exerciseType = null) {
  
  const row = document.createElement("tr");
  row.className = "set-row";
  row.innerHTML = setHTML;

  set_body.append(row);

  if (setData) {
    row.querySelector(".set-description").placeholder = setData.desc || "-";
    row.querySelector(".set-value").placeholder = setData.value || 0;
    row.querySelector(".set-rep").placeholder = setData.reps || 0;

    // Input the value from duration/weight depending on the exercise type
    if (exerciseType === 'weight') {
      row.querySelector(".set-value").placeholder = setData.weight || 0;
    } else if (exerciseType === 'duration') {
      row.querySelector(".set-rep").placeholder = setData.duration || 0;
    }
  }

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
  if (freeze_button) {
    freeze_button.removeEventListener("click", toggleFreeze);
    freeze_button.addEventListener("click", function (event) {
      toggleFreeze(event);
      autofill_set_desc(row);
    });
  };
  

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

  let bestValue = 0;
  let bestRep = 0;

  rows.forEach((row, index) => {
    if (index === 0) return;

    const prevValue = rows[index - 1].querySelector(".set-value").value;
    const prevRep = rows[index - 1].querySelector(".set-rep").value;

    // Update best values if new record found
    if (prevValue && +prevValue > bestValue) bestValue = +prevValue;
    if (prevRep && +prevRep > bestRep) bestRep = +prevRep;

    const valueInput = row.querySelector(".set-value");
    const repInput = row.querySelector(".set-rep");

    // Only assign if not already populated by placeholder
    if (!valueInput.placeholder || valueInput.placeholder === "0") {
      valueInput.placeholder = bestValue;
    }

    if (!repInput.placeholder || repInput.placeholder === "0") {
      repInput.placeholder = bestRep;
    }
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
            <button class="full-button blue add-exercise-btn">+ Add Exercises</button>
            <button class="full-button red cancel-btn">Cancel Workout</button>
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
        <button type="button" class="full-button grey add-set-btn">+ Add Set</button>
    `;

const SET_ROW_HTML = `
    <td class="set-number"></td> 
    <td class="long-cell"><input type="text" class="set-description" placeholder="-"></td>
    <td class="long-cell"><input type="number" class="numInput set-value" placeholder="0"></td>
    <td class="long-cell"><input type="number" class="numInput set-rep" placeholder="0"></td> 
    <td class="short-cell"><button type="button" class="set-status">✓</button></td>
    <td class="short-cell"><button type="button" class="small-button delete-btn">x</button></td>
    `;


const PREFILLED_WORKOUT_FORM_HTML = `
    <form class="workout-form">
        <input type="submit" class="small-button finish-button" value="Finish">
        <input type="text" class="workout-name" placeholder="">
        <textarea placeholder="Notes" id="workout-notes" class="workout-notes" name="workout-notes" rows="4"></textarea>
        <div class="exercise-list"></div>
        <button class="full-button blue add-exercise-btn">+ Add Exercises</button>
        <button class="full-button red cancel-btn">Cancel Workout</button>
    </form>   
`;


const PREFILLED_EXERCISE_HEADER_HTML = `
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
    <button type="button" class="full-button grey add-set-btn">+ Add Set</button>
`;


const PREFILLED_SET_ROW_HTML = `
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
    <button class="full-button blue inverted new-workout-button">Start an Empty Workout</button>
  </div>
  <div class="my-template-container">
    <div class="my-template-header">
      <h2>Templates</h2>
      <button class="widget-button create-template">+ Template</button>
    </div>
    <h3>My Templates</h3>
  </div>
  <div class="template-cards-container"></div>

`;

const TEMPLATE_CARD_HTML = `
  <div class="template-card-header">
    <h3 class="saved-temlate-name">__NAME__</h3>
    <div class="dropdown">
      <button class="dropdown-toggle">…</button>
      <div class="dropdown-menu">
        <button onclick="start_workout_from_template(__ID__)">Start Workout</button>
        <button onclick="editTemplate(__ID__)">Edit</button>
        <button onclick="deleteTemplate(__ID__)">Delete</button>
      </div>
    </div>
  </div>
  <p class="saved-temlate-desc">__DESC__</p>
  <p class="saved-temlate-days-counter">Last updated: __DAYS__</p>
`;


const NEW_TEMPLATE_WORKOUT_HTML = `
        <form class="new-template-form">
          <div class="form-header">
            <button class="small-button return-button">X</button>
            <input type="submit" class="small-button finish-button" value="Finish">
          </div>
            <input type="text" class="template-name" placeholder="New Template">
            <textarea placeholder="Notes" id="template-notes" class="template-notes" name="template-notes" rows="4"></textarea>
            <div class="exercise-list"></div>
            <button type="button" class="full-button blue add-exercise-btn">+ Add Exercises</button>
        </form>   
    `;


const NEW_TEMPLATE_EXERCISE_HTML = `
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
            </tr>
        </thead>
        <tbody class="set-body">
        </tbody>
    </table>
    <button type="button" class="full-button grey add-set-btn">+ Add Set</button>
`;

const NEW_TEMPLATE_SET_ROW_HTML = `
    <td class="set-number"></td> 
    <td class="long-cell"><input type="text" class="set-description" placeholder="-"></td>
    <td class="long-cell"><input type="number" class="numInput set-value" placeholder="0"></td>
    <td class="long-cell"><input type="number" class="numInput set-rep" placeholder="0"></td> 
    <td class="short-cell"><button type="button" class="small-button delete-btn">x</button></td>
    `;