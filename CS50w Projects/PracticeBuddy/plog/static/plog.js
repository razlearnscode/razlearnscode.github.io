import { renderStreak, countStreak } from './components/streak.js';
import { TimerManager, toggle_session_timer } from './components/timer.js';


// -- GLOBAL VALUES -- //

let logged_in_user = null; // get the user info globally

const timerManager = new TimerManager(); // initiallize timeManager so I can use it within my functions

document.addEventListener("DOMContentLoaded", async () => {
  // Having await helps that I don't have to wait for user to load, I can still proceed with the below function call
  logged_in_user = await get_user(); // Fetch one and reuse for all functions
  get_home_view();
});

function get_user() {
  return fetch("/user").then((response) => response.json());
}

function get_home_view() {
  document.querySelector(".log-view-container").style.display = "none";
  document.querySelector(".create-template-view").style.display = "none";
  document.querySelector(".home-view-container").style.display = "block";
  document.querySelector(".navbar").style.display = "block";

  const existing_home_view = document.querySelector(".home-content");

  // only show homeview if no existing content is available, to avoid adding it twice
  if (!existing_home_view) {
    show_home_view();
  }

  prepare_streakmap(logged_in_user.id);

  
}

function get_log_view() {
  document.querySelector(".home-view-container").style.display = "none";
  document.querySelector(".create-template-view").style.display = "none";
  document.querySelector(".log-view-container").style.display = "block";
  document.querySelector(".navbar").style.display = "none";
}

function get_new_template_view() {
  document.querySelector(".home-view-container").style.display = "none";
  document.querySelector(".log-view-container").style.display = "none";
  document.querySelector(".create-template-view").style.display = "block";
  document.querySelector(".navbar").style.display = "none";
}



function home_global_events_handler() {
  
  // DROPDOWN TOGGLE EVENT
  document.addEventListener("click", function(e) {

    const isToggle = e.target.classList.contains("dropdown-toggle");
    const clickedDropdown = e.target.closest(".dropdown");

    // 1. Close all other dropdown (not from my click)
    document.querySelectorAll(".dropdown.open").forEach(drop => {
      if (drop !== clickedDropdown) {
        drop.classList.remove("open");
      }
    });

    // 2. Display dropdown from current clicked toggle
    if (isToggle && clickedDropdown) {
      e.stopPropagation();
      clickedDropdown.classList.toggle("open");
    }

    // 3. Hanlde "Start plog from Template"
    if (e.target.classList.contains("start-plog-from-template-btn")) {
      e.stopPropagation();
      const template_card = e.target.closest(".template-card");
      const templateID = template_card.dataset.templateId;
      // Show new log with template info pre-filled
      start_log_from_template(templateID);
    };

    // 4. Handle Delete template event
    if (e.target.classList.contains("delete-plog-template-btn")) {
      e.stopPropagation();
      const template_card = e.target.closest(".template-card");
      const templateID = template_card.dataset.templateId;

      delete_template(templateID);

    };

  });
}

