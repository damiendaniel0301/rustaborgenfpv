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
let authProfile = null;
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

function writeLocalState(state) {
  originalSetItem.call(localStorage, STORAGE_KEY, JSON.stringify(state));
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

function userName(profile = authProfile) {
  return profile?.display_name || profile?.email || "Bruker";
}

function userRole(profile = authProfile) {
  return profile?.role === "instructor" ? "instructor" : "student";
}

function userRoleLabel(profile = authProfile) {
  return userRole(profile) === "instructor" ? "Instruktør" : "Elev";
}

function appUserFromProfile(profile = authProfile) {
  return {
    id: profile.id,
    name: userName(profile),
    role: userRole(profile)
  };
}

function ensureProfileInSharedData(sharedData, profile = authProfile) {
  const next = {
    students: Array.isArray(sharedData?.students) ? [...sharedData.students] : [],
    instructors: Array.isArray(sharedData?.instructors) ? [...sharedData.instructors] : []
  };
  const appUser = appUserFromProfile(profile);

  if (appUser.role === "instructor") {
    const instructorIndex = next.instructors.findIndex((item) => item.id === appUser.id);
    if (instructorIndex >= 0) next.instructors[instructorIndex] = appUser;
    else next.instructors.push(appUser);
    return next;
  }

  const studentIndex = next.students.findIndex((item) => item.id === appUser.id);
  if (studentIndex >= 0) {
    next.students[studentIndex] = {
      ...next.students[studentIndex],
      name: appUser.name
    };
  } else {
    next.students.push({ id: appUser.id, name: appUser.name });
  }
  return next;
}

function applyAuthState(sharedData = {}) {
  const localState = readLocalState();
  const appUser = appUserFromProfile();
  const mergedShared = ensureProfileInSharedData(sharedData);
  const selectedStudentId = appUser.role === "instructor"
    ? localState.selectedStudentId || mergedShared.students[0]?.id || "gjest"
    : appUser.id;

  writeLocalState({
    ...localState,
    user: appUser,
    currentStudentId: appUser.role === "student" ? appUser.id : localState.currentStudentId || "gjest",
    selectedStudentId,
    students: mergedShared.students,
    instructors: mergedShared.instructors
  });
}

function setStatus(message, isError = false) {
  const target = document.querySelector("#syncStatus");
  if (!target) return;
  target.textContent = message;
  target.classList.toggle("sync-error", isError);
}

function setLoginMessage(message) {
  const target = document.querySelector("#loginMessage");
  if (target) target.textContent = message;
}

function hideAppUntilSignedIn() {
  document.querySelector("main")?.classList.add("hidden");
  document.querySelector(".side-nav")?.classList.add("hidden");
  document.querySelector(".account-card")?.classList.add("hidden");
}

function showAppAfterSignedIn() {
  document.querySelector("main")?.classList.remove("hidden");
  document.querySelector(".side-nav")?.classList.remove("hidden");
  document.querySelector(".account-card")?.classList.remove("hidden");
}

function hideLegacyLoginControls() {
  const panel = document.querySelector(".login-panel");
  if (!panel) return;
  panel.classList.add("secure-auth-active");
  [
    "#loginUserSelect",
    "#loginInstructorCodeGroup",
    "#loginButton",
    "#showCreateUserButton",
    "#createUserPanel",
    "#loginMessage"
  ].forEach((selector) => document.querySelector(selector)?.classList.add("secure-hidden"));
  document.querySelector("label[for='loginUserSelect']")?.classList.add("secure-hidden");
}

function renderAuthForm() {
  hideAppUntilSignedIn();
  const panel = document.querySelector(".login-panel");
  if (!panel) return;
  panel.innerHTML = `
    <h2>Innlogging</h2>
    <div class="secure-auth-panel">
      <label for="authName">Navn</label>
      <input id="authName" autocomplete="name" placeholder="Navn ved ny bruker" />
      <label for="authEmail">E-post</label>
      <input id="authEmail" type="email" autocomplete="email" placeholder="din@epost.no" />
      <label for="authPassword">Passord</label>
      <input id="authPassword" type="password" autocomplete="current-password" placeholder="Minst 6 tegn" />
      <button id="authLoginButton" class="primary-button" type="button">Logg inn</button>
      <button id="authSignupButton" class="secondary-button" type="button">Lag elevbruker</button>
      <p id="loginMessage" class="login-message" aria-live="polite"></p>
      <p id="syncStatus" class="sync-status" aria-live="polite">Sikker innlogging</p>
    </div>
  `;

  document.querySelector("#authLoginButton").addEventListener("click", signIn);
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
    setLoginMessage("Innlogging feilet. Sjekk e-post og passord.");
    return;
  }
  window.location.reload();
}

async function signUp() {
  const { name, email, password } = authValues();
  if (!name || !email || password.length < 6) {
    setLoginMessage("Skriv navn, e-post og passord på minst 6 tegn.");
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

async function fetchRemoteSharedData() {
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
  if (!client || pushing || !authProfile) return;

  let parsed;
  try {
    parsed = JSON.parse(rawState);
  } catch {
    return;
  }

  const sharedData = ensureProfileInSharedData(sharedDataFromState(parsed));
  pushing = true;
  setStatus("Lagrer...");

  const { data, error } = await client.rpc("save_drone_app_state", {
    state_id: stateId,
    new_data: sharedData
  });

  pushing = false;

  if (error) {
    setStatus("Supabase-feil", true);
    return;
  }

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

  const normalizedRemoteData = ensureProfileInSharedData(remoteData);
  const remoteSnapshot = snapshot(normalizedRemoteData);
  const localSnapshot = snapshot(sharedDataFromState(readLocalState()));
  lastRemoteSnapshot = lastRemoteSnapshot || remoteSnapshot;

  if (remoteSnapshot !== localSnapshot && remoteSnapshot !== lastRemoteSnapshot) {
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
    <strong>${userName()}</strong>
    <small>${authProfile.email} - ${userRoleLabel()}</small>
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
    await client.auth.signOut();
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  });

  document.querySelector("#redeemInstructorInviteButton")?.addEventListener("click", redeemInstructorInvite);
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

function enforceAuthRoleView(authState = window.DRONEFLYVER_AUTH_STATE) {
  const user = authState?.user;
  if (!user) return;

  document.querySelector("#currentUser").textContent = user.name;
  document.querySelector("#currentRole").textContent = user.role === "instructor" ? "Instruktør" : "Elev";
  document.querySelectorAll(".instructor-only").forEach((item) => item.classList.toggle("hidden", user.role !== "instructor"));
  document.querySelectorAll(".student-only").forEach((item) => item.classList.toggle("hidden", user.role === "instructor"));

  if (user.role !== "instructor") return;

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

  const remoteData = await fetchRemoteSharedData();
  const sharedData = ensureProfileInSharedData(remoteData || sharedDataFromState(readLocalState()));
  const authState = {
    user: appUserFromProfile(),
    sharedData
  };
  window.DRONEFLYVER_AUTH_STATE = authState;
  applyAuthState(sharedData);
  lastRemoteSnapshot = snapshot(sharedData);
  installLocalStorageSync();

  showAppAfterSignedIn();
  await import("./app.js?v=24");
  window.droneflyverApplyAuthState?.(authState);
  enforceAuthRoleView(authState);
  renderSecureAccountPanel();
  setStatus("Synkronisert");

  window.addEventListener("focus", refreshFromRemote);
  window.setInterval(refreshFromRemote, 30000);
}

bootAuthenticatedApp();
