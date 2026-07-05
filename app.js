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

const instructorAccessCode = "rustaborgenfpv";
const deleteStudentPassword = "rustaborgenfpv";

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
  ...blankProgress()
};

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

const views = {
  dashboard: document.querySelector("#dashboardView"),
  step1: document.querySelector("#step1View"),
  step2: document.querySelector("#step2View"),
  certification: document.querySelector("#certificationView"),
  review: document.querySelector("#reviewView")
};

function loadState() {
  const raw = localStorage.getItem("droneflyt-state");
  if (!raw) return structuredClone(defaultState);

  try {
    return normalizeState({ ...structuredClone(defaultState), ...JSON.parse(raw) });
  } catch {
    return structuredClone(defaultState);
  }
}

function normalizeState(savedState) {
  savedState.step1.tasks = normalizeTasks(savedState.step1.tasks, lessons.step1.length);
  savedState.step2.tasks = normalizeTasks(savedState.step2.tasks, lessons.step2.length);
  savedState.step1.exam = normalizeLiftoffExam(savedState.step1.exam);
  updateLiftoffExamStatus(savedState.step1.exam);
  savedState.students = normalizeStudents(savedState);
  savedState.instructors = normalizeInstructors(savedState.instructors);
  savedState.currentStudentId = savedState.currentStudentId || studentIdFromName(savedState.user.name);
  savedState.selectedStudentId = savedState.selectedStudentId || savedState.currentStudentId;
  loadActiveStudentProgress(savedState);
  return savedState;
}

function normalizeTasks(tasks, length) {
  return Array.from({ length }, (_, index) => Boolean(tasks[index]));
}

function normalizeStudents(savedState) {
  const source = Array.isArray(savedState.students) && savedState.students.length
    ? savedState.students
    : [{
        id: studentIdFromName(savedState.user.name),
        name: savedState.user.name || "Gjest",
        step1: savedState.step1,
        step2: savedState.step2
      }];

  return source.map((student) => normalizeStudent(student));
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
        name: instructor.name || "Instruktør"
      }))
    : [];
}

function studentIdFromName(name = "Gjest") {
  const normalized = name.trim().toLowerCase().replace(/[^a-z0-9æøå]+/gi, "-").replace(/^-|-$/g, "");
  return normalized || "gjest";
}

