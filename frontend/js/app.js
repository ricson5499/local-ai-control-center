(function () {
  "use strict";

  var refreshInProgress = false;
  var serviceDefinitions = [
    { id: "ollama", name: "Ollama", description: "Local model API", port: "11434" },
    { id: "openWebUI", name: "Open WebUI", description: "Browser-based chat interface", port: "3000" }
  ];

  function byId(id) {
    return document.getElementById(id);
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-bs-theme", theme);
    var button = byId("theme-button");
    if (button) {
      button.textContent = theme === "dark" ? "☀ Light" : "☾ Dark";
      button.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
      button.setAttribute("title", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
    }
  }

  function initializeTheme() {
    var theme = "dark";
    try {
      var savedTheme = window.localStorage.getItem("laic-theme");
      if (savedTheme === "dark" || savedTheme === "light") theme = savedTheme;
    } catch (error) {
      // localStorage may be unavailable; keep the default theme.
    }
    applyTheme(theme);
    byId("theme-button").addEventListener("click", function () {
      var current = document.documentElement.getAttribute("data-bs-theme") || "dark";
      var next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      try {
        window.localStorage.setItem("laic-theme", next);
      } catch (error) {
        // Theme still changes for this page session.
      }
    });
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function formatBytes(bytes) {
    var value = Number(bytes);
    if (!Number.isFinite(value) || value < 0) return "—";
    if (value < 1024) return value + " B";
    var units = ["KB", "MB", "GB", "TB"];
    var index = -1;
    do {
      value = value / 1024;
      index++;
    } while (value >= 1024 && index < units.length - 1);
    return value.toFixed(1) + " " + units[index];
  }

  async function api(path, options) {
    var backend = "http://127.0.0.1:8787";
    var response = await fetch(backend+path, Object.assign({
      headers: {
        "Content-Type": "application/json"
      }
    }, options || {}));
    var payload;
    try {
      payload = await response.json();
    } catch (error) {
      payload = {};
    }
    if (!response.ok) {
      throw new Error(payload.error || payload.message || ("Request failed (" + response.status + ")"));
    }
    return payload;
  }

  function setConnection(online, label) {
    byId("connection-dot").className = "status-dot " + (online ? "is-online" : "is-offline");
    byId("connection-label").textContent = label;
  }

  function setError(message) {
    var node = byId("global-error");
    if (!message) {
      node.classList.add("d-none");
      node.textContent = "";
      return;
    }
    node.classList.remove("d-none");
    node.textContent = message;
  }

  function statusText(container) {
    if (!container) return "Unknown";
    if (container.State) {
      return container.State.charAt(0).toUpperCase() + container.State.slice(1);
    }
    if (container.Status) {
      if (/^Up/i.test(container.Status)) return "Running";
      if (/Exited|Created|Restarting/i.test(container.Status)) return container.Status.split(" ")[0];
      return container.Status;
    }
    return "Unknown";
  }

  function findContainer(containers, name) {
    var expected = name.replace(/^\//, "");

    return (containers || []).find(function (item) {
      var names = item.names || item.Names || item.Name || "";

      if (Array.isArray(names)) {
        return names.some(function (itemName) {
          return itemName.replace(/^\//, "") === expected;
        });
      }

      return String(names).replace(/^\//, "") === expected;
    });
  }

  function paintMetric(id, status, isRunning) {
    byId(id).textContent = status;
    byId(id).style.color = isRunning === true ? "#2fb344" : (isRunning === false ? "#d63939" : "");
  }

  function renderServices(containers) {
    var html = serviceDefinitions.map(function (service) {
      var container = findContainer(containers, service.id === "openWebUI" ? "open-webui" : "ollama");
      var status = statusText(container);
      var running = status.toLowerCase() === "running" || (container && /^Up/i.test(container.Status || ""));
      var badgeClass = running ? "bg-green-lt" : "bg-secondary-lt";
      var containerName = service.id === "openWebUI" ? "open-webui" : "ollama";
      var detail = container ? (container.status || container.Status || container.state || container.State || "Container found") : ("Container not found: " + containerName);
      var actions = running
        ? '<button class="btn btn-sm btn-outline-warning" data-service="' + service.id + '" data-action="restart">Restart</button>' +
          '<button class="btn btn-sm btn-outline-danger" data-service="' + service.id + '" data-action="stop">Stop</button>'
        : '<button class="btn btn-sm btn-primary" data-service="' + service.id + '" data-action="start">Start</button>';
      return '<div class="list-group-item">' +
        '<div class="d-flex justify-content-between gap-3 service-row">' +
          '<div class="d-flex align-items-start gap-3">' +
            '<span class="avatar avatar-sm bg-blue-lt">' + (service.id === "ollama" ? "O" : "W") + '</span>' +
            '<div><div class="service-name">' + escapeHtml(service.name) + ' <span class="badge ' + badgeClass + ' ms-1">' + escapeHtml(status) + '</span></div>' +
            '<div class="service-meta">' + escapeHtml(service.description) + ' · localhost:' + service.port + '</div>' +
            '<div class="service-meta mt-1">' + escapeHtml(detail) + '</div></div>' +
          '</div>' +
          '<div class="service-actions">' + actions + '</div>' +
        '</div>' +
      '</div>';
    }).join("");
    byId("services-list").innerHTML = html;
  }

  function renderModels(payload) {
    var models = payload && Array.isArray(payload.models) ? payload.models : [];
    byId("model-count").textContent = String(models.length);
    if (!models.length) {
      byId("models-list").innerHTML = '<div class="list-group-item empty-state">No models found, or Ollama is unavailable.</div>';
      return;
    }
    byId("models-list").innerHTML = models.map(function (model) {
      var name = model.name || model.model || "Unknown model";
      var size = model.size != null ? formatBytes(model.size) : "Size unknown";
      var modified = model.modified_at ? new Date(model.modified_at).toLocaleDateString() : "";
      return '<div class="list-group-item"><div class="model-name">' + escapeHtml(name) + '</div>' +
        '<div class="model-meta">' + escapeHtml(size) + (modified ? " · Updated " + escapeHtml(modified) : "") + '</div></div>';
    }).join("");
  }

  function renderLoadedModels(payload) {
    var models = payload && Array.isArray(payload.models) ? payload.models : [];
    if (!models.length) {
      byId("loaded-models").innerHTML = '<div class="empty-state">No model is currently loaded.</div>';
      return;
    }
    byId("loaded-models").innerHTML = models.map(function (model) {
      var name = model.name || model.model || "Unknown model";
      var size = model.size != null ? formatBytes(model.size) : "";
      var vram = model.size_vram != null ? formatBytes(model.size_vram) : "";
      var detail = [size, vram ? "VRAM " + vram : ""].filter(Boolean).join(" · ");
      return '<div class="d-flex align-items-start gap-2 mb-3">' +
        '<span class="status-dot is-online mt-2"></span><div><div class="model-name">' + escapeHtml(name) + '</div>' +
        '<div class="model-meta">' + escapeHtml(detail || "Loaded") + '</div></div></div>';
    }).join("");
  }

  function renderGpu(payload) {
    var gpu = payload && (payload.gpu || payload);
    if (!gpu || payload.available === false || payload.error) {
      byId("gpu-panel").innerHTML = '<div class="empty-state">GPU information is unavailable. Check that NVIDIA drivers and nvidia-smi are installed.</div>';
      return;
    }
    if (Array.isArray(gpu) && gpu.length) {
      byId("gpu-panel").innerHTML = gpu.map(function (item) {
        var name = item.name || item.gpu_name || "NVIDIA GPU";
        var utilization = item.utilization_gpu || item.utilization || item.gpu_utilization;
        var memoryUsed = item.memory_used || item.memoryUsed;
        var memoryTotal = item.memory_total || item.memoryTotal;
        return '<div class="mb-2"><div class="fw-bold">' + escapeHtml(name) + '</div>' +
          '<div class="text-secondary small">GPU utilization: ' + escapeHtml(utilization || "—") +
          ' · Memory: ' + escapeHtml(memoryUsed || "—") + ' / ' + escapeHtml(memoryTotal || "—") + '</div></div>';
      }).join("");
      return;
    }
    byId("gpu-panel").innerHTML = '<div class="empty-state">No GPU data returned.</div>';
  }

  async function refreshAll() {
    if (refreshInProgress) return;
    refreshInProgress = true;
    byId("refresh-button").disabled = true;
    try {
      var results = await Promise.allSettled([
        api("/api/health"),
        api("/api/docker/status"),
        api("/api/containers"),
        api("/api/ollama/models"),
        api("/api/ollama/loaded"),
        api("/api/system/gpu")
      ]);

      var health = results[0].status === "fulfilled" ? results[0].value : null;
      var docker = results[1].status === "fulfilled" ? results[1].value : null;
      var containers = results[2].status === "fulfilled" ? results[2].value : [];
      var models = results[3].status === "fulfilled" ? results[3].value : null;
      var loaded = results[4].status === "fulfilled" ? results[4].value : null;
      var gpu = results[5].status === "fulfilled" ? results[5].value : null;

      var hasApi = !!health;
      setConnection(hasApi, hasApi ? "Backend connected" : "Backend unavailable");

      var dockerRunning = docker && (docker.running === true || docker.available === true || docker.status === "running");
      paintMetric("docker-status", dockerRunning ? "Running" : (docker ? "Unavailable" : "Unknown"), !!dockerRunning);
      byId("docker-detail").textContent = docker && (docker.message || docker.detail)
        ? (docker.message || docker.detail)
        : (dockerRunning ? "Docker Engine is reachable" : "Docker Engine is not reachable");

      
      if (results[2].status === "fulfilled") {
          renderServices(Array.isArray(containers) ? containers : (containers.containers || []));

          var list = Array.isArray(containers) ? containers : (containers.containers || []);
          var ollama = findContainer(list, "ollama");
          var webui = findContainer(list, "open-webui");

          var ollamaStatus = ollama ? (ollama.status || ollama.Status || "") : "";
          var ollamaState = ollama ? (ollama.state || ollama.State || "") : "";
          var webuiStatus = webui ? (webui.status || webui.Status || "") : "";
          var webuiState = webui ? (webui.state || webui.State || "") : "";

          var ollamaRunning = ollama &&
              (/^Up/i.test(ollamaStatus) || String(ollamaState).toLowerCase() === "running");

          var webuiRunning = webui &&
              (/^Up/i.test(webuiStatus) || String(webuiState).toLowerCase() === "running");

          paintMetric("ollama-status",
              ollamaRunning ? "Running" : (ollama ? statusText(ollama) : "Not found"),
              !!ollamaRunning
          );

          byId("ollama-detail").textContent = ollama
              ? (ollamaStatus || "Container found")
              : "Container: ollama";

          paintMetric("webui-status",
              webuiRunning ? "Running" : (webui ? statusText(webui) : "Not found"),
              !!webuiRunning
          );
      } else {
          byId("services-list").innerHTML =
              '<div class="list-group-item empty-state">Cannot read Docker containers. Is Docker Desktop running?</div>';

          paintMetric("ollama-status", "Unknown", null);
          paintMetric("webui-status", "Unknown", null);
      }


      if (models) renderModels(models);
      else byId("models-list").innerHTML = '<div class="list-group-item empty-state">Cannot connect to the Ollama API.</div>';

      if (loaded) renderLoadedModels(loaded);
      else byId("loaded-models").innerHTML = '<div class="empty-state">Cannot read loaded models.</div>';

      if (gpu) renderGpu(gpu);
      else renderGpu({ available: false });

      var failures = results.filter(function (item) { return item.status === "rejected"; });
      if (!hasApi) {
        setError("The dashboard backend could not be reached. Start the Node.js server, then open this page from http://127.0.0.1:8787 (not by opening index.html directly).");
      } else if (failures.length) {
        setError("Some status checks failed. Docker, Ollama, or NVIDIA tools may be unavailable; check the affected panel below.");
      } else {
        setError("");
      }
    } catch (error) {
      setConnection(false, "Backend unavailable");
      setError(error.message || "Could not refresh dashboard.");
    } finally {
      refreshInProgress = false;
      byId("refresh-button").disabled = false;
    }
  }

  async function runServiceAction(serviceId, action, button) {
    button.disabled = true;
    var oldText = button.textContent;
    button.textContent = "Working…";
    try {
      await api("/api/services/" + encodeURIComponent(serviceId) + "/" + encodeURIComponent(action), {
        method: "POST",
        body: JSON.stringify({})
      });
      setError("");
      await new Promise(function (resolve) { window.setTimeout(resolve, 800); });
      await refreshAll();
    } catch (error) {
      setError("Could not " + action + " " + serviceId + ": " + (error.message || "Unknown error"));
    } finally {
      button.disabled = false;
      button.textContent = oldText;
    }
  }

  byId("services-list").addEventListener("click", function (event) {
    var button = event.target.closest("button[data-service][data-action]");
    if (!button) return;
    runServiceAction(button.getAttribute("data-service"), button.getAttribute("data-action"), button);
  });

  byId("refresh-button").addEventListener("click", refreshAll);
  byId("refresh-models-button").addEventListener("click", refreshAll);
  byId("docker-start-button").addEventListener("click", async function () {
    var button = this;
    button.disabled = true;
    var oldText = button.textContent;
    button.textContent = "Starting…";
    try {
      await api("/api/docker/start", { method: "POST", body: JSON.stringify({}) });
      setError("");
      window.setTimeout(refreshAll, 3000);
    } catch (error) {
      setError("Could not start Docker Desktop: " + (error.message || "Unknown error"));
    } finally {
      button.disabled = false;
      button.textContent = oldText;
    }
  });

  refreshAll();
  window.setInterval(refreshAll, 5000);
}());
