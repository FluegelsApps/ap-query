//Download Modal Interface
let downloadModal;
let downloadButton;
let downloadModalClose;
let downloadDataButton;
let downloadDataSelector;

//Exception Modal Interface
let exceptionModal;
let exceptionModalClose;
let exceptionModalCloseButton;
let exceptionModalOrigin;
let exceptionModalInstance;

//Session Information Modal Interface
let sessionInfoModal;
let sessionInfoModalClose;
let sessionInfoModalHostField;
let sessionInfoModalStartedField;
let sessionInfoModalTotalField;
let sessionInfoModalNextField;

//Add Configuration Modal Interface
let addConfigurationButton;
let addConfigurationModal;
let addConfigurationModalClose;
let addConfigurationHostField;
let addConfigurationUsernameField;
let addConfigurationPasswordField;
let addConfigurationQueryIntervalField;
let addConfigurationPowerMonitoringSwitch;
let addConfigurationGPSMonitoringSwitch;
let addConfigurationSaveButton;

//Update Configuration Modal Interface
let updateConfigurationModal;
let updateConfigurationModalClose;
let updateConfigurationHostField;
let updateConfigurationUsernameField;
let updateConfigurationPasswordField;
let updateConfigurationQueryIntervalField;
let updateConfigurationPowerMonitoringSwitch;
let updateConfigurationGPSMonitoringSwitch;
let updateConfigurationSaveButton;

//Configuration
let configurationTable;

//Power Monitoring Database Interface
let powerMonitoringCard;
let powerMonitoringCardToggle;
let powerMonitoringDeleteButton;
let powerMonitoringUploadButton;
let powerMonitoringUploadInput;
let powerMonitoringAPSelector;
let powerMonitoringTimeSelector;
let powerMonitoringDisplaySwitch;
let powerMonitoringDisplaySwitchParent;

//GPS Monitoring Database Interface
var gpsMapLoaded = false;
var gpsMonitoringAPFilter = " ";
var gpsMonitoringTimeFilter = -1;
var gpsMonitoringDisplayType = "map";
var lastGPSData;

let gpsMap;
let gpsMonitoringCard;
let gpsMonitoringTable;
let gpsMonitoringCardToggle;
let gpsMonitoringAPSelector;
let gpsMonitoringDeleteButton;
let gpsMonitoringTimeSelector;
let gpsMonitoringDisplaySwitch;
let gpsMonitoringDisplaySwitchParent;

let gpsMonitoringDownloadButton;
let gpsMonitoringDownloadModal;
let gpsMonitoringDownloadModalClose;
let gpsMonitoringDownloadModalButton;
let gpsMonitoringDownloadModalSelector;

let gpsMonitoringDownloadRawButton;
let gpsMonitoringDownloadRawModal;
let gpsMonitoringDownloadRawModalClose;
let gpsMonitoringDownloadRawModalButton;
let gpsMonitoringDownloadRawModalSelector;

//Variables
var socket;
var measurementChart;
var measurementTable;
var selectedAP = " ";
var selectedTimeSpan = -1;
var lastMeasurements;
var displayType = "chart";

let powerMonitoringDisplayed = true;
let powerMonitoringDisplays = [];

