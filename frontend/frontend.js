let downloadModal;
let downloadButton;
let downloadModalClose;
let downloadDataButton;
let downloadDataSelector;

let exceptionModal;
let exceptionModalClose;
let exceptionModalCloseButton;
let exceptionModalOrigin;
let exceptionModalInstance;

let addConfigurationButton;
let addConfigurationModal;
let addConfigurationModalClose;
let addConfigurationHostField;
let addConfigurationUsernameField;
let addConfigurationPasswordField;
let addConfigurationSaveButton;

let updateConfigurationModal;
let updateConfigurationModalClose;
let updateConfigurationHostField;
let updateConfigurationUsernameField;
let updateConfigurationPasswordField;
let updateConfigurationSaveButton;

let deleteDatabaseButton;
let measurementChartSelector;

var socket;
var measurementChart;
var selectedAP = " ";
var lastMeasurements;

const configurationTableSwitch = `<button
class="mdc-switch mdc-switch--unselected config-state-switch"
type="button"
role="switch"
aria-checked="false">
<div class="mdc-switch__track"></div>
<div class="mdc-switch__handle-track">
  <div class="mdc-switch__handle">
    <div class="mdc-switch__shadow">
      <div class="mdc-elevation-overlay"></div>
    </div>
    <div class="mdc-switch__ripple"></div>
    <div class="mdc-switch__icons">
      <svg
        class="mdc-switch__icon mdc-switch__icon--on"
        viewBox="0 0 24 24"
      >
        <path
          d="M19.69,5.23L8.96,15.96l-4.23-4.23L2.96,13.5l6,6L21.46,7L19.69,5.23z"
        />
      </svg>
      <svg
        class="mdc-switch__icon mdc-switch__icon--off"
        viewBox="0 0 24 24"
      >
        <path d="M20 13H4v-2h16v2z" />
      </svg>
    </div>
  </div>
</div>
</button>`;

const configurationTableActions = `<button onclick="editConfiguration('$HOST$')" class="mdc-icon-button material-icons">
<div class="mdc-icon-button__ripple"></div>
edit
</button>
<button onclick="removeConfiguration('$HOST$')" class="mdc-icon-button material-icons">
<div class="mdc-icon-button__ripple"></div>
delete_forever
</button>`;

const measurementSelectorItem = `<li
class="mdc-list-item"
aria-selected="false"
data-value="$APDATA$"
role="option"
>
<span class="mdc-list-item__ripple"></span>
<span class="mdc-list-item__text"> $APNAME$ </span>
</li>`;

const downloadDataItem = `<div class="mdc-checkbox">
  <input
    type="checkbox"
    class="mdc-checkbox__native-control"
    id="checkbox-1"
  />
  <div class="mdc-checkbox__background">
    <svg class="mdc-checkbox__checkmark" viewBox="0 0 24 24">
      <path
        class="mdc-checkbox__checkmark-path"
        fill="none"
        d="M1.73,12.91 8.1,19.28 22.79,4.59"
      />
    </svg>
    <div class="mdc-checkbox__mixedmark"></div>
  </div>
  <div class="mdc-checkbox__ripple"></div>
</div>
<label for="checkbox-1">$NAME$</label>`;

let configurationTable;

