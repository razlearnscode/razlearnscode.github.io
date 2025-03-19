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
    exercise_container.className = "exercise-container"

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
            <tbody>
                <tr>
                    <td class="set-number">-</td> 
                    <td class="set-description">-</td>
                    <td><input type="number" class="set-value"></td>
                    <td><input type="number" class="set-value"></td>
                    <td class="set-status">✔️</td>
                </tr>
    
                <tr>
                    <td class="set-number">-</td> 
                    <td class="set-description">-</td>
                    <td><input type="number" class="set-value"></td>
                    <td><input type="number" class="set-value"></td>
                    <td class="set-status">✔️</td>
                </tr>
    
                <tr>
                    <td class="set-number">-</td> 
                    <td class="set-description">-</td>
                    <td><input type="number" class="set-value"></td>
                    <td><input type="number" class="set-value"></td>
                    <td class="set-status">✔️</td>
                </tr>
            </tbody>
        </table>
        <button class="button add-set-btn">+ Add Set</button>
    `;

    return exercise_container;
}