function activeStudentId(appState = state) {
  return appState.user.role === "instructor" ? appState.selectedStudentId : appState.currentStudentId;
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

function ensureStudent(name) {
  const id = studentIdFromName(name);
  const existing = state.students.find((student) => student.id === id);
  if (existing) {
    existing.name = name;
    return existing;
  }

  const student = { id, name, ...blankProgress() };
  state.students.push(student);
  return student;
}

function ensureInstructor(name) {
  const id = studentIdFromName(name);
  const existing = state.instructors.find((instructor) => instructor.id === id);
  if (existing) {
    existing.name = name;
    return existing;
  }

  const instructor = { id, name };
  state.instructors.push(instructor);
  return instructor;
}

function existingUsers() {
  return [
    ...state.students.map((student) => ({ id: student.id, name: student.name, role: "student" })),
    ...state.instructors.map((instructor) => ({ id: instructor.id, name: instructor.name, role: "instructor" }))
  ];
}

function findExistingUser(value) {
  const [role, id] = value.split(":");
  return existingUsers().find((user) => user.role === role && user.id === id);
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
    certification: "Hvordan ta sertifisering?",
    review: "Vurdering"
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
            <p>Elev: ${selectedStudent.name}</p>
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
          <h3>${selectedStudent.name}</h3>
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

  list.innerHTML = state.students
    .map((student) => {
      const progress = Math.round((studentProgressPercent(student, "step1") + studentProgressPercent(student, "step2")) / 2);
      return `
        <button class="student-tab ${student.id === selectedId ? "active" : ""}" type="button" data-select-student="${student.id}">
          <strong>${student.name}</strong>
          <span>${progress}%</span>
        </button>
      `;
    })
    .join("");

  if (deleteButton) {
    deleteButton.disabled = !selectedStudent || selectedStudent.id === "gjest";
  }

  if (deleteMessage && selectedStudent?.id === "gjest") {
    deleteMessage.textContent = "Standardbrukeren Gjest kan ikke slettes.";
  } else if (deleteMessage && !deleteMessage.dataset.locked) {
    deleteMessage.textContent = "";
  }
}

function renderLogin() {
  const select = document.querySelector("#loginUserSelect");
  const users = existingUsers();
  const currentValue = `${state.user.role}:${state.user.role === "instructor" ? state.user.id || studentIdFromName(state.user.name) : state.currentStudentId}`;

  select.innerHTML = users
    .map((user) => `<option value="${user.role}:${user.id}">${user.name} - ${user.role === "instructor" ? "Instruktør" : "Elev"}</option>`)
    .join("");

  if (users.some((user) => `${user.role}:${user.id}` === currentValue)) {
    select.value = currentValue;
  } else {
    select.value = "student:gjest";
  }

  updateInstructorCodeVisibility();
}

function updateInstructorCodeVisibility() {
  const selectedUser = findExistingUser(document.querySelector("#loginUserSelect").value);
  const createRole = activeRole;
  document.querySelector("#loginInstructorCodeGroup").classList.toggle("hidden", selectedUser?.role !== "instructor");
  document.querySelector("#createInstructorCodeGroup").classList.toggle("hidden", createRole !== "instructor");
}

function studentProgressPercent(student, stepKey) {
  const tasks = student[stepKey].tasks;
  const requiredIndexes = requiredLessonIndexes(stepKey);
  const taskDone = requiredIndexes.filter((index) => tasks[index]).length;
  const examDone = student[stepKey].exam.status === "passed" ? 1 : 0;
  return percent(taskDone + examDone, requiredIndexes.length + 1);
}

function renderRole() {
  const isInstructor = activeRole === "instructor";
  document.querySelectorAll(".instructor-only").forEach((item) => item.classList.toggle("hidden", !isInstructor));
  document.querySelectorAll(".student-only").forEach((item) => item.classList.toggle("hidden", isInstructor));
  document.querySelector("#currentRole").textContent = isInstructor ? "Instruktør" : "Elev";
}

function render() {
  document.querySelector("#currentUser").textContent = state.user.name;
  activeRole = state.user.role;
  document.querySelectorAll(".role-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.role === activeRole);
  });

  renderLogin();
  renderTaskList("step1", "#step1Tasks");
  renderTaskList("step2", "#step2Tasks");
  renderDashboard();
  renderExams();
  renderReview();
  renderStudentTabs();
  renderRole();
}

