let logged_in_user = null; // get the user info globally

document.addEventListener("DOMContentLoaded", async () => {
  // Having await helps that I don't have to wait for user to load, I can still proceed with the below function call
  logged_in_user = await get_user(); // Fetch one and reuse for all functions
  show_records_view();
});

function get_user() {
  return fetch("/user").then((response) => response.json());
}

// Small helper to format dates nicely
function formatDate(isoString) {
    const date = new Date(isoString);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  }

function show_records_view() {
  const records_view_container = document.querySelector(
    ".records-view-container"
  );

  const records_view_content = document.createElement("div");
  records_view_content.className = "records-view-content";
  records_view_content.innerHTML = RECORDS_CONTENT_HTML;

  records_view_container.append(records_view_content);

  // Populate the records based on selection

  const exercise_dropdown =
    records_view_container.querySelector(".exercise-selector");

  fetch(`user/1/exercises`)
    .then((response) => response.json())
    .then((exercises) => {
      exercises.forEach((exercise) => {
        const exercise_option = document.createElement("option");
        exercise_option.value = exercise.exercise_id;
        exercise_option.textContent = exercise.exercise_name;

        exercise_dropdown.appendChild(exercise_option);
      });
    });

  // Handle after user has made the selection
  exercise_dropdown.addEventListener("change", (event) => {
    const selectedExercise = event.target.value;

    // Clear any existing cards
    const existingCards =
      records_view_content.querySelectorAll(".exercise-card");
    existingCards.forEach((card) => card.remove());

    if (selectedExercise) {
      // Display tracker chart
      show_chart(selectedExercise);

      // Display all the log records
      display_exercise_records(records_view_content, selectedExercise);
    }
  });
}

function display_exercise_records(records_view_content, exerciseID) {
  const exercise_log_history = records_view_content.querySelector(
    ".exercise-log-history"
  );

  fetch(`exercise/${exerciseID}`)
    .then((response) => response.json())
    .then((data) => {
      const logs_from_exercise = data.sessions_by_log;

      logs_from_exercise.forEach((log) => {
        const exerciseCard = document.createElement("div");

         let filled_in_card = EXERCISE_RECORD_BY_LOG_HTML.replace(
          /__EXERCISE_NAME__/g,
          data.exercise_name
        )

        const formattedDate = formatDate(log.entry_date);
        filled_in_card = filled_in_card.replace(/__SESSION_DATE__/g, formattedDate);

        // Only insert the note if it exists
        if (log.exercise_notes) {
          filled_in_card = filled_in_card.replace(
            /__EXERCISE_NOTE__/,
            log.exercise_notes
          );
        } else {
          // Remove the entire <p class="exercise-record-notes">...</p> line
          filled_in_card = filled_in_card.replace(
            /<p class="exercise-record-notes">__EXERCISE_NOTE__<\/p>/,
            ""
          );
        }

        exerciseCard.className = "exercise-card";
        exerciseCard.innerHTML = filled_in_card;

        exercise_log_history.appendChild(exerciseCard);

        const session_table_body = exerciseCard.querySelector(
          ".session-table-body"
        );

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
      });

      // Populate the sessions from each log
    });
}

function show_chart(exerciseID) {

  fetch(`exercise/${exerciseID}`)
    .then((response) => response.json())
    .then((data) => {

        const logs_from_exercise = data.sessions_by_log;

        // 🧹 Sort ascending by date before plotting chart
        logs_from_exercise.sort((a, b) => new Date(a.entry_date) - new Date(b.entry_date));

        const dateLabels = [];
        const bestSessionBPM = [];
        const bestSessionSpeed = [];
        const bestSessionScore = [];

        logs_from_exercise.forEach((log) => {
            if (log.best_session) {

                const formattedDate = formatDate(log.entry_date);
                dateLabels.push(formattedDate);
                bestSessionBPM.push(log.best_session.bpm);
                bestSessionSpeed.push(log.best_session.speed);
                bestSessionScore.push(log.best_session.score);
            }
        });

        create_chart(dateLabels, bestSessionBPM, bestSessionSpeed, bestSessionScore);

    })
};