let gpsMonitoringDisplayed = true;
let gpsMonitoringDisplays = [];

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
</button>
<button id="info_button" onclick="showSessionInfo('$HOST$')" class="mdc-icon-button material-icons">
<div class="mdc-icon-button__ripple"></div>
info
</button>`;

const configurationTableMonitorings = `<span style="display: $POWERMONITORING$" class="material-icons">bolt</span>
<span style="display: $GPSMONITORING$" class="material-icons">near_me</span>`;

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

window.onload = function () {
  //Initialize Socket IO
  socket = io();

  //Reference views
  initialize();

  //Initialize MapBox
  mapboxgl.accessToken = "pk.eyJ1IjoibTR4ZGV2IiwiYSI6ImNsN3c4cDN0dTBqNHIzb3MyMWwwenZsenQifQ.bpPCMxfKQiOPtJ2waiiPVg";
  gpsMap = new mapboxgl.Map({
    container: 'gps-map',
    style: 'mapbox://styles/mapbox/streets-v11'
  });

  gpsMap.on("load", function () {
    gpsMapLoaded = true;
    if (lastGPSData != null) updateGPSData(lastGPSData);

    gpsMap.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'clusterPositions',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#51bbd6',
          100,
          '#f1f075',
          750,
          '#f28cb1'
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20,
          100,
          30,
          750,
          40
        ]
      }
    });

    gpsMap.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'clusterPositions',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12
      }
    });

    gpsMap.addLayer({
      id: 'unclustered-point',
      type: 'fill',
      source: 'positions',
      paint: {
        "fill-color": "blue",
        "fill-opacity": 0.6,
      }
    });
  });

  //Initialize the expandable power monitoring card
  for (var i = 1; i < powerMonitoringCard.children.length; i++) {
    powerMonitoringDisplays[i] = powerMonitoringCard.children[i].style.display;
    powerMonitoringCard.children[i].style.display = powerMonitoringDisplayed ? powerMonitoringDisplays[i] : "none";
  }

  powerMonitoringCardToggle.onclick = function () {
    powerMonitoringDisplayed = !powerMonitoringDisplayed;
    powerMonitoringCardToggle.innerHTML = powerMonitoringCardToggle.innerHTML.replace(
      powerMonitoringDisplayed ? "expand_more" : "expand_less",
      powerMonitoringDisplayed ? "expand_less" : "expand_more"
    );

    for (var i = 1; i < powerMonitoringCard.children.length; i++) {
      powerMonitoringCard.children[i].style.display = powerMonitoringDisplayed ? powerMonitoringDisplays[i] : "none";
    }
  }

  //Initialize the expandable gps monitoring card
  for (var i = 1; i < gpsMonitoringCard.children.length; i++) {
    gpsMonitoringDisplays[i] = gpsMonitoringCard.children[i].style.display;
    gpsMonitoringCard.children[i].style.display = gpsMonitoringDisplayed ? gpsMonitoringDisplays[i] : "none";
  }

  gpsMonitoringCardToggle.onclick = function () {
    gpsMonitoringDisplayed = !gpsMonitoringDisplayed;
    gpsMonitoringCardToggle.innerHTML = gpsMonitoringCardToggle.innerHTML.replace(
      gpsMonitoringDisplayed ? "expand_more" : "expand_less",
      gpsMonitoringDisplayed ? "expand_less" : "expand_more"
    );

    for (var i = 1; i < gpsMonitoringCard.children.length; i++) {
      gpsMonitoringCard.children[i].style.display = gpsMonitoringDisplayed ? gpsMonitoringDisplays[i] : "none";
    }
  }

  powerMonitoringUploadButton.onclick = function () {
    $("#uploadInput").trigger("click");
  };

  //Listen for file selection on update database button
  powerMonitoringUploadInput.addEventListener(
    "change",
    (event) => {
      let file = event.target.files[0];
      let reader = new FileReader();
      reader.onload = (file) => {
        //Confirm that the user wants to replace the current database
        if (
          confirm(
            "Are you sure? This process will replace the data in the database."
          )
        )
          socket.emit("replace_measurements", reader.result);
      };
      reader.readAsText(file, "utf8");
    },
    false
  );

  //Initialize the download modal
  downloadButton.onclick = function () {
    downloadModal.style.display = "block";

    //Remove all children
    while (downloadDataSelector.children.length > 0)
      downloadDataSelector.removeChild(0);

    //Collect a list of all access points
    let accessPoints = [];
    for (let i = 0; i < lastMeasurements.length; i++) {
      if (!accessPoints.includes(lastMeasurements[i].ap))
        accessPoints.push(lastMeasurements[i].ap);
    }

    //Create the list of downloadable access point data
    for (let i = 0; i < accessPoints.length; i++) {
      let element = document.createElement("div");
      element.innerHTML = downloadDataItem.replace("$NAME$", accessPoints[i]);
      downloadDataSelector.appendChild(element);
    }
  };

  //Close the download dialog
  downloadModalClose.onclick = function () {
    downloadModal.style.display = "none";
  };

  //Download the actual data
  downloadDataButton.onclick = function () {
    downloadModal.style.display = "none";
    let accessPoints = [];

    //Collect all selected access points
    for (let i = 0; i < downloadDataSelector.children.length; i++) {
      if (downloadDataSelector.children[i].querySelector("#checkbox-1").checked) {
        accessPoints.push(
          downloadDataSelector.children[i].querySelector("label").innerHTML
        );
      }
    }

    //Send the request ot the web server
    socket.emit("request_exportdb_file", JSON.stringify(accessPoints));
  };

  //Initialize the GPS Monitoring download dialog
  gpsMonitoringDownloadButton.onclick = function () {
    gpsMonitoringDownloadModal.style.display = "block";

    //Remove all children
    while (gpsMonitoringDownloadModalSelector.children.length > 0)
      gpsMonitoringDownloadModalSelector.removeChild(0);

    //Collect a list of all access points
    let accessPoints = [];
    for (let i = 0; i < lastGPSData.length; i++) {
      if (!accessPoints.includes(lastGPSData[i].accessPoint))
        accessPoints.push(lastGPSData[i].accessPoint);
    }

    //Create the list of downloadable access point data
    for (let i = 0; i < accessPoints.length; i++) {
      let element = document.createElement("div");
      element.innerHTML = downloadDataItem.replace("$NAME$", accessPoints[i]);
      gpsMonitoringDownloadModalSelector.appendChild(element);
    }
  };

  //Close the GPS Monitoring download dialog
  gpsMonitoringDownloadModalClose.onclick = function () {
    gpsMonitoringDownloadModal.style.display = "none";
  };

  //Download the actual GPS Monitoring data
  gpsMonitoringDownloadModalButton.onclick = function () {
    gpsMonitoringDownloadModal.style.display = "none";
    let accessPoints = [];

    //Collect all selected access points
    for (let i = 0; i < gpsMonitoringDownloadModalSelector.children.length; i++) {
      if (gpsMonitoringDownloadModalSelector.children[i].querySelector("#checkbox-1").checked) {
        accessPoints.push(gpsMonitoringDownloadModalSelector.children[i].querySelector("label").innerHTML);
      }
    }

    socket.emit("request_gps_monitoring_exportdb_csv", JSON.stringify(accessPoints));
  };

  //Initialize the GPS Monitoring raw download dialog
  gpsMonitoringDownloadRawButton.onclick = function () {
    gpsMonitoringDownloadRawModal.style.display = "block";

    //Remove all children
    while (gpsMonitoringDownloadRawModalSelector.children.length > 0)
      gpsMonitoringDownloadRawModalSelector.removeChild(0);

    //Collect a list of all access points
    let accessPoints = [];
    for (let i = 0; i < lastGPSData.length; i++) {
      if (!accessPoints.includes(lastGPSData[i].accessPoint))
        accessPoints.push(lastGPSData[i].accessPoint);
    };

    //Create the list of downloadable access point data
    for (let i = 0; i < accessPoints.length; i++) {
      let element = document.createElement("div");
      element.innerHTML = downloadDataItem.replace("$NAME$", accessPoints[i]);
      gpsMonitoringDownloadRawModalSelector.appendChild(element);
    }
  };

  //Close the GPS Monitoring download raw dialog
  gpsMonitoringDownloadRawModalClose.onclick = function () {
    gpsMonitoringDownloadRawModal.style.display = "none";
  };

  // Download the actual GPS Monitoring raw data
  gpsMonitoringDownloadRawModalButton.onclick = function () {
    gpsMonitoringDownloadRawModal.style.display = "none";
    let accessPoints = [];

    //Collect all selected access points
    for (let i = 0; i < gpsMonitoringDownloadRawModalSelector.children.length; i++) {
      if (gpsMonitoringDownloadRawModalSelector.children[i].querySelector("#checkbox-1").checked) {
        accessPoints.push(gpsMonitoringDownloadRawModalSelector.children[i].querySelector("label").innerHTML);
      }
    }

    socket.emit("request_gps_monitoring_exportdb_raw", JSON.stringify(accessPoints));
  };

  //Close the exception dialog
  exceptionModalClose.onclick = () => {
    exceptionModal.style.display = "none";
  };

  //Close the exception dialog
  exceptionModalCloseButton.onclick = () => {
    exceptionModal.style.display = "none";
  };

  sessionInfoModalClose.onclick = () => {
    sessionInfoModal.style.display = "none";
  };

  //Open add configuration dialog
  addConfigurationButton.onclick = () => {
    addConfigurationModal.style.display = "block";
  };

  //Close add configuration dialog
  addConfigurationModalClose.onclick = () => {
    addConfigurationModal.style.display = "none";
  };

  //Listen for changes in display type
  powerMonitoringDisplaySwitchParent.onclick = () => {
    displayType = powerMonitoringDisplaySwitch.selected ? "table" : "chart";
    updateMeasurements(lastMeasurements);
  };

  //Listen for changes in gps display type
  gpsMonitoringDisplaySwitchParent.onclick = () => {
    gpsMonitoringDisplayType = gpsMonitoringDisplaySwitch.selected ? "table" : "map";
    updateGPSData(lastGPSData);
  }

  //Listen for changes to update the validation
  addConfigurationHostField.listen(
    "input",
    () => (addConfigurationHostField.valid = addConfigurationHostField.valid)
  );
  addConfigurationHostField.valid = addConfigurationHostField.valid;

  //Listen for changes to update the validation
  addConfigurationUsernameField.listen(
    "input",
    () =>
    (addConfigurationUsernameField.valid =
      addConfigurationUsernameField.valid)
  );
  addConfigurationUsernameField.valid = addConfigurationUsernameField.valid;

  //Listen for changes to update the validation
  addConfigurationPasswordField.listen(
    "input",
    () =>
    (addConfigurationPasswordField.valid =
      addConfigurationPasswordField.valid)
  );
  addConfigurationPasswordField.valid = addConfigurationPasswordField.valid;

  addConfigurationQueryIntervalField.listen(
    "input",
    () => (addConfigurationQueryIntervalField.valid =
      !isNaN(addConfigurationQueryIntervalField.value) &&
      addConfigurationQueryIntervalField.value.length > 0)
  );
  addConfigurationQueryIntervalField.valid = addConfigurationQueryIntervalField.valid;

  //Add a configuration to the database
  addConfigurationSaveButton.onclick = () => {
    if (
      addConfigurationHostField.valid &&
      addConfigurationUsernameField.valid &&
      addConfigurationPasswordField.valid
    ) {
      //Send the command to the server
      socket.emit(
        "insert_configuration",
        JSON.stringify({
          host: addConfigurationHostField.value,
          username: addConfigurationUsernameField.value,
          password: addConfigurationPasswordField.value,
          queryInterval: parseInt(addConfigurationQueryIntervalField.value) * 1000,
          powerMonitoring: addConfigurationPowerMonitoringSwitch.selected,
          gpsMonitoring: addConfigurationGPSMonitoringSwitch.selected
        })
      );

      //Reset the interface of the modal
      addConfigurationHostField.value = "";
      addConfigurationUsernameField.value = "";
      addConfigurationPasswordField.value = "";
      addConfigurationQueryIntervalField.value = "";
      addConfigurationPowerMonitoringSwitch.selected = false;
      addConfigurationGPSMonitoringSwitch.selected = false;
      addConfigurationModal.style.display = "none";
    } else {
      //Show error message
      alert("Incomplete configuration information");
    }
  };

  //Close the update configuration modal
  updateConfigurationModalClose.onclick = () => {
    updateConfigurationModal.style.display = "none";
  };

  //Delete the contents of the measurements database
  powerMonitoringDeleteButton.onclick = () => {
    //Prompt the user to confirm the action
    if (confirm("Are you sure?")) {
      //Send the command to the web server
      socket.emit("delete_measurements", "");
      measurementChart.data.datasets = [];
      measurementChart.update();

      //Clear the access point selector
      let parent = document.getElementById("measurementChartSelectorParent");
      for (let i = 1; i < parent.children.length; i++)
        parent.removeChild(parent.children[i]);
    }
  };

  //Listen for changes of the chart access points selector
  powerMonitoringAPSelector.listen("MDCSelect:change", () => {
    selectedAP = powerMonitoringAPSelector.value;
    updateMeasurements(lastMeasurements);
  });

  //Listen for changes of the chart time selector
  powerMonitoringTimeSelector.listen("MDCSelect:change", () => {
    switch (powerMonitoringTimeSelector.value) {
      case "ten_minutes":
        selectedTimeSpan = 10 * 60 * 1000;
        break;
      case "hour":
        selectedTimeSpan = 60 * 60 * 1000;
        break;
      case "twelve_hours":
        selectedTimeSpan = 12 * 60 * 60 * 1000;
        break;
      case "day":
        selectedTimeSpan = 24 * 60 * 60 * 1000;
        break;
      case "week":
        selectedTimeSpan = 7 * 24 * 60 * 60 * 1000;
        break;
      case "all":
        selectedTimeSpan = -1;
        break;
    }

    //Update the graph
    updateMeasurements(lastMeasurements);
  });

  //Listen for changes to the GPS monitoring AP selector
  gpsMonitoringAPSelector.listen("MDCSelect:change", () => {
    gpsMonitoringAPFilter = gpsMonitoringAPSelector.value;
    updateGPSData(lastGPSData);
  });

  //Listen for changes to the GPS monitoring time selector
  gpsMonitoringTimeSelector.listen("MDCSelect:change", () => {
    switch (gpsMonitoringTimeSelector.value) {
      case "ten_minutes":
        gpsMonitoringTimeFilter = 10 * 60 * 1000;
        break;
      case "hour":
        gpsMonitoringTimeFilter = 60 * 60 * 1000;
        break;
      case "twelve_hours":
        gpsMonitoringTimeFilter = 12 * 60 * 60 * 1000;
        break;
      case "day":
        gpsMonitoringTimeFilter = 24 * 60 * 60 * 1000;
        break;
      case "week":
        gpsMonitoringTimeFilter = 7 * 24 * 60 * 60 * 1000;
        break;
      case "all":
        gpsMonitoringTimeFilter = -1;
        break;
    }

    updateGPSData(lastGPSData);
  });

  //Delete the contents of the gps monitoring database
  gpsMonitoringDeleteButton.onclick = function () {
    //Prompt the user to confirm the action
    if (confirm("Are you sure?")) {
      //Send the command to the web server
      socket.emit("delete_gps_data", "");
    }
  };

  //Close all modals when the window is clicked
  window.onclick = (event) => {
    if (event.target == downloadModal) downloadModal.style.display = "none";
    if (event.target == gpsMonitoringDownloadModal) gpsMonitoringDownloadModal.style.display = "none";
    if (event.target == gpsMonitoringDownloadRawModal) gpsMonitoringDownloadRawModal.style.display = "none";
    if (event.target == addConfigurationModal)
      addConfigurationModal.style.display = "none";
    if (event.target == updateConfigurationModal)
      updateConfigurationModal.style.display = "none";
    if (event.target == exceptionModal) exceptionModal.style.display = "none";
    if (event.target == sessionInfoModal)
      sessionInfoModal.style.display = "none";
  };

  //Notification when the configuration database has been updated
  socket.on("notify_configdb_updated", (configuration) => {
    updateConfiguration(JSON.parse(configuration));
  });

  //Listen for changes to update the validation
  updateConfigurationHostField.listen(
    "input",
    () =>
      (updateConfigurationHostField.valid = updateConfigurationHostField.valid)
  );
  updateConfigurationHostField.valid = updateConfigurationHostField.valid;

  //Listen for changes to update the validation
  updateConfigurationUsernameField.listen(
    "input",
    () =>
    (updateConfigurationUsernameField.valid =
      updateConfigurationUsernameField.valid)
  );
  updateConfigurationUsernameField.valid =
    updateConfigurationUsernameField.valid;

  //Listen for changes to update the validation
  updateConfigurationPasswordField.listen(
    "input",
    () =>
    (updateConfigurationPasswordField.valid =
      updateConfigurationPasswordField.valid)
  );
  updateConfigurationPasswordField.valid =
    updateConfigurationPasswordField.valid;

  updateConfigurationQueryIntervalField.listen(
    "input",
    () => (updateConfigurationQueryIntervalField.valid =
      !isNaN(updateConfigurationQueryIntervalField.value) &&
      updateConfigurationQueryIntervalField.value.length > 0)
  );
  updateConfigurationQueryIntervalField.valid = updateConfigurationQueryIntervalField.valid;

  //Response on requested configuration data
  socket.on("response_configdb_data", (rawConfiguration) => {
    let configuration = JSON.parse(rawConfiguration);

    //Fill the requested data into the interface
    updateConfigurationModal.style.display = "block";
    updateConfigurationHostField.value = configuration.host;
    updateConfigurationUsernameField.value = configuration.user;
    updateConfigurationQueryIntervalField.value = configuration.queryInterval / 1000;
    updateConfigurationPowerMonitoringSwitch.selected = configuration.powerMonitoring;
    updateConfigurationGPSMonitoringSwitch.selected = configuration.gpsMonitoring;

    //Send the update command to the server
    updateConfigurationSaveButton.onclick = () => {
      if (
        updateConfigurationHostField.valid &&
        updateConfigurationUsernameField.valid &&
        updateConfigurationPasswordField.valid
      ) {
        //Send the updated configuration data to the server
        socket.emit(
          "update_configuration",
          JSON.stringify({
            oldhost: configuration.host,
            host: updateConfigurationHostField.value,
            username: updateConfigurationUsernameField.value,
            password: updateConfigurationPasswordField.value,
            queryInterval: parseInt(updateConfigurationQueryIntervalField.value) * 1000,
            powerMonitoring: updateConfigurationPowerMonitoringSwitch.selected,
            gpsMonitoring: updateConfigurationGPSMonitoringSwitch.selected
          })
        );

        //Clear the interface and close the dialog
        updateConfigurationHostField.value = "";
        updateConfigurationUsernameField.value = "";
        updateConfigurationPasswordField.value = "";
        updateConfigurationQueryIntervalField.value = "";
        updateConfigurationPowerMonitoringSwitch.selected = false;
        updateConfigurationGPSMonitoringSwitch.selected = false;
        updateConfigurationModal.style.display = "none";
      } else {
        //Show error message
        alert("Incomplete configuration information");
      }
    };
  });

  //Update the measurements chart
  socket.on("notify_measurements_updated", (rawMeasurements) => {
    updateMeasurements(JSON.parse(rawMeasurements));
  });

  //Update the gps data
  socket.on("notify_gps_updated", (rawGPS) => {
    if (gpsMapLoaded) updateGPSData(JSON.parse(rawGPS));
    lastGPSData = JSON.parse(rawGPS);
  });

  //Download the received database file
  socket.on("response_exportdb_file", content => downloadFile(content, "measurements.csv", "text/csv"));

  //Download the received gps database file
  socket.on("response_gps_monitoring_exportdb_csv", content => downloadFile(content, "gps_monitoring_data.csv", "text/csv"));

  //Download the received gps raw database file
  socket.on("response_gps_monitoring_exportdb_raw", content => downloadFile(content, "gps_monitoring_raw_data.txt", "text"));

  //Show the requested session information
  socket.on("response_session_info", (rawInfo) => {
    let sessionInformation = JSON.parse(rawInfo);

    sessionInfoModalHostField.innerHTML = `Host: ${sessionInformation.host}`;
    sessionInfoModalStartedField.innerHTML = `Connection started at: ${new Date(
      sessionInformation.started
    ).toString()}`;
    sessionInfoModalTotalField.innerHTML = `Total measures: ${sessionInformation.measures}`;
    sessionInfoModalNextField.innerHTML = `Next measure: ${new Date(
      sessionInformation.nextmeasure
    ).toString()}`;

    sessionInfoModal.style.display = "block";
  });

  //Show a dialog that notifies the user that an exception occurred
  socket.on("notify_exception", (rawException) => {
    exceptionModal.style.display = "block";

    let exception = JSON.parse(rawException);
    exceptionModalOrigin.innerHTML = exception.origin;
    exceptionModalInstance.innerHTML = JSON.stringify(
      exception.instance,
      undefined,
      4
    );
  });
};

//Reference all views and variables
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

  sessionInfoModal = document.getElementById("sessionInfoModal");
  sessionInfoModalClose = document.getElementById("sessionInfoModalClose");
  sessionInfoModalHostField = document.getElementById(
    "sessionInfoModalHostField"
  );
  sessionInfoModalStartedField = document.getElementById(
    "sessionInfoModalStartedField"
  );
  sessionInfoModalTotalField = document.getElementById(
    "sessionInfoModalTotalField"
  );
  sessionInfoModalNextField = document.getElementById(
    "sessionInfoModalNextField"
  );

  addConfigurationModal = document.getElementById("addConfigurationModal");
  addConfigurationButton = document.getElementById("addConfigurationButton");
  addConfigurationModalClose = document.getElementById(
    "addConfigurationModalClose"
  );

  powerMonitoringCard = document.getElementById("power-monitoring-card");
  powerMonitoringCardToggle = document.getElementById("power-monitoring-card-toggle");
  powerMonitoringDeleteButton = document.getElementById("deleteDatabaseButton");
  powerMonitoringUploadInput = document.getElementById("uploadInput");
  powerMonitoringUploadButton = document.getElementById("uploadButton");

  powerMonitoringDisplaySwitchParent = document.getElementById(
    "measurementDisplaySwitchParent"
  );
  powerMonitoringDisplaySwitch = new mdc.switchControl.MDCSwitch(
    document.querySelector("#measurementDisplaySwitch")
  );

  powerMonitoringAPSelector = new mdc.select.MDCSelect(
    document.getElementById("measurementChartSelector")
  );
  powerMonitoringTimeSelector = new mdc.select.MDCSelect(
    document.getElementById("measurementTimeSelector")
  );

  gpsMonitoringCard = document.getElementById("gps-monitoring-card");
  gpsMonitoringCardToggle = document.getElementById("gps-monitoring-card-toggle");
  gpsMonitoringDeleteButton = document.getElementById("gpsMonitoringDeleteButton");

  gpsMonitoringAPSelector = new mdc.select.MDCSelect(
    document.getElementById("gpsMonitoringChartSelector")
  );
  gpsMonitoringTimeSelector = new mdc.select.MDCSelect(
    document.getElementById("gpsMonitoringTimeSelector")
  );

  gpsMonitoringDownloadModal = document.getElementById("gpsMonitoringDownloadModal");
  gpsMonitoringDownloadButton = document.getElementById("gpsMonitoringDownloadButton");
  gpsMonitoringDownloadModalClose = document.getElementById("gpsMonitoringDownloadModalClose");
  gpsMonitoringDownloadModalButton = document.getElementById("gpsMonitoringDownloadModalButton");
  gpsMonitoringDownloadModalSelector = document.getElementById("gpsMonitoringDownloadModalSelector");

  gpsMonitoringDisplaySwitchParent = document.getElementById("gpsMonitoringDisplaySwitchParent");
  gpsMonitoringDisplaySwitch = new mdc.switchControl.MDCSwitch(
    document.querySelector("#gpsMonitoringDisplaySwitch")
  );

  gpsMonitoringDownloadRawModal = document.getElementById("gpsMonitoringDownloadRawModal");
  gpsMonitoringDownloadRawButton = document.getElementById("gpsMonitoringDownloadRawButton");
  gpsMonitoringDownloadRawModalClose = document.getElementById("gpsMonitoringDownloadRawModalClose");
  gpsMonitoringDownloadRawModalButton = document.getElementById("gpsMonitoringDownloadRawModalButton");
  gpsMonitoringDownloadRawModalSelector = document.getElementById("gpsMonitoringDownloadRawModalSelector");

  addConfigurationHostField = new mdc.textField.MDCTextField(
    document.querySelector("#addConfigurationHostField")
  );
  addConfigurationUsernameField = new mdc.textField.MDCTextField(
    document.querySelector("#addConfigurationUsernameField")
  );
  addConfigurationPasswordField = new mdc.textField.MDCTextField(
    document.querySelector("#addConfigurationPasswordField")
  );
  addConfigurationQueryIntervalField = new mdc.textField.MDCTextField(
    document.querySelector("#addConfigurationQueryIntervalField")
  );
  addConfigurationPowerMonitoringSwitch = new mdc.switchControl.MDCSwitch(
    document.querySelector("#power-monitoring-switch")
  );
  addConfigurationGPSMonitoringSwitch = new mdc.switchControl.MDCSwitch(
    document.querySelector("#gps-data-monitoring-switch")
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
  updateConfigurationQueryIntervalField = new mdc.textField.MDCTextField(
    document.querySelector("#updateConfigurationQueryIntervalField")
  );
  updateConfigurationPowerMonitoringSwitch = new mdc.switchControl.MDCSwitch(
    document.querySelector('#update-power-monitoring-switch')
  );
  updateConfigurationGPSMonitoringSwitch = new mdc.switchControl.MDCSwitch(
    document.querySelector('#update-gps-data-monitoring-switch')
  );
  updateConfigurationSaveButton = document.getElementById(
    "updateConfigurationSaveButton"
  );

  configurationTable = document.getElementById("configurationTable");
  measurementTable = document.getElementById("measurementTable");
  gpsMonitoringTable = document.getElementById("gpsMonitoringTable");

  //Initialize the measurement chart
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

    let configMonitorings = row.insertCell();
    configMonitorings.innerHTML = configurationTableMonitorings
      .replace("$POWERMONITORING$", configurations[i].powerMonitoring ? "inline" : "none")
      .replace("$GPSMONITORING$", configurations[i].gpsMonitoring ? "inline" : "none");

    let configActions = row.insertCell();
    configActions.innerHTML = configurationTableActions
      .replace("$HOST$", configurations[i].host)
      .replace("$HOST$", configurations[i].host)
      .replace("$HOST$", configurations[i].host);

    if (configurations[i].state == 0)
      configActions.removeChild(configActions.children[2]);
  }
}

function updateMeasurements(measurements) {
  lastMeasurements = measurements;
  dataIndices = {};
  accessPoints = [];

  let labels = [];
  let values = [];
  let timestamps = [];

  document.getElementById("measurementChartParent").style.display =
    displayType == "chart" ? "block" : "none";
  document.getElementById("measurementTableParent").style.display =
    displayType == "table" ? "block" : "none";
  while (measurementTable.rows.length > 1) measurementTable.deleteRow(1);

  for (let i = 0; i < measurements.length; i++) {
    if (!accessPoints.includes(measurements[i].ap))
      accessPoints[accessPoints.length] = measurements[i].ap;

    if (
      measurements[i].ap == selectedAP &&
      !timestamps.includes(measurements[i].timestamp) &&
      inTimeRange(measurements[i].timestamp)
    )
      timestamps.push(measurements[i].timestamp);
  }
  timestamps.sort();

  for (let i = 0; i < measurements.length; i++) {
    if (selectedAP == " " && accessPoints != null && accessPoints.length > 0) {
      selectedAP = accessPoints[0];
      updateMeasurements(measurements);
      powerMonitoringAPSelector.value = selectedAP;
      return;
    }

    if (
      measurements[i] != null &&
      measurements[i].ap != null &&
      selectedAP == measurements[i].ap &&
      inTimeRange(measurements[i].timestamp)
    ) {
      if (displayType == "chart") {
        let time = new Date(measurements[i].timestamp);

        labels.push(time.toLocaleString());
        for (let b = 0; b < 4; b++) if (values[b] == null) values[b] = [];

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
      } else if (displayType == "table") {
        let row = measurementTable.insertRow();
        row.insertCell().innerHTML = new Date(
          measurements[i].timestamp
        ).toLocaleString().replace(", ", " ");
        row.insertCell().innerHTML = measurements[i].ap;
        row.insertCell().innerHTML = measurements[i].current;
        row.insertCell().innerHTML = measurements[i].average;
        row.insertCell().innerHTML = measurements[i].minimum;
        row.insertCell().innerHTML = measurements[i].maximum;
      }
    }
  }

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

function updateGPSData(gpsData) {
  var accessPoints = [];
  var positions = [];
  var clusterPositions = [];

  document.getElementById("gps-map").style.display = gpsMonitoringDisplayType == "map" ? "block" : "none";
  document.getElementById("gpsMonitoringTableParent").style.display = gpsMonitoringDisplayType == "table" ? "block" : "none";
  while (gpsMonitoringTable.rows.length > 1) gpsMonitoringTable.deleteRow(1);

  for (let i = 0; i < gpsData.length; i++) {
    if (!accessPoints.includes(gpsData[i].accessPoint))
      accessPoints.push(gpsData[i].accessPoint);
  }

  if (gpsMonitoringAPFilter == " " && accessPoints != null && accessPoints.length > 0) {
    gpsMonitoringAPFilter = accessPoints[0];
    updateGPSData(gpsData);
    gpsMonitoringAPSelector.value = accessPoints[0];
    return;
  }

  if (gpsMonitoringDisplayType == "map") {
    for (let i = 0; i < gpsData.length; i++) {
      if (gpsData[i] != null && gpsData[i].accessPoint != null && gpsData[i].accessPoint == gpsMonitoringAPFilter && inTimeRange(gpsData[i].timestamp)) {
        let correctedLatitude = minutesToDegrees(gpsData[i].latitude);
        let correctedLongitude = minutesToDegrees(gpsData[i].longitude);

        positions.push(createGeoJSONCircle(
          correctedLatitude,
          correctedLongitude,
          1.0
        ))

        clusterPositions.push({
          type: "Feature",
          geometry: {
            "type": "Point",
            "coordinates": [
              correctedLongitude,
              correctedLatitude,
            ],
          },
        });
      }

      let positionsData = {
        "type": "FeatureCollection",
        "features": positions,
      };

      let positionsSource = {
        type: "geojson",
        data: positionsData,
      };

      let clusterPositionsData = {
        "type": "FeatureCollection",
        "features": clusterPositions,
      };

      let clusterPositionsSource = {
        type: "geojson",
        data: clusterPositionsData,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      }

      if (gpsMap.getSource("positions") == null) gpsMap.addSource("positions", positionsSource);
      else gpsMap.getSource("positions").setData(positionsData);

      if (gpsMap.getSource("clusterPositions") == null) gpsMap.addSource("clusterPositions", clusterPositionsSource);
      else gpsMap.getSource("clusterPositions").setData(clusterPositionsData)
    }
  } else if (gpsMonitoringDisplayType == "table") {
    for (let i = 0; i < gpsData.length; i++) {
      if (gpsData[i] != null && gpsData[i].accessPoint != null && gpsData[i].accessPoint == gpsMonitoringAPFilter && inTimeRange(gpsData[i].timestamp)) {
        let row = gpsMonitoringTable.insertRow();
        row.insertCell().innerHTML = formatUTCTime(gpsData[i].timestampUTC);
        row.insertCell().innerHTML = gpsData[i].accessPoint ?? "-";
        row.insertCell().innerHTML = `${gpsData[i].latitude ?? "-"} ${gpsData[i].latitudeOrientation}`;
        row.insertCell().innerHTML = `${gpsData[i].longitude ?? "-"} ${gpsData[i].longitudeOrientation}`;
        row.insertCell().innerHTML = gpsData[i].quality ?? "-"
        row.insertCell().innerHTML = gpsData[i].satellites ?? "-";
        row.insertCell().innerHTML = gpsData[i].horizontalDilution ?? "-";
        row.insertCell().innerHTML = `${gpsData[i].altitude ?? "-"} ${gpsData[i].altitudeUnits}`;
        row.insertCell().innerHTML = `${gpsData[i].geoidalSeparation ?? "-"} ${gpsData[i].geoidalSeparationUnits}`;
        row.insertCell().innerHTML = gpsData[i].diffDataAge ?? "-";
        row.insertCell().innerHTML = gpsData[i].diffRefStationID ?? "-";
        row.insertCell().innerHTML = gpsData[i].checksum ?? "-";
      }
    }
  }

  let parent = document.getElementById("gpsMonitoringChartSelectorParent");
  if (accessPoints.length != parent.children.length - 1) {
    for (let i = 1; i < parent.children.length; i++)
      parent.removeChild(parent.children[i]);

    for (let i = 0; i < accessPoints.length; i++) {
      var li = document.createElement("li");
      li.innerHTML = measurementSelectorItem
        .replace("$APNAME$", accessPoints[i])
        .replace("$APDATA$", accessPoints[i]);
      parent.appendChild(li);
      gpsMonitoringAPSelector.layoutOptions();
    }
  }
}

function removeConfiguration(host) {
  if (confirm("Are you sure?")) socket.emit("remove_configuration", host);
}

function editConfiguration(host) {
  socket.emit("request_configdb_data", host);
}

function showSessionInfo(host) {
  socket.emit("request_session_info", host);
}

function normalize(string) {
  while (string.includes(".")) string = string.replace(".", "");
  return string;
}

function formatTime(time) {
  return time < 10 ? "0" + time : time;
}

function inTimeRange(time) {
  return (
    new Date().getTime() - time <= selectedTimeSpan || selectedTimeSpan == -1
  );
}

function formatUTCTime(timestamp) {
  let timestampString = timestamp.toString();

  //Resolve milliseconds
  let milliseconds = timestampString.includes(".") ? timestampString.split(".")[1] : "0";
  timestampString = timestampString.replace(`.${milliseconds}`, "");

  //Resolve seconds
  let seconds = timestampString.substring(timestampString.length - 2);
  timestampString = timestampString.substring(0, timestampString.length - 2);

  //Resolve minutes
  let minutes = timestampString.substring(timestampString.length - 2);
  timestampString = timestampString.substring(0, timestampString.length - 2);

  //Resolve hours
  let hours = timestampString;

  return `${hours}:${minutes}:${seconds}.${formatTime(parseInt(milliseconds))} UTC`;
}

//Source: https://stackoverflow.com/questions/37599561/drawing-a-circle-with-the-radius-in-miles-meters-with-mapbox-gl-js
function createGeoJSONCircle(latitude, longitude, radius) {
  var ret = [];
  var distanceX = radius / (111.320 * Math.cos(latitude * Math.PI / 180));
  var distanceY = radius / 110.574;

  var theta, x, y;
  for (var i = 0; i < 64; i++) {
    theta = (i / 64) * (2 * Math.PI);
    x = distanceX * Math.cos(theta);
    y = distanceY * Math.sin(theta);

    ret.push([longitude + x, latitude + y]);
  }
  ret.push(ret[0]);

  return {
    "type": "Feature",
    "geometry": {
      "type": "Polygon",
      "coordinates": [ret],
    },
  };

  /*return {
    "type": "geojson",
    "data": {
      "type": "FeatureCollection",
      "features": [{
        "type": "Feature",
        "geometry": {
          "type": "Polygon",
          "coordinates": [ret],
        },
      }],
    },
  };*/
}

function minutesToDegrees(value) {
  var stringValue = value.toString()
  stringValue = stringValue.substring(0, stringValue.indexOf(".") + 5);
  let minutes = parseFloat(stringValue.substring(stringValue.length - 7));
  let degrees = parseFloat(stringValue.replace(minutes.toString()));
  return isNaN(degrees) ? 0 : degrees + (minutes / 60);
}

function downloadFile(content, fileName, type) {
  let anchor = document.createElement("a");
  let blob = new Blob([content], { type });
  anchor.href = window.URL.createObjectURL(blob);
  anchor.download = fileName;
  anchor.click();
  anchor.remove();
}