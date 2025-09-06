/* eslint-disable no-undef */
const successLogEl = document.getElementById("successLog");
const failedLogEl = document.getElementById("failedLog");
const tabTasksBtn = document.getElementById("tab-tasks-btn");
const tabSuccessBtn = document.getElementById("tab-success-btn");
const tabFailedBtn = document.getElementById("tab-failed-btn");
const tabTasksPanel = document.getElementById("tab-tasks");
const tabSuccessPanel = document.getElementById("tab-success");
const tabFailedPanel = document.getElementById("tab-failed");
const tbody = document.querySelector("#taskTable tbody");
const elDown = document.getElementById("downloading");
const elSuccess = document.getElementById("success");
const elFailed = document.getElementById("failed");
const elTotal = document.getElementById("total");
const emptyState = document.getElementById("emptyState");

// tab switching
const activateTab = (tab) => {
  tabTasksBtn.classList.remove("border-indigo-500", "text-indigo-600");
  tabSuccessBtn.classList.remove("border-indigo-500", "text-indigo-600");
  tabFailedBtn.classList.remove("border-indigo-500", "text-indigo-600");
  tabTasksBtn.setAttribute("aria-selected", "false");
  tabSuccessBtn.setAttribute("aria-selected", "false");
  tabFailedBtn.setAttribute("aria-selected", "false");

  tabTasksPanel.classList.add("hidden");
  tabSuccessPanel.classList.add("hidden");
  tabFailedPanel.classList.add("hidden");

  if (tab === "tasks") {
    tabTasksBtn.classList.add("border-indigo-500", "text-indigo-600");
    tabTasksBtn.setAttribute("aria-selected", "true");
    tabTasksPanel.classList.remove("hidden");
  } else if (tab === "success") {
    tabSuccessBtn.classList.add("border-indigo-500", "text-indigo-600");
    tabSuccessBtn.setAttribute("aria-selected", "true");
    tabSuccessPanel.classList.remove("hidden");
  } else if (tab === "failed") {
    tabFailedBtn.classList.add("border-indigo-500", "text-indigo-600");
    tabFailedBtn.setAttribute("aria-selected", "true");
    tabFailedPanel.classList.remove("hidden");
  }
};

const renderTaskNumbers = (success, failed, downloading) => {
  elDown.textContent = downloading;
  elSuccess.textContent = success;
  elFailed.textContent = failed;
  elTotal.textContent = success + failed + downloading;
};

const renderDownloadingTasks = (downloadingTasks) => {
  const escapeHtml = (s) => {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  };

  if (downloadingTasks.length === 0) {
    emptyState.classList.remove("hidden");
  } else {
    emptyState.classList.add("hidden");
  }

  tbody.innerHTML = "";

  downloadingTasks.forEach((t) => {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-gray-50";
    const statusClass =
      t.status === "downloading"
        ? "text-blue-600"
        : t.status === "success"
          ? "text-green-600"
          : "text-red-600";
    tr.innerHTML = `
              <td class="px-3 py-2 align-top" title=${t.id}>${t.id}</td>
              <td class="px-3 py-2 align-top" title=${t.url}><a target="_blank" href=${t.url}>${escapeHtml(t.url)}</a></td>
              <td class="px-3 py-2 align-top">${t.type}</td>
              <td class="px-3 py-2 align-top ${statusClass}">${t.status}</td>
            `;
    tbody.appendChild(tr);
  });
};

const render = async () => {
  tbody.innerHTML = "";
  renderDownloadingTasks([]);
  renderTaskNumbers(0, 0, 0);
};

const refreshData = async () => {
  const data = {
    tasks: [],
    successLog: "",
    failedLog: "",
    successTasks: 0,
    failedTasks: 0,
    downloadingTasks: 0,
  };

  globalThis.getTasks().then((tasks) => {
    renderDownloadingTasks(tasks);
    data.tasks = tasks;
    data.downloadingTasks = tasks.length;
    renderTaskNumbers(data.successTasks, data.failedTasks, data.downloadingTasks);
  });

  globalThis.fetchLog("success").then((log) => {
    if (successLogEl) {
      successLogEl.textContent = log;
    }
    data.successLog = log;
    data.successTasks = log.split("\n").filter((line) => line.trim() !== "").length;
    renderTaskNumbers(data.successTasks, data.failedTasks, data.downloadingTasks);
  });

  globalThis.fetchLog("failure").then((log) => {
    if (failedLogEl) {
      failedLogEl.textContent = log;
    }
    data.failedLog = log;
    data.failedTasks = log.split("\n").filter((line) => line.trim() !== "").length;
    renderTaskNumbers(data.successTasks, data.failedTasks, data.downloadingTasks);
  });
};

const initListeners = () => {
  tabTasksBtn.addEventListener("click", () => activateTab("tasks"));
  tabSuccessBtn.addEventListener("click", async () => {
    activateTab("success");
  });
  tabFailedBtn.addEventListener("click", async () => {
    activateTab("failed");
  });

  document.getElementById("taskForm").addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const urlEl = document.getElementById("url");
    const typeEl = document.getElementById("type");
    const url = urlEl.value.trim();
    const type = typeEl.value;
    if (!url) return alert("请填写 url");
    try {
      // create task on server
      await globalThis.createTask(url, type);
      // clear input
      urlEl.value = "";
      // refresh UI
      await render();
      // switch to tasks tab
      activateTab("tasks");
    } catch (e) {
      alert(`创建任务失败: ${e?.message || e}`);
    }
  });
};

initListeners();
activateTab("tasks");
render();
refreshData();

setInterval(() => {
  refreshData();
}, 10 * 1000);
