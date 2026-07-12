const liftoffExamExercises = [
  {
    title: "Øvelse 1: Straw bale - 01 Field day",
    requirement: "Skal gjennomføres innen 03:15"
  },
  {
    title: "Øvelse 2: short circuit - 01 pole position",
    requirement: "Skal gjennomføres innen 03:00"
  },
  {
    title: "Øvelse 3: Hangar - C03",
    requirement: "Skal gjennomføres innen 02:15"
  }
];

function blankProgress() {
  return {
    step1: {
      tasks: Array(16).fill(false),
      exam: {
        status: "not_submitted",
        exercises: liftoffExamExercises.map(() => ({ status: "not_submitted", fileName: "", youtube: "", note: "" }))
      }
    },
    step2: {
      tasks: [false, false, false, false],
      exam: { status: "not_started", youtube: "", fileName: "", note: "" }
    }
  };
}

const defaultState = {
  user: { name: "Gjest", role: "student" },
  currentStudentId: "gjest",
  selectedStudentId: "gjest",
  instructors: [],
  students: [{ id: "gjest", name: "Gjest", ...blankProgress() }],
  flightLogs: [],
  deletedStudentIds: [],
  ...blankProgress()
};

const coreEventCodes = [
  ["TO", "Takeoff"],
  ["LDG", "Landing"],
  ["LOS", "Loss of signal / svak link"],
  ["GPS", "GPS-problem"],
  ["BAT", "Lav batterispenning / battery warning"],
  ["RTH", "Return-to-home aktivert"],
  ["OBS", "Obstacle / hindring"],
  ["WX", "Værpåvirkning"],
  ["PAY", "Payload event"],
  ["CAM", "Kamera/sensor-hendelse"],
  ["ABT", "Abortert sortie"],
  ["MNT", "Vedlikehold kreves"]
];

const standardBatteryPacks = Array.from({ length: 8 }, (_, index) => `BAT-${String(index + 1).padStart(2, "0")}`);

const lessons = {
  step1: [
    {
      title: "Learn to fly an FPV drone TODAY (for total beginners)",
      goal: "Sett opp simulator, kontroller og første hover i Liftoff.",
      video: "https://www.youtube.com/watch?v=SpuXqNakP2A&list=PLwoDb7WF6c8lCKhQOTy-Vb9LfW0VAIrTP"
    },
    {
      title: "Lesson 2 - Forward flight and altitude control",
      goal: "Fly fremover med kontrollert høyde og små styreutslag.",
      video: "https://www.youtube.com/watch?v=CNJQduiIBos&list=PLwoDb7WF6c8lCKhQOTy-Vb9LfW0VAIrTP"
    },
    {
      title: "Lesson 3 - How to slow down",
      goal: "Lær å redusere fart uten å miste kontroll eller høyde.",
      video: "https://www.youtube.com/watch?v=3S0BvdiBwCk&list=PLwoDb7WF6c8lCKhQOTy-Vb9LfW0VAIrTP"
    },
    {
      title: "Lesson 4 - Beginning Turns",
      goal: "Start med enkle svinger og hold en rolig flylinje.",
      video: "https://www.youtube.com/watch?v=x0eBWQqKpeg&list=PLwoDb7WF6c8lCKhQOTy-Vb9LfW0VAIrTP"
    },
    {
      title: "Lesson 5 - Coordinated Turns",
      goal: "Koordiner roll, yaw og throttle i jevne svinger.",
      video: "https://www.youtube.com/watch?v=E2V9aPlLSrQ&list=PLwoDb7WF6c8lCKhQOTy-Vb9LfW0VAIrTP"
    },
    {
      title: "Lesson 6 - Un-coordinated Turns",
      goal: "Forstå forskjellen på koordinerte og ukoordinerte svinger.",
      video: "https://www.youtube.com/watch?v=umj9YW45sj0&list=PLwoDb7WF6c8lCKhQOTy-Vb9LfW0VAIrTP"
    },
    {
      title: "Lesson 7 - A more complicated environment",
      goal: "Fly kontrollert i et mer krevende miljø med flere referansepunkter.",
      video: "https://www.youtube.com/watch?v=8nuLwkJTWb4&list=PLwoDb7WF6c8lCKhQOTy-Vb9LfW0VAIrTP"
    },
    {
      title: "Lesson 8 - Troubleshooting Your Problems",
      goal: "Identifiser vanlige feil og juster teknikken i simulatoren.",
      video: "https://www.youtube.com/watch?v=QQDydREdDuU&list=PLwoDb7WF6c8lCKhQOTy-Vb9LfW0VAIrTP"
    },
    {
      title: "Lesson 9 - Acrobatic Rolls and Inverted Flight",
      goal: "Øv på rolls og kontroll når dronen er invertert.",
      video: "https://www.youtube.com/watch?v=l5DJh1zJ9nI&list=PLwoDb7WF6c8lCKhQOTy-Vb9LfW0VAIrTP",
      optional: true
    },
    {
      title: "Lesson 10 - Flips and Split-S",
      goal: "Gjennomfør flips og Split-S med trygg høyde og retning.",
      video: "https://www.youtube.com/watch?v=pL7sj1h3SRs&list=PLwoDb7WF6c8lCKhQOTy-Vb9LfW0VAIrTP",
      optional: true
    },
    {
      title: "Lesson 11 - Throttle Pumps and Low Altitude Flips and Rolls",
      goal: "Tren throttle-pumps og lave manøvre med presis timing.",
      video: "https://www.youtube.com/watch?v=DYNCfrS9mFk&list=PLwoDb7WF6c8lCKhQOTy-Vb9LfW0VAIrTP",
      optional: true
    },
    {
      title: "Lesson 12 - Extreme altitude limitation",
      goal: "Hold kontroll når høyden er sterkt begrenset.",
      video: "https://www.youtube.com/watch?v=EGDxYVLIfbw&list=PLwoDb7WF6c8lCKhQOTy-Vb9LfW0VAIrTP"
    },
    {
      title: "Lesson 13 - Landing (crashing with style)",
      goal: "Øv på landinger og avslutninger med kontroll.",
      video: "https://www.youtube.com/watch?v=viNSApofw58&list=PLwoDb7WF6c8lCKhQOTy-Vb9LfW0VAIrTP"
    },
    {
      title: "Lesson 14 - Panic Stops",
      goal: "Stopp raskt og trygt når flylinjen eller situasjonen blir feil.",
      video: "https://www.youtube.com/watch?v=TwODqrWbpW4&list=PLwoDb7WF6c8lCKhQOTy-Vb9LfW0VAIrTP"
    },
    {
      title: "Lesson 15 - Beginner Power Loops",
      goal: "Gjennomfør en enkel power loop med god inngang, throttle og utgang.",
      video: "https://www.youtube.com/watch?v=j-fJIPVe3fs&list=PLwoDb7WF6c8lCKhQOTy-Vb9LfW0VAIrTP",
      optional: true
    },
    {
      title: "Trinn 16 - Eksamens flyvninger",
      goal: "Bruk drone: Racewhoop 2.5\", bruk kamera vinkel 10 grader, og fullfør alle tre eksamensløpene innen 2:10.",
      video: "https://www.youtube.com/playlist?list=PLwoDb7WF6c8lCKhQOTy-Vb9LfW0VAIrTP"
    }
  ],
  step2: [
    {
      title: "Tinywhoop-sjekk før flyvning",
      goal: "Kontroller propeller, batteri, failsafe, VTX-kanal og trygg flysone.",
      video: "https://www.youtube.com/watch?v=y3MHEpfzXrM"
    },
    {
      title: "Rolig hover og landinger",
      goal: "Fly rolig hover, korte forflytninger og tre kontrollerte landinger. Bruk videoene fra Steg 1 som repetisjon.",
      video: "https://www.youtube.com/playlist?list=PLwoDb7WF6c8lCKhQOTy-Vb9LfW0VAIrTP",
      videoLabel: "Repetisjon fra Steg 1"
    },
    {
      title: "Innendørs bane",
      goal: "Fly en enkel løype gjennom porter eller markører med jevn fart.",
      video: "https://www.youtube.com/results?search_query=tinywhoop+indoor+course+beginner"
    },
    {
      title: "Praktisk eksamensrunde",
      goal: "Gjennomfør avtalt flyvning foran instruktør uten farlige situasjoner.",
      video: "https://www.youtube.com/results?search_query=tinywhoop+beginner+flight+practice"
    }
  ]
};

let state = loadState();
let activeRole = state.user.role;
let reviewStep = "step1";
let flightLogFormDirty = false;
let selectedFlightLogUserId = state.user.id || state.currentStudentId || "gjest";
let flightLogSummaryVisible = false;
let flightLogSortKey = "date";
let flightLogSortDirection = "desc";
let flightLogDroneFilter = "all";
let flightLogModeFilter = "all";
let flightLogMissionFilter = "all";
let adminRenameSelectedUserId = "";
let deviceMode = detectDeviceMode();

const views = {
  dashboard: document.querySelector("#dashboardView"),
  step1: document.querySelector("#step1View"),
  step2: document.querySelector("#step2View"),
  certification: document.querySelector("#certificationView"),
  military: document.querySelector("#militaryView"),
  review: document.querySelector("#reviewView"),
  flightLog: document.querySelector("#flightLogView")
};

function loadState() {
  const raw = localStorage.getItem("droneflyt-state");
  if (!raw) return normalizeState(applyAuthUserOverride(structuredClone(defaultState)));

  try {
    return normalizeState(applyAuthUserOverride({ ...structuredClone(defaultState), ...JSON.parse(raw) }));
  } catch {
    return normalizeState(applyAuthUserOverride(structuredClone(defaultState)));
  }
}

function applyAuthUserOverride(savedState) {
  const authUser = window.DRONEFLYVER_AUTH_STATE?.user;
  if (!authUser?.id) return savedState;

  savedState.user = {
    id: authUser.id,
    name: authUser.name || savedState.user?.name || "Bruker",
    role: authUser.role || savedState.user?.role || "student"
  };

  if (savedState.user.role === "student") {
    savedState.currentStudentId = savedState.user.id;
    savedState.selectedStudentId = savedState.user.id;
  }

  return savedState;
}

