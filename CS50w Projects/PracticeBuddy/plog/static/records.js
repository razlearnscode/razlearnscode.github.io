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
  
    const records_view_content = document.createElement("div");
    records_view_content.className = "records-view-content";
    records_view_content.innerHTML = RECORDS_CONTENT_HTML;
  
    records_view_container.append(records_view_content);

    // Populate the records based on selection

    const exercise_dropdown = records_view_container.querySelector(".exercise-selector");

    fetch(`user/1/exercises`)
    .then((response) => response.json())
    .then((exercises) => {

        exercises.forEach((exercise) => {

            const exercise_option = document.createElement("option");
            exercise_option.value = exercise.exercise_id;
            exercise_option.textContent = exercise.exercise_name;
            
            exercise_dropdown.appendChild(exercise_option);
        })
    })

    // Handle after user has made the selection
    exercise_dropdown.addEventListener("change", (event) => {
        const selectedExercise = event.target.value;

        // Clear any existing cards
        const existingCards = records_view_content.querySelectorAll(".exercise-card");
        existingCards.forEach((card) => card.remove());


        if (selectedExercise) {
            display_exercise_records(records_view_content, selectedExercise);
        }
    });
 
}

function display_exercise_records(records_view_content, exerciseID) {

    const exercise_log_history = records_view_content.querySelector(".exercise-log-history");

    fetch(`exercise/${exerciseID}`)
    .then((response) => response.json())
    .then((data) => {

        const log_from_exercise = data.sessions_by_log;

        log_from_exercise.forEach((log) => {

            const exerciseCard = document.createElement("div");

            filled_in_card = EXERCISE_RECORD_BY_LOG_HTML
            .replace(/__EXERCISE_NAME__/g, data.exercise_name)
            .replace(/__SESSION_DATE__/g, log.entry_date)

            // Only insert the note if it exists
            if (log.exercise_notes) {
                filled_in_card = filled_in_card.replace(/__EXERCISE_NOTE__/, log.exercise_notes);
            } else {
                // Remove the entire <p class="exercise-record-notes">...</p> line
                filled_in_card = filled_in_card.replace(/<p class="exercise-record-notes">__EXERCISE_NOTE__<\/p>/, "");
            }


            exerciseCard.className = "exercise-card";
            exerciseCard.innerHTML = filled_in_card;
    
            exercise_log_history.appendChild(exerciseCard);

            const session_table_body = exerciseCard.querySelector(".session-table-body");

            const sessions_from_log = log.sessions;

            sessions_from_log.forEach((session) => {

                const session_record = document.createElement("tr");
                session_record.className = "session-record";

                session_record.innerHTML = `
                    <td>${session.bpm}</td>
                    <td>${session.speed}</td>
                    <td>${session.score}</td>
                `;

                session_table_body.appendChild(session_record);

            });

        })
        
        // Populate the sessions from each log
    })

}

const RECORDS_CONTENT_HTML = `
<h3>Select your exercise</h3>
<select name="exercise-selector" class="exercise-selector">
    <option value="">-- Select an exercise --</option>
</select>
<div class="exercise-records-content">

    <div class="exercise-log-tracker">
        <h2 class="component-header">Tracker</h2>
    </div>

    <div class="exercise-log-history">
        <h2 class="component-header">History</h2>
    </div>
</div>
`;

const EXERCISE_RECORD_BY_LOG_HTML = `
    
    <h4>__EXERCISE_NAME__</h4>
    <p class="log-date">__SESSION_DATE__</p>
    <p class="exercise-record-notes">__EXERCISE_NOTE__</p>

        <table class="exercise-table">
            <thead>
                <tr>
                    <th>BPM</th>
                    <th>Speed</th>
                    <th>Score</th>
                </tr>
            </thead>
            <tbody class="session-table-body">
                
            </tbody>
        </table>
`;

