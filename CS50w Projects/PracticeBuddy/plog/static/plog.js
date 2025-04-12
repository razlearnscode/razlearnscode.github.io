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
    document.querySelector(".log-view-container").style.display = 'none';
    document.querySelector(".home-view-container").style.display = 'block';
    show_home_view();
}

function get_log_view() {
    document.querySelector(".home-view-container").style.display = 'none';
    document.querySelector(".log-view-container").style.display = 'block';
    document.querySelector(".navbar").style.display = 'none';
    show_empty_log_view()
}

function show_home_view() {

    const home_view_container = document.querySelector(".home-view-container");

    const home_content = document.createElement("div");
    home_content.className = "home-content"

    home_content.innerHTML = HOME_VIEW_HTML;

    home_view_container.append(home_content);
}

function show_empty_log_view() {

    const log_view_container = document.querySelector(".log-view-container");

    const new_log = document.createElement("div");
    new_log.className = "new-log-container";

    new_log.innerHTML = LOG_FORM_HTML;

    log_view_container.append(new_log);

    const log_form = new_log.querySelector(".log-form");
    const exercise_list = new_log.querySelector(".exercise-list");
    const add_exercise_btn = new_log.querySelector(".add-exercise-btn");
    const cancel_btn = new_log.querySelector(".add-exercise-btn");

    add_exercise_btn.addEventListener("click", function(event) {
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


    create_session_row(session_body, sessionHTML);
    create_session_row(session_body, sessionHTML);
    create_session_row(session_body, sessionHTML);

    if (exerciseData) {
        // Let's do nothing for now, until I set up the template later
    } else {
        // Empty log --> Call create session row function
        
    }
    
    return exercise_container;

}


function create_session_row(session_body, sessionHTML, setData = null) {
    
    const row = document.createElement("tr");
    row.className = "session-row";
    row.innerHTML = sessionHTML;

    session_body.append(row)

    // FUNCTIONS
    // 1. save function
    // 2. Delete function
    // (Optional) copy latest input 
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
            <input type="submit" class="button small" style="margin-left: auto;" value="Finish">
            <input type="text" class="log-name" placeholder="New Log">
            <p>[00:00]</p>
            <textarea placeholder="Notes" id="log-notes" class="log-notes" name="log-notes" rows="3"></textarea>
        </div>

        <div class="log-form-content">
            <div class="exercise-list"></div>
            <button class="button full add-exercise-btn">+ Add Exercises</button>
            <button class="button full cancel-btn">Cancel Workout</button>
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
    <button type="button" class="button full">+ Add Session</button>
`;

const SESSION_ROW_HTML = `
    <td><input type="number" class="session-score" placeholder="/5"></td>    
    <td><input type="text" class="session-duration" placeholder="00:00"></td>
    <td><input type="number" class="session-bpm" placeholder="0"></td>
    <td><input type="number" class="session-speed" placeholder="0"></td> 
    <td><button type="button" class="session-status">✓</button></td>
    <td><button type="button" class="small-button delete-btn">x</button></td>
    `;
