let logged_in_user = null; // get the user info globally

document.addEventListener("DOMContentLoaded", async () => {
  // Having await helps that I don't have to wait for user to load, I can still proceed with the below function call
  logged_in_user = await get_user(); // Fetch one and reuse for all functions
  get_log_view();
});

function get_user() {
  return fetch("/user").then((response) => response.json());
}

function get_home_view() {
  document.querySelector(".log-view-container").style.display = "none";
  document.querySelector(".home-view-container").style.display = "block";
  show_home_view();
}

function get_log_view() {
  document.querySelector(".home-view-container").style.display = "none";
  document.querySelector(".log-view-container").style.display = "block";
  document.querySelector(".navbar").style.display = "none";
  show_empty_log_view();
}

function show_home_view() {
  const home_view_container = document.querySelector(".home-view-container");

  const home_content = document.createElement("div");
  home_content.className = "home-content";

  home_content.innerHTML = HOME_VIEW_HTML;

  home_view_container.append(home_content);
}

function global_click_event_handlers() {
  // Handle click event when the save button is pressed
  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("session-status")) {
      const row = e.target.closest(".session-row");
      console.log("Im clicked");
      toggle_session_timer(row);
    }
  });
}

function show_empty_log_view() {

    global_click_event_handlers();
  const log_view_container = document.querySelector(".log-view-container");

  const new_log = document.createElement("div");
  new_log.className = "new-log-container";

  new_log.innerHTML = LOG_FORM_HTML;

  log_view_container.append(new_log);

  const log_form = new_log.querySelector(".log-form");
  const exercise_list = new_log.querySelector(".exercise-list");
  const add_exercise_btn = new_log.querySelector(".add-exercise-btn");
  const cancel_btn = new_log.querySelector(".add-exercise-btn");

  add_exercise_btn.addEventListener("click", function (event) {
    event.preventDefault();
    const new_exercise = add_exercise(EXERCISE_CONTENT_HTML, SESSION_ROW_HTML);
    exercise_list.append(new_exercise);
  });
}

function add_exercise(exerciseHTML, sessionHTML, exerciseData = null) {
  const exercise_container = document.createElement("div");
  exercise_container.className = "exercise-container";

  exercise_container.innerHTML = exerciseHTML;

  const session_body = exercise_container.querySelector(".session-body");

  const default_row = create_session_row(session_body, sessionHTML);

  if (exerciseData) {
    // Let's do nothing for now, until I set up the template later
  } else {
    // Empty log --> Call create session row function
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

// Session Timer click handling
function toggle_session_timer(sessionRow) {
  const durationInput = sessionRow.querySelector(".session-duration");
  const session_save_btn = sessionRow.querySelector(".session-status");
  let seconds = parseInt(sessionRow.dataset.duration || "0"); // get the existing value, else starts again from zero

  const isPaused = sessionRow.dataset.paused === "true"; // check if the timer is paused
  const isRunning = !!sessionRow.dataset.timerId; // PLEASE NOTE: this is simply checking if the row.dataset.timerID exists

  // If the timing is available and running, then click on the button will save the timer
  if (isRunning) {
    clearInterval(Number(sessionRow.dataset.timerId));
    delete sessionRow.dataset.timerId; // notice that I'm only removing the timerID, I still keep the duration intact
    sessionRow.dataset.paused = "true";
    session_save_btn.classList.add("is-selected");
    session_save_btn.classList.remove("is-unselected");

    // Styling the remaning elements
    sessionRow.querySelectorAll("input").forEach((inputBox) => {
      inputBox.classList.add("is-saved");
      console.log("I was saved x4");
    });
  } else {
    // if no timer, then starts new one

    // Start the timer: the interval helps set a repeating action (every 1000ms = 1 second)
    const timerId = setInterval(() => {
      seconds++; // increase the timer
      durationInput.value = formatTime(seconds); // For FE: Fill up the durationInput with the formatted time in seconds
      // The below is equivalanet as <tr> data-duration="seconds"</tr>
      sessionRow.dataset.duration = seconds; // For BE: saves the raw second value as a data-duration attribute on the row
    }, 1000);

    // So in total, the sessionRow will look like this
    // <tr class="session-duration" data-duration="seconds" data-timerID="timerId"></tr>
    sessionRow.dataset.timerId = timerId; // this is to assign the corresponding timerID to the row
    sessionRow.dataset.paused = "false"; // since the timer is running, is paused = false
    session_save_btn.classList.remove("is-selected"); // make the button unselected again
    session_save_btn.classList.add("is-unselected");

    // Styling the remaning elements
    sessionRow.querySelectorAll("input").forEach((inputBox) => {
      inputBox.classList.remove("is-saved");
    });
  }
}

// Function to auto add a timer

// 1. Function to format time
function formatTime(seconds) {
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0"); // padStart is to format the string as 00:00
  const secs = String(seconds % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}

function create_session_row(session_body, sessionHTML, setData = null) {
  const row = document.createElement("tr");
  row.className = "session-row";
  row.innerHTML = sessionHTML;

  session_body.append(row);
  toggle_session_timer(row);
  return row;
}

// --*-- ALL HTML TEMPLATES --*-- //
const HOME_VIEW_HTML = `

    <div class="new-log-container">
        <h3>Quick Start</h3>
        <button class="button full">Start Plogging</button>
    </div>
`;

const LOG_FORM_HTML = `

    <form class="log-form">
        <div class="log-form-header">
            <input type="submit" class="button button--primary" style="margin-left: auto;" value="Finish">
            <input type="text" class="log-name" placeholder="New Log">
            <p>[00:00]</p>
            <textarea placeholder="Notes" id="log-notes" class="log-notes" name="log-notes" rows="3"></textarea>
        </div>

        <div class="log-form-content">
            <div class="exercise-list"></div>
            <button class="button button--primary button--full add-exercise-btn">+ Add Exercises</button>
            <button class="button button--full button--danger cancel-btn">Cancel Workout</button>
        </div>
    </form>   
`;

const EXERCISE_CONTENT_HTML = `

    <input type="text" class="exercise-name" placeholder="Name Your Exercise">
        <table class="session-table">
            <thead>
                <tr>
                    <th>★</th>
                    <th>Duration</th>
                    <th>BPM</th>
                    <th>Speed</th>
                    <th>✓</th>
                    <th> </th>
                </tr>
            </thead>
            <tbody class="session-body">
                <!-- Rows will be generated dynamically -->
            </tbody>
        </table>
    <button type="button" class="button button--thin button--secondary add-session-btn">+ Add Session</button>
`;

const SESSION_ROW_HTML = `
    <td><input type="number" class="session-score" placeholder="/ 5"></td>    
    <td><input type="text" class="session-duration" placeholder="00:00" readonly></td>
    <td><input type="number" class="session-bpm" placeholder="0"></td>
    <td><input type="number" class="session-speed" placeholder="0"></td> 
    <td><button type="button" class="button is-unselected session-status">✓</button></td>
    <td><button type="button" class="button button--danger delete-btn">x</button></td>
    `;