function prepare_streakmap(userID) {

  // -- 1. Display streakmap by default on initial load
  const defaultButtonSelected = document.querySelector(".range-btn[data-mode='preset'].active");
  if (defaultButtonSelected) {
    const defaultRange = parseInt(defaultButtonSelected.dataset.range);
    const today = new Date();
    const endDate = today;
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - defaultRange);

    display_streakmap(userID, startDate, endDate);
  }

  // -- 2. Handle all preset range buttons
  // Select only buttons with mode = preset
  document.querySelectorAll(".range-btn[data-mode='preset']").forEach(button => {
    
    button.addEventListener("click", () => {

      // Remove "active" class list from all other buttons
      document.querySelectorAll(".range-btn").forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");

      const range = parseInt(button.dataset.range); // get the range from data-range="X"
      const today = new Date();
      const endDate = today;
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - range);

      display_streakmap(userID, startDate, endDate);

    });
  });

  // -- 3. Handle custom date range
  const customBtn = document.getElementById("custom-date-btn");
  const datePicker = document.getElementById("custom-date-picker");

  // Show/hide the date picker
  customBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // Prevent click from bubbling up
    const isVisible = datePicker.style.display === "block";
    datePicker.style.display = isVisible ? "none" : "block";
    positionPickerBelowButton();
  });

  // Dismiss on outside click
  document.addEventListener("click", (e) => {
    if (!datePicker.contains(e.target) && e.target !== customBtn) {
      datePicker.style.display = "none";
    }
  });

  // Optional: also close on "Escape" key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      datePicker.style.display = "none";
    }
  });

  function positionPickerBelowButton() {

    // get the position and size of the button
    const rect = customBtn.getBoundingClientRect();
    datePicker.style.position = "absolute"; // Unlike static, seting as absolute allow this to be floating component.
    datePicker.style.top = `${rect.bottom + window.scrollY + 6}px`;
    datePicker.style.left = `${rect.left + window.scrollX}px`;
  }

  // Apply custom date
  document.getElementById("apply-custom-range").addEventListener("click", () => { 
    const start = new Date(document.getElementById("custom-start").value);
    const end = new Date(document.getElementById("custom-end").value);

    if (!start || !end || start > end) {
      alert("Invalid date range");
      return;
    }

    document.querySelectorAll(".range-btn").forEach(btn => btn.classList.remove("active"));
    customBtn.classList.add("active");
    
    datePicker.style.display = "none";
    display_streakmap(userID, start, end);
  });


}

function display_streakmap(userID, startDate, endDate) {

  // Clear existing streakmap before display new one
  const streakMap = document.getElementById("streak-map");
  if (streakMap) {
    streakMap.innerHTML = ""; // Clear before display
  }

  const streak_header = document.querySelector(".streak-header");


  fetch(`user/${userID}/log-dates/?range=30`)
  .then((response) => response.json())
  .then((logs) => {
    renderStreak("streak-map", logs, startDate, endDate, "month-labels");
    countStreak(logs, streak_header);
  })
  .catch((error) => {
    console.error("Failed to fetch streak map logs:", error);
  });
}

function forms_events_handler(logContainer) {
    
  logContainer.addEventListener("click", function (e) {

    const targetButton = e.target.closest("button"); // Set target to button to ensure the entire button is targeted (and not the icon inside it)

    if (!targetButton) return; // Not click if not a button

    const row = targetButton.closest(".session-row");
    if (!row) return;

    // SAVE Event
    if (targetButton.classList.contains("session-status")) {
      toggle_session_timer(row, timerManager); // Only for new template
    } else if (targetButton.classList.contains("delete-btn")) { // DELETE session event
      row.remove();
    }
  });
}



// 0000000000 --*-- HOME VIEW --*-- 0000000000 //
function show_home_view() {
  const home_view_container = document.querySelector(".home-view-container");

  const home_content = document.createElement("div");
  home_content.className = "home-content";

  home_content.innerHTML = HOME_VIEW_HTML;

  home_view_container.append(home_content);

  const new_empty_log_btn = home_content.querySelector(".start-empty-log-btn");
  const new_template_btn = home_content.querySelector(".new-template-btn");

  new_empty_log_btn.addEventListener("click", function(e) {
    e.stopPropagation();
    get_log_view();
    const empty_log_container = start_log();
  })
  
  new_template_btn.addEventListener("click", function(e) {
    e.stopPropagation();
    get_new_template_view();
    create_template();
  });

  show_saved_template(home_view_container);
}

function show_saved_template(home_view_container) {

  const template_cards_container = home_view_container.querySelector(".template-cards-container");

  fetch(`user/1/templates`)
  .then((response) => response.json())
  .then((saved_templates) => {

    saved_templates.forEach((tempEl) => {
        
        console.log(tempEl);

        const filled_in_template = TEMPLATE_CARD_HTML
        .replace(/__ID__/g, tempEl.id)
        .replace(/__NAME__/g, tempEl.name)
        .replace(/__DESC__/g, tempEl.desc || "")
        .replace(/__DAYS__/g, tempEl.days_since_updated === 0 ? 'Today' : `${tempEl.days_since_updated} days ago`);

        const template_card = document.createElement("div");
        template_card.className = "template-card";    

        // Add the ID to the template card
        template_card.dataset.templateId = tempEl.id;

        template_card.innerHTML = filled_in_template;
        template_cards_container.append(template_card);

    })

  })

  home_global_events_handler();

}

