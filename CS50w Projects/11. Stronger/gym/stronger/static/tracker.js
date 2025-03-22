document.addEventListener("DOMContentLoaded", function () {
  start_work_out();
});

function start_work_out() {
  // Start a blank workout
  const new_workout = document.createElement("div");
  new_workout.className = "workout-container";

  new_workout.innerHTML = `
        <form class="workout-form">
            <input type="submit" class="small-button finish-button" value="Finish">
            <input type="text" class="workout-name" placeholder="New Workout">
            <textarea placeholder="Notes" id="workout-notes" class="workout-notes" name="workout-notes" rows="4"></textarea>
            <div class="exercise-list"></div>
            <button class="full-button add-exercise-btn">+ Add Exercises</button>
            <button class="full-button cancel-btn">Cancel Workout</button>
        </form>   

    `;

  const add_exercise_btn = new_workout.querySelector(".add-exercise-btn");
  const exercise_list = new_workout.querySelector(".exercise-list");

  // --- EVENTS --- // 

  // 1. Add Exercise Event
  add_exercise_btn.addEventListener("click", function (event) {
    event.preventDefault(); // ✅ Prevent form from submitting
    const empty_exercise = add_exercise();
    exercise_list.append(empty_exercise);
  });

  document.querySelector(".container").append(new_workout);
}

function add_exercise() {
  // Assume for the MVP, users won't be able to select existing exercises
  // Thus, we will generate new exercises from scratch

  // Requirement: New exercise will automatically create 3 sets
  const exercise_container = document.createElement("div");
  exercise_container.className = "exercise-container";

  const setNumber = 1;

  exercise_container.innerHTML = `
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

  const set_body = exercise_container.querySelector(".set-body");

  function add_set_row() {
    const setRow = document.createElement("tr");
    setRow.className = "set-row";

    setRow.innerHTML = `
            <td class="set-number"></td> 
            <td class="set-description">-</td>
            <td><input type="number" class="set-value" placeholder="0"></td>
            <td><input type="number" class="set-rep" placeholder="0"></td> 
            <td><button type="button" class="set-status">✓</button></td>
            <td><button type="button" class="small-button delete-btn">x</button></td>
        `;

    set_body.append(setRow);

    const all_set_rows = set_body.querySelectorAll("tr");

    update_set_index(all_set_rows); // auto index each row
    freeze_set(all_set_rows); // freeze completed set - technically saving it
    copy_latest_input(all_set_rows); // mimic the latest input as the placeholder
    remove_row(all_set_rows);

  }

  function toggleFreeze(event) {
    event.currentTarget.closest("tr").classList.toggle("freeze");
  }

  function freeze_set(all_set_rows) {
    

    all_set_rows.forEach((row) => {
      const freeze_button = row.querySelector(".set-status");

      // Remove any previously assigned event listener before adding new one
      // This is an addional step to make sure that the event for each individual element is handled properly
      freeze_button.removeEventListener("click", toggleFreeze);
      freeze_button.addEventListener("click", toggleFreeze);
    });
  }

  // Reupdate all the index everytime this function is called
  function update_set_index(all_set_rows) {

    // Need to have the addition function to compare the existing location with the index

    all_set_rows.forEach((row, index) => {
      // + 1 here because index starts at zero. But I want the first row to be 1
      // Not to confused that we need + 1 to increment for each row, index is already
      // recording the position of the current element
      row.querySelector(".set-number").textContent = index + 1;
    });

    // don't need to append here because I've updated the text content directly
  }

  // Auto copy/paste the last input when creating the new set 
  function copy_latest_input(all_set_rows) {

    // if first row, then pull from best record
    let bestValue = 0;
    let bestRep = 0;
 
    all_set_rows.forEach((row,index) => {

        if (index === 0) return; // skip the first row

        const prevValue = all_set_rows[index-1].querySelector(".set-value").value; // get previous value
        const prevRep = all_set_rows[index-1].querySelector(".set-rep").value; // get previous rep

        // Default to current best
        row.querySelector(".set-value").placeholder = bestValue;
        row.querySelector(".set-rep").placeholder = bestRep;
        
        // Get the best record input (if prevValue exists and is greater than bestRep, then update)
        if (prevValue && + +prevValue > bestValue) bestValue = +prevValue;
        if (prevRep && + +prevRep > bestRep) bestRep = +prevRep;

        // Update the placeholders again with the latest record (if available)
        row.querySelector(".set-value").placeholder = bestValue;
        row.querySelector(".set-rep").placeholder = bestRep;

    }); 

  }

  function remove_row(all_set_rows) {
    
    all_set_rows.forEach((row,index) => {
        const delete_button = row.querySelector(".delete-btn")

        delete_button.addEventListener("click", function(event) {
            event.preventDefault(); // ✅ Prevent form from submitting1
            row.remove();

            // After removing row, re-select all rows for re-index
            const remaining_rows = set_body.querySelectorAll("tr");
            update_set_index(remaining_rows);
        });
    });


    
  }

  // Add 1 initial set when adding new exercises
  add_set_row();

  // Auto index and add new set when + Add set button is clicked
  exercise_container
    .querySelector(".add-set-btn")
    .addEventListener("click", function () {
      // Also note to prefill the character based on the last input within this
      add_set_row();
    });


  return exercise_container;
}