window.onload = function () {
  console.log("Setting up Socket.IO");
  socket = io();

  initialize();

  downloadButton.onclick = function () {
    downloadModal.style.display = "block";

    for (let i = 0; i < downloadDataSelector.children.length; i++)
      downloadDataSelector.removeChild(downloadDataSelector.children[i]);

    accessPoints = [];
    for (let i = 0; i < lastMeasurements.length; i++)
      if (!accessPoints.includes(lastMeasurements[i].ap))
        accessPoints.push(lastMeasurements[i].ap);

    for (let i = 0; i < accessPoints.length; i++) {
      let element = document.createElement("div");
      element.innerHTML = downloadDataItem.replace("$NAME$", accessPoints[i]);
      downloadDataSelector.appendChild(element);
    }
  };

  downloadModalClose.onclick = function () {
    downloadModal.style.display = "none";
  };

  downloadDataButton.onclick = function () {
    downloadModal.style.display = "none";
    let accessPoints = [];

    for (let i = 0; i < downloadDataSelector.children.length; i++)
      if (downloadDataSelector.children[i].querySelector("#checkbox-1").checked)
        accessPoints.push(
          downloadDataSelector.children[i].querySelector("label").innerHTML
        );

    socket.emit("request_exportdb_file", JSON.stringify(accessPoints));
  };

  exceptionModalClose.onclick = function () {
    exceptionModal.style.display = "none";
  };

  exceptionModalCloseButton.onclick = function () {
    exceptionModal.style.display = "none";
  };

  addConfigurationButton.onclick = function () {
    addConfigurationModal.style.display = "block";
  };

  addConfigurationModalClose.onclick = function () {
    addConfigurationModal.style.display = "none";
  };

  addConfigurationSaveButton.onclick = function () {
    socket.emit(
      "insert_configuration",
      JSON.stringify({
        host: addConfigurationHostField.value,
        username: addConfigurationUsernameField.value,
        password: addConfigurationPasswordField.value,
      })
    );

    addConfigurationHostField.value = "";
    addConfigurationUsernameField.value = "";
    addConfigurationPasswordField.value = "";
    addConfigurationModal.style.display = "none";
  };

  updateConfigurationModalClose.onclick = function () {
    updateConfigurationModal.style.display = "none";
  };

  deleteDatabaseButton.onclick = function () {
    if (confirm("Are you sure?")) {
      socket.emit("delete_measurements", "");
      measurementChart.data.datasets = [];
      measurementChart.update();

      let parent = document.getElementById("measurementChartSelectorParent");
      for (let i = 1; i < parent.children.length; i++)
        parent.removeChild(parent.children[i]);
    }
  };

  measurementChartSelector.listen("MDCSelect:change", () => {
    selectedAP = measurementChartSelector.value;
    updateMeasurements(lastMeasurements);
  });

  window.onclick = function (event) {
    if (event.target == downloadModal) downloadModal.style.display = "none";
    if (event.target == addConfigurationModal)
      addConfigurationModal.style.display = "none";
    if (event.target == updateConfigurationModal)
      updateConfigurationModal.style.display = "none";
    if (event.target == exceptionModal) exceptionModal.style.display = "none";
  };

  socket.on("status_changed", (status) => {
    alert(`Status changed to ${status}`);
  });

  socket.on("notify_configdb_updated", (configuration) => {
    console.log("Receiving configuration update:\n" + configuration);
    updateConfiguration(JSON.parse(configuration));
  });

  socket.on("response_configdb_data", (rawConfiguration) => {
    console.log("Receiving: " + rawConfiguration);

    let configuration = JSON.parse(rawConfiguration);
    updateConfigurationModal.style.display = "block";
    updateConfigurationHostField.value = configuration.host;
    updateConfigurationUsernameField.value = configuration.user;

    updateConfigurationSaveButton.onclick = function () {
      console.log("Updating configuration");
      socket.emit(
        "update_configuration",
        JSON.stringify({
          oldhost: configuration.host,
          host: updateConfigurationHostField.value,
          username: updateConfigurationUsernameField.value,
          password: updateConfigurationPasswordField.value,
        })
      );

      updateConfigurationHostField.value = "";
      updateConfigurationUsernameField.value = "";
      updateConfigurationPasswordField.value = "";

      updateConfigurationModal.style.display = "none";
    };
  });

  socket.on("notify_measurements_updated", (rawMeasurements) => {
    updateMeasurements(JSON.parse(rawMeasurements));
  });

  socket.on("response_exportdb_file", (content) => {
    let anchor = document.createElement("a");
    let blob = new Blob([content], { type: "text/csv" });
    anchor.href = window.URL.createObjectURL(blob);
    anchor.download = "measurements.csv";
    anchor.click();
    anchor.remove();
  });

  socket.on("notify_exception", (rawException) => {
    exceptionModal.style.display = "block";

    let exception = JSON.parse(rawException);
    exceptionModalOrigin.innerHTML = exception.origin;
    exceptionModalInstance.innerHTML = JSON.stringify(exception.instance, undefined, 4);
  });
};

function initialize() {
  downloadModal = document.getElementById("downloadModal");
  downloadButton = document.getElementById("downloadButton");
  downloadModalClose = document.getElementById("downloadModalClose");
  downloadDataButton = document.getElementById("downloadDataButton");
  downloadDataSelector = document.getElementById("downloadDataForm");

  exceptionModal = document.getElementById("exceptionModal");
  exceptionModalClose = document.getElementById("exceptionModalClose");
  exceptionModalCloseButton = document.getElementById(
    "exceptionModalCloseButton"
  );
  exceptionModalOrigin = document.getElementById("exceptionModalOrigin");
  exceptionModalInstance = document.getElementById("exceptionModalInstance");

  addConfigurationModal = document.getElementById("addConfigurationModal");
  addConfigurationButton = document.getElementById("addConfigurationButton");
  addConfigurationModalClose = document.getElementById(
    "addConfigurationModalClose"
  );

  deleteDatabaseButton = document.getElementById("deleteDatabaseButton");
  measurementChartSelector = new mdc.select.MDCSelect(
    document.querySelector(".mdc-select")
  );

  addConfigurationHostField = new mdc.textField.MDCTextField(
    document.querySelector("#addConfigurationHostField")
  );
  addConfigurationUsernameField = new mdc.textField.MDCTextField(
    document.querySelector("#addConfigurationUsernameField")
  );
  addConfigurationPasswordField = new mdc.textField.MDCTextField(
    document.querySelector("#addConfigurationPasswordField")
  );
  addConfigurationSaveButton = document.getElementById(
    "addConfigurationSaveButton"
  );

  updateConfigurationModal = document.getElementById(
    "updateConfigurationModal"
  );
  updateConfigurationModalClose = document.getElementById(
    "updateConfigurationModalClose"
  );

  updateConfigurationHostField = new mdc.textField.MDCTextField(
    document.querySelector("#updateConfigurationHostField")
  );
  updateConfigurationUsernameField = new mdc.textField.MDCTextField(
    document.querySelector("#updateConfigurationUsernameField")
  );
  updateConfigurationPasswordField = new mdc.textField.MDCTextField(
    document.querySelector("#updateConfigurationPasswordField")
  );
  updateConfigurationSaveButton = document.getElementById(
    "updateConfigurationSaveButton"
  );

  configurationTable = document.getElementById("configurationTable");

  measurementChart = new Chart(
    document.getElementById("measurement-power-chart"),
    {
      type: "line",
      data: {
        labels: ["1", "2", "3"],
        datasets: [],
      },
      options: {},
    }
  );
}