function start_log_from_template(templateId) {

  get_log_view();

  // GET API to collect all data related to the templateId for display
  fetch(`template/${templateId}`)
  .then((response) => response.json())
  .then((data)=> {

    const logName = data.name;

    // Start timer
    timerManager.startLogTimer(formatted => {
      document.querySelector(".log-timer").textContent = formatted;
    })


    const all_exercises = data.exercises;

      const log_container = start_log(templateId);
      const exercise_list = log_container?.querySelector(".exercise-list");  // allow to check if the component actually exists

      if (!log_container || !exercise_list) {
        console.error("DOM not ready yet - null component");
        return;   
      }

      document.querySelector(".log-name").value = logName;

      all_exercises.forEach((exerciseData) => {
        const exercise_element = add_exercise(EXERCISE_CONTENT_HTML, SESSION_ROW_HTML, exerciseData);
        exercise_list.append(exercise_element);
      });

      console.log("Log successfully prefilled from template.");
  })
  .catch((err) => {
    console.error("Error starting log from template:", err);
    alert("Something went wrong while loading your log.");
  });

}


// 0000000000 --*-- CREATE TEMPLATE VIEW --*-- 0000000000 //

function create_template() {

  forms_events_handler();

  const new_template_view = document.querySelector(".create-template-view");

  const new_template = document.createElement("div");
  new_template.className = "new-template-container";

  new_template.innerHTML = NEW_TEMPLATE_LOG_HTML;
  new_template_view.append(new_template);

  const template_form = new_template.querySelector(".log-form");
  const exercise_list = new_template.querySelector(".exercise-list");
  const add_exercise_btn = new_template.querySelector(".add-exercise-btn");
  const cancel_btn = new_template.querySelector(".cancel-btn");

  add_exercise_btn.addEventListener("click", function (event) {
    event.preventDefault();
    const new_exercise = add_exercise(NEW_TEMPLATE_EXERCISE_HTML, NEW_TEMPLATE_SESSION_HTML);
    exercise_list.append(new_exercise);
  });

  template_form.addEventListener("submit", function(event) {
    event.preventDefault();
    save_new_template(template_form);
  });

  cancel_btn.addEventListener("click", function(event) {
    event.preventDefault();
    new_template.remove();
    get_home_view();
  });

}

function save_new_template(new_template) {

  const templateName = new_template.querySelector(".log-name").value.trim();
  const templateDesc = new_template.querySelector(".template-desc").value.trim();

  const exercisesTemplate = [];
  const allExercises = new_template.querySelectorAll(".exercise-container");

  allExercises.forEach((single_exercise) => {
    const exerciseName = single_exercise.querySelector(".exercise-name").value;
    const allSessions = single_exercise.querySelectorAll(".session-row");

    const sessions = [];

    allSessions.forEach((row) => {
      
      const bpm = row.querySelector(".session-bpm").value || 0;
      const speed = row.querySelector(".session-speed").value || 0;
      const desc = `${exerciseName} - BPM: ${bpm} - @ ${speed} %`;
      
      sessions.push({
        bpm: parseInt(bpm),
        speed: parseInt(speed),
        desc: desc,
      });

    });


    exercisesTemplate.push({
      name: exerciseName,
      sessions: sessions,
      // notes = models.CharField(max_length=500, blank=True, null=True)
      // target = models.PositiveIntegerField(blank=True, null=True) # can be BPM, speed, etc. Keep it broad for now
      // category = models.CharField(max_length=64, choices=CATEGORIES, default='OTHERS', blank=True, null=True)
    });

    
  });

  const templateData = {
    name: templateName,
    desc: templateDesc,
    exercisesTemplate,
  };

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
    get_home_view();
  })
  .catch((error) => {
    console.error("Error saving template:", error);
    alert("There was an error saving your template.");
  });

}

function delete_template(templateID) {
  
  fetch(`template/${templateID}/delete`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
  })
  .then((response) => response.json())
  .then((data) => {

    if (data.success) {
      console.log("Template deleted!");

      // Remove the card from the UI
      const card = document.querySelector(`.template-card[data-template-id="${templateID}"]`);
      if (card) card.remove();
    }
  })
  .catch((error) => {
    console.error("Error deleting template:", error);
    alert("Failed to delete template. Please try again.");
  });

}

