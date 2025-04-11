// register the datalabels plugin
Chart.register(ChartDataLabels);

document.addEventListener("DOMContentLoaded", function () {
  show_chart();
});

function show_chart() {
  const ctx = document.getElementById("myChart");
  const exerciseId = 20;

  fetch(`/records/${exerciseId}`)
    .then((response) => response.json())
    .then((setData) => {
      const date_labels = [];
      const set_values = [];
      const reps_by_index = [];
      const data_labels_by_index = [];

      setData.forEach((set) => {
        date_labels.push(set.completed_date);
        set_values.push(set.weight);
        reps_by_index.push(set.reps);

        const label_value_pairs = [set.weight, set.reps];
        data_labels_by_index.push(label_value_pairs); // parallel array to match index
      });

      new Chart(ctx, {
        type: "line",
        data: {
          labels: date_labels,
          datasets: [
            {
              label: "Best Weight",
              data: set_values,
              borderWidth: 2,
              borderColor: "rgba(75,192,192,1)",
              pointBackgroundColor: "rgba(75,192,192,1)",
              tension: 0.1,
            },
          ],
        },
        options: {
          responsive: true,
          
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Weight (kg)",
              },
            },
            x: {
              title: {
                display: true,
                text: "Date",
              },
            },
          },
          plugins: {

            // ✅ Inline data labels
            datalabels: {
              formatter: (value, context) => {
                const [weight, reps] = data_labels_by_index[context.dataIndex];
                const formattedWeight = parseFloat(weight).toFixed(1); // One decimal place
                return `${formattedWeight}kg\nx ${reps} reps`;
              },
              align: "top",
              anchor: "end",
              backgroundColor: "#444",
              color: "#fff",
              borderRadius: 4,
              font: {
                weight: "bold",
                size: 12,
              },
              padding: 6,
            },

            // ✅ Custom tooltip
            tooltip: {
              enabled: false, // disable default
              external: function (context) {
                // Get canvas parent and inject custom tooltip if not exists
                let tooltipEl = document.getElementById("custom-tooltip");

                if (!tooltipEl) {
                  tooltipEl = document.createElement("div");
                  tooltipEl.id = "custom-tooltip";
                  tooltipEl.style.position = "absolute";
                  tooltipEl.style.background = "#fff";
                  tooltipEl.style.border = "1px solid #ccc";
                  tooltipEl.style.padding = "8px";
                  tooltipEl.style.borderRadius = "4px";
                  tooltipEl.style.pointerEvents = "none";
                  tooltipEl.style.boxShadow = "0px 0px 5px rgba(0,0,0,0.3)";
                  tooltipEl.style.fontSize = "14px";
                  document.body.appendChild(tooltipEl);
                }

                // Hide if there's no tooltip

                const tooltipModel = context.tooltip;
                if (tooltipModel.opacity === 0) {
                  tooltipEl.style.opacity = 0;
                  return;
                }

                // Note: Using dataPoints, chartJS supports dynamc index via hovering
                // As a result, the value of [0] will vary based on which points of the index I'm hovering at 

                const index = tooltipModel.dataPoints[0].dataIndex; // e.g., 2nd point
                const label = tooltipModel.dataPoints[0].label; // e.g., "11/04/2025"
                const weight = tooltipModel.dataPoints[0].formattedValue; // e.g., "65.00"
                const reps = reps_by_index[index]; // e.g., 5 reps for that point

                tooltipEl.innerHTML = `
                  <strong>Date:</strong> ${label}<br>
                  <strong>Weight:</strong> ${weight}kg<br>
                  <strong>Reps:</strong> ${reps}
                `;

                // Set the positions for the custom tooltip exacty where the user is hovering on the chart
                const canvasRect = ctx.getBoundingClientRect(); // Get size and position of the chart <canvas> relative to the viewport
                tooltipEl.style.opacity = 1; // make the custom tool tip visible
                tooltipEl.style.left = canvasRect.left + window.pageXOffset + tooltipModel.caretX + "px"; 
                tooltipEl.style.top = canvasRect.top + window.pageYOffset + tooltipModel.caretY + "px";

                // canvasRect.left	--> The X position of the canvas (relative to the viewport)
                // tooltipModel.caretX	--> X position of the tooltip caret inside the canvas
                // window.pageXOffset -->	Scroll offset (how far you've scrolled horizontally)
                // + "px"	-->  Converts it into a valid CSS pixel value


              },
            },
          },
        },
      });
    });
}
