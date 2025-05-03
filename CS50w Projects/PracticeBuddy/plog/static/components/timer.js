// Session Timer click handling
export function toggle_session_timer(sessionRow, timerManager) {
    const durationInput = sessionRow.querySelector(".session-duration");
    const session_save_btn = sessionRow.querySelector(".session-status");


    // Start Toggle using TimeManager
    const sessionTimer = timerManager.toggleSessionTimer(sessionRow, (formatted, seconds) => {
        durationInput.value = formatted; // display the timer on the form
        sessionRow.dataset.duration = seconds; // update the duration dataset in session-row for later storage
    });

    const isPaused = sessionTimer === "paused"; // I can do this because toggleSessionTimer returns "paused" or "running"

    // If timer is paused, then freeze all the input and pause the timer
    // If timer is running, then show the timer running
    if (isPaused) {
        
        // Freeze session duration input
        durationInput.classList.add("is-saved");
        durationInput.readOnly = true;
        
        // Freeze the session-save button
        session_save_btn.classList.add("is-selected");
        session_save_btn.classList.remove("is-unselected");

        // Allow manual input only for non-timer fields
        sessionRow.querySelectorAll(".session-input[data-mode='manual']").forEach((manualInputBox) => {
            manualInputBox.classList.add("is-saved");
        });
    } else { // if timer is running

        // Enable manual input
        sessionRow.querySelectorAll("input").forEach((inputBox) => {
            inputBox.classList.remove("is-saved");
            inputBox.readOnly = false;
        });
      
        // Remove the saved UI (green)
        session_save_btn.classList.remove("is-selected");
        session_save_btn.classList.add("is-unselected");
    }
}

export class TimerManager {
  constructor() {
    this.sessions = new Map(); // key = DOM row, value = timer object
    this.logTimer = null;
    this.logSeconds = 0;
  }

  formatTime(seconds) {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  }

  // ----------------------------
  // LOG-LEVEL TIMER
  // ----------------------------

  startLogTimer(displayCallback) {
    this.logSeconds = 0;
    this.logTimer = setInterval(() => {
      this.logSeconds++;
      // Explain the code below:
      // As long as there's a variable passed when calling this function
      // e.g. startLogTimer(formatted) --> Then we can pass the value to this parameter
      if (displayCallback) displayCallback(this.formatTime(this.logSeconds));
    }, 1000);
  }

  stopLogTimer() {
    if (this.logTimer) {
      clearInterval(this.logTimer);
      this.logTimer = null;
    }
    return {
      seconds: this.logSeconds,
      formatted: this.formatTime(this.logSeconds),
    };
  }

  // ----------------------------
  // SESSION TIMERS
  // ----------------------------

  // What does "onTick" do?
  // Without onTick, the timer could count internally, but nothing would update on screen
  // | What it is | A function passed into toggleSessionTimer |
  // | When it's called | Once per second while the timer is running |
  // | What it does | Lets you define how to update the UI (or other logic) |

  startSessionTimer(row, onTick) {
    let seconds = parseInt(row.dataset.duration || "0"); // get the current timer value, else start from 0 if non exists
    const intervalId = setInterval(() => {
      seconds++;
      row.dataset.duration = seconds;
      if (onTick) onTick(this.formatTime(seconds), seconds); // returns the "formatted" seconds (for display) and actual seconds (for storage)
      // this works because in toggleSessionTimer, I passed (formatted, seconds) to it
    }, 1000);

    // Internally tracks the timer using a Map (find the timer in question)
    // Associates the DOM row with its timer info
    // So you can later pause/stop that exact row’s timer
    this.sessions.set(row, { intervalId, seconds }); // map the session to that row
    row.dataset.paused = "false";
  }

  stopSessionTimer(row) {
    const timer = this.sessions.get(row);
    if (timer) {
      clearInterval(timer.intervalId);
      this.sessions.delete(row); // stops and removes the session timer for a row.
      row.dataset.paused = "true";
    }
  }

  // Toggle to stop/resume time
  // This function will use the startSessionTimer and stopSessionTimer internally
  toggleSessionTimer(row, onTick) { // pass "formatted" and "seconds" to onTick
    if (this.sessions.has(row)) { 
      this.stopSessionTimer(row);
      return "paused"; // return ause after have stopped the timer and removed the session
    } else {
      this.startSessionTimer(row, onTick);
      return "running";
    }
  }

  getSessionDuration(row) {
    const seconds = parseInt(row.dataset.duration || "0");
    return {
      seconds,
      formatted: this.formatTime(seconds),
    };
  }
}
  