document.querySelectorAll(".role-button").forEach((button) => {
  button.addEventListener("click", () => {
    activeRole = button.dataset.role;
    document.querySelectorAll(".role-button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    updateInstructorCodeVisibility();
  });
});

document.querySelector("#loginButton").addEventListener("click", () => {
  const selectedUser = findExistingUser(document.querySelector("#loginUserSelect").value);
  const message = document.querySelector("#loginMessage");
  if (!selectedUser) {
    message.textContent = "Velg en bruker først.";
    return;
  }

  if (selectedUser.role === "instructor" && document.querySelector("#loginInstructorCode").value.trim() !== instructorAccessCode) {
    message.textContent = "Feil instruktørkode.";
    return;
  }

  state.user = { id: selectedUser.id, name: selectedUser.name, role: selectedUser.role };
  if (selectedUser.role === "student") {
    state.currentStudentId = selectedUser.id;
    state.selectedStudentId = selectedUser.id;
  } else if (!state.students.some((student) => student.id === state.selectedStudentId)) {
    state.selectedStudentId = state.students[0].id;
  }
  document.querySelector("#loginInstructorCode").value = "";
  message.textContent = "";
  loadActiveStudentProgress();
  saveState();
  render();
  if (selectedUser.role === "instructor") setView("review");
});

document.querySelector("#loginUserSelect").addEventListener("change", () => {
  document.querySelector("#loginMessage").textContent = "";
  updateInstructorCodeVisibility();
});

document.querySelector("#showCreateUserButton").addEventListener("click", () => {
  document.querySelector("#createUserPanel").classList.remove("hidden");
  document.querySelector("#loginMessage").textContent = "";
  updateInstructorCodeVisibility();
});

document.querySelector("#cancelCreateUserButton").addEventListener("click", () => {
  document.querySelector("#createUserPanel").classList.add("hidden");
  document.querySelector("#nameInput").value = "";
  document.querySelector("#createInstructorCode").value = "";
  document.querySelector("#loginMessage").textContent = "";
});

document.querySelector("#createUserButton").addEventListener("click", () => {
  const name = document.querySelector("#nameInput").value.trim();
  const message = document.querySelector("#loginMessage");

  if (!name) {
    message.textContent = "Skriv navn på ny bruker først.";
    return;
  }

  if (activeRole === "instructor" && document.querySelector("#createInstructorCode").value.trim() !== instructorAccessCode) {
    message.textContent = "Feil instruktørkode. Instruktørbruker ble ikke opprettet.";
    return;
  }

  if (activeRole === "student") {
    const student = ensureStudent(name);
    state.user = { id: student.id, name: student.name, role: "student" };
    state.currentStudentId = student.id;
    state.selectedStudentId = student.id;
  } else {
    const instructor = ensureInstructor(name);
    state.user = { id: instructor.id, name: instructor.name, role: "instructor" };
    if (!state.students.some((student) => student.id === state.selectedStudentId)) {
      state.selectedStudentId = state.students[0].id;
    }
  }

  document.querySelector("#createUserPanel").classList.add("hidden");
  document.querySelector("#nameInput").value = "";
  document.querySelector("#createInstructorCode").value = "";
  message.textContent = "";
  loadActiveStudentProgress();
  saveState();
  render();
  if (state.user.role === "instructor") setView("review");
});

document.querySelectorAll(".nav-button").forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view));
});

document.querySelector("#reviewStepSelect").addEventListener("change", (event) => {
  reviewStep = event.target.value;
  renderReview();
});

document.querySelector("#deleteStudentButton").addEventListener("click", () => {
  const selectedStudent = activeStudent();
  const passwordInput = document.querySelector("#deleteStudentPassword");
  const message = document.querySelector("#deleteStudentMessage");
  const password = passwordInput.value.trim();

  message.dataset.locked = "true";

  if (!selectedStudent || selectedStudent.id === "gjest") {
    message.textContent = "Standardbrukeren Gjest kan ikke slettes.";
    return;
  }

  if (password !== deleteStudentPassword) {
    message.textContent = "Feil passord. Brukeren ble ikke slettet.";
    return;
  }

  state.students = state.students.filter((student) => student.id !== selectedStudent.id);
  const nextStudent = state.students.find((student) => student.id !== "gjest") || state.students[0];
  state.selectedStudentId = nextStudent?.id || "gjest";
  if (state.currentStudentId === selectedStudent.id) {
    state.currentStudentId = state.selectedStudentId;
  }
  loadActiveStudentProgress();
  passwordInput.value = "";
  message.textContent = `Brukeren ${selectedStudent.name} er slettet.`;
  saveState();
  render();
});

document.querySelector("#continueButton").addEventListener("click", () => {
  if (state.step1.exam.status !== "passed") setView("step1");
  else setView("step2");
});

document.body.addEventListener("click", (event) => {
  const check = event.target.closest(".check-button");
  const videoButton = event.target.closest("[data-video]");
  const passButton = event.target.closest("[data-pass]");
  const failButton = event.target.closest("[data-fail]");
  const submitExercise = event.target.closest("[data-submit-exercise]");
  const submitTinywhoopVideo = event.target.closest("[data-submit-tinywhoop-video]");
  const passExercise = event.target.closest("[data-pass-exercise]");
  const failExercise = event.target.closest("[data-fail-exercise]");
  const clearExercise = event.target.closest("[data-clear-exercise]");
  const clearButton = event.target.closest("[data-clear]");
  const selectStudent = event.target.closest("[data-select-student]");

  if (selectStudent) {
    saveState();
    state.selectedStudentId = selectStudent.dataset.selectStudent;
    loadActiveStudentProgress();
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

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

render();
