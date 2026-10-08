$(document).ready(function () {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/login";
    return;
  }

  // ---------- Logout ----------
  $("#logoutBtn").on("click", function (event) {
    event.preventDefault();
    localStorage.removeItem("token");
    window.location.href = "/login";
  });

  // ---------- State helpers ----------
  function showLoading() {
    $("#loadingState").show();
    $("#errorState").hide();
    $("#emptyState").hide();
    $("#sensorCards").hide();
    $("#chartsSection").hide();
  }

  function showError() {
    $("#loadingState").hide();
    $("#errorState").show();
    $("#emptyState").hide();
    $("#sensorCards").hide();
    $("#chartsSection").hide();
  }

  function showEmpty() {
    $("#loadingState").hide();
    $("#errorState").hide();
    $("#emptyState").show();
    $("#sensorCards").hide();
    $("#chartsSection").hide();
  }

  function showData() {
    $("#loadingState").hide();
    $("#errorState").hide();
    $("#emptyState").hide();
    $("#sensorCards").show();
    $("#chartsSection").show();
  }

  // ---------- Charts ----------
  let tempChart, humidityChart, lightChart, gasChart;

  function destroyCharts() {
    [tempChart, humidityChart, lightChart, gasChart].forEach(function (c) {
      if (c) c.destroy();
    });
  }

  function buildChart(canvasId, label, data, color) {
    return new Chart($(canvasId), {
      type: "line",
      data: {
        labels: data.labels,
        datasets: [{
          label: label,
          data: data.values,
          borderColor: color,
          backgroundColor: color + "22",
          fill: true,
          tension: 0.3,
          pointRadius: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { display: true, ticks: { maxTicksLimit: 8 } },
          y: { beginAtZero: true }
        }
      }
    });
  }

  function renderCharts(labels, readings) {
    destroyCharts();
    tempChart = buildChart("#tempChart", "Temperature (°C)", {
      labels: labels, values: readings.map(function (r) { return r.temperature; })
    }, "#e74c3c");
    humidityChart = buildChart("#humidityChart", "Humidity (%)", {
      labels: labels, values: readings.map(function (r) { return r.humidity; })
    }, "#3498db");
    lightChart = buildChart("#lightChart", "Light", {
      labels: labels, values: readings.map(function (r) { return r.light; })
    }, "#f1c40f");
    gasChart = buildChart("#gasChart", "Gas Level", {
      labels: labels, values: readings.map(function (r) { return r.gas_level; })
    }, "#2ecc71");
  }

  // ---------- Card + device info ----------
  function renderCards(latest) {
    $("#temperature").text(latest.temperature ?? "—");
    $("#humidity").text(latest.humidity ?? "—");
    $("#light").text(latest.light ?? "—");
    $("#gas_level").text(latest.gas_level ?? "—");
  }

  function renderDevice(device) {
  $("#deviceId").text(device.device_id || "—");
  $("#deviceLocation").text(device.location || "—");

  let status = "offline";

  if (device.last_seen) {
    const lastSeenTime = new Date(device.last_seen).getTime();
    const currentTime = Date.now();

    const secondsSinceLastReading =
      (currentTime - lastSeenTime) / 1000;

    // Device is considered online if a reading
    // was received within the last 30 seconds.
    if (secondsSinceLastReading <= 30) {
      status = "online";
    }
  }

  $("#deviceStatus")
    .text(status === "online" ? "Online" : "Offline")
    .attr("data-status", status);
}

  // ---------- Data loading ----------
  function loadReadings() {
    showLoading();

    $.ajax({
      url: "/api/readings",
      method: "GET",
      headers: { Authorization: "Bearer " + token },
      success: function (response) {
    const readings = Array.isArray(response)
      ? response
      : (response.data || []);

    if (!readings || readings.length === 0) {
        showEmpty();
        return;
    }

    const latest = readings[0];

    const labels = readings.map(function (r) {
        return r.recorded_at
          ? new Date(r.recorded_at).toLocaleTimeString()
          : "";
    });

    renderCards(latest);
    renderDevice(latest);
    renderCharts(labels, readings);
    showData();
},
    });
  }
  function loadDevice() {
  $.ajax({
    url: "/api/devices",
    method: "GET",
    headers: {
      Authorization: "Bearer " + token
    },

    success: function (response) {
      const devices = response.data || [];

      if (devices.length === 0) {
        $("#deviceId").text("—");
        $("#deviceLocation").text("—");
        $("#deviceStatus").text("Offline");
       
        return;
      }

      renderDevice(devices[0]);
    },

    error: function (xhr) {
      if (xhr.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
  });
}

  loadReadings();
  loadDevice();

  setInterval(loadReadings, 10000); // live refresh every 10s
  setInterval(loadDevice, 10000);
});