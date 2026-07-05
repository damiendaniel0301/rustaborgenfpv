const STORAGE_KEY = "droneflyt-state";
const TABLE_NAME = "drone_app_state";
const config = window.DRONEFLYVER_SUPABASE || {};
const configured = Boolean(
  window.supabase &&
  config.url &&
  config.anonKey &&
  !config.url.includes("DIN_") &&
  !config.anonKey.includes("DIN_")
);
const stateId = config.stateId || "rustaborgenfpv";
const client = configured ? window.supabase.createClient(config.url, config.anonKey) : null;
const originalSetItem = Storage.prototype.setItem;
let saveTimer;
let lastRemoteSnapshot = "";
let pushing = false;

function readLocalState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function sharedDataFromState(state = {}) {
  return {
    students: Array.isArray(state.students) ? state.students : [],
    instructors: Array.isArray(state.instructors) ? state.instructors : []
  };
}

function snapshot(value) {
  return JSON.stringify(value || {});
}

function setStatus(message, isError = false) {
  const target = document.querySelector("#syncStatus");
  if (!target) return;
  target.textContent = message;
  target.classList.toggle("sync-error", isError);
}

function mergeSharedData(sharedData) {
  if (!sharedData) return;
  const current = readLocalState();
  const merged = {
    ...current,
    students: Array.isArray(sharedData.students) ? sharedData.students : current.students,
    instructors: Array.isArray(sharedData.instructors) ? sharedData.instructors : current.instructors
  };
  originalSetItem.call(localStorage, STORAGE_KEY, JSON.stringify(merged));
}

async function fetchRemoteSharedData() {
  if (!client) return null;
  const { data, error } = await client
    .from(TABLE_NAME)
    .select("data")
    .eq("id", stateId)
    .maybeSingle();

  if (error) {
    setStatus("Supabase-feil", true);
    return null;
  }

  return data?.data || null;
}

async function pushSharedData(rawState) {
  if (!client || pushing) return;

  let parsed;
  try {
    parsed = JSON.parse(rawState);
  } catch {
    return;
  }

  const sharedData = sharedDataFromState(parsed);
  pushing = true;
  setStatus("Lagrer...");

  const { error } = await client
    .from(TABLE_NAME)
    .upsert({ id: stateId, data: sharedData }, { onConflict: "id" });

  pushing = false;

  if (error) {
    setStatus("Supabase-feil", true);
    return;
  }

  lastRemoteSnapshot = snapshot(sharedData);
  setStatus("Synkronisert");
}

function schedulePush(rawState) {
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => pushSharedData(rawState), 350);
}

function installLocalStorageSync() {
  Storage.prototype.setItem = function patchedSetItem(key, value) {
    originalSetItem.apply(this, arguments);
    if (this === localStorage && key === STORAGE_KEY) {
      schedulePush(value);
    }
  };
}

async function refreshFromRemote() {
  if (!client || pushing) return;
  const remoteData = await fetchRemoteSharedData();
  if (!remoteData) return;

  const remoteSnapshot = snapshot(remoteData);
  const localSnapshot = snapshot(sharedDataFromState(readLocalState()));
  lastRemoteSnapshot = lastRemoteSnapshot || remoteSnapshot;

  if (remoteSnapshot !== localSnapshot && remoteSnapshot !== lastRemoteSnapshot) {
    mergeSharedData(remoteData);
    window.location.reload();
    return;
  }

  lastRemoteSnapshot = remoteSnapshot;
  setStatus("Synkronisert");
}

if (client) {
  const remoteData = await fetchRemoteSharedData();
  if (remoteData) {
    mergeSharedData(remoteData);
    lastRemoteSnapshot = snapshot(remoteData);
  } else {
    const localSharedData = sharedDataFromState(readLocalState());
    if (localSharedData.students.length || localSharedData.instructors.length) {
      await pushSharedData(JSON.stringify(readLocalState()));
    }
  }
  installLocalStorageSync();
}

await import("./app.js");

setStatus(client ? "Synkronisert" : "Lokal lagring");

if (client) {
  window.addEventListener("focus", refreshFromRemote);
  window.setInterval(refreshFromRemote, 30000);
}
