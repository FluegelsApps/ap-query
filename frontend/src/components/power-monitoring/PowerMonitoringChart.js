import React from "react";
import { Line } from "react-chartjs-2";
import { inTimeRange } from "../../Utils";

const PowerMonitoringChart = ({ measurements, apFilter, setAPFilter, timeFilter }) => {

  let labels = [];
  let values = [];
  let timestamps = [];
  let accessPoints = [];

  for (let i = 0; i < measurements.length; i++) {
    if (!accessPoints.includes(measurements[i].ap))
      accessPoints.push(measurements[i].ap);

    if (
      measurements[i].ap == apFilter &&
      !timestamps.includes(measurements[i].timestamp) &&
      inTimeRange(measurements[i].timestamp, timeFilter)
    )
      timestamps.push(measurements[i].timestamp);
  }
  timestamps.sort();

  for (let i = 0; i < measurements.length; i++) {
    if (
      apFilter == undefined &&
      accessPoints != null &&
      accessPoints.length > 0
    ) {
      setAPFilter(accessPoints[0]);
    }

    if (
      measurements[i] != null &&
      measurements[i].ap != null &&
      apFilter == measurements[i].ap &&
      inTimeRange(measurements[i].timestamp, timeFilter)
    ) {
      let time = new Date(measurements[i].timestamp);

      labels.push(time.toLocaleString());
      for (let b = 0; b < 4; b++)
        if (values[b] == null) values[b] = [];

      let xIndex = 0;
      for (let a = 0; a < timestamps.length; a++) {
        if (timestamps[a] == measurements[i].timestamp) {
          xIndex = a;
          break;
        }
      }

      values[0][xIndex] = measurements[i].current;
      values[1][xIndex] = measurements[i].average;
      values[2][xIndex] = measurements[i].minimum;
      values[3][xIndex] = measurements[i].maximum;
    }

    let currentSet = {
      label: "Current",
      backgroundColor: "rgb(20, 186, 219)",
      borderColor: "rgb(20, 186, 219)",
      data: values[0]
    }

    let averageSet = {
      label: "Average",
      backgroundColor: "rgb(219, 176, 20)",
      borderColor: "rgb(219, 176, 20)",
      data: values[1]
    }

    let minimumSet = {
      label: "Minimum",
      backgroundColor: "rgb(3, 252, 44)",
      borderColor: "rgb(3, 252, 44)",
      data: values[2],
    };

    let maximumSet = {
      label: "Maximum",
      backgroundColor: "rgb(219, 20, 20)",
      borderColor: "rgb(219, 20, 20)",
      data: values[3],
    };


  }

  return (
    <Line options={{
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Power Monitoring Data"
        }
      }
    }} data={{
      labels: ["1", "2", "3"],
      datasets: []
    }} />
  );
}

/**
function updateMeasurements(measurements) {
  for (let i = 0; i < measurements.length; i++) {
    if (selectedAP == " " && accessPoints != null && accessPoints.length > 0) {

  let currentSet =
    measurementChart.data.datasets[0] != null
      ? measurementChart.data.datasets[0]
      : {
        label: "Current",
        backgroundColor: "rgb(20, 186, 219)",
        borderColor: "rgb(20, 186, 219)",
        data: undefined,
      };
  currentSet.data = values[0];
  measurementChart.data.datasets[0] = currentSet;

  let averageSet =
    measurementChart.data.datasets[1] != null
      ? measurementChart.data.datasets[1]
      : {
        label: "Average",
        backgroundColor: "rgb(219, 176, 20)",
        borderColor: "rgb(219, 176, 20)",
        data: undefined,
      };
  averageSet.data = values[1];
  measurementChart.data.datasets[1] = averageSet;

  let minimumSet =
    measurementChart.data.datasets[2] != null
      ? measurementChart.data.datasets[2]
      : {
        label: "Minimum",
        backgroundColor: "rgb(3, 252, 44)",
        borderColor: "rgb(3, 252, 44)",
        data: undefined,
      };
  minimumSet.data = values[2];
  measurementChart.data.datasets[2] = minimumSet;

  let maximumSet =
    measurementChart.data.datasets[3] != null
      ? measurementChart.data.datasets[3]
      : {
        label: "Maximum",
        backgroundColor: "rgb(219, 20, 20)",
        borderColor: "rgb(219, 20, 20)",
        data: undefined,
      };
  maximumSet.data = values[3];
  measurementChart.data.datasets[3] = maximumSet;

  let parent = document.getElementById("measurementChartSelectorParent");
  if (accessPoints.length != parent.children.length - 1) {
    for (let i = 1; i < parent.children.length; i++)
      parent.removeChild(parent.children[i]);

    for (let i = 0; i < accessPoints.length; i++) {
      var li = document.createElement("li");
      li.innerHTML = measurementSelectorItem
        .replace("$APNAME$", accessPoints[i])
        .replace("$APDATA$", normalize(accessPoints[i]));
      parent.appendChild(li);
      powerMonitoringAPSelector.layoutOptions();
    }
  }

  measurementChart.data.labels = labels;
  measurementChart.update();
}
 */

export default PowerMonitoringChart;