// 0000000000 --*-- LOG VIEW --*-- 0000000000 //
function start_log(templateID = null) {

  const log_view_container = document.querySelector(".log-view-container");

  const new_log = document.createElement("div");
  new_log.className = "log-container";

  if (templateID) {
    new_log.dataset.templateId = templateID;
  }

  new_log.innerHTML = LOG_FORM_HTML;

  log_view_container.append(new_log);

  const log_form = new_log.querySelector(".log-form");
  const exercise_list = new_log.querySelector(".exercise-list");
  const add_exercise_btn = new_log.querySelector(".add-exercise-btn");
  const cancel_btn = new_log.querySelector(".cancel-btn");

  add_exercise_btn.addEventListener("click", function (event) {
    event.preventDefault();
    const new_exercise = add_exercise(EXERCISE_CONTENT_HTML, SESSION_ROW_HTML);
    exercise_list.append(new_exercise);
  });

  forms_events_handler(new_log);

  cancel_btn.addEventListener("click", function(event) {
    event.preventDefault();
    new_log.remove();
    get_home_view();
  });

  log_form.addEventListener("submit", function(event) {
    event.preventDefault();
    save_log(new_log);

  });

  return new_log;


}

function add_exercise(exerciseHTML, sessionHTML, exerciseData = null) {
  const exercise_container = document.createElement("div");
  exercise_container.className = "exercise-container";

  exercise_container.innerHTML = exerciseHTML;

  const session_body = exercise_container.querySelector(".session-body");

  if (exerciseData) {
    
    // Prefill the exercises with existing data 
    if (exerciseData.exercise_name) {

      exercise_container.querySelector(".exercise-name").value = exerciseData.exercise_name;
      if (exerciseData.exercise_id != null) {
        exercise_container.dataset.templateId = exerciseData.exercise_id;
      }
    }
    
  } else {
    // Empty log --> Call create session row function
    const default_row = create_session_row(session_body, sessionHTML);
  }

  // Add Event listener for 'Add Exercise Btn'
  exercise_container
    .querySelector(".add-session-btn")
    .addEventListener("click", function (event) {
      event.preventDefault();
      create_session_row(session_body, sessionHTML);
    });

  return exercise_container;
}


function create_session_row(session_body, sessionHTML, setData = null) {
  const row = document.createElement("tr");
  row.className = "session-row";
  row.innerHTML = sessionHTML;

  session_body.append(row);

  if (row.querySelector(".session-status")) {
    toggle_session_timer(row, timerManager); // Only toggle this if the session duration is available
  }

  return row;
}


function save_log(new_log) {

    // Stop the log timer 
    const timerResult = timerManager.stopLogTimer();

    const logName = new_log.querySelector(".log-name").value.trim();
    const logNotes = new_log.querySelector(".log-notes").value.trim();
    const logTemplate = new_log.dataset.templateId || null;

    const exercises = [];

    const allExercises = new_log.querySelectorAll(".exercise-container");

    allExercises.forEach((single_exercise) => {
      
      const exerciseName = single_exercise.querySelector(".exercise-name").value.trim();
      const exerciseNotes = single_exercise.querySelector(".exercise-notes").value.trim();
      const exerciseID = single_exercise.dataset.templateId;
      const category = "OTHERS"; // default to this now. I'll update this later
      
      const sessions = [];

      const allSessions = single_exercise.querySelectorAll(".session-row");

      allSessions.forEach((row) => {

        if (row.dataset.paused === "true") { // Check if the timer has been stopped (saved) for the session
          const score = row.querySelector(".session-score").value || 1;
          const bpm = row.querySelector(".session-bpm").value || 0;
          const speed = row.querySelector(".session-speed").value || 0;
          const desc = `${exerciseName} - BPM: ${bpm} - @ ${speed} %`;
          const duration = row.dataset.duration || 0;

          sessions.push({
            score: parseInt(score),
            desc: desc,
            bpm: parseInt(bpm),
            speed: parseInt(speed),
            duration: parseInt(duration),
          });
        }
      });

      // Update the exercises in the list
      exercises.push({ 
        id: exerciseID,
        name: exerciseName,
        category,
        notes: exerciseNotes,
        sessions,
      });
    });

    const logData = {
      name: logName,
      notes: logNotes,
      duration: timerResult.seconds,
      exercises,
      template_id: logTemplate,
    }

    // Make the POST request
    fetch("/save_log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(logData),
    })
    .then((response) => response.json())
    .then((data) =>{ // receive the response from the API
      console.log("Log saved", data);
      alert("Log data saved!");

      // Clear the old log after successful submission
      document.querySelector(".log-container").remove();
      get_home_view(); // return back to Home
    })
    .catch((error) => {
      console.error("Error saving log:", error);
      alert("There was an error saving your log")
    });

}

