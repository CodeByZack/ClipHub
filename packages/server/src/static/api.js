/* eslint-disable no-undef */
const API_PREFIX = "";

const getTasks = async () => {
  try {
    const res = await fetch(`${API_PREFIX}/tasks`, { cache: "no-store" });
    if (!res.ok) {
      console.error("Failed to fetch tasks", res.status);
      return [];
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Error fetching tasks", e);
    return [];
  }
};

const createTask = async (url, type) => {
  try {
    const res = await fetch(`${API_PREFIX}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, type }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || `status ${res.status}`);
    }
    const task = await res.json();
    return task;
  } catch (e) {
    console.error("Error creating task", e);
    throw e;
  }
};

const fetchLog = async (which) => {
  const path = which === "success" ? "/tasks/success/log" : "/tasks/failure/log";
  try {
    const res = await fetch(`${API_PREFIX}${path}`, { cache: "no-store" });
    if (!res.ok) {
      console.log(`${which} log: failed to fetch (${res.status})`);
      return "";
    }
    return await res.text();
  } catch (e) {
    console.error("Error fetching log", e);
    return "";
  }
};

globalThis.getTasks = getTasks;
globalThis.createTask = createTask;
globalThis.fetchLog = fetchLog;
