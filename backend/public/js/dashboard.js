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

  function renderDevice(latest) {
    $("#deviceId").text(latest.device_id || "ROOM-ESP32-01");
    $("#deviceLocation").text(latest.location || "Smart Room");
    const status = latest.status || "Online";
    $("#deviceStatus").text(status).attr("data-status", status.toLowerCase());
  }

  // ---------- Data loading ----------
  function loadReadings() {
    showLoading();

    $.ajax({
      url: "/api/readings",
      method: "GET",
      headers: { Authorization: "Bearer " + token },
      success: function (response) {
        const readings = Array.isArray(response) ? response : (response.readings || []);

        if (!readings || readings.length === 0) {
          showEmpty();
          return;
        }

        const latest = readings[readings.length - 1];
        const labels = readings.map(function (r) {
          return r.timestamp ? new Date(r.timestamp).toLocaleTimeString() : "";
        });

        renderCards(latest);
        renderDevice(latest);
        renderCharts(labels, readings);
        showData();
      },
      error: function (xhr) {
        if (xhr.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }
        showError();
      }
    });
  }

  loadReadings();
  setInterval(loadReadings, 10000); // live refresh every 10s
});