// 000000000 --*-- ALL HTML TEMPLATES --*-- 000000000 //

// --*-- HOME VIEW TEMPLATES --*-- //
const HOME_VIEW_HTML = `

    <div class="new-log-container">
        <h3>Quick Start</h3>
        <button class="button button--primary button--full start-empty-log-btn">Start Plogging</button>
    </div>
    <div class="streak-header">
      <h2>Log Streaks</h2>
      <h1 class="streak-counter" style="margin-left:auto;"></h1>
    </div>

    <div class="date-range-selector">  
          <button class="range-btn start" data-mode="preset" data-range="30">30d</button>
          <button class="range-btn active" data-mode="preset" data-range="60">60d</button>
          <button class="range-btn" data-mode="preset" data-range="90">90d</button>        
          <button class="range-btn end custom-date-btn" data-mode="custom" id="custom-date-btn">
            <i class="fa-solid fa-calendar-day"></i> Custom
          </button>

        <div id="custom-date-picker" class="floating-date-picker">
           <label>Start:
              <input type="date" id="custom-start" />
            </label>
            <label>End:
              <input type="date" id="custom-end" />
            </label>
            <button id="apply-custom-range">Apply</button>
        </div>

    </div>

    <div class="streak-row-wrapper">
        <div class="day-labels">
          <div class="day-label">Sun</div>
          <div class="day-label">Mon</div>
          <div class="day-label">Tue</div>
          <div class="day-label">Wed</div>
          <div class="day-label">Thu</div>
          <div class="day-label">Fri</div>
          <div class="day-label">Sat</div>
        </div>

        <div class="streak-container">
          <div class="streak-map-wrapper">
            <div id="streak-map" class="streak-map"></div>
          </div>
          <div id="month-labels" class="month-labels"></div>
        </div>
    </div>
    


    <div class="my-template-container">
      <div class="my-template-header">
        <h2>Templates</h2>
        <button class="button button--secondary new-template-btn">+ Template</button>
      </div>
      <h3>My Templates</h3>
      <div class="template-cards-container"></div>
    </div>
`;

const TEMPLATE_CARD_HTML = `
  <div class="template-card-header">
    <h3 class="saved-temlate-name">__NAME__</h3>
    <div class="dropdown">
      <button class="dropdown-toggle">…</button>
      <div class="dropdown-menu">
        <button class="start-plog-from-template-btn">Start Plog</button>
        <button class="edit-plog-template-btn">Edit</button>
        <button class="delete-plog-template-btn">Delete</button>
      </div>
    </div>
  </div>
  <p class="saved-temlate-desc">__DESC__</p>
  <p class="saved-temlate-days-counter">Last updated: __DAYS__</p>
`;


// --*-- NEW TEMPLATE VIEW TEMPLATES --*-- //
const NEW_TEMPLATE_LOG_HTML = `
  <form class="log-form">
    <div class="log-form-header">
      <input type="submit" class="button button--primary" style="margin-left: auto;" value="Finish">
      <input type="text" class="log-name" placeholder="Name the Template">
      <textarea placeholder="Description" id="template-desc" class="template-desc" name="template-desc" rows="3"></textarea>
    </div>

      <div class="log-form-content">
        <div class="exercise-list"></div>
        <button class="button button--primary button--full add-exercise-btn"><i class="fa-solid fa-plus"></i> Add Exercises</button>
        <button class="button button--full button--danger cancel-btn">Cancel</button>
    </div>
  </form>   
`;

