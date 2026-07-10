const STORAGE_KEY = "droneflyt-state";
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
const remoteRefreshIntervalMs = 10 * 60 * 1000;
let authProfile = null;
let saveTimer;
let lastRemoteSnapshot = "";
let pushing = false;
let lastPushHadError = false;
let lastKnownStudentIds = new Set();

window.droneflyverHasUnsavedWork = window.droneflyverHasUnsavedWork || (() => false);
window.droneflyverReportStatus?.(`Supabase-script startet v${window.DRONEFLYVER_APP_VERSION || "ukjent"}`);

async function clearAuthAndReload() {
  try {
    if (client) await client.auth.signOut();
  } catch {
    // Continue with local cleanup even if Supabase is unavailable.
  }
  localStorage.clear();
  sessionStorage.clear();
  window.location.reload();
}

document.querySelector("#accountLogoutButton")?.addEventListener("click", (event) => {
  event.preventDefault();
  clearAuthAndReload();
});

function readLocalState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeLocalState(state) {
  originalSetItem.call(localStorage, STORAGE_KEY, JSON.stringify(state));
}

function isUuid(value = "") {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function sharedDataFromState(state = {}) {
  return {
    students: Array.isArray(state.students) ? state.students : [],
    instructors: Array.isArray(state.instructors) ? state.instructors : [],
    flightLogs: Array.isArray(state.flightLogs) ? state.flightLogs.filter((log) => isUuid(log?.ownerId)) : [],
    deletedStudentIds: Array.isArray(state.deletedStudentIds) ? state.deletedStudentIds : []
  };
}

function snapshot(value) {
  return JSON.stringify(value || {});
}

function userName(profile = authProfile) {
  return profile?.display_name || profile?.email || "Bruker";
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function userRole(profile = authProfile) {
  if (profile?.role === "admin") return "admin";
  if (profile?.role === "instructor") return "instructor";
  return "student";
}

function isInstructorRole(role = userRole()) {
  return role === "instructor" || role === "admin";
}

function isAdminRole(role = userRole()) {
  return role === "admin";
}

function userRoleLabel(profile = authProfile) {
  const role = userRole(profile);
  if (role === "admin") return "Admin / Instruktør";
  if (role === "instructor") return "Instruktør";
  return "Elev";
}

function appUserFromProfile(profile = authProfile) {
  return {
    id: profile.id,
    name: userName(profile),
    role: userRole(profile)
  };
}

function realStudentCount(sharedData = {}) {
  return (sharedData.students || []).filter((student) => student.id !== "gjest").length;
}

function removeDeletedStudents(sharedData = {}) {
  const deletedIds = new Set(Array.isArray(sharedData.deletedStudentIds) ? sharedData.deletedStudentIds : []);
  return {
    ...sharedData,
    students: (Array.isArray(sharedData.students) ? sharedData.students : []).filter((student) => student?.id === "gjest" || !deletedIds.has(student?.id))
  };
}

function ensureProfileInSharedData(sharedData, profile = authProfile) {
  const next = {
    students: Array.isArray(sharedData?.students) ? [...sharedData.students] : [],
    instructors: Array.isArray(sharedData?.instructors) ? [...sharedData.instructors] : [],
    flightLogs: Array.isArray(sharedData?.flightLogs) ? [...sharedData.flightLogs] : [],
    deletedStudentIds: Array.isArray(sharedData?.deletedStudentIds) ? [...sharedData.deletedStudentIds] : []
  };
  const appUser = appUserFromProfile(profile);

  if (isInstructorRole(appUser.role)) {
    const instructorIndex = next.instructors.findIndex((item) => item.id === appUser.id);
    if (instructorIndex >= 0) next.instructors[instructorIndex] = appUser;
    else next.instructors.push(appUser);
    next.students = next.students.filter((student) => student.id !== appUser.id);
    return removeDeletedStudents(next);
  }

  if (next.deletedStudentIds.includes(appUser.id)) return removeDeletedStudents(next);

  const studentIndex = next.students.findIndex((item) => item.id === appUser.id);
  if (studentIndex >= 0) {
    next.students[studentIndex] = {
      ...next.students[studentIndex],
      name: appUser.name
    };
  } else {
    next.students.push({ id: appUser.id, name: appUser.name });
  }
  return removeDeletedStudents(next);
}

function mergeProfilesIntoSharedData(sharedData, profiles = []) {
  const next = {
    students: Array.isArray(sharedData?.students) ? [...sharedData.students] : [],
    instructors: Array.isArray(sharedData?.instructors) ? [...sharedData.instructors] : [],
    flightLogs: Array.isArray(sharedData?.flightLogs) ? [...sharedData.flightLogs] : [],
    deletedStudentIds: Array.isArray(sharedData?.deletedStudentIds) ? [...sharedData.deletedStudentIds] : []
  };

  profiles.forEach((profile) => {
    const appUser = appUserFromProfile(profile);
    if (isInstructorRole(appUser.role)) {
      const instructorIndex = next.instructors.findIndex((item) => item.id === appUser.id);
      if (instructorIndex >= 0) next.instructors[instructorIndex] = appUser;
      else next.instructors.push(appUser);
      next.students = next.students.filter((student) => student.id !== appUser.id);
      return;
    }

    if (next.deletedStudentIds.includes(appUser.id)) return;

    const studentIndex = next.students.findIndex((item) => item.id === appUser.id);
    if (studentIndex >= 0) {
      next.students[studentIndex] = {
        ...next.students[studentIndex],
        name: appUser.name
      };
    } else {
      next.students.push({ id: appUser.id, name: appUser.name });
    }
  });

  return removeDeletedStudents(next);
}

function mergeStudentsPreservingRemote(localStudents = [], remoteStudents = []) {
  const byId = new Map();
  remoteStudents.forEach((student) => {
    if (student?.id) byId.set(student.id, student);
  });
  localStudents.forEach((student) => {
    if (student?.id) byId.set(student.id, student);
  });
  return [...byId.values()];
}

function applyAuthState(sharedData = {}) {
  const localState = readLocalState();
  const appUser = appUserFromProfile();
  const mergedShared = ensureProfileInSharedData(sharedData);
  const firstRealStudentId = mergedShared.students.find((student) => student.id !== "gjest")?.id || mergedShared.students[0]?.id || "gjest";
  const localSelectedStudentExists = mergedShared.students.some((student) => student.id === localState.selectedStudentId);
  const selectedStudentId = isInstructorRole(appUser.role)
    ? (localSelectedStudentExists && localState.selectedStudentId !== "gjest" ? localState.selectedStudentId : firstRealStudentId)
    : appUser.id;

  writeLocalState({
    ...localState,
    user: appUser,
    currentStudentId: appUser.role === "student" ? appUser.id : localState.currentStudentId || firstRealStudentId,
    selectedStudentId,
    students: mergedShared.students,
    instructors: mergedShared.instructors,
    flightLogs: mergedShared.flightLogs,
    deletedStudentIds: mergedShared.deletedStudentIds
  });
  lastKnownStudentIds = new Set(mergedShared.students.map((student) => student.id));
}

function setStatus(message, isError = false) {
  if (window.droneflyverReportStatus) {
    window.droneflyverReportStatus(message, isError);
    return;
  }
  document.querySelectorAll(".sync-status").forEach((target) => {
    target.textContent = message;
    target.classList.toggle("sync-error", isError);
  });
}

function setLoginMessage(message) {
  const target = document.querySelector("#loginMessage");
  if (target) target.textContent = message;
}

function hideAppUntilSignedIn() {
  document.querySelector("main")?.classList.add("hidden");
  document.querySelectorAll(".side-nav").forEach((nav) => nav.classList.add("hidden"));
  document.querySelector(".account-card")?.classList.add("hidden");
}

function showAppAfterSignedIn() {
  document.querySelector("main")?.classList.remove("hidden");
  document.querySelectorAll(".side-nav").forEach((nav) => nav.classList.remove("hidden"));
  document.querySelector(".account-card")?.classList.remove("hidden");
}

function hideLegacyLoginControls() {
  const panel = document.querySelector(".login-panel");
  if (!panel) return;
  panel.classList.add("secure-auth-active");
}

function renderAuthForm() {
  hideAppUntilSignedIn();
  const panel = document.querySelector(".login-panel");
  if (!panel) return;
  panel.innerHTML = `
    <h2>Innlogging</h2>
    <div class="secure-auth-panel">
      <label for="authName">Fornavn</label>
      <input id="authName" autocomplete="given-name" placeholder="Kun fornavn ved ny bruker" />
      <p class="auth-help">Legg kun inn fornavn i appen. Ikke skriv etternavn eller fullt navn.</p>
      <label for="authEmail">E-post</label>
      <input id="authEmail" type="email" autocomplete="email" placeholder="din@epost.no" />
      <label for="authPassword">Passord</label>
      <input id="authPassword" type="password" autocomplete="current-password" placeholder="Minst 6 tegn" />
      <button id="authLoginButton" class="primary-button" type="button">Logg inn</button>
      <button id="authResetPasswordButton" class="secondary-button" type="button">Send nytt passord</button>
      <button id="authSignupButton" class="secondary-button" type="button">Lag elevbruker</button>
      <p id="loginMessage" class="login-message" aria-live="polite"></p>
      <p id="syncStatus" class="sync-status" aria-live="polite">Sikker innlogging</p>
    </div>
  `;

  document.querySelector("#authLoginButton").addEventListener("click", signIn);
  document.querySelector("#authResetPasswordButton").addEventListener("click", sendPasswordReset);
  document.querySelector("#authSignupButton").addEventListener("click", signUp);
}

function authValues() {
  return {
    name: document.querySelector("#authName")?.value.trim() || "",
    email: document.querySelector("#authEmail")?.value.trim() || "",
    password: document.querySelector("#authPassword")?.value || ""
  };
}

async function signIn() {
  const { email, password } = authValues();
  if (!email || !password) {
    setLoginMessage("Skriv e-post og passord.");
    return;
  }

  setLoginMessage("Logger inn...");
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    setLoginMessage(`Innlogging feilet: ${error.message}. Sjekk e-post, eller bruk "Send nytt passord".`);
    return;
  }
  window.location.reload();
}

async function sendPasswordReset() {
  const { email } = authValues();
  if (!email) {
    setLoginMessage("Skriv e-postadressen først.");
    return;
  }

  setLoginMessage("Sender lenke for nytt passord...");
  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}${window.location.pathname}?resetPassword=1`
  });

  if (error) {
    setLoginMessage(`Kunne ikke sende nytt passord: ${error.message}`);
    return;
  }

  setLoginMessage("Sjekk e-post for lenke til nytt passord.");
}

async function completePasswordRecoveryIfNeeded() {
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const searchParams = new URLSearchParams(window.location.search);
  const isRecovery = hashParams.get("type") === "recovery" || searchParams.get("type") === "recovery" || searchParams.get("resetPassword") === "1";
  if (!isRecovery) return;

  const code = searchParams.get("code");
  if (code) {
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (error) {
      setLoginMessage(`Kunne ikke åpne passordlenke: ${error.message}`);
      return;
    }
  }

  const newPassword = window.prompt("Skriv nytt passord for Droneflyver. Minst 6 tegn.");
  if (!newPassword) return;

  if (newPassword.length < 6) {
    setLoginMessage("Passord må være minst 6 tegn.");
    return;
  }

  const { error } = await client.auth.updateUser({ password: newPassword });
  if (error) {
    setLoginMessage(`Kunne ikke oppdatere passord: ${error.message}`);
    return;
  }

  window.history.replaceState({}, document.title, window.location.pathname);
  setLoginMessage("Passord er oppdatert. Du kan logge inn.");
}

async function signUp() {
  const { name, email, password } = authValues();
  if (/\s+\S/.test(name)) {
    setLoginMessage("Kun ett navn tillat av sikkerhetshensyn, bruk kun fornavn");
    return;
  }
  if (!name || !email || password.length < 6) {
    setLoginMessage("Skriv kun fornavn, e-post og passord på minst 6 tegn.");
    return;
  }

  setLoginMessage("Oppretter elevbruker...");
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: name
      }
    }
  });

  if (error) {
    if ((error.message || "").toLowerCase().includes("rate limit")) {
      setLoginMessage("Supabase har midlertidig stoppet nye registreringer fordi e-postgrensen er nådd. Vent litt, eller konfigurer egen SMTP i Supabase Auth.");
      return;
    }
    setLoginMessage(`Kunne ikke opprette bruker: ${error.message}`);
    return;
  }

  if (!data.session) {
    setLoginMessage("Bruker er opprettet. Sjekk e-post for bekreftelse før innlogging.");
    return;
  }

  window.location.reload();
}

async function ensureProfile(user) {
  const displayName = user.user_metadata?.display_name || user.email;
  let { data, error } = await client
    .from("profiles")
    .select("id,email,display_name,role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    setStatus("Profil-feil", true);
    return null;
  }

  if (data) return data;

  const inserted = await client
    .from("profiles")
    .insert({
      id: user.id,
      email: user.email,
      display_name: displayName,
      role: "student"
    })
    .select("id,email,display_name,role")
    .single();

  if (inserted.error) {
    setStatus("Profil-feil", true);
    return null;
  }

  return inserted.data;
}

async function reactivateOwnStudentProfileIfNeeded(profile) {
  if (profile?.role !== "student") return;

  const { error } = await client.rpc("reactivate_own_student_profile");
  if (error) {
    setStatus("Kunne ikke reaktivere elevkonto", true);
  }
}

async function fetchProfilesForRoster() {
  if (!isInstructorRole()) return [];

  const { data, error } = await client.rpc("get_profiles_for_roster");
  if (error) {
    const fallback = await client
      .from("profiles")
      .select("id,email,display_name,role")
      .order("created_at", { ascending: true });

    if (!fallback.error) return Array.isArray(fallback.data) ? fallback.data : [];
  }

  if (error) {
    setStatus("Kunne ikke hente elevliste", true);
    return [];
  }

  return Array.isArray(data) ? data : [];
}
async function fetchRemoteSharedData() {
  const { data, error } = await client.rpc("get_app_state", {
    state_id: stateId
  });

  if (error) {
    setStatus("Supabase-feil", true);
    return null;
  }

  return data || null;
}

async function pushSharedData(rawState) {
  if (!client || pushing || !authProfile) return;

  let parsed;
  try {
    parsed = JSON.parse(rawState);
  } catch {
    return;
  }

  if (isInstructorRole()) {
    const currentIds = new Set((parsed.students || []).map((student) => student.id));
    const deletedIds = new Set(Array.isArray(parsed.deletedStudentIds) ? parsed.deletedStudentIds : []);
    lastKnownStudentIds.forEach((studentId) => {
      if (studentId !== "gjest" && !currentIds.has(studentId)) {
        // UI deactivation: hides the student from rosters without deleting the Supabase Auth user.
        deletedIds.add(studentId);
      }
    });
    parsed.deletedStudentIds = [...deletedIds];
  }

  let sharedData = sharedDataFromState(parsed);
  if (isInstructorRole()) {
    const remoteData = await fetchRemoteSharedData();
    if (remoteData) {
      const deletedIds = new Set([
        ...(Array.isArray(sharedData.deletedStudentIds) ? sharedData.deletedStudentIds : []),
        ...(Array.isArray(remoteData.deletedStudentIds) ? remoteData.deletedStudentIds : [])
      ]);
      sharedData.deletedStudentIds = [...deletedIds];
    }
    if (remoteData?.students?.length) {
      sharedData.students = mergeStudentsPreservingRemote(sharedData.students, remoteData.students);
    }
    sharedData = removeDeletedStudents(sharedData);
    const profileRoster = await fetchProfilesForRoster();
    sharedData = mergeProfilesIntoSharedData(sharedData, profileRoster);
  }
  sharedData = ensureProfileInSharedData(sharedData);
  pushing = true;
  setStatus("Lagrer...");

  const { data, error } = await client.rpc("save_app_state", {
    state_id: stateId,
    new_data: sharedData
  });

  pushing = false;

  if (error) {
    lastPushHadError = true;
    setStatus("Supabase-feil", true);
    return;
  }

  lastPushHadError = false;
  if (data) {
    lastRemoteSnapshot = snapshot(data);
  } else {
    lastRemoteSnapshot = snapshot(sharedData);
  }
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
  if (!client || pushing || !authProfile) return;
  const remoteData = await fetchRemoteSharedData();
  if (!remoteData) return;

  const profileRoster = await fetchProfilesForRoster();
  const normalizedRemoteData = ensureProfileInSharedData(mergeProfilesIntoSharedData(remoteData, profileRoster));
  const remoteSnapshot = snapshot(normalizedRemoteData);
  const localSnapshot = snapshot(sharedDataFromState(readLocalState()));
  lastRemoteSnapshot = lastRemoteSnapshot || remoteSnapshot;

  if (remoteSnapshot !== localSnapshot && remoteSnapshot !== lastRemoteSnapshot) {
    if (lastPushHadError) {
      setStatus("Kunne ikke lagre siste endring - prøv å lagre igjen", true);
      return;
    }
    if (window.droneflyverHasUnsavedWork?.()) {
      lastRemoteSnapshot = remoteSnapshot;
      setStatus("Ulagret flylogg - lagre før oppdatering", true);
      return;
    }
    applyAuthState(normalizedRemoteData);
    window.location.reload();
    return;
  }

  lastRemoteSnapshot = remoteSnapshot;
  setStatus("Synkronisert");
}

function renderSecureAccountPanel() {
  hideLegacyLoginControls();
  const panel = document.querySelector(".login-panel");
  if (!panel) return;

  document.querySelector("#secureAccountPanel")?.remove();
  const account = document.createElement("div");
  account.id = "secureAccountPanel";
  account.className = "secure-auth-panel";
  account.innerHTML = `
    <span class="secure-label">Pålogget med Supabase</span>
    <strong>${escapeHtml(userName())}</strong>
    <small>${escapeHtml(authProfile.email)} - ${escapeHtml(userRoleLabel())}</small>
    ${userRole() === "student" ? `
      <div class="instructor-upgrade">
        <label for="instructorInviteCode">Instruktør-invitasjonskode</label>
        <input id="instructorInviteCode" type="password" autocomplete="off" placeholder="Kun for godkjente instruktører" />
        <button id="redeemInstructorInviteButton" class="secondary-button full-button" type="button">Aktiver instruktørtilgang</button>
      </div>
    ` : ""}
    <button id="secureLogoutButton" class="secondary-button full-button" type="button">Logg ut</button>
  `;
  panel.insertBefore(account, document.querySelector("#syncStatus"));

  document.querySelector("#secureLogoutButton")?.addEventListener("click", async () => {
    await clearAuthAndReload();
  });

  document.querySelector("#redeemInstructorInviteButton")?.addEventListener("click", redeemInstructorInvite);
}

function renderSignedInIdentity(authState = window.DRONEFLYVER_AUTH_STATE) {
  const user = authState?.user || appUserFromProfile();
  const currentUser = document.querySelector("#currentUser");
  const currentRole = document.querySelector("#currentRole");
  if (currentUser) currentUser.textContent = user.name || userName();
  if (currentRole) {
    currentRole.textContent = user.role === "admin" ? "Admin / Instruktør" : user.role === "instructor" ? "Instruktør" : "Elev";
  }
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

async function redeemInstructorInvite() {
  const input = document.querySelector("#instructorInviteCode");
  const inviteCode = input?.value.trim();
  if (!inviteCode) {
    setStatus("Skriv invitasjonskode", true);
    return;
  }

  setStatus("Kontrollerer invitasjon...");
  const { data, error } = await client.rpc("redeem_instructor_invite", {
    invite_code: inviteCode
  });

  if (error || data !== true) {
    setStatus("Ugyldig instruktørkode", true);
    return;
  }

  setStatus("Instruktørtilgang aktivert");
  window.location.reload();
}

window.droneflyverAdminRenameUser = async (targetUserId, newName) => {
  if (!client || !authProfile || !isAdminRole()) {
    throw new Error("Admin-rettigheter kreves.");
  }

  const cleanName = String(newName || "").trim();
  if (!targetUserId || !cleanName) {
    throw new Error("Velg bruker og skriv nytt navn.");
  }

  const { data, error } = await client.rpc("admin_update_profile_display_name", {
    target_user_id: targetUserId,
    new_display_name: cleanName
  });

  if (error) {
    throw new Error(error.message || "Kunne ikke endre brukernavn.");
  }

  const remoteData = await fetchRemoteSharedData();
  const profileRoster = await fetchProfilesForRoster();
  const sharedData = ensureProfileInSharedData(mergeProfilesIntoSharedData(remoteData || sharedDataFromState(readLocalState()), profileRoster));
  applyAuthState(sharedData);
  lastRemoteSnapshot = snapshot(sharedData);
  window.DRONEFLYVER_AUTH_STATE = {
    user: appUserFromProfile(),
    sharedData
  };

  return data;
};

window.droneflyverDeactivateStudent = async (targetStudentId, note = "") => {
  if (!client || !authProfile || !isInstructorRole()) {
    throw new Error("Instruktør- eller adminrettigheter kreves.");
  }

  if (!targetStudentId) {
    throw new Error("Velg elev som skal deaktiveres.");
  }

  const { data, error } = await client.rpc("deactivate_student_profile", {
    target_student_id: targetStudentId,
    deactivate_note: note
  });

  if (error) {
    throw new Error(error.message || "Kunne ikke deaktivere elev.");
  }

  if (data !== true) {
    throw new Error("Fant ikke aktiv elev å deaktivere.");
  }

  const remoteData = await fetchRemoteSharedData();
  const profileRoster = await fetchProfilesForRoster();
  const sharedData = ensureProfileInSharedData(mergeProfilesIntoSharedData(remoteData || sharedDataFromState(readLocalState()), profileRoster));
  applyAuthState(sharedData);
  lastRemoteSnapshot = snapshot(sharedData);
  window.DRONEFLYVER_AUTH_STATE = {
    user: appUserFromProfile(),
    sharedData
  };

  return true;
};

function enforceAuthRoleView(authState = window.DRONEFLYVER_AUTH_STATE) {
  const user = authState?.user;
  if (!user) return;

  document.querySelector("#currentUser").textContent = user.name;
  const instructorAccess = isInstructorRole(user.role);
  const adminAccess = isAdminRole(user.role);
  document.querySelector("#currentRole").textContent = user.role === "admin" ? "Admin / Instruktør" : user.role === "instructor" ? "Instruktør" : "Elev";
  document.querySelectorAll(".instructor-only").forEach((item) => item.classList.toggle("hidden", !instructorAccess));
  document.querySelectorAll(".admin-only").forEach((item) => item.classList.toggle("hidden", !adminAccess));
  document.querySelectorAll(".student-only").forEach((item) => item.classList.toggle("hidden", instructorAccess));

  if (!instructorAccess) return;

  const reviewView = document.querySelector("#reviewView");
  if (!reviewView) return;

  document.querySelectorAll(".view").forEach((view) => view.classList.toggle("active-view", view === reviewView));
  document.querySelectorAll(".nav-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === "review");
  });
  const title = document.querySelector("#viewTitle");
  if (title) title.textContent = "Vurdering";
}

async function bootAuthenticatedApp() {
  if (!client) {
    renderAuthForm();
    setLoginMessage("Supabase er ikke konfigurert.");
    return;
  }

  await completePasswordRecoveryIfNeeded();
  const { data: sessionData } = await client.auth.getSession();
  const session = sessionData.session;
  if (!session) {
    renderAuthForm();
    return;
  }

  authProfile = await ensureProfile(session.user);
  if (!authProfile) {
    renderAuthForm();
    setLoginMessage("Fant ikke brukerprofil.");
    return;
  }
  await reactivateOwnStudentProfileIfNeeded(authProfile);

  const remoteData = await fetchRemoteSharedData();
  const profileRoster = await fetchProfilesForRoster();
  const sharedData = ensureProfileInSharedData(mergeProfilesIntoSharedData(remoteData || sharedDataFromState(readLocalState()), profileRoster));
  const authState = {
    user: appUserFromProfile(),
    sharedData
  };
  window.DRONEFLYVER_AUTH_STATE = authState;
  renderSignedInIdentity(authState);
  applyAuthState(sharedData);
  lastRemoteSnapshot = snapshot(sharedData);
  installLocalStorageSync();

  showAppAfterSignedIn();
  await import("./app.js?v=64");
  window.droneflyverApplyAuthState?.(authState);
  enforceAuthRoleView(authState);
  renderSecureAccountPanel();
  setStatus(`Synkronisert - ${realStudentCount(sharedData)} elever`);

  window.addEventListener("focus", refreshFromRemote);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) refreshFromRemote();
  });
  window.setInterval(refreshFromRemote, remoteRefreshIntervalMs);
  registerServiceWorker();
}

bootAuthenticatedApp();