function normalizeState(savedState) {
  savedState.step1.tasks = normalizeTasks(savedState.step1.tasks, lessons.step1.length);
  savedState.step2.tasks = normalizeTasks(savedState.step2.tasks, lessons.step2.length);
  savedState.step1.exam = normalizeLiftoffExam(savedState.step1.exam);
  updateLiftoffExamStatus(savedState.step1.exam);
  savedState.students = normalizeStudents(savedState);
  savedState.instructors = normalizeInstructors(savedState.instructors);
  savedState.flightLogs = normalizeFlightLogs(savedState.flightLogs);
  savedState.deletedStudentIds = Array.isArray(savedState.deletedStudentIds) ? savedState.deletedStudentIds : [];
  savedState.currentStudentId = savedState.currentStudentId || studentIdFromName(savedState.user.name);
  savedState.selectedStudentId = savedState.selectedStudentId || savedState.currentStudentId;
  loadActiveStudentProgress(savedState);
  return savedState;
}

function applySharedState(sharedData = {}) {
  state.deletedStudentIds = Array.isArray(sharedData.deletedStudentIds) ? sharedData.deletedStudentIds : [];
  state.students = normalizeStudents({
    ...state,
    students: filterDeletedStudents(sharedData.students, state.deletedStudentIds)
  });
  state.instructors = normalizeInstructors(sharedData.instructors);
  state.flightLogs = normalizeFlightLogs(sharedData.flightLogs);

  if (!state.students.some((student) => student.id === state.currentStudentId)) {
    state.currentStudentId = "gjest";
  }

  const firstRealStudentId = state.students.find((student) => student.id !== "gjest")?.id || state.students[0]?.id || "gjest";
  if (!state.students.some((student) => student.id === state.selectedStudentId) || (state.selectedStudentId === "gjest" && firstRealStudentId !== "gjest")) {
    state.selectedStudentId = isInstructorRole(state.user.role) ? firstRealStudentId : state.currentStudentId || "gjest";
  }

  loadActiveStudentProgress();
}

function detectDeviceMode() {
  const coarsePointer = window.matchMedia?.("(pointer: coarse)")?.matches || false;
  const narrowScreen = window.matchMedia?.("(max-width: 820px)")?.matches || window.innerWidth <= 820;
  const mobileAgent = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  const touchDevice = (navigator.maxTouchPoints || 0) > 1;
  return (narrowScreen && (coarsePointer || touchDevice)) || mobileAgent ? "mobile" : "desktop";
}

function applyDeviceMode() {
  deviceMode = detectDeviceMode();
  const isMobile = deviceMode === "mobile";
  document.body.classList.toggle("device-mobile", isMobile);
  document.body.classList.toggle("device-desktop", !isMobile);
  document.body.dataset.deviceMode = deviceMode;

  const mobileStart = document.querySelector("#flightLogMobileStart");
  const badge = document.querySelector("#deviceModeBadge");
  if (mobileStart) mobileStart.classList.toggle("hidden", !isMobile);
  if (badge) badge.textContent = isMobile ? "Mobilmodus" : "PC-visning";
}

function groupFlightLogFormForSteps() {
  const form = document.querySelector("#flightLogForm");
  if (!form || form.dataset.stepped === "true") return;

  const groups = [
    { title: "1. Sortie", selectors: ["#flightDate", "#sortieNo", "#operatorPilot", "#missionType"] },
    { title: "2. Tid og sted", selectors: ["#takeoffTime", "#landingTime", "#flightTimeMinutes", "#flightLocation"] },
    { title: "3. Drone og hendelser", selectors: ["#droneAirframe", "#flightMode", "#batteryPackOptions", "#coreEventOptions"] },
    { title: "4. Merknader", selectors: ["#weather", "#issuesIncidents", "#maintenanceRequired", "#flightRemarks"] }
  ];

  groups.forEach(({ title, selectors }) => {
    const section = document.createElement("fieldset");
    section.className = "flight-log-step-section";
    const legend = document.createElement("legend");
    legend.textContent = title;
    section.append(legend);

    selectors.forEach((selector) => {
      const element = document.querySelector(selector);
      const row = element?.closest(".form-row, .core-event-fieldset");
      if (row && row.parentElement === form) section.append(row);
    });

    const actions = document.querySelector(".flight-log-actions");
    if (title.startsWith("4.") && actions?.parentElement === form) {
      actions.classList.add("sticky-save-bar");
      section.append(actions);
    }

    form.append(section);
  });

  form.dataset.stepped = "true";
}