const NEW_TEMPLATE_EXERCISE_HTML = `
      <input type="text" class="exercise-name" placeholder="Name Your Exercise">
        <table class="session-table">
            <thead>
                <tr>
                    <th class="score-header">★</th>
                    <th class="target-duration-header">Duration</th>
                    <th class="bpm-header">BPM</th>
                    <th class="speed-header">Speed</th>
                    <th class="delete-header"> </th>
                </tr>
            </thead>
            <tbody class="session-body">
                
            </tbody>
        </table>
    <button type="button" class="button button--thin button--secondary add-session-btn"><i class="fa-solid fa-plus"></i> Add Session</button>
`;

// Let's update and remove the readonly in session-template-duration later
const NEW_TEMPLATE_SESSION_HTML = `
  <td class="score-cell"><input type="number" class="session-score" placeholder="1-5" min="1" max="5"></td>    
  <td class="target-duration-cell"><input type="text" class="session-duration" placeholder="00:00" readonly></td>
  <td class="bpm-cell"><input type="number" class="session-bpm" placeholder="0" min="0"></td>
  <td class="speed-cell"><input type="number" class="session-speed" placeholder="0" min="0" max="200"></td> 
  <td class="delete-cell"><button type="button" class="button button--danger delete-btn">x</button></td>
`;


// --*-- LOG VIEW TEMPLATES --*-- //

const LOG_FORM_HTML = `

    <form class="log-form">
        <div class="log-form-header">
            <input type="submit" class="button button--primary" style="margin-left: auto;" value="Finish">
            <input type="text" class="log-name" placeholder="New Log">
            <p class="log-timer">00:00</p>
            <textarea placeholder="Notes" id="log-notes" class="log-notes" name="log-notes" rows="2"></textarea>
        </div>

        <div class="log-form-content">
            <div class="exercise-list"></div>
            <button class="button button--primary button--full add-exercise-btn"><i class="fa-solid fa-plus"></i> Add Exercises</button>
            <button class="button button--full button--danger cancel-btn">Cancel Log</button>
        </div>
    </form>   
`;

const EXERCISE_CONTENT_HTML = `

    <input type="text" class="exercise-name" placeholder="Name Your Exercise">
    <div class="exercise-note-container">
      <textarea placeholder="Exercise Notes" id="exercise-notes" class="exercise-notes" name="exercise-notes" rows="1"></textarea>
      <button type="button" class="button button--secondary button--compact pin-btn"><i class="fa-solid fa-thumbtack"></i></button>
    </div>
    
        <table class="session-table">
            <thead>
                <tr>
                    <th class="score-header">★</th>
                    <th class="duration-header">Duration</th>
                    <th class="bpm-header">BPM</th>
                    <th class="speed-header">Speed</th>
                    <th class="status-header"><i class="fa-solid fa-bookmark"></i></th>
                    <th class="delete-header"><i class="fa-solid fa-trash"></i></th>
                </tr>
            </thead>
            <tbody class="session-body">
                <!-- Rows will be generated dynamically -->
            </tbody>
        </table>
    <button type="button" class="button button--thin button--secondary add-session-btn"><i class="fa-solid fa-plus"></i> Add Session</button>
`;

const SESSION_ROW_HTML = `
    <td class="score-cell"><input type="number" data-mode="manual" class="session-input session-score" placeholder="1-5" min="1" max="5"></td>    
    <td class="duration-cell"><input type="text" data-mode="auto" class="session-input session-duration" placeholder="00:00" readonly></td>
    <td class="bpm-cell"><input type="number" data-mode="manual" class="session-input session-bpm" placeholder="0" min="0"></td>
    <td class="speed-cell"><input type="number" data-mode="manual" class="session-input session-speed" placeholder="0" min="0" max="200"></td> 
    <td class="status-cell"><button type="button" class="button is-unselected button--compact session-status"><i class="fa-solid fa-bookmark"></i></button></td>
    <td class="delete-cell"><button type="button" class="button button--danger button--compact delete-btn"><i class="fa-solid fa-trash"></i></button></td>
    `;


