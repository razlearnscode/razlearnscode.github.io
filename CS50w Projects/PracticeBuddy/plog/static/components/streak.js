export function renderStreak(containerId, logDates, startDate, endDate, monthLabelId) {

    // Create a Set for faster lookup
    const activeDatesSet = new Set(logDates.map((log) => log.entry_date)); // Just the dates

    // Populate the streak map
    const streakMap = document.getElementById(containerId);
    const monthLabels = document.getElementById(monthLabelId);

    let currentMonth = "";
    let dayCounter = 0;
    let columnCounter = 0;

    if (!streakMap) {
        console.error(`Container with ID '${containerId}' not found.`);
        return;
    }

    if (!monthLabels) {
        console.error(`Month label component not found.`);
        return;
    }

    streakMap.innerHTML = ""; // Create empty string in advance so I can append to it
    monthLabels.innerHTML = ""; // same as above

    let d = new Date(startDate); // start counting from the start date

    const dayOfStartDate = d.getDay(); // Sunday = 0, Monday=1, etc

    // Start looping from first day of the week (Sunday) to the startDate. Hide if they are from the previous month
    // This makes the startDate clearer 
    for (let i = 0; i < dayOfStartDate; i++) {
        
        // Create but hide days if they are from previous month
        // This helps add padding so that the calendar don't always start with the current date, but the Sunday instead
        const emptyDiv = document.createElement("div");
        emptyDiv.classList.add("day"); // still create the day div, but hide it
        emptyDiv.style.visibility = "hidden"; // hide so that the startDate will starts the week 
        streakMap.appendChild(emptyDiv);

        // Display empty month labels if not the first week of the month
        const emptyMonthDiv = document.createElement("div");
        emptyMonthDiv.classList.add("month-label");
        emptyMonthDiv.textContent = "";
        monthLabels.appendChild(emptyMonthDiv);
    }

    while (d <= endDate) {

        // get the month from the current iterated date
        const nextMonth = d.toLocaleString("default", { month: "short"}); 

        const monthDiv = document.createElement("div");
        monthDiv.classList.add("month-label");

        if (nextMonth !== currentMonth) {
            monthDiv.textContent = nextMonth;
            currentMonth = nextMonth; // when we first start off with currentMonth = "", it will just be assigned to nextMonth
        } else {
            monthDiv.textContent = ""; // if not new month, then set to empty
        }
        monthLabels.appendChild(monthDiv);

        // Draw 7 days (one column)
        for (let i = 0; i < 7 && d <= endDate; i++) {
            const dayDiv = document.createElement("div");
            dayDiv.classList.add("day");

            const dateString= d.toISOString().split("T")[0]; // so you only get the date, no timestamp
            if (activeDatesSet.has(dateString)) {
                dayDiv.classList.add("active");
            }

            streakMap.appendChild(dayDiv);
            d.setDate(d.getDate() + 1); // increment the day to go through the loop
        }

    }

    // ⚡ Scroll the container to the right after rendering
    const container = document.querySelector(".streak-container");
    if (container) {
      container.scrollLeft = 0; // since RTL, this is now the "right end"
    }
    
}

export function countStreak(logDates, streakHeader) {

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    //need to update the mapping to only get dates, because logDates return the full API response, with other info besides entry_date
    // e.g. logDates return  { id: 1, entry_date: "2025-04-21", ... },
    // thus logDates.map(log => log.entry_date) means going through the logDates, map every row with only log.entry_date
    const allLogDates = new Set(logDates.map(log => log.entry_date));

    console.log(allLogDates);


    let streak = 0; // start counting streak from 0
    let currentDate = new Date(today); // get today's date

    // this way, if the user hasn't done a log for today, it still shows the current streak instead of resetting to 0

    // If today is not in logDates, start from yesterday
    // This helps to prevent reset the streak to 0 when user can still create the log today
    if (!allLogDates.has(todayStr)) {
        currentDate.setDate(currentDate.getDate() - 1);
    }

    // else, just start counting streak from today as normal
    while (true) {

        const dateStr = currentDate.toISOString().split("T")[0];

        // Count the streak from today backward
        // If the day before current date is not included in the set, then break the loop
        if (allLogDates.has(dateStr)) {
            streak++; // add to the streak
            // continue to go backward, until streak breaks
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            break;
        }
        
    }

    const streak_counter = streakHeader.querySelector(".streak-counter")

    streak_counter.innerText = `${streak} days`;

}


