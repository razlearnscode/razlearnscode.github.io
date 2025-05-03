// Session Timer click handling
export function toggle_session_timer(sessionRow) {
    const durationInput = sessionRow.querySelector(".session-duration");
    const session_save_btn = sessionRow.querySelector(".session-status");
    let seconds = parseInt(sessionRow.dataset.duration || "0"); // get the existing value, else starts again from zero
  
    const isPaused = sessionRow.dataset.paused === "true"; // check if the timer is paused
    const isRunning = !!sessionRow.dataset.timerId; // PLEASE NOTE: this is simply checking if the row.dataset.timerID exists
  
    // If the timing is available and running, then click on the button will save the timer
    if (isRunning) {
      clearInterval(Number(sessionRow.dataset.timerId));
      delete sessionRow.dataset.timerId; // Only remove timerID, but keep the duration intact. We'll use the duration to save
      sessionRow.dataset.paused = "true"; // set timer to pause
      session_save_btn.classList.add("is-selected"); // apply special UX for saved sessions to the button
      session_save_btn.classList.remove("is-unselected");
  
      // Styling the remaning elements
  
      // Make only the session timer readonly
      const session_timer = sessionRow.querySelector(".session-duration");
      session_timer.classList.add("is-saved");
      session_timer.readOnly = true;
  
      // For other session values, still allow manual input
      sessionRow.querySelectorAll(".session-input[data-mode='manual']").forEach((manualInputBox) => {
        manualInputBox.classList.add("is-saved");
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
        inputBox.readOnly = false; // Make the input no longer immutable
      });
    }
  }

  // 1. Function to format time
function formatTime(seconds) {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0"); // padStart is to format the string as 00:00
    const secs = String(seconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  }