function updateConfiguration(configurations) {
  while (configurationTable.rows.length > 1) configurationTable.deleteRow(1);

  for (let i = 0; i < configurations.length; i++) {
    let row = configurationTable.insertRow();

    let hostField = row.insertCell();
    hostField.innerHTML = configurations[i].host;

    let statusField = row.insertCell();
    statusField.innerHTML = configurations[i].status;

    let stateSwitchParent = row.insertCell();
    stateSwitchParent.innerHTML = configurationTableSwitch;
    let stateSwitch = mdc.switchControl.MDCSwitch.attachTo(stateSwitchParent);
    stateSwitch.selected = configurations[i].state == 1;
    stateSwitchParent.onclick = function () {
      if (stateSwitch.selected) {
        //Cancel the current session
        socket.emit("start_connection", configurations[i]);
      } else {
        //Start a new session
        socket.emit("stop_connection", configurations[i]);
      }
    };

    let configActions = row.insertCell();
    configActions.innerHTML = configurationTableActions
      .replace("$HOST$", configurations[i].host)
      .replace("$HOST$", configurations[i].host);
  }
}

function updateMeasurements(measurements) {
  lastMeasurements = measurements;
  dataIndices = {};
  accessPoints = [];

  let labels = [];
  let values = [];
  let timestamps = [];

  for (let i = 0; i < measurements.length; i++)
    if (!timestamps.includes(measurements[i].timestamp))
      timestamps.push(measurements[i].timestamp);
  timestamps.sort();

  for (let i = 0; i < measurements.length; i++) {
    if (!accessPoints.includes(measurements[i].ap))
      accessPoints[accessPoints.length] = measurements[i].ap;

    if (
      measurements[i] != null &&
      measurements[i].ap != null &&
      selectedAP == measurements[i].ap
    ) {
      let time = new Date(measurements[i].timestamp);

      labels.push([
        `${formatTime(time.getHours())}:${formatTime(
          time.getMinutes()
        )}:${formatTime(time.getSeconds())}`,
        `${formatTime(time.getDay())}.${formatTime(
          time.getMonth()
        )}.${time.getFullYear()}`,
      ]);
      for (let b = 0; b < 4; b++) if (values[b] == null) values[b] = [];

      let xIndex = 0;
      for (let a = 0; a < timestamps.length; a++) {
        if (timestamps[a] == measurements[i].timestamp) xIndex = a;
      }

      values[0][xIndex] = measurements[i].current;
      values[1][xIndex] = measurements[i].average;
      values[2][xIndex] = measurements[i].minimum;
      values[3][xIndex] = measurements[i].maximum;
    }
  }

  let currentColor = `rgb(20, 186, 219)`;
  measurementChart.data.datasets[0] = {
    label: "Current",
    backgroundColor: currentColor,
    borderColor: currentColor,
    data: values[0],
  };

  let averageColor = `rgb(219, 176, 20)`;
  measurementChart.data.datasets[1] = {
    label: "Average",
    backgroundColor: averageColor,
    borderColor: averageColor,
    data: values[1],
  };

  let minimumColor = `rgb(3, 252, 44)`;
  measurementChart.data.datasets[2] = {
    label: "Minimum",
    backgroundColor: minimumColor,
    borderColor: minimumColor,
    data: values[2],
  };

  let maximumColor = `rgb(219, 20, 20)`;
  measurementChart.data.datasets[3] = {
    label: "Maximum",
    backgroundColor: maximumColor,
    borderColor: maximumColor,
    data: values[3],
  };

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
      measurementChartSelector.layoutOptions();
    }
  }

  measurementChart.data.labels = labels;
  measurementChart.update();
}

function removeConfiguration(host) {
  if (confirm("Are you sure?")) socket.emit("remove_configuration", host);
}

function editConfiguration(host) {
  socket.emit("request_configdb_data", host);
}

function normalize(string) {
  while (string.includes(".")) string = string.replace(".", "");
  return string;
}

function formatTime(time) {
  return time < 10 ? "0" + time : time;
}
