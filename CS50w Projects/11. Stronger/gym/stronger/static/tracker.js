document.addEventListener("DOMContentLoaded", function () {
    start_work_out();

});

function start_work_out() {

    // Start a blank workout
    const new_workout = document.createElement("div");
    new_workout.className = "workout-container";

    new_workout.innerHTML = `
        <h2>New Workout</h2>
        <p>Notes</p>
        <div class="exercise-list"></div>
        <button class="button add-exercise-btn">+ Add Exercises</button>
        <button class="button cancel-btn">Cancel Workout</button>
    `;

    const add_exercise_btn = new_workout.querySelector(".add-exercise-btn")
    const exercise_list = new_workout.querySelector(".exercise-list");

    add_exercise_btn.addEventListener('click', function() {
        const empty_exercise = add_exercise();
        exercise_list.append(empty_exercise)
    })

    document.querySelector(".container").append(new_workout);

};

function add_exercise() {

    // Assume for the MVP, users won't be able to select existing exercises
    // Thus, we will generate new exercises from scratch

    // Requirement: New exercise will automatically create 3 sets
    const exercise_container = document.createElement("div");
    exercise_container.className = "exercise-container";

    const setNumber = 1;

    exercise_container.innerHTML = `
        <span>Name Your Exercise</span>
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
        <button class="button add-set-btn">+ Add Set</button>
    `;

    const set_body = exercise_container.querySelector(".set-body");

    function add_set_row() {
        
        const setRow = document.createElement("tr");
        setRow.className = "set-row";

        setRow.innerHTML = `
            <td class="set-number"></td> 
            <td class="set-description">-</td>
            <td><input type="number" class="set-value" placeholder="16"></td>
            <td><input type="number" class="set-rep" placeholder="16"></td>
            <td><button class="set-status">✓</button></td>
        `;

        set_body.append(setRow);

        const all_set_rows = set_body.querySelectorAll("tr");
        
        update_set_index(all_set_rows); // auto index each row
        save_set(all_set_rows);
        
    }

    function save_set(all_set_rows) {
        
        all_set_rows.forEach((row) => {
            const value_completed = set_body.querySelector(".set-value");
            const rep_completed = set_body.querySelector(".set-rep");
            const save_button = row.querySelector(".set-status");

            save_button.addEventListener('click', function() {
                row.classList.toggle('saved'); // toggle between adding and removing "saved" upon each click
                // Don't do anything else here since only class with saved will be sent to server upon clicking the Finish button
            });
        
        });



    }
    
    // Reupdate all the index everytime this function is called
    function update_set_index(all_set_rows) {
        

        all_set_rows.forEach((row, index) => {
            // + 1 here because index starts at zero. But I want the first row to be 1
            // Not to confused that we need + 1 to increment for each row, index is already
            // recording the position of the current element
            row.querySelector(".set-number").textContent = index + 1;
        });

        // don't need to append here because I've updated the text content directly
    }

    // Add 3 initial sets
    for (let i = 0; i < 3; i++) {
        add_set_row();
    }

    // Auto index and add new set when + Add set button is clicked
    exercise_container.querySelector(".add-set-btn").addEventListener('click', function() {
        add_set_row();
    })

    return exercise_container;
}