function setupFlightLogMobileShell() {
  applyDeviceMode();
  groupFlightLogFormForSteps();

  document.querySelector("#newSortieButton")?.addEventListener("click", () => {
    flightLogSummaryVisible = false;
    resetFlightLogForm();
    setView("flightLog");
    document.querySelector("#flightLogForm")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  window.addEventListener("resize", applyDeviceMode);
  window.addEventListener("orientationchange", applyDeviceMode);
}

function normalizeTasks(tasks = [], length) {
  const source = Array.isArray(tasks) ? tasks : [];
  return Array.from({ length }, (_, index) => Boolean(source[index]));
}

function normalizeStudents(savedState) {
  const deletedIds = new Set(Array.isArray(savedState.deletedStudentIds) ? savedState.deletedStudentIds : []);
  const source = Array.isArray(savedState.students) && savedState.students.length
    ? savedState.students
    : [{
        id: studentIdFromName(savedState.user.name),
        name: savedState.user.name || "Gjest",
        step1: savedState.step1,
        step2: savedState.step2
      }];

  return filterDeletedStudents(source, deletedIds).map((student) => normalizeStudent(student));
}

function filterDeletedStudents(students = [], deletedStudentIds = []) {
  const deletedIds = deletedStudentIds instanceof Set
    ? deletedStudentIds
    : new Set(Array.isArray(deletedStudentIds) ? deletedStudentIds : []);
  return (Array.isArray(students) ? students : []).filter((student) => student?.id === "gjest" || !deletedIds.has(student?.id));
}

function normalizeStudent(student) {
  const progress = blankProgress();
  progress.step1.tasks = normalizeTasks(student.step1?.tasks, lessons.step1.length);
  progress.step1.exam = normalizeLiftoffExam(student.step1?.exam);
  updateLiftoffExamStatus(progress.step1.exam);
  progress.step2.tasks = normalizeTasks(student.step2?.tasks, lessons.step2.length);
  progress.step2.exam = normalizeTinywhoopExam(student.step2?.exam);

  return {
    id: student.id || studentIdFromName(student.name),
    name: student.name || "Gjest",
    ...progress
  };
}

function normalizeInstructors(instructors = []) {
  return Array.isArray(instructors)
    ? instructors.map((instructor) => ({
        id: instructor.id || studentIdFromName(instructor.name),
        name: instructor.name || "Instruktør",
        role: instructor.role === "admin" ? "admin" : "instructor"
      }))
    : [];
}

function normalizeFlightLogs(logs = []) {
  if (!Array.isArray(logs)) return [];

  return logs
    .filter((log) => log && typeof log === "object")
    .map((log) => {
      const batteryPackNos = normalizeBatteryPackNos(log);
      return {
        id: log.id || crypto.randomUUID(),
        ownerId: log.ownerId || "",
        date: log.date || "",
        sortieNo: log.sortieNo || "",
        operatorPilot: log.operatorPilot || "",
        droneAirframe: log.droneAirframe || "",
        location: log.location || "",
        missionType: log.missionType || "Trening",
        takeoffTime: log.takeoffTime || "",
        landingTime: log.landingTime || "",
        flightTimeMinutes: Number(log.flightTimeMinutes) || 0,
        cumulativeFlightHours: Number(log.cumulativeFlightHours) || 0,
        batteryPackNos,
        batteryPackNo: batteryPackNos.join(", "),
        weather: log.weather || "",
        flightMode: log.flightMode || "FPV",
        coreEvents: Array.isArray(log.coreEvents) ? log.coreEvents.filter(Boolean) : [],
        issuesIncidents: log.issuesIncidents || "",
        maintenanceRequired: Boolean(log.maintenanceRequired),
        maintenanceNotes: log.maintenanceNotes || "",
        remarks: log.remarks || "",
        createdAt: log.createdAt || new Date().toISOString(),
        updatedAt: log.updatedAt || new Date().toISOString()
      };
    })
    .sort((a, b) => `${b.date} ${b.takeoffTime}`.localeCompare(`${a.date} ${a.takeoffTime}`));
}

function normalizeBatteryPackNos(log = {}) {
  const values = Array.isArray(log.batteryPackNos)
    ? log.batteryPackNos
    : String(log.batteryPackNo || "").split(/[,;\n]/);

  return [...new Set(values.map((value) => String(value).trim()).filter(Boolean))];
}

function studentIdFromName(name = "Gjest") {
  const normalized = name.trim().toLowerCase().replace(/[^a-z0-9æøå]+/gi, "-").replace(/^-|-$/g, "");
  return normalized || "gjest";
}

function activeStudentId(appState = state) {
  return isInstructorRole(appState.user.role) ? appState.selectedStudentId : appState.currentStudentId;
}

function flightLogOwnerId(appState = state) {
  return appState.user.id || appState.currentStudentId || activeStudentId(appState);
}

function activeStudent(appState = state) {
  const id = activeStudentId(appState);
  return appState.students.find((student) => student.id === id) || appState.students[0];
}

function loadActiveStudentProgress(appState = state) {
  const student = activeStudent(appState);
  appState.step1 = structuredClone(student.step1);
  appState.step2 = structuredClone(student.step2);
}

function syncActiveStudentProgress() {
  const id = activeStudentId();
  const index = state.students.findIndex((student) => student.id === id);
  if (index === -1) return;

  state.students[index] = {
    ...state.students[index],
    step1: structuredClone(state.step1),
    step2: structuredClone(state.step2)
  };
}

function normalizeLiftoffExam(exam = {}) {
  const savedExercises = Array.isArray(exam.exercises) ? exam.exercises : [];

  return {
    status: exam.status || "not_submitted",
    exercises: liftoffExamExercises.map((_, index) => ({
      status: savedExercises[index]?.status || "not_submitted",
      fileName: savedExercises[index]?.fileName || "",
      youtube: savedExercises[index]?.youtube || "",
      note: savedExercises[index]?.note || ""
    }))
  };
}

function normalizeTinywhoopExam(exam = {}) {
  return {
    status: exam.status || "not_started",
    youtube: exam.youtube || "",
    fileName: exam.fileName || "",
    note: exam.note || ""
  };
}

function updateLiftoffExamStatus(exam = state.step1.exam) {
  const statuses = exam.exercises.map((exercise) => exercise.status);
  if (statuses.every((status) => status === "passed")) {
    exam.status = "passed";
  } else if (statuses.some((status) => status !== "not_submitted")) {
    exam.status = "submitted";
  } else {
    exam.status = "not_submitted";
  }
}

function saveState() {
  syncActiveStudentProgress();
  localStorage.setItem("droneflyt-state", JSON.stringify(state));
}

function percent(done, total) {
  return Math.round((done / total) * 100);
}

function stepPercent(stepKey) {
  const tasks = state[stepKey].tasks;
  const requiredIndexes = requiredLessonIndexes(stepKey);
  const taskDone = requiredIndexes.filter((index) => tasks[index]).length;
  const examDone = state[stepKey].exam.status === "passed" ? 1 : 0;
  return percent(taskDone + examDone, requiredIndexes.length + 1);
}

function requiredLessonIndexes(stepKey) {
  return lessons[stepKey]
    .map((lesson, index) => ({ lesson, index }))
    .filter(({ lesson }) => !lesson.optional)
    .map(({ index }) => index);
}

function requiredTasksComplete(stepKey, tasks = state[stepKey].tasks) {
  return requiredLessonIndexes(stepKey).every((index) => tasks[index]);
}

function setView(viewName) {
  Object.entries(views).forEach(([name, element]) => {
    element.classList.toggle("active-view", name === viewName);
  });

  document.querySelectorAll(".nav-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === viewName);
  });

  const titles = {
    dashboard: "Oversikt",
    step1: "Steg 1: Liftoff",
    step2: "Steg 2: Tinywhoop",
    certification: "Steg 3: Kurs og sertifisering",
    military: "Steg 4: Militært typekurs",
    review: "Vurdering",
    flightLog: "Flylogg"
  };
  document.querySelector("#viewTitle").textContent = titles[viewName];
}

function renderTaskList(stepKey, targetId) {
  const target = document.querySelector(targetId);
  const locked = stepKey === "step2" && state.step1.exam.status !== "passed";

  target.innerHTML = lessons[stepKey]
    .map((lesson, index) => {
      const done = state[stepKey].tasks[index];
      const optional = Boolean(lesson.optional);
      return `
        <article class="task-item ${locked ? "locked" : ""} ${optional ? "optional" : ""}">
          <button class="check-button ${done ? "done" : ""}" type="button" data-step="${stepKey}" data-index="${index}" ${locked ? "disabled" : ""} aria-label="Marker trinn som ferdig">${done ? "✓" : ""}</button>
          <div class="task-copy">
            <div class="task-label-row">
              <span class="task-meta">Trinn ${index + 1}</span>
              ${optional ? `<span class="optional-badge">Valgfri</span>` : ""}
            </div>
            <strong>${lesson.title}</strong>
            <p>${lesson.goal}</p>
            <a href="${lesson.video}" target="_blank" rel="noreferrer">${lesson.videoLabel || "Se YouTube-eksempler"}</a>
          </div>
          <button class="secondary-button" type="button" data-video="${lesson.video}">Video</button>
        </article>
      `;
    })
    .join("");
}

function examText(exam, stepKey) {
  if (exam.status === "passed") return "Bestått";
  if (exam.status === "failed") return "Ikke godkjent ennå";
  if (exam.status === "submitted") return stepKey === "step1" ? "Delvis sendt/godkjent" : "Klar til praktisk vurdering";
  return stepKey === "step1" ? "Ikke sendt inn" : "Ikke startet";
}

function renderDashboard() {
  const step1 = stepPercent("step1");
  const step2 = stepPercent("step2");
  const total = Math.round((step1 + step2) / 2);

  document.querySelector("#step1Progress").value = step1;
  document.querySelector("#step2Progress").value = step2;
  document.querySelector("#totalProgress").textContent = `${total}%`;

  let next = "Start med trinn 1 i Liftoff";
  if (!requiredTasksComplete("step1")) next = "Fortsett med obligatoriske Liftoff-trinn";
  else if (state.step1.exam.status !== "passed") next = "Send Liftoff-eksamensflyvninger til instruktør";
  else if (!requiredTasksComplete("step2")) next = "Fortsett med tinywhoop-trinnene";
  else if (state.step2.exam.status !== "passed") next = "Avtal tinywhoop-eksamen med instruktør";
  else next = "Hele opplæringsløpet er bestått";
  document.querySelector("#nextAction").textContent = next;
}

function renderExams() {
  const liftoff = state.step1.exam;
  const tinywhoop = state.step2.exam;
  const approvedExercises = liftoff.exercises.filter((exercise) => exercise.status === "passed").length;

  document.querySelector("#liftoffExamState").textContent =
    `${examText(liftoff, "step1")} - ${approvedExercises} av ${liftoffExamExercises.length} øvelser godkjent`;
  document.querySelector("#tinywhoopExamState").textContent =
    `${examText(tinywhoop, "step2")}${tinywhoop.youtube ? " - videolink sendt" : ""}`;
  renderLiftoffExerciseList();
  renderTinywhoopSubmission();

  const step2Lock = document.querySelector("#step2Lock");
  const open = state.step1.exam.status === "passed";
  step2Lock.textContent = open ? "Åpent" : "Krever bestått steg 1";
  step2Lock.classList.toggle("open", open);
}

function renderLiftoffExerciseList() {
  const list = document.querySelector("#liftoffExerciseList");

  list.innerHTML = liftoffExamExercises
    .map((exercise, index) => {
      const saved = state.step1.exam.exercises[index];
      const videoUrl = safeUrl(saved.youtube);
      return `
        <article class="exam-exercise-card">
          <div>
            <span class="task-meta">Eksamensøvelse ${index + 1}</span>
            <strong>${exercise.title}</strong>
            <p>${exercise.requirement}</p>
            <p>Bruk drone: Racewhoop 2.5" · Bruk kamera vinkel 10 grader</p>
            <p>Status: ${exerciseStatusText(saved.status)}</p>
            ${saved.note ? `<p><strong>Merknad fra instruktør:</strong> ${escapeHtml(saved.note)}</p>` : ""}
            ${videoUrl ? `<p><a class="link-button inline-link" href="${videoUrl}" target="_blank" rel="noreferrer">Se video</a></p>` : ""}
          </div>
          <div class="exam-controls student-only">
            <p class="upload-help">Last opp videoen til YouTube, Google Drive eller lignende, og lim inn en delbar lenke her.</p>
            <input data-exam-link="${index}" type="url" placeholder="Lim inn delbar videolink" value="${escapeHtml(saved.youtube)}" />
            <button class="primary-button" type="button" data-submit-exercise="${index}">Send videolink</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderTinywhoopSubmission() {
  const target = document.querySelector("#tinywhoopSubmission");
  if (!target) return;

  const locked = state.step1.exam.status !== "passed";
  const videoUrl = safeUrl(state.step2.exam.youtube);

  target.innerHTML = `
    <p class="upload-help">Etter avtale med instruktør kan du laste opp video til YouTube, Google Drive eller lignende, og lime inn en delbar lenke her.</p>
    ${videoUrl ? `<p><a class="link-button inline-link" href="${videoUrl}" target="_blank" rel="noreferrer">Se innsendt video</a></p>` : ""}
    <input id="tinywhoopVideoLink" type="url" placeholder="Lim inn delbar videolink" value="${escapeHtml(state.step2.exam.youtube)}" ${locked ? "disabled" : ""} />
    <button class="primary-button" type="button" data-submit-tinywhoop-video ${locked ? "disabled" : ""}>Send videolink</button>
  `;
}

function exerciseStatusText(status) {
  if (status === "passed") return "Godkjent";
  if (status === "failed") return "Ikke godkjent";
  if (status === "submitted") return "Sendt til vurdering";
  return "Ikke sendt inn";
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeUrl(value = "") {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function dateCompact(date = todayString()) {
  return date.replaceAll("-", "");
}

function isInstructorRole(role = activeRole) {
  return role === "instructor" || role === "admin";
}

function isAdminRole(role = activeRole) {
  return role === "admin";
}

function roleLabel(role = "student") {
  if (role === "admin") return "admin";
  if (role === "instructor") return "instruktør";
  return "elev";
}

function flightLogsForActiveStudent() {
  const ownerId = flightLogOwnerId();
  return state.flightLogs.filter((log) => log.ownerId === ownerId);
}

function flightLogUsers() {
  const users = [
    state.user.id ? { id: state.user.id, name: state.user.name, role: state.user.role } : null,
    ...state.instructors.map((instructor) => ({ ...instructor, role: instructor.role || "instructor" })),
    ...state.students.map((student) => ({ id: student.id, name: student.name, role: "student" }))
  ].filter((user) => user?.id && user.id !== "gjest");

  return users.reduce((unique, user) => {
    if (!unique.some((item) => item.id === user.id)) unique.push(user);
    return unique;
  }, []);
}

function selectedFlightLogUser() {
  const users = flightLogUsers();
  const fallback = users.find((user) => user.id === state.user.id) || users[0] || { id: flightLogOwnerId(), name: state.user.name };

  if (!isInstructorRole(state.user.role)) {
    selectedFlightLogUserId = fallback.id;
    return fallback;
  }

  if (!users.some((user) => user.id === selectedFlightLogUserId)) {
    selectedFlightLogUserId = fallback.id;
  }

  return users.find((user) => user.id === selectedFlightLogUserId) || fallback;
}

function flightLogsForSelectedUser() {
  const user = selectedFlightLogUser();
  return state.flightLogs.filter((log) => log.ownerId === user.id);
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))]
    .sort((a, b) => String(a).localeCompare(String(b), "no"));
}

function ensureFlightLogFiltersValid(logs = flightLogsForSelectedUser()) {
  if (flightLogDroneFilter !== "all" && !logs.some((log) => log.droneAirframe === flightLogDroneFilter)) {
    flightLogDroneFilter = "all";
  }
  if (flightLogModeFilter !== "all" && !logs.some((log) => log.flightMode === flightLogModeFilter)) {
    flightLogModeFilter = "all";
  }
  if (flightLogMissionFilter !== "all" && !logs.some((log) => log.missionType === flightLogMissionFilter)) {
    flightLogMissionFilter = "all";
  }
}

function filteredFlightLogs(logs = flightLogsForSelectedUser()) {
  return logs.filter((log) => {
    const matchesDrone = flightLogDroneFilter === "all" || log.droneAirframe === flightLogDroneFilter;
    const matchesMode = flightLogModeFilter === "all" || log.flightMode === flightLogModeFilter;
    const matchesMission = flightLogMissionFilter === "all" || log.missionType === flightLogMissionFilter;
    return matchesDrone && matchesMode && matchesMission;
  });
}

function flightLogSortValue(log, key) {
  if (key === "date") return `${log.date || ""} ${log.takeoffTime || ""}`;
  if (key === "flightTimeMinutes") return Number(log[key]) || 0;
  return String(log[key] || "").toLowerCase();
}

function sortedFlightLogs(logs = filteredFlightLogs()) {
  const direction = flightLogSortDirection === "asc" ? 1 : -1;
  return [...logs].sort((a, b) => {
    const aValue = flightLogSortValue(a, flightLogSortKey);
    const bValue = flightLogSortValue(b, flightLogSortKey);
    if (typeof aValue === "number" && typeof bValue === "number") return (aValue - bValue) * direction;
    return String(aValue).localeCompare(String(bValue), "no") * direction;
  });
}

function generateSortieNumber(date = todayString()) {
  const compact = dateCompact(date);
  const sameDayCount = flightLogsForActiveStudent().filter((log) => log.date === date).length + 1;
  return `${compact}-${String(sameDayCount).padStart(3, "0")}`;
}

function minutesBetween(start, end) {
  if (!start || !end) return 0;
  const [startHours, startMinutes] = start.split(":").map(Number);
  const [endHours, endMinutes] = end.split(":").map(Number);
  if ([startHours, startMinutes, endHours, endMinutes].some(Number.isNaN)) return 0;
  let minutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
  if (minutes < 0) minutes += 24 * 60;
  return minutes;
}

function formatHoursFromMinutes(minutes = 0) {
  return `${(minutes / 60).toFixed(2)} t`;
}

function countBy(logs, getValues) {
  return logs.reduce((counts, log) => {
    const values = getValues(log);
    const list = Array.isArray(values) ? values : [values];
    list.filter(Boolean).forEach((value) => {
      counts[value] = (counts[value] || 0) + 1;
    });
    return counts;
  }, {});
}

function formatCountMap(counts) {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  return entries.length ? entries.map(([key, count]) => `${escapeHtml(key)}: ${count}`).join(", ") : "-";
}

function summarizeBatteries(logs) {
  return logs.reduce((summary, log) => {
    const drone = log.droneAirframe || "Ukjent drone";
    const batteries = normalizeBatteryPackNos(log);
    if (!batteries.length) return summary;
    const minutesPerBattery = (Number(log.flightTimeMinutes) || 0) / batteries.length;
    if (!summary[drone]) summary[drone] = {};
    batteries.forEach((battery) => {
      if (!summary[drone][battery]) summary[drone][battery] = { cycles: 0, minutes: 0 };
      summary[drone][battery].cycles += 1;
      summary[drone][battery].minutes += minutesPerBattery;
    });
    return summary;
  }, {});
}

function summarizeDrones(logs) {
  return logs.reduce((summary, log) => {
    const drone = log.droneAirframe || "";
    if (!drone) return summary;
    if (!summary[drone]) summary[drone] = { sorties: 0, minutes: 0 };
    summary[drone].sorties += 1;
    summary[drone].minutes += Number(log.flightTimeMinutes) || 0;
    return summary;
  }, {});
}

function batterySummaryLines(summary, escape = true) {
  const droneEntries = Object.entries(summary).sort((a, b) => a[0].localeCompare(b[0], "no"));
  return droneEntries.flatMap(([drone, batteries]) => {
    const droneName = escape ? escapeHtml(drone) : drone;
    const prefix = escape ? "&nbsp;&nbsp;" : "  ";
    const batteryLines = Object.entries(batteries)
      .sort((a, b) => b[1].cycles - a[1].cycles || a[0].localeCompare(b[0], "no"))
      .map(([battery, data]) => {
        const name = escape ? escapeHtml(battery) : battery;
        return `${prefix}${name}: ${data.cycles} cycles / ${data.minutes} min / ${formatHoursFromMinutes(data.minutes)}`;
      });
    return [`${droneName}:`, ...batteryLines];
  });
}

function droneSummaryLines(summary, escape = true) {
  const entries = Object.entries(summary).sort((a, b) => b[1].sorties - a[1].sorties || a[0].localeCompare(b[0]));
  return entries.map(([drone, data]) => {
      const name = escape ? escapeHtml(drone) : drone;
      return `${name}: ${data.sorties} sorties / ${data.minutes} min / ${formatHoursFromMinutes(data.minutes)}`;
    });
}

function renderSummaryLines(lines) {
  return lines.length
    ? `<span class="summary-subline">${lines.join("</span><span class=\"summary-subline\">")}</span>`
    : `<span class="summary-subline">-</span>`;
}

function flightLogSortLabel() {
  const labels = {
    date: "Dato",
    sortieNo: "Sortie No.",
    operatorPilot: "Pilot",
    droneAirframe: "Drone / Airframe",
    location: "Location",
    missionType: "Mission type",
    flightMode: "Flight mode",
    flightTimeMinutes: "Flight time",
    batteryPackNo: "Battery / pack no."
  };
  const direction = flightLogSortDirection === "asc" ? "stigende" : "synkende";
  return `${labels[flightLogSortKey] || "Dato"} (${direction})`;
}

function activeFlightLogFilterLabel() {
  const filters = [];
  if (flightLogDroneFilter !== "all") filters.push(`Drone: ${flightLogDroneFilter}`);
  if (flightLogModeFilter !== "all") filters.push(`Flight mode: ${flightLogModeFilter}`);
  if (flightLogMissionFilter !== "all") filters.push(`Mission type: ${flightLogMissionFilter}`);
  return filters.length ? filters.join(" | ") : "Ingen filter";
}

function summarizeFlightLogs(logs) {
  const totalMinutes = logs.reduce((sum, log) => sum + (Number(log.flightTimeMinutes) || 0), 0);
  const sortedDates = logs.map((log) => log.date).filter(Boolean).sort();

  return {
    totalFlights: logs.length,
    totalMinutes,
    totalHours: formatHoursFromMinutes(totalMinutes),
    cumulativeHours: (totalMinutes / 60).toFixed(2),
    firstDate: sortedDates[0] || "-",
    lastDate: sortedDates[sortedDates.length - 1] || "-",
    maintenanceCount: logs.filter((log) => log.maintenanceRequired).length,
    incidentCount: logs.filter((log) => log.issuesIncidents).length,
    missionTypes: countBy(logs, (log) => log.missionType),
    flightModes: countBy(logs, (log) => log.flightMode),
    coreEvents: countBy(logs, (log) => log.coreEvents),
    drones: summarizeDrones(logs),
    batteries: summarizeBatteries(logs)
  };
}

function renderFlightLogSummary() {
  const panel = document.querySelector("#flightLogSummaryPanel");
  if (!panel) return;

  if (!flightLogSummaryVisible) {
    panel.classList.add("hidden");
    panel.innerHTML = "";
    return;
  }

  const baseLogs = flightLogsForSelectedUser();
  ensureFlightLogFiltersValid(baseLogs);
  const logs = sortedFlightLogs(filteredFlightLogs(baseLogs));
  const user = selectedFlightLogUser();
  const summary = summarizeFlightLogs(logs);

  panel.classList.remove("hidden");
  panel.innerHTML = `
    <div class="summary-header">
      <div>
        <span class="task-meta">Oppsummering</span>
        <h3>${escapeHtml(user.name)}</h3>
      </div>
      <strong>${summary.totalFlights} sorties</strong>
    </div>
    <div class="summary-grid">
      <div><span>Flytid</span><strong>${summary.totalMinutes} min / ${summary.totalHours}</strong></div>
      <div><span>Datoer</span><strong>${escapeHtml(summary.firstDate)} - ${escapeHtml(summary.lastDate)}</strong></div>
      <div><span>Cumulative hours</span><strong>${summary.cumulativeHours} t</strong></div>
      <div><span>Vedlikehold</span><strong>${summary.maintenanceCount}</strong></div>
      <div><span>Issues/incidents</span><strong>${summary.incidentCount}</strong></div>
    </div>
    <div class="summary-lines">
      <p><strong>Filter:</strong> ${escapeHtml(activeFlightLogFilterLabel())}</p>
      <p><strong>Sortering:</strong> ${escapeHtml(flightLogSortLabel())}</p>
      <p><strong>Mission type:</strong> ${formatCountMap(summary.missionTypes)}</p>
      <p><strong>Flight mode:</strong> ${formatCountMap(summary.flightModes)}</p>
      <p><strong>Core events:</strong> ${formatCountMap(summary.coreEvents)}</p>
      <div class="summary-line-block"><strong>Drone / Airframe:</strong>${renderSummaryLines(droneSummaryLines(summary.drones))}</div>
      <div class="summary-line-block"><strong>Battery / pack no.:</strong>${renderSummaryLines(batterySummaryLines(summary.batteries))}</div>
    </div>
  `;
}

function renderCoreEventOptions() {
  const options = document.querySelector("#coreEventOptions");
  const legend = document.querySelector("#coreEventLegend");
  if (!options || !legend) return;

  options.innerHTML = coreEventCodes
    .map(([code, label]) => `
      <label class="core-event-option">
        <input type="checkbox" value="${code}" />
        <span class="core-event-option-text">
          <strong>${code}</strong>
          <small>${label}</small>
        </span>
      </label>
    `)
    .join("");

  const legendMarkup = coreEventCodes
    .map(([code, label]) => `
      <div class="core-event-row">
        <strong>${code}</strong>
        <span>${label}</span>
      </div>
    `)
    .join("");

  legend.innerHTML = legendMarkup;
}

function setFlightLogFormDirty(isDirty) {
  flightLogFormDirty = Boolean(isDirty);
  window.droneflyverHasUnsavedWork = () => flightLogFormDirty;
}

function batteryPackNosFromForm() {
  const hiddenValue = document.querySelector("#batteryPackNo")?.value || "";
  const checkedValues = [...document.querySelectorAll("#batteryPackOptions input:checked")].map((input) => input.value);
  return normalizeBatteryPackNos({ batteryPackNos: [...normalizeBatteryPackNos({ batteryPackNo: hiddenValue }), ...checkedValues] });
}

function sortBatteryPackNos(packs = []) {
  const order = new Map(standardBatteryPacks.map((pack, index) => [pack, index]));
  return [...packs].sort((a, b) => {
    const first = order.has(a) ? order.get(a) : Number.MAX_SAFE_INTEGER;
    const second = order.has(b) ? order.get(b) : Number.MAX_SAFE_INTEGER;
    return first === second ? a.localeCompare(b) : first - second;
  });
}

function renderBatteryPackOptions(packs = batteryPackNosFromForm()) {
  const options = document.querySelector("#batteryPackOptions");
  if (!options) return;

  const selected = new Set(packs);
  options.innerHTML = standardBatteryPacks
    .map((pack) => `
      <label class="battery-pack-option">
        <input type="checkbox" value="${pack}" ${selected.has(pack) ? "checked" : ""} />
        <span>${pack}</span>
      </label>
    `)
    .join("");
}

function setBatteryPackNos(values = []) {
  const packs = sortBatteryPackNos(normalizeBatteryPackNos({ batteryPackNos: values }));
  const hidden = document.querySelector("#batteryPackNo");
  const list = document.querySelector("#batteryPackList");
  if (hidden) hidden.value = packs.join(", ");
  renderBatteryPackOptions(packs);
  if (!list) return;

  list.innerHTML = packs.length
    ? packs.map((pack) => `
        <button class="battery-pack-chip" type="button" data-remove-battery-pack="${escapeHtml(pack)}">
          <span>${escapeHtml(pack)}</span>
          <strong aria-hidden="true">x</strong>
        </button>
      `).join("")
    : `<span class="battery-pack-empty">Ingen batterier lagt til</span>`;
}

function resetFlightLogForm() {
  const form = document.querySelector("#flightLogForm");
  if (!form) return;

  form.reset();
  const date = todayString();
  document.querySelector("#flightLogId").value = "";
  document.querySelector("#flightDate").value = date;
  document.querySelector("#sortieNo").value = generateSortieNumber(date);
  document.querySelector("#operatorPilot").value = state.user.name === "Gjest" ? "" : state.user.name;
  setBatteryPackNos([]);
  setFlightLogFormDirty(false);
}

function flightLogFromForm() {
  const id = document.querySelector("#flightLogId").value || crypto.randomUUID();
  const now = new Date().toISOString();
  const existing = state.flightLogs.find((log) => log.id === id);
  const batteryPackNos = batteryPackNosFromForm();

  return {
    id,
    ownerId: flightLogOwnerId(),
    date: document.querySelector("#flightDate").value,
    sortieNo: document.querySelector("#sortieNo").value.trim(),
    operatorPilot: document.querySelector("#operatorPilot").value.trim(),
    droneAirframe: document.querySelector("#droneAirframe").value.trim(),
    location: document.querySelector("#flightLocation").value.trim(),
    missionType: document.querySelector("#missionType").value,
    takeoffTime: document.querySelector("#takeoffTime").value,
    landingTime: document.querySelector("#landingTime").value,
    flightTimeMinutes: Number(document.querySelector("#flightTimeMinutes").value) || 0,
    cumulativeFlightHours: 0,
    batteryPackNos,
    batteryPackNo: batteryPackNos.join(", "),
    weather: document.querySelector("#weather").value.trim(),
    flightMode: document.querySelector("#flightMode").value,
    coreEvents: [...document.querySelectorAll("#coreEventOptions input:checked")].map((input) => input.value),
    issuesIncidents: document.querySelector("#issuesIncidents").value.trim(),
    maintenanceRequired: document.querySelector("#maintenanceRequired").checked,
    maintenanceNotes: document.querySelector("#maintenanceNotes").value.trim(),
    remarks: document.querySelector("#flightRemarks").value.trim(),
    createdAt: existing?.createdAt || now,
    updatedAt: now
  };
}

function populateFlightLogForm(log) {
  setView("flightLog");
  document.querySelector("#flightLogId").value = log.id;
  document.querySelector("#flightDate").value = log.date;
  document.querySelector("#sortieNo").value = log.sortieNo;
  document.querySelector("#operatorPilot").value = log.operatorPilot;
  document.querySelector("#droneAirframe").value = log.droneAirframe;
  document.querySelector("#flightLocation").value = log.location;
  document.querySelector("#missionType").value = log.missionType;
  document.querySelector("#takeoffTime").value = log.takeoffTime;
  document.querySelector("#landingTime").value = log.landingTime;
  document.querySelector("#flightTimeMinutes").value = log.flightTimeMinutes || "";
  setBatteryPackNos(normalizeBatteryPackNos(log));
  document.querySelector("#weather").value = log.weather;
  document.querySelector("#flightMode").value = log.flightMode;
  document.querySelectorAll("#coreEventOptions input").forEach((input) => {
    input.checked = log.coreEvents.includes(input.value);
  });
  document.querySelector("#issuesIncidents").value = log.issuesIncidents;
  document.querySelector("#maintenanceRequired").checked = log.maintenanceRequired;
  document.querySelector("#maintenanceNotes").value = log.maintenanceNotes;
  document.querySelector("#flightRemarks").value = log.remarks;
  setFlightLogFormDirty(false);
}

function renderFlightLog() {
  renderCoreEventOptions();
  const baseLogs = flightLogsForSelectedUser();
  ensureFlightLogFiltersValid(baseLogs);
  const logs = sortedFlightLogs(filteredFlightLogs(baseLogs));
  const user = selectedFlightLogUser();
  const list = document.querySelector("#flightLogList");
  const count = document.querySelector("#flightLogCount");
  const summaryButton = document.querySelector("#summarizeFlightLogButton");
  if (!list || !count) return;

  renderFlightLogUserSelect();
  renderFlightLogFilters(baseLogs);
  renderFlightLogSortControls();
  renderFlightLogSummary();
  list.classList.toggle("hidden", flightLogSummaryVisible);
  if (summaryButton) {
    summaryButton.textContent = flightLogSummaryVisible ? "Hovedvisning" : "Oppsummer flylogg";
  }
  const filterSuffix = activeFlightLogFilterLabel() === "Ingen filter" ? "" : " (filtrert)";
  count.textContent = `${logs.length} ${logs.length === 1 ? "flyvning" : "flyvninger"} - ${user.name}${filterSuffix}`;

  if (!document.querySelector("#flightDate").value) {
    resetFlightLogForm();
  }

  if (!logs.length) {
    list.innerHTML = `<article class="empty-log-card">Ingen flyvninger loggført for valgt bruker ennå.</article>`;
    return;
  }

  list.innerHTML = logs
    .map((log) => `
      <article class="flight-log-card">
        <div class="flight-log-main">
          <span class="task-meta">${escapeHtml(log.date)} · ${escapeHtml(log.flightMode)}</span>
          <h3>${escapeHtml(log.sortieNo || "Uten sortie no.")}</h3>
          <p>${escapeHtml(log.operatorPilot || "Ukjent pilot")} · ${escapeHtml(log.droneAirframe || "Ukjent drone")}</p>
          <p>${escapeHtml(log.location || "Ukjent sted")} · ${escapeHtml(log.missionType)}</p>
        </div>
        <div class="flight-log-details">
          <span>${escapeHtml(log.takeoffTime || "--:--")} - ${escapeHtml(log.landingTime || "--:--")}</span>
          <strong>${log.flightTimeMinutes || 0} min</strong>
          <span>Batteri: ${escapeHtml(log.batteryPackNo || "-")}</span>
          <span>Vær: ${escapeHtml(log.weather || "-")}</span>
        </div>
        <div class="core-event-tags">
          ${log.coreEvents.length ? log.coreEvents.map((code) => `<span>${escapeHtml(code)}</span>`).join("") : "<span>Ingen core events</span>"}
          ${log.maintenanceRequired ? `<span class="maintenance-flag">MNT</span>` : ""}
        </div>
        ${(log.issuesIncidents || log.maintenanceNotes || log.remarks) ? `
          <div class="flight-log-notes">
            ${log.issuesIncidents ? `<p><strong>Issues:</strong> ${escapeHtml(log.issuesIncidents)}</p>` : ""}
            ${log.maintenanceNotes ? `<p><strong>Maintenance:</strong> ${escapeHtml(log.maintenanceNotes)}</p>` : ""}
            ${log.remarks ? `<p><strong>Remarks:</strong> ${escapeHtml(log.remarks)}</p>` : ""}
          </div>
        ` : ""}
        ${log.ownerId === flightLogOwnerId() ? `<button class="secondary-button" type="button" data-edit-flight-log="${log.id}">Rediger</button>` : ""}
      </article>
    `)
    .join("");
}

function renderFlightLogUserSelect() {
  const select = document.querySelector("#flightLogUserSelect");
  if (!select) return;

  const users = flightLogUsers();
  const selected = selectedFlightLogUser();
  select.innerHTML = users
    .map((user) => `<option value="${escapeHtml(user.id)}">${escapeHtml(user.name)} (${roleLabel(user.role)})</option>`)
    .join("");
  select.value = selected.id;
}

function selectOptions(values, selectedValue, allLabel) {
  return [
    `<option value="all">${allLabel}</option>`,
    ...values.map((value) => `<option value="${escapeHtml(value)}"${value === selectedValue ? " selected" : ""}>${escapeHtml(value)}</option>`)
  ].join("");
}

function renderFlightLogFilters(logs = flightLogsForSelectedUser()) {
  const droneSelect = document.querySelector("#flightLogDroneFilter");
  const modeSelect = document.querySelector("#flightLogModeFilter");
  const missionSelect = document.querySelector("#flightLogMissionFilter");
  if (!droneSelect || !modeSelect || !missionSelect) return;

  droneSelect.innerHTML = selectOptions(uniqueSorted(logs.map((log) => log.droneAirframe)), flightLogDroneFilter, "Alle droner");
  modeSelect.innerHTML = selectOptions(uniqueSorted(logs.map((log) => log.flightMode)), flightLogModeFilter, "Alle flight modes");
  missionSelect.innerHTML = selectOptions(uniqueSorted(logs.map((log) => log.missionType)), flightLogMissionFilter, "Alle mission types");
  droneSelect.value = flightLogDroneFilter;
  modeSelect.value = flightLogModeFilter;
  missionSelect.value = flightLogMissionFilter;
}

function renderFlightLogSortControls() {
  const sortSelect = document.querySelector("#flightLogSortSelect");
  const directionSelect = document.querySelector("#flightLogSortDirection");
  if (sortSelect) sortSelect.value = flightLogSortKey;
  if (directionSelect) directionSelect.value = flightLogSortDirection;
}

function sanitizeFileName(value = "flylogg") {
  return value.toLowerCase().replace(/[^a-z0-9æøå]+/gi, "-").replace(/^-|-$/g, "") || "flylogg";
}

function excelCell(value = "") {
  return escapeHtml(value).replaceAll("\n", "<br>");
}

function xmlEscape(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function columnName(index) {
  let name = "";
  let number = index + 1;
  while (number > 0) {
    const remainder = (number - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    number = Math.floor((number - 1) / 26);
  }
  return name;
}

function worksheetCell(value, rowIndex, columnIndex, style = 0) {
  const reference = `${columnName(columnIndex)}${rowIndex}`;
  const styleAttribute = style ? ` s="${style}"` : "";
  if (typeof value === "number" && Number.isFinite(value)) {
    return `<c r="${reference}"${styleAttribute}><v>${value}</v></c>`;
  }
  return `<c r="${reference}" t="inlineStr"${styleAttribute}><is><t>${xmlEscape(value)}</t></is></c>`;
}

function worksheetRow(values, rowIndex, style = 0) {
  return `<row r="${rowIndex}">${values.map((value, index) => worksheetCell(value, rowIndex, index, style)).join("")}</row>`;
}

function countMapText(counts) {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  return entries.length ? entries.map(([key, count]) => `${key}: ${count}`).join(", ") : "-";
}

function buildWorksheetXml(logs, user) {
  const summary = summarizeFlightLogs(logs);
  const rows = [];
  let rowIndex = 1;
  rows.push(worksheetRow([`Fly log - ${user.name}`], rowIndex++, 1));
  rows.push(worksheetRow([`Eksportert ${new Date().toLocaleString("no-NO")}`], rowIndex++));
  rows.push(worksheetRow(["Ikke legg inn gradert informasjon, henvis til Sortie No og lagre gradert informasjon på egnet enhet."], rowIndex++, 2));
  rowIndex++;

  const headers = [
    "Date", "Sortie No.", "Operator / Pilot", "Drone / Airframe", "Location", "Mission type",
    "Takeoff", "Landing", "Flight time min", "Battery", "Weather", "Mode",
    "Core events", "Issues / incidents", "Maintenance", "Maintenance notes", "Remarks"
  ];
  const headerRowIndex = rowIndex;
  rows.push(worksheetRow(headers, rowIndex++, 1));

  logs.forEach((log) => {
    rows.push(worksheetRow([
      log.date,
      log.sortieNo,
      log.operatorPilot,
      log.droneAirframe,
      log.location,
      log.missionType,
      log.takeoffTime,
      log.landingTime,
      Number(log.flightTimeMinutes) || 0,
      log.batteryPackNo,
      log.weather,
      log.flightMode,
      log.coreEvents.join(", "),
      log.issuesIncidents,
      log.maintenanceRequired ? "Ja" : "Nei",
      log.maintenanceNotes,
      log.remarks
    ], rowIndex++));
  });
  const lastTableRowIndex = Math.max(headerRowIndex, rowIndex - 1);

  if (!logs.length) rows.push(worksheetRow(["Ingen flyvninger loggført."], rowIndex++));

  rowIndex++;
  rows.push(worksheetRow(["Oppsummering"], rowIndex++, 1));
  const summaryRows = [
    ["Antall sorties", summary.totalFlights],
    ["Total flytid", `${summary.totalMinutes} min / ${summary.totalHours}`],
    ["Datoer", `${summary.firstDate} - ${summary.lastDate}`],
    ["Filter", activeFlightLogFilterLabel()],
    ["Sortering", flightLogSortLabel()],
    ["Cumulative flight hours", `${summary.cumulativeHours} t`],
    ["Vedlikehold kreves", summary.maintenanceCount],
    ["Issues / incidents", summary.incidentCount],
    ["Mission type", countMapText(summary.missionTypes)],
    ["Flight mode", countMapText(summary.flightModes)],
    ["Core events", countMapText(summary.coreEvents)]
  ];
  summaryRows.forEach((row) => rows.push(worksheetRow(row, rowIndex++)));

  rows.push(worksheetRow(["Drone / Airframe"], rowIndex++, 2));
  const droneLines = droneSummaryLines(summary.drones, false);
  (droneLines.length ? droneLines : ["-"]).forEach((line) => rows.push(worksheetRow(["", line], rowIndex++)));

  rows.push(worksheetRow(["Battery / pack no."], rowIndex++, 2));
  const batteryLines = batterySummaryLines(summary.batteries, false);
  (batteryLines.length ? batteryLines : ["-"]).forEach((line) => rows.push(worksheetRow(["", line], rowIndex++)));

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetPr><pageSetUpPr fitToPage="1"/></sheetPr>
  <dimension ref="A1:Q${rowIndex - 1}"/>
  <cols>
    <col min="1" max="2" width="16" customWidth="1"/>
    <col min="3" max="6" width="22" customWidth="1"/>
    <col min="7" max="10" width="14" customWidth="1"/>
    <col min="11" max="17" width="20" customWidth="1"/>
  </cols>
  <sheetData>${rows.join("")}</sheetData>
  <autoFilter ref="A${headerRowIndex}:Q${lastTableRowIndex}"/>
  <pageMargins left="0.3" right="0.3" top="0.5" bottom="0.5" header="0.2" footer="0.2"/>
  <pageSetup paperSize="9" orientation="landscape" fitToWidth="1" fitToHeight="0"/>
</worksheet>`;
}

function crc32(bytes) {
  let crc = -1;
  for (const byte of bytes) {
    crc = (crc >>> 8) ^ crc32.table[(crc ^ byte) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

crc32.table = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  return value >>> 0;
});

function littleEndian(value, bytes) {
  return Array.from({ length: bytes }, (_, index) => (value >>> (index * 8)) & 0xff);
}

function concatBytes(parts) {
  const length = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(length);
  let offset = 0;
  parts.forEach((part) => {
    output.set(part, offset);
    offset += part.length;
  });
  return output;
}

function createZip(files) {
  const encoder = new TextEncoder();
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  files.forEach(({ name, content }) => {
    const nameBytes = encoder.encode(name);
    const contentBytes = encoder.encode(content);
    const checksum = crc32(contentBytes);
    const localHeader = new Uint8Array([
      ...littleEndian(0x04034b50, 4), ...littleEndian(20, 2), 0, 0, 0, 0, 0, 0, 0, 0,
      ...littleEndian(checksum, 4), ...littleEndian(contentBytes.length, 4), ...littleEndian(contentBytes.length, 4),
      ...littleEndian(nameBytes.length, 2), 0, 0
    ]);
    localParts.push(localHeader, nameBytes, contentBytes);

    const centralHeader = new Uint8Array([
      ...littleEndian(0x02014b50, 4), ...littleEndian(20, 2), ...littleEndian(20, 2), 0, 0, 0, 0, 0, 0, 0, 0,
      ...littleEndian(checksum, 4), ...littleEndian(contentBytes.length, 4), ...littleEndian(contentBytes.length, 4),
      ...littleEndian(nameBytes.length, 2), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ...littleEndian(offset, 4)
    ]);
    centralParts.push(centralHeader, nameBytes);
    offset += localHeader.length + nameBytes.length + contentBytes.length;
  });

  const centralDirectory = concatBytes(centralParts);
  const endRecord = new Uint8Array([
    ...littleEndian(0x06054b50, 4), 0, 0, 0, 0,
    ...littleEndian(files.length, 2), ...littleEndian(files.length, 2),
    ...littleEndian(centralDirectory.length, 4), ...littleEndian(offset, 4), 0, 0
  ]);

  return concatBytes([...localParts, centralDirectory, endRecord]);
}

function buildFlightLogXlsx(logs, user) {
  return createZip([
    {
      name: "[Content_Types].xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`
    },
    {
      name: "_rels/.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`
    },
    {
      name: "xl/workbook.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="Fly log" sheetId="1" r:id="rId1"/></sheets>
</workbook>`
    },
    {
      name: "xl/_rels/workbook.xml.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`
    },
    {
      name: "xl/styles.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2"><font><sz val="11"/><name val="Arial"/></font><font><b/><sz val="11"/><name val="Arial"/></font></fonts>
  <fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFE5EDF8"/><bgColor indexed="64"/></patternFill></fill></fills>
  <borders count="2"><border/><border><left style="thin"/><right style="thin"/><top style="thin"/><bottom style="thin"/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1"/></cellXfs>
</styleSheet>`
    },
    { name: "xl/worksheets/sheet1.xml", content: buildWorksheetXml(logs, user) }
  ]);
}

function exportSelectedFlightLogToExcel() {
  const logs = sortedFlightLogs(filteredFlightLogs());
  const user = selectedFlightLogUser();
  const bytes = buildFlightLogXlsx(logs, user);
  const blob = new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `flylogg-${sanitizeFileName(user.name)}-${todayString()}.xlsx`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function renderReview() {
  const list = document.querySelector("#reviewList");
  const cards = [];
  const liftoff = state.step1.exam;
  const tinywhoop = state.step2.exam;
  const selectedStudent = activeStudent();
  const reviewStepSelect = document.querySelector("#reviewStepSelect");

  if (reviewStepSelect) {
    reviewStepSelect.value = reviewStep;
  }

  if (reviewStep === "step1") {
    liftoffExamExercises.forEach((exercise, index) => {
      const saved = liftoff.exercises[index];
      const videoUrl = safeUrl(saved.youtube);
      const passLabel = saved.status === "passed" ? "Godkjent" : "Endre til godkjent";
      const failLabel = saved.status === "failed" ? "Ikke godkjent" : "Endre til ikke godkjent";

      cards.push(`
        <article class="review-card">
          <div>
            <span>Steg 1 - Simulator</span>
            <h3>${exercise.title}</h3>
            <p>Elev: ${escapeHtml(selectedStudent.name)}</p>
            <p>${exercise.requirement}</p>
            <p>Bruk drone: Racewhoop 2.5" · Bruk kamera vinkel 10 grader</p>
            <p>Status: ${exerciseStatusText(saved.status)}</p>
            ${saved.note ? `<p><strong>Lagret merknad:</strong> ${escapeHtml(saved.note)}</p>` : ""}
            ${videoUrl ? `<p><a class="link-button inline-link" href="${videoUrl}" target="_blank" rel="noreferrer">Se elevens video</a></p>` : ""}
          </div>
          <div class="review-actions">
            <label class="review-note-label" for="reviewNote${index}">Merknad til eleven</label>
            <textarea id="reviewNote${index}" class="review-note" data-review-note="${index}" rows="4" placeholder="Skriv begrunnelse eller hva eleven bør forbedre">${escapeHtml(saved.note)}</textarea>
            <button class="primary-button" type="button" data-pass-exercise="${index}" ${saved.status === "not_submitted" ? "disabled" : ""}>${passLabel}</button>
            <button class="danger-button" type="button" data-fail-exercise="${index}" ${saved.status === "not_submitted" ? "disabled" : ""}>${failLabel}</button>
            <button class="secondary-button" type="button" data-clear-exercise="${index}" ${saved.status === "not_submitted" ? "disabled" : ""}>Fjern vurdering</button>
          </div>
        </article>
      `);
    });
  }

  const tinywhoopPassLabel = tinywhoop.status === "passed" ? "Bestått" : "Endre til bestått";
  const tinywhoopFailLabel = tinywhoop.status === "failed" ? "Ikke bestått" : "Endre til ikke bestått";
  const tinywhoopVideoUrl = safeUrl(tinywhoop.youtube);

  if (reviewStep === "step2") {
    cards.push(`
      <article class="review-card">
        <div>
          <span>Steg 2 - Tinywhoop</span>
          <h3>${escapeHtml(selectedStudent.name)}</h3>
          <p>Status: ${examText(tinywhoop, "step2")}</p>
          <p>Registreres etter praktisk vurdering med instruktør.</p>
          <p>Eksamensflyvning krever normalt fysisk at instruktør ser på. Etter avtale med instruktør kan eksamensflyvning gjøres gjennom video der eleven viser de ferdigheter og kontroll som kreves.</p>
          ${tinywhoopVideoUrl ? `<p><a class="link-button inline-link" href="${tinywhoopVideoUrl}" target="_blank" rel="noreferrer">Se elevens tinywhoop-video</a></p>` : ""}
          ${tinywhoop.note ? `<p><strong>Lagret merknad:</strong> ${escapeHtml(tinywhoop.note)}</p>` : ""}
        </div>
        <div class="review-actions">
          <p class="review-change-help">Kan endres etter registrering hvis instruktør trykker feil.</p>
          <label class="review-note-label" for="tinywhoopReviewNote">Merknad til eleven</label>
          <textarea id="tinywhoopReviewNote" class="review-note" data-step2-review-note rows="4" placeholder="Skriv begrunnelse eller hva eleven bør forbedre">${escapeHtml(tinywhoop.note)}</textarea>
          <button class="primary-button" type="button" data-pass="step2" ${state.step1.exam.status !== "passed" ? "disabled" : ""}>${tinywhoopPassLabel}</button>
          <button class="danger-button" type="button" data-fail="step2" ${state.step1.exam.status !== "passed" ? "disabled" : ""}>${tinywhoopFailLabel}</button>
          <button class="secondary-button" type="button" data-clear="step2" ${state.step1.exam.status !== "passed" ? "disabled" : ""}>Fjern vurdering</button>
        </div>
      </article>
    `);
  }

  list.innerHTML = cards.join("");
}

function renderStudentTabs() {
  const list = document.querySelector("#studentTabList");
  const selectedId = activeStudentId();
  const selectedStudent = activeStudent();
  const deleteButton = document.querySelector("#deleteStudentButton");
  const deleteMessage = document.querySelector("#deleteStudentMessage");
  const visibleStudents = state.students.some((student) => student.id !== "gjest")
    ? state.students.filter((student) => student.id !== "gjest")
    : state.students;

  list.innerHTML = visibleStudents
    .map((student) => {
      const progress = Math.round((studentProgressPercent(student, "step1") + studentProgressPercent(student, "step2")) / 2);
      return `
        <button class="student-tab ${student.id === selectedId ? "active" : ""}" type="button" data-select-student="${escapeHtml(student.id)}">
          <strong>${escapeHtml(student.name)}</strong>
          <span>${progress}%</span>
        </button>
      `;
    })
    .join("");

  if (deleteButton) {
    deleteButton.disabled = !selectedStudent || selectedStudent.id === "gjest";
  }

  if (deleteMessage && selectedStudent?.id === "gjest") {
    deleteMessage.textContent = "Standardbrukeren Gjest kan ikke deaktiveres.";
  } else if (deleteMessage && !deleteMessage.dataset.locked) {
    deleteMessage.textContent = "";
  }

  renderAdminInstructorPanel();
  renderAdminUserPanel();
}

function renderAdminInstructorPanel() {
  const panel = document.querySelector("#adminInstructorPanel");
  const list = document.querySelector("#adminInstructorList");
  if (!panel || !list) return;

  const canAdmin = isAdminRole(state.user.role);
  panel.classList.toggle("hidden", !canAdmin);
  if (!canAdmin) return;

  const instructors = [
    ...state.instructors,
    ...(state.user.id && isInstructorRole(state.user.role) ? [state.user] : [])
  ]
    .filter((instructor) => instructor?.id)
    .filter((instructor, index, items) => items.findIndex((item) => item.id === instructor.id) === index)
    .sort((a, b) => a.name.localeCompare(b.name, "no"));

  list.innerHTML = instructors.length
    ? instructors
        .map((instructor) => `
          <div class="admin-instructor-item">
            <strong>${escapeHtml(instructor.name)}</strong>
            <span>${instructor.role === "admin" ? "Admin / instruktør" : "Instruktør"}</span>
          </div>
        `)
        .join("")
    : `<p class="delete-student-message">Ingen instruktører funnet.</p>`;
}

function adminEditableUsers() {
  return flightLogUsers()
    .filter((user) => user.id !== "gjest")
    .sort((a, b) => a.name.localeCompare(b.name, "no"));
}

function renderAdminUserPanel() {
  const panel = document.querySelector("#adminUserPanel");
  const select = document.querySelector("#adminUserSelect");
  const input = document.querySelector("#adminUserNameInput");
  const message = document.querySelector("#adminRenameMessage");
  if (!panel || !select || !input) return;

  const canAdmin = isAdminRole(state.user.role);
  panel.classList.toggle("hidden", !canAdmin);
  if (!canAdmin) return;

  const users = adminEditableUsers();
  const button = document.querySelector("#adminRenameUserButton");
  if (!users.length) {
    select.innerHTML = "";
    input.value = "";
    input.disabled = true;
    if (button) button.disabled = true;
    if (message && !message.dataset.locked) message.textContent = "Ingen brukere å endre.";
    return;
  }

  if (!users.some((user) => user.id === adminRenameSelectedUserId)) {
    adminRenameSelectedUserId = users[0].id;
  }

  select.innerHTML = users
    .map((user) => `<option value="${escapeHtml(user.id)}">${escapeHtml(user.name)} (${roleLabel(user.role)})</option>`)
    .join("");
  select.value = adminRenameSelectedUserId;

  const selected = users.find((user) => user.id === adminRenameSelectedUserId) || users[0];
  input.disabled = false;
  if (button) button.disabled = false;
  if (!input.dataset.dirty) input.value = selected.name;
  if (message && !message.dataset.locked) message.textContent = "";
}

function applyRenamedUser(userId, newName) {
  if (state.user.id === userId) state.user.name = newName;

  const student = state.students.find((item) => item.id === userId);
  if (student) student.name = newName;

  const instructor = state.instructors.find((item) => item.id === userId);
  if (instructor) instructor.name = newName;
}

function renderLogin() {
  // Supabase renders and owns the login panel in supabase-sync.js.
}

function studentProgressPercent(student, stepKey) {
  const tasks = student[stepKey].tasks;
  const requiredIndexes = requiredLessonIndexes(stepKey);
  const taskDone = requiredIndexes.filter((index) => tasks[index]).length;
  const examDone = student[stepKey].exam.status === "passed" ? 1 : 0;
  return percent(taskDone + examDone, requiredIndexes.length + 1);
}

function renderRole() {
  const instructorAccess = isInstructorRole(activeRole);
  const adminAccess = isAdminRole(activeRole);
  document.querySelectorAll(".instructor-only").forEach((item) => item.classList.toggle("hidden", !instructorAccess));
  document.querySelectorAll(".admin-only").forEach((item) => item.classList.toggle("hidden", !adminAccess));
  document.querySelectorAll(".student-only").forEach((item) => item.classList.toggle("hidden", instructorAccess));
  document.querySelector("#currentRole").textContent = activeRole === "admin" ? "Admin / Instruktør" : activeRole === "instructor" ? "Instruktør" : "Elev";
}

function render() {
  document.querySelector("#currentUser").textContent = state.user.name;
  activeRole = state.user.role;

  renderLogin();
  renderTaskList("step1", "#step1Tasks");
  renderTaskList("step2", "#step2Tasks");
  renderDashboard();
  renderExams();
  renderReview();
  renderStudentTabs();
  renderFlightLog();
  renderRole();
}

window.droneflyverApplyAuthState = (authState = window.DRONEFLYVER_AUTH_STATE) => {
  if (!authState?.user) return;

  state.user = {
    id: authState.user.id,
    name: authState.user.name,
    role: authState.user.role
  };

  if (authState.sharedData) {
    applySharedState(authState.sharedData);
  }

  if (state.user.role === "student") {
    state.currentStudentId = state.user.id;
    state.selectedStudentId = state.user.id;
  } else {
    const firstRealStudentId = state.students.find((student) => student.id !== "gjest")?.id || state.students[0]?.id || "gjest";
    if (!state.students.some((student) => student.id === state.selectedStudentId) || (state.selectedStudentId === "gjest" && firstRealStudentId !== "gjest")) {
      state.selectedStudentId = firstRealStudentId;
    }
  }

  loadActiveStudentProgress();
  saveState();
  render();
  if (isInstructorRole(state.user.role)) setView("review");
};

document.querySelectorAll(".nav-button").forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view));
});

document.querySelector("#reviewStepSelect").addEventListener("change", (event) => {
  reviewStep = event.target.value;
  renderReview();
});

document.querySelector("#deleteStudentButton")?.addEventListener("click", async () => {
  const selectedStudent = activeStudent();
  const message = document.querySelector("#deleteStudentMessage");

  message.dataset.locked = "true";

  if (!selectedStudent || selectedStudent.id === "gjest") {
    message.textContent = "Standardbrukeren Gjest kan ikke deaktiveres.";
    return;
  }

  const confirmed = window.confirm(`Deaktiver ${selectedStudent.name}? Eleven skjules fra instruktørlisten, men Supabase-kontoen slettes ikke.`);
  if (!confirmed) return;

  try {
    message.textContent = `Deaktiverer ${selectedStudent.name}...`;
    if (!window.droneflyverDeactivateStudent) {
      throw new Error("Supabase-deaktivering er ikke klar. Oppdater siden og prøv igjen.");
    }
    await window.droneflyverDeactivateStudent(selectedStudent.id, "Deaktivert fra appen av instruktør/admin");
  } catch (error) {
    message.textContent = error.message || "Kunne ikke deaktivere elev.";
    return;
  }

  state.deletedStudentIds = [...new Set([...(state.deletedStudentIds || []), selectedStudent.id])];
  state.students = state.students.filter((student) => student.id !== selectedStudent.id);
  const nextStudent = state.students.find((student) => student.id !== "gjest") || state.students[0];
  state.selectedStudentId = nextStudent?.id || "gjest";
  if (state.currentStudentId === selectedStudent.id) {
    state.currentStudentId = state.selectedStudentId;
  }
  loadActiveStudentProgress();
  message.textContent = `${selectedStudent.name} er deaktivert og skjult fra elevlisten.`;
  saveState();
  render();
});

document.querySelector("#adminUserSelect")?.addEventListener("change", (event) => {
  adminRenameSelectedUserId = event.target.value;
  const input = document.querySelector("#adminUserNameInput");
  const selected = adminEditableUsers().find((user) => user.id === adminRenameSelectedUserId);
  if (input && selected) {
    input.dataset.dirty = "";
    input.value = selected.name;
  }
  const message = document.querySelector("#adminRenameMessage");
  if (message) {
    message.dataset.locked = "";
    message.textContent = "";
  }
});

document.querySelector("#adminUserNameInput")?.addEventListener("input", (event) => {
  event.target.dataset.dirty = "true";
});

document.querySelector("#adminRenameUserButton")?.addEventListener("click", async () => {
  const input = document.querySelector("#adminUserNameInput");
  const message = document.querySelector("#adminRenameMessage");
  const newName = input?.value.trim() || "";

  if (message) {
    message.dataset.locked = "true";
    message.textContent = "Lagrer nytt navn...";
  }

  try {
    if (!window.droneflyverAdminRenameUser) {
      throw new Error("Admin-funksjon er ikke tilgjengelig.");
    }
    await window.droneflyverAdminRenameUser(adminRenameSelectedUserId, newName);
    applyRenamedUser(adminRenameSelectedUserId, newName);
    if (input) input.dataset.dirty = "";
    saveState();
    render();
    if (message) {
      message.dataset.locked = "true";
      message.textContent = `Brukernavn endret til ${newName}.`;
    }
  } catch (error) {
    if (message) {
      message.dataset.locked = "true";
      message.textContent = error.message || "Kunne ikke endre brukernavn.";
    }
  }
});

document.querySelector("#continueButton").addEventListener("click", () => {
  if (state.step1.exam.status !== "passed") setView("step1");
  else setView("step2");
});

document.querySelector("#flightLogForm")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const log = flightLogFromForm();
  if (!log.sortieNo) {
    log.sortieNo = generateSortieNumber(log.date || todayString());
  }

  const index = state.flightLogs.findIndex((item) => item.id === log.id);
  if (index >= 0) state.flightLogs[index] = log;
  else state.flightLogs.push(log);
  state.flightLogs = normalizeFlightLogs(state.flightLogs);
  setFlightLogFormDirty(false);
  saveState();
  render();
  resetFlightLogForm();
});

document.querySelector("#clearFlightLogForm")?.addEventListener("click", resetFlightLogForm);

document.querySelector("#batteryPackOptions")?.addEventListener("change", (event) => {
  if (!(event.target instanceof HTMLInputElement) || event.target.type !== "checkbox") return;
  setBatteryPackNos([...document.querySelectorAll("#batteryPackOptions input:checked")].map((input) => input.value));
  setFlightLogFormDirty(true);
});

document.querySelector("#flightLogForm")?.addEventListener("input", () => {
  setFlightLogFormDirty(true);
});

document.querySelector("#flightLogUserSelect")?.addEventListener("change", (event) => {
  selectedFlightLogUserId = event.target.value;
  flightLogSummaryVisible = false;
  flightLogDroneFilter = "all";
  flightLogModeFilter = "all";
  flightLogMissionFilter = "all";
  renderFlightLog();
});

document.querySelector("#flightLogDroneFilter")?.addEventListener("change", (event) => {
  flightLogDroneFilter = event.target.value;
  renderFlightLog();
});

document.querySelector("#flightLogModeFilter")?.addEventListener("change", (event) => {
  flightLogModeFilter = event.target.value;
  renderFlightLog();
});

document.querySelector("#flightLogMissionFilter")?.addEventListener("change", (event) => {
  flightLogMissionFilter = event.target.value;
  renderFlightLog();
});

document.querySelector("#flightLogSortSelect")?.addEventListener("change", (event) => {
  flightLogSortKey = event.target.value;
  renderFlightLog();
});

document.querySelector("#flightLogSortDirection")?.addEventListener("change", (event) => {
  flightLogSortDirection = event.target.value;
  renderFlightLog();
});

document.querySelector("#summarizeFlightLogButton")?.addEventListener("click", () => {
  flightLogSummaryVisible = !flightLogSummaryVisible;
  renderFlightLog();
});

document.querySelector("#exportFlightLogExcelButton")?.addEventListener("click", exportSelectedFlightLogToExcel);

document.querySelector("#flightDate")?.addEventListener("change", (event) => {
  const sortie = document.querySelector("#sortieNo");
  if (sortie && !document.querySelector("#flightLogId").value) {
    sortie.value = generateSortieNumber(event.target.value || todayString());
  }
  setFlightLogFormDirty(true);
});

["#takeoffTime", "#landingTime"].forEach((selector) => {
  document.querySelector(selector)?.addEventListener("change", () => {
    const minutes = minutesBetween(
      document.querySelector("#takeoffTime").value,
      document.querySelector("#landingTime").value
    );
    if (minutes > 0) {
      document.querySelector("#flightTimeMinutes").value = minutes;
      setFlightLogFormDirty(true);
    }
  });
});

setupFlightLogMobileShell();

document.body.addEventListener("click", (event) => {
  const check = event.target.closest(".check-button");
  const videoButton = event.target.closest("[data-video]");
  const removeBatteryPack = event.target.closest("[data-remove-battery-pack]");
  const passButton = event.target.closest("[data-pass]");
  const failButton = event.target.closest("[data-fail]");
  const submitExercise = event.target.closest("[data-submit-exercise]");
  const submitTinywhoopVideo = event.target.closest("[data-submit-tinywhoop-video]");
  const passExercise = event.target.closest("[data-pass-exercise]");
  const failExercise = event.target.closest("[data-fail-exercise]");
  const clearExercise = event.target.closest("[data-clear-exercise]");
  const clearButton = event.target.closest("[data-clear]");
  const selectStudent = event.target.closest("[data-select-student]");
  const editFlightLog = event.target.closest("[data-edit-flight-log]");

  if (removeBatteryPack) {
    const nextPacks = batteryPackNosFromForm().filter((pack) => pack !== removeBatteryPack.dataset.removeBatteryPack);
    setBatteryPackNos(nextPacks);
    setFlightLogFormDirty(true);
    return;
  }

  if (editFlightLog) {
    const log = state.flightLogs.find((item) => item.id === editFlightLog.dataset.editFlightLog);
    if (log) populateFlightLogForm(log);
    return;
  }

  if (selectStudent) {
    saveState();
    state.selectedStudentId = selectStudent.dataset.selectStudent;
    loadActiveStudentProgress();
    resetFlightLogForm();
    saveState();
    render();
    setView("review");
    return;
  }

  if (check) {
    const step = check.dataset.step;
    const index = Number(check.dataset.index);
    state[step].tasks[index] = !state[step].tasks[index];
    if (step === "step2" && state.step2.tasks.every(Boolean) && state.step2.exam.status === "not_started") {
      state.step2.exam.status = "submitted";
    }
    saveState();
    render();
  }

  if (videoButton) {
    window.open(videoButton.dataset.video, "_blank", "noreferrer");
  }

  if (passButton) {
    const step = passButton.dataset.pass;
    state[step].exam.status = "passed";
    if (step === "step2") {
      state.step2.exam.note = document.querySelector("[data-step2-review-note]")?.value.trim() || "";
    }
    saveState();
    render();
  }

  if (failButton) {
    const step = failButton.dataset.fail;
    state[step].exam.status = "failed";
    if (step === "step2") {
      state.step2.exam.note = document.querySelector("[data-step2-review-note]")?.value.trim() || "";
    }
    saveState();
    render();
  }

  if (clearButton) {
    const step = clearButton.dataset.clear;
    state[step].exam.status = step === "step2" ? "submitted" : "not_submitted";
    if (step === "step2") {
      state.step2.exam.note = document.querySelector("[data-step2-review-note]")?.value.trim() || "";
    }
    saveState();
    render();
  }

  if (submitTinywhoopVideo) {
    const youtube = document.querySelector("#tinywhoopVideoLink").value.trim();
    const videoUrl = safeUrl(youtube);

    if (!videoUrl) {
      document.querySelector("#tinywhoopExamState").textContent = "Lim inn en gyldig delbar videolink først, for eksempel fra YouTube eller Google Drive.";
      return;
    }

    state.step2.exam = {
      ...state.step2.exam,
      status: "submitted",
      fileName: "Videolink",
      youtube: videoUrl
    };
    saveState();
    render();
  }

  if (submitExercise) {
    const index = Number(submitExercise.dataset.submitExercise);
    const youtube = document.querySelector(`[data-exam-link="${index}"]`).value.trim();
    const videoUrl = safeUrl(youtube);

    if (!videoUrl) {
      document.querySelector("#liftoffExamState").textContent = "Lim inn en gyldig delbar videolink først, for eksempel fra YouTube eller Google Drive.";
      return;
    }

    state.step1.exam.exercises[index] = {
      status: "submitted",
      fileName: "Videolink",
      youtube: videoUrl,
      note: ""
    };
    updateLiftoffExamStatus();
    saveState();
    render();
  }

  if (passExercise) {
    const index = Number(passExercise.dataset.passExercise);
    state.step1.exam.exercises[index].status = "passed";
    state.step1.exam.exercises[index].note = document.querySelector(`[data-review-note="${index}"]`)?.value.trim() || "";
    updateLiftoffExamStatus();
    saveState();
    render();
  }

  if (failExercise) {
    const index = Number(failExercise.dataset.failExercise);
    state.step1.exam.exercises[index].status = "failed";
    state.step1.exam.exercises[index].note = document.querySelector(`[data-review-note="${index}"]`)?.value.trim() || "";
    updateLiftoffExamStatus();
    saveState();
    render();
  }

  if (clearExercise) {
    const index = Number(clearExercise.dataset.clearExercise);
    state.step1.exam.exercises[index].status = "submitted";
    state.step1.exam.exercises[index].note = document.querySelector(`[data-review-note="${index}"]`)?.value.trim() || "";
    updateLiftoffExamStatus();
    saveState();
    render();
  }
});

document.querySelector("#resetDemo").addEventListener("click", () => {
  state = structuredClone(defaultState);
  loadActiveStudentProgress();
  saveState();
  setView("dashboard");
  render();
});

render();
if (deviceMode === "mobile") setView("flightLog");