let currentChart = null;

function create_chart(dateLabels, bpmValues, speedValues, scoreValues) {

    if (currentChart) {
        currentChart.destroy();
    }

    const exerciseChart = document.getElementById("exerciseChart");

    currentChart = new Chart(exerciseChart, {
        type: "bar", // base type
        data: {
        labels: dateLabels, // x-axis = dates
        datasets: [
            {
            label: "BPM",
            type: "line", // 👈 line for BPM
            data: bpmValues, // BPM values
            borderColor: "#4C4C4C",
            backgroundColor: "#4C4C4C",
            yAxisID: "y-bpm", // maps to left y-axis
            tension: 0.4, // smooth line
            fill: false,
            pointBackgroundColor: "rgba(245, 245, 245)",
            pointRadius: 5,
            pointBorderWidth: 2,
            },
            {
            label: "Speed (%)",
            type: "bar",
            data: speedValues,
            backgroundColor: scoreValues.map(score => {
                // Example: Higher score = darker red
                if (score === 5) return "rgba(80, 166, 92, 1)";
                if (score === 4) return "rgba(80, 166, 92, 0.8)";
                if (score === 3) return "rgba(80, 166, 92, 0.4)";
                if (score === 2) return "rgba(80, 166, 92, 0.2)";
                return "rgba(80, 166, 92, 0.01)"; // score 1
            }),
            borderColor: "#50a65c",
            borderWidth: 1,
            yAxisID: "y-speed",

            },
        ],
        },
        options: {
        responsive: true,
        interaction: {
            mode: "index",
            intersect: false,
        },
        scales: {
            x: {
            grid: {
                drawOnChartArea: false, // removes right-side grid to make it cleaner
            },
            },
            "y-bpm": {
            type: "linear",
            position: "left",
            min: 0,
            max: 200,
            title: {
                display: true,
                text: "BPM",
            },
            grid: {
                drawOnChartArea: false, // removes right-side grid to make it cleaner
            },
            },
            "y-speed": {
            type: "linear",
            position: "right",
            min: 0,
            max: 100,
            ticks: {
                stepSize: 20, //
            },
            title: {
                display: true,
                text: "Speed (%)",
            },
            grid: {
                drawOnChartArea: false, // removes right-side grid to make it cleaner
            },
            },
        },
        plugins: {

            tooltip: {
                callbacks: {
                    afterBody: function(context) {
                      const index = context[0].dataIndex;
                      const score = scoreValues[index]; // you already pass this to create_chart
                      return `Score: ${score}/5`;
                    }
                  }
            },
        },
        },
    });
}

const RECORDS_CONTENT_HTML = `
<h3>Select your exercise</h3>
<select name="exercise-selector" class="exercise-selector">
    <option value="">-- Select an exercise --</option>
</select>
<div class="exercise-records-content">

    <div class="exercise-log-tracker">
        <h2 class="component-header">Tracker</h2>
        <div class="chart-container">
            <div class="score-legend">
                <p><b>Score:</b></p>
                <span class="score-box score-5"></span> 5/5
                <span class="score-box score-4"></span> 4/5
                <span class="score-box score-3"></span> 3/5
                <span class="score-box score-2"></span> 2/5
                <span class="score-box score-1"></span> 1/5
            </div>

            <canvas id="exerciseChart"></canvas>
        </div>
    </div>

    <div class="exercise-log-history">
        <h2 class="component-header">History</h2>
    </div>
</div>
`;

const EXERCISE_RECORD_BY_LOG_HTML = `
    
    <h4>__EXERCISE_NAME__</h4>
    <p class="log-date">__SESSION_DATE__</p>
    <div class="quote-container">
        <div><i class="fa-solid fa-quote-left"></i></div>
         <p class="exercise-record-notes">__EXERCISE_NOTE__</p>
    </div>
   

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
