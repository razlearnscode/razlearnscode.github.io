export function renderStreak(containerId) {

    const activeDates = [
        "2025-07-01",
        "2025-07-02",
        "2025-07-03",
        "2025-07-04",
        "2025-07-05",
        "2025-08-01",
        "2025-08-03",
        "2025-08-15",
        "2025-09-01",
        "2025-09-02",
      ];
    
    // Generate days (you can define the range you want)
    const startDate = new Date("2025-07-01");
    const endDate = new Date("2026-05-30");

    // Create a Set for faster lookup
    const activeSet = new Set(activeDates);

    // Populate the streak map
    const streakMap = document.getElementById(containerId);

    if (!streakMap) {
        console.error(`Container with ID '${containerId}' not found.`);
        return;
    }

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) { // Go through the loop and increment the date
        const dayDiv = document.createElement("div"); // create a day div for each date
        dayDiv.classList.add("day");

        const dateStr = d.toISOString().split("T")[0];
        if (activeSet.has(dateStr)) {
        dayDiv.classList.add("active");
        }

        streakMap.appendChild(dayDiv);
    }

}