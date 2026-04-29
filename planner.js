const jobs = {
  1001: [
    {
      key: "1001-0",
      pallets: 2,
      collect: {
        location: "Manchester",
        date: "2026-04-27",
        time: "09:00",
        isDepot: false,
      },
      deliver: {
        location: "Depot",
        date: "2026-04-27",
        time: "17:00",
        isDepot: true,
      },
    },
    {
      key: "1001-1",
      pallets: 2,
      collect: {
        location: "Depot",
        date: "2026-04-28",
        time: "07:00",
        isDepot: true,
      },
      deliver: {
        location: "Oxford",
        date: "2026-04-28",
        time: "11:00",
        isDepot: false,
      },
    },
  ],

  1002: [
    {
      key: "1002-0",
      pallets: 4,
      collect: {
        location: "Bristol",
        date: "2026-04-27",
        time: "10:00",
        isDepot: false,
      },
      deliver: {
        location: "Swindon",
        date: "2026-04-27",
        time: "13:00",
        isDepot: false,
      },
    },
  ],
};

function formatDateTime(date, time) {
  const parts = [];

  if (date) parts.push(date);
  if (time) parts.push(time);

  return parts.join(" ");
}

function renderJobPot() {
  const jobList = document.querySelector(".job-list");
  jobList.innerHTML = `
  <div class="job-header">
    <div></div>
    <div>Order</div>
    <div>Mode</div>

    <div class="collect-head">C/D</div>
    <div class="collect-head">Date</div>
    <div class="collect-head">Time</div>
    <div class="collect-head">Depot</div>
    <div class="collect-head">Detail</div>

    <div class="deliver-head">C/D</div>
    <div class="deliver-head">Date</div>
    <div class="deliver-head">Time</div>
    <div class="deliver-head">Depot</div>
    <div class="deliver-head">Detail</div>

    <div>Pallets</div>
    <div>Load</div>
  </div>
`;

  const grouped = {};

  movements
    .filter((movement) => {
      if (activeModeFilter === "all") return true;
      return movement.planningMode === activeModeFilter;
    })
    .forEach((movement) => {
      if (!grouped[movement.jobId]) {
        grouped[movement.jobId] = [];
      }

      grouped[movement.jobId].push(movement);
    });

  Object.keys(grouped).forEach((jobId) => {
    const group = document.createElement("div");
    group.className = "job-group";

    grouped[jobId].forEach((movement, index) => {
      const row = document.createElement("div");
      row.className = "job-row";
      row.setAttribute("draggable", "true");
      row.dataset.job = movement.jobId;
      row.dataset.move = index;
      row.dataset.movementId = movement.id;

      row.innerHTML = `

        <div class="col select-col">
            <input type="checkbox" class="row-select" data-id="${movement.id}" />
        </div>

        <div class="col order-id">
          <button class="order-link" data-order="${movement.orderId}">${movement.orderId}</button>
        </div>

        <div class="col mode-col">
  <span class="mode-badge ${movement.planningMode === "direct" ? "mode-direct" : "mode-depot"}">
    ${movement.planningMode === "direct" ? "Direct" : "Via Depot"}
  </span>
</div>

<div class="col cd-col collect-col">C</div>
<div class="col date-col collect-col">${movement.collect.date || ""}</div>
<div class="col time-col collect-col">${movement.collect.time || ""}</div>
<div class="col location-col collect-col">${movement.collect.location}</div>
<div class="col detail-col collect-col">${movement.collect.detail}</div>



<div class="col cd-col deliver-col">D</div>
<div class="col date-col deliver-col">${movement.deliver.date || ""}</div>
<div class="col time-col deliver-col">${movement.deliver.time || ""}</div>
<div class="col location-col deliver-col">${movement.deliver.location}</div>
<div class="col detail-col deliver-col">${movement.deliver.detail}</div>

        <div class="col pallets-col">${movement.pallets} pallets</div>

        <div class="col run-assign">
            <input class="run-input" type="text" placeholder="Run" />
            <button class="unassign-btn" title="Unallocate">×</button>
        </div>
        `;

      group.appendChild(row);
    });

    jobList.appendChild(group);
  });
}

let movements = [
  {
    id: "1001-0",
    orderId: "ORD-5001",
    jobId: "1001",
    customer: "Tesco",
    pallets: 2,
    collect: {
      location: "Coop Manchester",
      detail: "For Tesco Oxford",
      date: "2026-04-27",
      time: "09:00",
      isDepot: false,
    },
    deliver: {
      location: "Depot",
      detail: "Tesco Oxford Ex Coop Manchester",
      date: "2026-04-27",
      time: "17:00",
      isDepot: true,
    },
    runId: null,
  },
  {
    id: "1001-1",
    orderId: "ORD-5001",
    jobId: "1001",
    customer: "Tesco",
    pallets: 2,
    collect: {
      location: "Depot",
      detail: "Tesco Oxford Ex Coop Manchester",
      date: "2026-04-28",
      time: "07:00",
      isDepot: true,
    },
    deliver: {
      location: "Tesco Oxford",
      detail: "Ex Coop Manchester",
      date: "2026-04-28",
      time: "11:00",
      isDepot: false,
    },
    runId: null,
  },
  {
    id: "1002-0",
    orderId: "ORD-5002",
    jobId: "1002",
    customer: "Aldi",
    pallets: 4,
    collect: {
      location: "Aldi Bristol",
      detail: "For Aldi Swindon",
      date: "2026-04-27",
      time: "10:00",
      isDepot: false,
    },
    deliver: {
      location: "Aldi Swindon",
      detail: "Ex Aldi Bristol",
      date: "2026-04-27",
      time: "13:00",
      isDepot: false,
    },
    runId: null,
  },
];

function formatStop(action, stop) {
  return `${action} ${stop.location} ${stop.detail}`;
}

let runs = {
  1: {
    name: "Manchester Multi Drop",
    date: "2026-04-29",
    startTime: "08:00",
    stops: [],
  },
  2: { name: "South West", date: "2026-04-29", startTime: "08:30", stops: [] },
  3: { name: "London", date: "2026-04-29", startTime: "09:00", stops: [] },
};

let activeRunId = null;
let dragPayload = null;

let currentFilter = "all";
let currentView = "jobs";

let currentDateFilter = "all";
let currentTypeFilter = "all";
let includeDepot = true;

let currentSearchTerm = "";

let customDateFilter = "";

let selectedMovements = new Set();

let runEditMode = false;

let activeModeFilter = "all";

let activeOrderId = null;

let editingJobNumber = null;

let currentRunDate = "2026-04-29";

let includePreviousEveningRuns = false;

const movementAllocations = {};

renderJobPot();
attachJobPotEvents();


document.getElementById("runDatePicker").value = currentRunDate;

const runCards = document.querySelectorAll(".run-card");
const jobRows = document.querySelectorAll(".job-row");
const routeEmpty = document.querySelector(".route-empty");
const routeList = document.querySelector(".route-list");
const activeRouteHeader = document.querySelector(".bottom .panel-header h2");
const jobPot = document.querySelector(".job-list");

const unallocateDropzone = document.querySelector(".unallocate-dropzone");

loadRunsFromDB();

runCards.forEach((card) => {
  card.addEventListener("click", () => {
    selectRun(card.dataset.run);
  });

  card.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  card.addEventListener("drop", (e) => {
    e.preventDefault();

    const runId = card.dataset.run;

    if (!dragPayload) return;

    if (dragPayload.type === "jobMovement") {
      assignMovementToRun(dragPayload.movementId, runId);
    }

    if (dragPayload.type === "routeMovement") {
      moveMovementToRun(dragPayload.movementKey, runId);
    }

    dragPayload = null;

    unallocateDropzone.classList.remove("visible", "drag-over");
  });
});

function attachJobPotEvents() {
  document.querySelectorAll(".job-row").forEach((row) => {
    row.addEventListener("dragstart", () => {
      dragPayload = {
        type: "jobMovement",
        movementId: row.dataset.movementId,
      };
    });
  });

  document.querySelectorAll(".row-select").forEach((checkbox) => {
    checkbox.addEventListener("change", (e) => {
      const id = e.target.dataset.id;

      if (e.target.checked) {
        selectedMovements.add(id);
      } else {
        selectedMovements.delete(id);
      }

      updateSelectedCount();
    });
  });

  document.querySelectorAll(".run-input").forEach((input) => {
    input.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;

      const row = input.closest(".job-row");
      const movementId = row.dataset.movementId;
      const runId = input.value.trim();

      if (!runs[runId]) {
        alert("That run does not exist.");
        input.value = "";
        return;
      }

      assignMovementToRun(movementId, runId);
    });
  });

  document.querySelectorAll(".unassign-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();

      const row = button.closest(".job-row");
      unallocateMovement(row.dataset.movementId);
    });
  });

  document.querySelectorAll(".order-link").forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      renderOrderDetail(button.dataset.order);
    });
  });
}

document.getElementById("jobSearchInput").addEventListener("input", (e) => {
  currentSearchTerm = e.target.value.trim().toLowerCase();
  applyJobPotFilters();
});

document.querySelectorAll(".run-input").forEach((input) => {
  input.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;

    const row = input.closest(".job-row");
    const jobId = row.dataset.job;
    const moveIndex = Number(row.dataset.move);
    const runId = input.value.trim();

    if (!runs[runId]) {
      alert("That run does not exist.");
      input.value = "";
      return;
    }

    assignMovementToRun(jobId, moveIndex, runId);
  });
});

jobPot.addEventListener("dragover", (e) => {
  e.preventDefault();
});

jobPot.addEventListener("drop", (e) => {
  e.preventDefault();

  if (!dragPayload || dragPayload.type !== "routeMovement") return;

  unallocateMovement(dragPayload.movementKey);
  dragPayload = null;
});

function selectRun(runId) {
  const clickedSameRun = activeRunId === runId;

  activeRunId = clickedSameRun ? null : runId;

  document.querySelectorAll(".run-card").forEach((card) => {
    card.classList.toggle("active", card.dataset.run === activeRunId);
  });

  if (activeRunId) {
    renderActiveRun();
  } else {
    activeRouteHeader.textContent = "Active Route";
    routeEmpty.style.display = "block";
    routeEmpty.textContent = "Select a run to begin planning";
    routeList.style.display = "none";
    routeList.innerHTML = "";
  }
}

function getMovement(jobId, moveIndex) {
  return jobs[jobId][moveIndex];
}

function assignMovementToRun(movementId, runId) {
  const movement = movements.find((m) => m.id === movementId);

  removeMovementFromAllRuns(movement.id);

  runs[runId].stops.push({
    movementKey: movement.id,
    type: "collect",
    ...movement.collect,
    jobId: movement.jobId,
    orderId: movement.orderId,
    pallets: movement.pallets,
  });

  runs[runId].stops.push({
    movementKey: movement.id,
    type: "deliver",
    ...movement.deliver,
    jobId: movement.jobId,
    orderId: movement.orderId,
    pallets: movement.pallets,
  });

  movement.runId = runId;
  movementAllocations[movement.id] = runId;

  updateJobPotAllocationDisplay();
  selectRun(runId);
  saveAllocationToSupabase(movementId, runId);
}

function moveMovementToRun(movementKey, newRunId) {
  const movementStops = removeMovementFromAllRuns(movementKey);

  movementStops.forEach((stop) => {
    runs[newRunId].stops.push(stop);
  });

  movementAllocations[movementKey] = newRunId;

  updateJobPotAllocationDisplay();
  selectRun(newRunId);
  saveAllocationToSupabase(movementKey, newRunId);
}

function unallocateMovement(movementKey) {
  removeMovementFromAllRuns(movementKey);
  delete movementAllocations[movementKey];

  const movement = movements.find((m) => m.id === movementKey);
  if (movement) {
    movement.runId = null;
  }

  updateJobPotAllocationDisplay();
  renderActiveRun();

  deleteAllocationFromSupabase(movementKey);
}

function removeMovementFromAllRuns(movementKey) {
  let removedStops = [];

  Object.keys(runs).forEach((runId) => {
    const run = runs[runId];
    const remainingStops = [];

    run.stops.forEach((stop) => {
      if (stop.movementKey === movementKey) {
        removedStops.push(stop);
      } else {
        remainingStops.push(stop);
      }
    });

    run.stops = remainingStops;
  });

  return removedStops;
}

function renderOrderDetail(orderId) {
  activeOrderId = orderId;
  const orderMovements = movements.filter((m) => m.orderId === orderId);

  activeRouteHeader.innerHTML = `
   Order Detail — ${orderId}
   <button id="addJobBtn" class="primary-btn" data-order="${orderId}">Add Job</button>
 `;

  routeEmpty.style.display = "none";
  routeList.style.display = "flex";
  routeList.innerHTML = `
  <div class="order-detail-header order-detail-row">
    <div>Job</div>
    <div>C/D</div>
    <div>Depot</div>
    <div>Detail</div>
    <div>C/D</div>
    <div>Depot</div>
    <div>Detail</div>
    <div>Pallets</div>
    <div>Load</div>
  </div>
 `;

  orderMovements.forEach((movement) => {
    const row = document.createElement("div");
    row.className = "order-detail-row";

    row.innerHTML = `
      <div>
  <button class="job-link" data-job="${movement.jobId}">
    ${movement.jobId}
  </button>
</div>
      <div>C</div>
      <div>${movement.collect.location}</div>
      <div>${movement.collect.detail}</div>
      <div>D</div>
      <div>${movement.deliver.location}</div>
      <div>${movement.deliver.detail}</div>
      <div>${movement.pallets} pallets</div>
      <div>${movement.runId ? `Run ${movement.runId}` : "Unallocated"}</div>
    `;

    routeList.appendChild(row);
  });

  const addJobBtn = document.getElementById("addJobBtn");

  if (addJobBtn) {
    addJobBtn.addEventListener("click", () => {
      editingJobNumber = null;
      openOrderWizard(orderId);
    });
  }

  document.querySelectorAll(".job-link").forEach((button) => {
    button.addEventListener("click", () => {
      openJobWizardForEdit(button.dataset.job);
    });
  });
}

function renderActiveRun() {
  if (!activeRunId) return;

  const run = runs[activeRunId];

  activeRouteHeader.textContent = `Active Route — Run ${run.plannerRunNo || ""}: ${run.name}`;
  routeList.innerHTML = "";

  if (!run.stops.length) {
    routeEmpty.style.display = "block";
    routeEmpty.textContent = "No stops planned yet";
    routeList.style.display = "none";
    return;
  }

  routeEmpty.style.display = "none";
  routeList.style.display = "flex";

  routeList.innerHTML = `
    <div class="route-header route-stop-grid">
      <div>Seq</div>
      <div>Job</div>
      <div>C/D</div>
      <div>Depot</div>
      <div>Detail</div>
      <div>Pallets</div>
      <div>Order</div>
    </div>
  `;

  run.stops.forEach((stop, index) => {
    const stopRow = document.createElement("div");
    stopRow.className = "route-stop route-stop-grid";
    stopRow.setAttribute("draggable", "true");

    stopRow.innerHTML = `
      <div>${index + 1}</div>
      <div>${stop.jobId}</div>
      <div>${stop.type === "collect" ? "C" : "D"}</div>
      <div>${stop.location}</div>
      <div>${stop.detail}</div>
      <div>${stop.pallets || ""}</div>
      <div>${stop.orderId || ""}</div>
    `;

    stopRow.addEventListener("dragstart", () => {
      dragPayload = {
        type: "routeMovement",
        runId: activeRunId,
        movementKey: stop.movementKey,
        stopIndex: index,
      };
    });

    stopRow.addEventListener("dragover", (e) => {
      e.preventDefault();
      stopRow.classList.add("drag-over");
    });

    stopRow.addEventListener("dragleave", () => {
      stopRow.classList.remove("drag-over");
    });

    stopRow.addEventListener("drop", (e) => {
      e.preventDefault();

      if (!dragPayload || dragPayload.type !== "routeMovement") return;
      if (dragPayload.runId !== activeRunId) return;

      const fromIndex = dragPayload.stopIndex;
      const toIndex = index;

      const movedStop = run.stops.splice(fromIndex, 1)[0];
      run.stops.splice(toIndex, 0, movedStop);

      stopRow.classList.remove("drag-over");

      saveRunOrderToSupabase(activeRunId);

      renderActiveRun();
    });

    routeList.appendChild(stopRow);
  });
}

function updateJobPotAllocationDisplay() {
  document.querySelectorAll(".job-row").forEach((row) => {
    const movementId = row.dataset.movementId;
    const input = row.querySelector(".run-input");
    const runId = movementAllocations[movementId];

    if (runId) {
      input.value = runId;
      row.classList.add("allocated");
    } else {
      input.value = "";
      row.classList.remove("allocated");
    }
  });
  applyJobPotFilters();
}

unallocateDropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  unallocateDropzone.classList.add("drag-over");
});

unallocateDropzone.addEventListener("dragleave", () => {
  unallocateDropzone.classList.remove("drag-over");
});

unallocateDropzone.addEventListener("drop", (e) => {
  e.preventDefault();

  if (!dragPayload || dragPayload.type !== "routeMovement") return;

  unallocateMovement(dragPayload.movementKey);

  dragPayload = null;
  unallocateDropzone.classList.remove("visible", "drag-over");
});

document.querySelectorAll(".unassign-btn").forEach((button) => {
  button.addEventListener("click", (e) => {
    e.stopPropagation();

    const row = button.closest(".job-row");
    const movementKey = `${row.dataset.job}-${row.dataset.move}`;

    unallocateMovement(movementKey);
  });
});

document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;

    document
      .querySelectorAll(".filter-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    applyJobPotFilters();
  });
});

document.querySelectorAll(".view-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentView = btn.dataset.view;

    document
      .querySelectorAll(".view-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    applyJobPotFilters();
  });
});

function applyJobPotFilters() {
  const today = "2026-04-27";
  const tomorrow = "2026-04-28";

  const selectedDate =
    currentDateFilter === "today"
      ? today
      : currentDateFilter === "tomorrow"
        ? tomorrow
        : currentDateFilter === "custom"
          ? customDateFilter
          : null;

  document.querySelectorAll(".job-group").forEach((group) => {
    const rows = Array.from(group.querySelectorAll(".job-row"));

    const rowMatches = rows.map((row) => {
      const movementId = row.dataset.movementId;
      const movement = movements.find((m) => m.id === movementId);

      const isAllocated = !!movement.runId;

      // Allocation filter
      if (currentFilter === "unallocated" && isAllocated) return false;
      if (currentFilter === "allocated" && !isAllocated) return false;

      // COLLECTIONS MODE
      if (currentTypeFilter === "collect") {
        if (!includeDepot && movement.collect.isDepot) return false;
        if (selectedDate && movement.collect.date !== selectedDate)
          return false;
        return true;
      }

      // DELIVERIES MODE
      if (currentTypeFilter === "deliver") {
        if (!includeDepot && movement.deliver.isDepot) return false;
        if (selectedDate && movement.deliver.date !== selectedDate)
          return false;
        return true;
      }

      // ALL MODE
      const collectVisible =
        (includeDepot || !movement.collect.isDepot) &&
        (!selectedDate || movement.collect.date === selectedDate);

      const deliverVisible =
        (includeDepot || !movement.deliver.isDepot) &&
        (!selectedDate || movement.deliver.date === selectedDate);

      return collectVisible || deliverVisible;
    });

    // JOBS VIEW
    if (currentView === "jobs") {
      const showWholeJob = rowMatches.some(Boolean);

      group.style.display = showWholeJob ? "block" : "none";

      rows.forEach((row) => {
        row.style.display = showWholeJob ? "grid" : "none";
      });

      return;
    }

    // LEGS VIEW
    if (currentView === "legs") {
      let anyVisible = false;

      rows.forEach((row, index) => {
        const show = rowMatches[index];

        row.style.display = show ? "grid" : "none";
        if (show) anyVisible = true;
      });

      group.style.display = anyVisible ? "block" : "none";
    }
  });
}

// DATE
document.querySelectorAll(".date-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentDateFilter = btn.dataset.date;

    customDateFilter = "";
    document.getElementById("jobDatePicker").value = "";

    document
      .querySelectorAll(".date-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    applyJobPotFilters();
  });
});

document.querySelectorAll(".mode-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".mode-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    activeModeFilter = btn.dataset.mode;

    renderJobPot();
  });
});

// TYPE
document.querySelectorAll(".type-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentTypeFilter = btn.dataset.type;

    document
      .querySelectorAll(".type-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const jobPotPanel = document.querySelector(".job-pot");
    jobPotPanel.classList.remove("show-collect", "show-deliver");

    if (currentTypeFilter === "collect") {
      jobPotPanel.classList.add("show-collect");
    }

    if (currentTypeFilter === "deliver") {
      jobPotPanel.classList.add("show-deliver");
    }

    applyJobPotFilters();
  });
});

// DEPOT
document.getElementById("toggleDepot").addEventListener("change", (e) => {
  includeDepot = e.target.checked;
  applyJobPotFilters();
});

document.getElementById("jobDatePicker").addEventListener("change", (e) => {
  customDateFilter = e.target.value;
  currentDateFilter = "custom";

  document
    .querySelectorAll(".date-btn")
    .forEach((b) => b.classList.remove("active"));

  applyJobPotFilters();
});

document.getElementById("assignSelectedBtn").addEventListener("click", () => {
  const runId = document.getElementById("bulkRunInput").value.trim();

  if (!runs[runId]) {
    alert("Invalid run");
    return;
  }

  selectedMovements.forEach((movementId) => {
    assignMovementToRun(movementId, runId);
  });

  selectedMovements.clear();
  updateSelectedCount();
});

function updateSelectedCount() {
  document.getElementById("selectedCount").textContent =
    `${selectedMovements.size} selected`;
}

function updateSelectedCount() {
  const countEl = document.getElementById("selectedCount");
  if (!countEl) return;

  countEl.textContent = `${selectedMovements.size} selected`;
}

async function saveAllocationToSupabase(movementId, runId) {
  try {
    const { data: runData, error: runError } = await supabaseClient
      .from("runs")
      .select("id")
      .eq("planner_run_no", runId)
      .single();

    if (runError) throw runError;

    const accountId = await getAccountId();

    const { error: upsertError } = await supabaseClient
      .from("run_allocations")
      .upsert(
        {
          account_id: accountId,
          run_id: runData.id,
          movement_id: movementId,
          stop_sequence: 1,
        },
        {
          onConflict: "movement_id",
        },
      );

    if (upsertError) throw upsertError;

    console.log("Saved allocation:", movementId, "→ run", runId);
  } catch (err) {
    console.error("Error saving allocation:", err);
  }
}

async function getAccountId() {
  const { data, error } = await supabaseClient
    .from("accounts")
    .select("id")
    .limit(1)
    .single();

  if (error) {
    console.error("Error fetching account:", error);
    return null;
  }

  return data.id;
}

async function loadAllocationsFromSupabase() {
  const { data, error } = await supabaseClient.from("run_allocations").select(`
        movement_id,
        stop_sequence,
        collect_sequence,
        deliver_sequence,
        runs (
        id,
        run_name,
        planner_run_no
        )
    `);

  if (error) {
    console.error("Error loading allocations:", error);
    return;
  }

  data.forEach((allocation) => {
    const movement = movements.find((m) => m.id === allocation.movement_id);
    if (!movement) return;

    const plannerRunNo = allocation.runs?.planner_run_no || "1";

    movement.runId = plannerRunNo;
    movementAllocations[movement.id] = plannerRunNo;

    if (!runs[plannerRunNo].stops.some((s) => s.movementKey === movement.id)) {
      runs[plannerRunNo].stops.push({
        movementKey: movement.id,
        type: "collect",
        sequence: allocation.collect_sequence || allocation.stop_sequence || 1,
        ...movement.collect,
        jobId: movement.jobId,
        orderId: movement.orderId,
        pallets: movement.pallets,
      });

      runs[plannerRunNo].stops.push({
        movementKey: movement.id,
        type: "deliver",
        sequence:
          allocation.deliver_sequence || (allocation.stop_sequence || 1) + 1,
        ...movement.deliver,
        jobId: movement.jobId,
        orderId: movement.orderId,
        pallets: movement.pallets,
      });
    }
  });

  Object.values(runs).forEach((run) => {
    run.stops.sort((a, b) => a.sequence - b.sequence);
  });

  updateJobPotAllocationDisplay();

  if (activeRunId) {
    renderActiveRun();
  }

  console.log("Loaded allocations from Supabase:", data);
}

async function deleteAllocationFromSupabase(movementId) {
  const { error } = await supabaseClient
    .from("run_allocations")
    .delete()
    .eq("movement_id", movementId);

  if (error) {
    console.error("Error deleting allocation:", error);
    return;
  }

  console.log("Deleted allocation:", movementId);
}

document.getElementById("clearSelectionBtn").addEventListener("click", () => {
  selectedMovements.clear();

  document.querySelectorAll(".row-select").forEach((checkbox) => {
    checkbox.checked = false;
  });

  updateSelectedCount();
});

function formatTime(value) {
  if (!value) return "";
  return value.slice(0, 5);
}

function formatDate(value) {
  if (!value) return "";

  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function buildMovementDisplay(job, movement) {
  const originalCollect = job.collection_address?.name || "Collection";
  const originalDeliver = job.delivery_address?.name || "Delivery";

  const fromName = movement.from_address?.name || "From";
  const toName = movement.to_address?.name || "To";

  const sharedDetail = `${originalDeliver} Ex ${originalCollect}`;

  const collectionDate = formatDate(job.collection_date);
  const collectionTime = formatTime(job.collection_time);
  const deliveryDate = formatDate(job.delivery_date);
  const deliveryTime = formatTime(job.delivery_time);

  if (movement.movement_type === "direct") {
    return {
      collect: {
        location: fromName,
        detail: `For ${originalDeliver}`,
        date: collectionDate,
        time: collectionTime,
        isDepot: false,
      },
      deliver: {
        location: toName,
        detail: `Ex ${originalCollect}`,
        date: deliveryDate,
        time: deliveryTime,
        isDepot: false,
      },
    };
  }

  if (movement.movement_type === "to_depot") {
    return {
      collect: {
        location: fromName,
        detail: `For ${originalDeliver}`,
        date: collectionDate,
        time: collectionTime,
        isDepot: false,
      },
      deliver: {
        location: toName,
        detail: sharedDetail,
        date: collectionDate,
        time: "",
        isDepot: true,
      },
    };
  }

  if (movement.movement_type === "from_depot") {
    return {
      collect: {
        location: fromName,
        detail: sharedDetail,
        date: deliveryDate,
        time: "",
        isDepot: true,
      },
      deliver: {
        location: toName,
        detail: `Ex ${originalCollect}`,
        date: deliveryDate,
        time: deliveryTime,
        isDepot: false,
      },
    };
  }

  return {
    collect: {
      location: fromName,
      detail: "",
      isDepot: false,
    },
    deliver: {
      location: toName,
      detail: "",
      isDepot: false,
    },
  };
}

async function loadPlannerDataFromSupabase() {
  const { data, error } = await supabaseClient.from("orders").select(`
  id,
  order_number,
  jobs (
    id,
    job_number,
    pallets,
    planning_mode,
    collection_date,
    collection_time,
    delivery_date,
    delivery_time,
    collection_address:addresses!jobs_collection_address_id_fkey (
      id,
      name,
      town,
      postcode
    ),
    delivery_address:addresses!jobs_delivery_address_id_fkey (
      id,
      name,
      town,
      postcode
    ),
    movements (
      id,
      movement_type,
      sequence_no,
      from_address:addresses!movements_from_address_id_fkey (
        id,
        name,
        town,
        postcode
      ),
      to_address:addresses!movements_to_address_id_fkey (
        id,
        name,
        town,
        postcode
      )
    )
  )
`);

  if (error) {
    console.error("Error loading planner data:", error);
    return;
  }

  console.log("Supabase raw planner data:", data);

  const transformedMovements = [];

  data.forEach((order) => {
    order.jobs.forEach((job) => {
      job.movements.forEach((movement) => {
        const display = buildMovementDisplay(job, movement);

        transformedMovements.push({
          id: movement.id,
          orderId: order.order_number,
          jobId: job.job_number,
          movement_type: movement.movement_type,
          customer: "Demo Customer",
          pallets: job.pallets || 1,

          planningMode: job.planning_mode,

          jobCollect: job.collection_address,
          jobDeliver: job.delivery_address,

          collect: display.collect,
          deliver: display.deliver,

          runId: null,
        });
      });
    });
  });

  movements = transformedMovements;

  renderJobPot();
  attachJobPotEvents();
  applyJobPotFilters();

  await loadAllocationsFromSupabase();

  console.log("Planner movements from Supabase:", movements);
}

loadPlannerDataFromSupabase();

async function saveRunOrderToSupabase(runId) {
  try {
    const run = runs[runId];
    if (!run) return;

    const sequenceByMovement = {};

    run.stops.forEach((stop, index) => {
      if (!sequenceByMovement[stop.movementKey]) {
        sequenceByMovement[stop.movementKey] = {};
      }

      if (stop.type === "collect") {
        sequenceByMovement[stop.movementKey].collect_sequence = index + 1;
      }

      if (stop.type === "deliver") {
        sequenceByMovement[stop.movementKey].deliver_sequence = index + 1;
      }
    });

    for (const movementId of Object.keys(sequenceByMovement)) {
      const update = sequenceByMovement[movementId];

      await supabaseClient
        .from("run_allocations")
        .update(update)
        .eq("movement_id", movementId);
    }

    console.log("Saved run stop order");
  } catch (err) {
    console.error("Error saving order:", err);
  }
}

const orderWizard = document.getElementById("orderWizard");
const newOrderBtn = document.getElementById("newOrderBtn");
const closeWizardBtn = document.getElementById("closeWizardBtn");
const cancelWizardBtn = document.getElementById("cancelWizardBtn");
const saveWizardBtn = document.getElementById("saveWizardBtn");

function openOrderWizard(orderId = activeOrderId) {
  activeOrderId = orderId;
  orderWizard.classList.remove("hidden");
}

function closeOrderWizard() {
  orderWizard.classList.add("hidden");
}

newOrderBtn.addEventListener("click", createBlankOrder);
closeWizardBtn.addEventListener("click", closeOrderWizard);
cancelWizardBtn.addEventListener("click", closeOrderWizard);

saveWizardBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const wizardData = {
    customer: document.getElementById("wizardCustomer").value.trim(),
    orderNumber: document.getElementById("wizardOrderNumber").value.trim(),
    collectName: document.getElementById("wizardCollectName").value.trim(),
    collectTown: document.getElementById("wizardCollectTown").value.trim(),
    collectPostcode: document
      .getElementById("wizardCollectPostcode")
      .value.trim(),
    deliverName: document.getElementById("wizardDeliverName").value.trim(),
    deliverTown: document.getElementById("wizardDeliverTown").value.trim(),
    deliverPostcode: document
      .getElementById("wizardDeliverPostcode")
      .value.trim(),
    collectionDate: document.getElementById("wizardCollectionDate").value,
    collectionTime:
      document.getElementById("wizardCollectionTime").value || "09:00",
    deliveryDate: document.getElementById("wizardDeliveryDate").value,
    deliveryTime:
      document.getElementById("wizardDeliveryTime").value || "11:00",
    pallets: Number(document.getElementById("wizardPallets").value || 1),
    planningMode: document.getElementById("wizardPlanningMode").value,
  };

  console.log("Wizard data:", wizardData);
  if (editingJobNumber) {
    updateJobFromWizard(editingJobNumber, wizardData);
  } else {
    createJobFromWizard(activeOrderId, wizardData);
  }
});

async function createOrderFromWizard(wizardData) {
  try {
    const accountId = await getAccountId();

    // 1. Create or find customer
    // 1. Create customer for now
    const { data: customer, error: customerError } = await supabaseClient
      .from("customers")
      .insert({
        account_id: accountId,
        name: wizardData.customer || "Unknown Customer",
      })
      .select()
      .single();

    if (customerError) throw customerError;

    // 2. Create collection address
    const { data: collectionAddress, error: collectionError } =
      await supabaseClient
        .from("addresses")
        .insert({
          account_id: accountId,
          customer_id: customer.id,
          name: wizardData.collectName,
          town: wizardData.collectTown,
          postcode: wizardData.collectPostcode,
        })
        .select()
        .single();

    if (collectionError) throw collectionError;

    // 3. Create delivery address
    const { data: deliveryAddress, error: deliveryError } = await supabaseClient
      .from("addresses")
      .insert({
        account_id: accountId,
        customer_id: customer.id,
        name: wizardData.deliverName,
        town: wizardData.deliverTown,
        postcode: wizardData.deliverPostcode,
      })
      .select()
      .single();

    if (deliveryError) throw deliveryError;

    // 4. Create order
    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .insert({
        account_id: accountId,
        customer_id: customer.id,
        order_number: wizardData.orderNumber,
        status: "planned",
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 5. Create job
    const { data: job, error: jobError } = await supabaseClient
      .from("jobs")
      .insert({
        account_id: accountId,
        order_id: order.id,
        job_number: `${wizardData.orderNumber}-A`,
        planning_mode: wizardData.planningMode,
        status: "unplanned",
        pallets: wizardData.pallets,
        collection_address_id: collectionAddress.id,
        delivery_address_id: deliveryAddress.id,
      })
      .select()
      .single();

    if (jobError) throw jobError;

    // 6. Create movement
    // 6. Create movement(s)
    if (wizardData.planningMode === "direct") {
      const { error: movementError } = await supabaseClient
        .from("movements")
        .insert({
          account_id: accountId,
          job_id: job.id,
          movement_type: "direct",
          from_address_id: collectionAddress.id,
          to_address_id: deliveryAddress.id,
          sequence_no: 1,
          active: true,
        });

      if (movementError) throw movementError;
    }

    if (wizardData.planningMode === "via_depot") {
      const { data: depotAddress, error: depotError } = await supabaseClient
        .from("addresses")
        .select("id")
        .eq("account_id", accountId)
        .eq("name", "Depot")
        .single();

      if (depotError) throw depotError;

      const { error: movementError } = await supabaseClient
        .from("movements")
        .insert([
          {
            account_id: accountId,
            job_id: job.id,
            movement_type: "to_depot",
            from_address_id: collectionAddress.id,
            to_address_id: depotAddress.id,
            sequence_no: 1,
            active: true,
          },
          {
            account_id: accountId,
            job_id: job.id,
            movement_type: "from_depot",
            from_address_id: depotAddress.id,
            to_address_id: deliveryAddress.id,
            sequence_no: 2,
            active: true,
          },
        ]);

      if (movementError) throw movementError;
    }

    alert("Order created");

    closeOrderWizard();
    await loadPlannerDataFromSupabase();
  } catch (err) {
    console.error("Error creating order:", err);
    alert("Could not create order. Check console.");
  }
}

async function createJobFromWizard(orderNumber, wizardData) {
  try {
    if (!orderNumber) {
      alert("No active order selected");
      return;
    }

    const accountId = await getAccountId();

    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .select("id, order_number")
      .eq("order_number", orderNumber)
      .single();

    if (orderError) throw orderError;

    const { data: collectionAddress, error: collectionError } =
      await supabaseClient
        .from("addresses")
        .insert({
          account_id: accountId,
          name: wizardData.collectName,
          town: wizardData.collectTown,
          postcode: wizardData.collectPostcode,
        })
        .select()
        .single();

    if (collectionError) throw collectionError;

    const { data: deliveryAddress, error: deliveryError } = await supabaseClient
      .from("addresses")
      .insert({
        account_id: accountId,
        name: wizardData.deliverName,
        town: wizardData.deliverTown,
        postcode: wizardData.deliverPostcode,
      })
      .select()
      .single();

    if (deliveryError) throw deliveryError;

    const { data: existingJobs, error: jobsError } = await supabaseClient
      .from("jobs")
      .select("id")
      .eq("order_id", order.id);

    if (jobsError) throw jobsError;

    const suffix = String.fromCharCode(65 + existingJobs.length);
    const jobNumber = `${order.order_number}-${suffix}`;

    const { data: job, error: jobError } = await supabaseClient
      .from("jobs")
      .insert({
        account_id: accountId,
        order_id: order.id,
        job_number: jobNumber,
        planning_mode: wizardData.planningMode,
        status: "unplanned",
        pallets: wizardData.pallets,
        collection_address_id: collectionAddress.id,
        delivery_address_id: deliveryAddress.id,
        collection_date: wizardData.collectionDate || null,
        collection_time: wizardData.collectionTime || null,
        delivery_date: wizardData.deliveryDate || null,
        delivery_time: wizardData.deliveryTime || null,
      })
      .select()
      .single();

    if (jobError) throw jobError;

    if (wizardData.planningMode === "direct") {
      const { error: movementError } = await supabaseClient
        .from("movements")
        .insert({
          account_id: accountId,
          job_id: job.id,
          movement_type: "direct",
          from_address_id: collectionAddress.id,
          to_address_id: deliveryAddress.id,
          sequence_no: 1,
          active: true,
        });

      if (movementError) throw movementError;
    }

    if (wizardData.planningMode === "via_depot") {
      const { data: depotAddress, error: depotError } = await supabaseClient
        .from("addresses")
        .select("id")
        .eq("account_id", accountId)
        .eq("name", "Depot")
        .eq("postcode", "DEP 001")
        .limit(1)
        .single();

      if (depotError) throw depotError;

      const { error: movementError } = await supabaseClient
        .from("movements")
        .insert([
          {
            account_id: accountId,
            job_id: job.id,
            movement_type: "to_depot",
            from_address_id: collectionAddress.id,
            to_address_id: depotAddress.id,
            sequence_no: 1,
            active: true,
          },
          {
            account_id: accountId,
            job_id: job.id,
            movement_type: "from_depot",
            from_address_id: depotAddress.id,
            to_address_id: deliveryAddress.id,
            sequence_no: 2,
            active: true,
          },
        ]);

      if (movementError) throw movementError;
    }

    alert("Job created");

    closeOrderWizard();
    await loadPlannerDataFromSupabase();
    renderOrderDetail(order.order_number);
  } catch (err) {
    console.error("Error creating job:", err);
    alert("Could not create job. Check console.");
  }
}

async function updateJobFromWizard(jobNumber, wizardData) {
  try {
    const accountId = await getAccountId();

    // 1. Find job
    const { data: job, error: jobError } = await supabaseClient
      .from("jobs")
      .select("*")
      .eq("job_number", jobNumber)
      .single();

    if (jobError) throw jobError;

    // 2. Update collection address
    const { error: collectError } = await supabaseClient
      .from("addresses")
      .update({
        name: wizardData.collectName,
        town: wizardData.collectTown,
        postcode: wizardData.collectPostcode,
      })
      .eq("id", job.collection_address_id);

    if (collectError) throw collectError;

    // 3. Update delivery address
    const { error: deliverError } = await supabaseClient
      .from("addresses")
      .update({
        name: wizardData.deliverName,
        town: wizardData.deliverTown,
        postcode: wizardData.deliverPostcode,
      })
      .eq("id", job.delivery_address_id);

    if (deliverError) throw deliverError;

    // 4. Update job core fields
    const { error: updateJobError } = await supabaseClient
      .from("jobs")
      .update({
        pallets: wizardData.pallets,
        planning_mode: wizardData.planningMode,
        collection_date: wizardData.collectionDate || null,
        collection_time: wizardData.collectionTime || null,
        delivery_date: wizardData.deliveryDate || null,
        delivery_time: wizardData.deliveryTime || null,
      })
      .eq("id", job.id);

    if (updateJobError) throw updateJobError;

    // 5. Delete old movements + allocations
    const { data: existingMovements } = await supabaseClient
      .from("movements")
      .select("id")
      .eq("job_id", job.id);

    if (existingMovements && existingMovements.length) {
      const movementIds = existingMovements.map((m) => m.id);

      await supabaseClient
        .from("run_allocations")
        .delete()
        .in("movement_id", movementIds);

      await supabaseClient.from("movements").delete().eq("job_id", job.id);
    }

    // 6. Recreate movements
    if (wizardData.planningMode === "direct") {
      const { error: movementError } = await supabaseClient
        .from("movements")
        .insert({
          account_id: accountId,
          job_id: job.id,
          movement_type: "direct",
          from_address_id: job.collection_address_id,
          to_address_id: job.delivery_address_id,
          sequence_no: 1,
          active: true,
        });

      if (movementError) throw movementError;
    }

    if (wizardData.planningMode === "via_depot") {
      const { data: depotAddress, error: depotError } = await supabaseClient
        .from("addresses")
        .select("id")
        .eq("account_id", accountId)
        .eq("name", "Depot")
        .eq("postcode", "DEP 001")
        .limit(1)
        .single();

      if (depotError) throw depotError;

      const { error: movementError } = await supabaseClient
        .from("movements")
        .insert([
          {
            account_id: accountId,
            job_id: job.id,
            movement_type: "to_depot",
            from_address_id: job.collection_address_id,
            to_address_id: depotAddress.id,
            sequence_no: 1,
            active: true,
          },
          {
            account_id: accountId,
            job_id: job.id,
            movement_type: "from_depot",
            from_address_id: depotAddress.id,
            to_address_id: job.delivery_address_id,
            sequence_no: 2,
            active: true,
          },
        ]);

      if (movementError) throw movementError;
    }

    alert("Job updated");

    closeOrderWizard();

    await loadPlannerDataFromSupabase();
    renderOrderDetail(activeOrderId);
  } catch (err) {
    console.error("Error updating job:", err);
    alert("Could not update job");
  }
}

async function createBlankOrder() {
  try {
    const accountId = await getAccountId();

    // simple order number generator
    const orderNumber = "ORD-" + Math.floor(1000 + Math.random() * 9000);

    const { data: order, error } = await supabaseClient
      .from("orders")
      .insert({
        account_id: accountId,
        order_number: orderNumber,
        status: "draft",
      })
      .select()
      .single();

    if (error) throw error;

    console.log("Created blank order:", order);

    // open order detail panel
    renderOrderDetail(order.order_number);

    // OPTIONAL: reload planner so order appears in pot
    await loadPlannerDataFromSupabase();
  } catch (err) {
    console.error("Error creating blank order:", err);
    alert("Could not create order");
  }
}

async function openJobWizardForEdit(jobNumber) {
  try {
    editingJobNumber = jobNumber;

    const { data: job, error } = await supabaseClient
      .from("jobs")
      .select(
        `
        id,
        job_number,
        pallets,
        planning_mode,
        collection_date,
        collection_time,
        delivery_date,
        delivery_time,
        collection_address:addresses!jobs_collection_address_id_fkey (
          name,
          town,
          postcode
        ),
        delivery_address:addresses!jobs_delivery_address_id_fkey (
          name,
          town,
          postcode
        ),
        orders (
          order_number
        )
      `,
      )
      .eq("job_number", jobNumber)
      .single();

    if (error) throw error;

    activeOrderId = job.orders.order_number;

    // Fill wizard with TRUE data
    document.getElementById("wizardCustomer").value = "";
    document.getElementById("wizardOrderNumber").value =
      job.orders.order_number;

    document.getElementById("wizardCollectName").value =
      job.collection_address?.name || "";
    document.getElementById("wizardCollectTown").value =
      job.collection_address?.town || "";
    document.getElementById("wizardCollectPostcode").value =
      job.collection_address?.postcode || "";

    document.getElementById("wizardDeliverName").value =
      job.delivery_address?.name || "";
    document.getElementById("wizardDeliverTown").value =
      job.delivery_address?.town || "";
    document.getElementById("wizardDeliverPostcode").value =
      job.delivery_address?.postcode || "";

    document.getElementById("wizardCollectionDate").value =
      job.collection_date || "";
    document.getElementById("wizardCollectionTime").value =
      job.collection_time || "09:00";

    document.getElementById("wizardDeliveryDate").value =
      job.delivery_date || "";
    document.getElementById("wizardDeliveryTime").value =
      job.delivery_time || "11:00";

    document.getElementById("wizardPallets").value = job.pallets || 1;
    document.getElementById("wizardPlanningMode").value = job.planning_mode;

    openOrderWizard(activeOrderId);
  } catch (err) {
    console.error("Error loading job:", err);
    alert("Could not load job");
  }
}

function normaliseDate(value) {
  if (!value) return "";

  if (value.includes("-")) return value;

  const [day, month, year] = value.split("/");
  return `${year}-${month}-${day}`;
}

function addDaysIso(dateIso, days) {
  const [year, month, day] = dateIso.split("-").map(Number);

  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);

  return date.toISOString().slice(0, 10);
}

function runMinutes(run) {
  if (!run.startTime) return 9999;

  const [hours, minutes] = run.startTime.split(":").map(Number);
  return hours * 60 + minutes;
}

function shouldShowRunOnSelectedDate(run) {
  const selectedDate = normaliseDate(currentRunDate);
  const runDate = normaliseDate(run.date);
  const minutes = runMinutes(run);

  // Normal selected-day runs
  if (runDate === selectedDate) return true;

  // Optional previous evening window: previous day from 20:00 onwards
  if (includePreviousEveningRuns) {
    const previousDate = addDaysIso(selectedDate, -1);

    if (runDate === previousDate && minutes >= 20 * 60) {
      return true;
    }
  }

  return false;
}

function sortRunsForPlanningDay(a, b) {
  const aIsPrevious = a.date !== currentRunDate ? 0 : 1;
  const bIsPrevious = b.date !== currentRunDate ? 0 : 1;

  if (aIsPrevious !== bIsPrevious) {
    return aIsPrevious - bIsPrevious;
  }

  return (a.startTime || "99:99").localeCompare(b.startTime || "99:99");
}

function renderRuns() {
  const runList = document.querySelector(".run-list");
  runList.innerHTML = "";

  const selectedDate = normaliseDate(currentRunDate);
  const previousDate = addDaysIso(selectedDate, -1);

  const visibleRuns = Object.keys(runs)
    .map((runId) => {
      const run = runs[runId];

      return {
        id: String(runId),
        ...run,
        date: normaliseDate(run.date),
        startTime: run.startTime || "",
      };
    })
    .filter((run) => {
      // normal runs for selected day
      if (run.date === selectedDate) return true;

      // previous evening window
      if (
        includePreviousEveningRuns &&
        run.date === previousDate &&
        run.startTime >= "20:00"
      ) {
        return true;
      }

      return false;
    })
    .sort((a, b) => {
      const aPrevious = a.date === previousDate ? 0 : 1;
      const bPrevious = b.date === previousDate ? 0 : 1;

      if (aPrevious !== bPrevious) return aPrevious - bPrevious;

      return (a.startTime || "99:99").localeCompare(b.startTime || "99:99");
    });

  console.log("VISIBLE RUNS:", {
    selectedDate,
    previousDate,
    includePreviousEveningRuns,
    visibleRuns,
    allRuns: runs,
  });

  visibleRuns.forEach((run) => {
    const card = document.createElement("div");
    card.className = "run-card";
    card.dataset.run = run.id;

    card.innerHTML = `
      <div class="run-edit-row">
        <input class="run-time-input" type="time" value="${run.startTime}" ${runEditMode ? "" : "readonly"} />
        <input class="run-name-input" type="text" value="${run.name || "Unknown"}" ${runEditMode ? "" : "readonly"} />
      </div>
      <div class="run-ref">#${run.plannerRunNo || String(run.id).slice(0, 7)}</div>
    `;

    card.addEventListener("click", () => {
      selectRun(run.id);
    });

    const timeInput = card.querySelector(".run-time-input");
    const nameInput = card.querySelector(".run-name-input");

    timeInput.addEventListener("click", (e) => e.stopPropagation());
    nameInput.addEventListener("click", (e) => e.stopPropagation());

    timeInput.addEventListener("input", async (e) => {
      const value = e.target.value || "";

      runs[run.id].startTime = value;

      await supabaseClient
        .from("runs")
        .update({ start_time: value || null })
        .eq("id", run.id);
    });

    timeInput.addEventListener("change", () => {
      renderRuns();
    });

    nameInput.addEventListener("input", async (e) => {
      const value = e.target.value.trim() || "Unknown";

      runs[run.id].name = value;

      await supabaseClient
        .from("runs")
        .update({ run_name: value })
        .eq("id", run.id);
    });

    nameInput.addEventListener("change", () => {
      renderRuns();
    });

    card.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    card.addEventListener("drop", (e) => {
      e.preventDefault();

      if (!dragPayload) return;

      if (dragPayload.type === "jobMovement") {
        assignMovementToRun(dragPayload.movementId, run.id);
      }

      if (dragPayload.type === "routeMovement") {
        moveMovementToRun(dragPayload.movementKey, run.id);
      }

      dragPayload = null;
      unallocateDropzone.classList.remove("visible", "drag-over");
    });

    runList.appendChild(card);
  });
}

function getTodayIso() {
  return "2026-04-29";
}

function getTomorrowIso() {
  return "2026-04-30";
}

document.querySelectorAll(".run-date-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".run-date-btn")
      .forEach((b) => b.classList.remove("active"));

    btn.classList.add("active");

    if (btn.dataset.runDate === "today") {
      currentRunDate = getTodayIso();
    }

    if (btn.dataset.runDate === "tomorrow") {
      currentRunDate = getTomorrowIso();
    }

    document.getElementById("runDatePicker").value = currentRunDate;

    activeRunId = null;
    renderRuns();
    renderActiveRun();
  });
});

document.getElementById("runDatePicker").addEventListener("change", (e) => {
  currentRunDate = e.target.value;

  document
    .querySelectorAll(".run-date-btn")
    .forEach((b) => b.classList.remove("active"));

  activeRunId = null;
  renderRuns();
  renderActiveRun();
});

document.getElementById("addRunBtn").addEventListener("click", async () => {
  const plannerRunNo = String(Date.now()).slice(-7); // temp unique

  const { data, error } = await supabaseClient
    .from("runs")
    .insert([
      {
        run_name: "New Run",
        run_date: currentRunDate,
        start_time: null,
        planner_run_no: plannerRunNo,
        account_id: YOUR_ACCOUNT_ID // we’ll handle properly later
      }
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating run:", error);
    return;
  }

  runs[data.id] = {
    id: data.id,
    name: data.run_name,
    date: data.run_date,
    startTime: data.start_time,
    plannerRunNo: data.planner_run_no
  };

  activeRunId = data.id;

  renderRuns();
  selectRun(data.id);
});

document
  .getElementById("runWindowOffsetToggle")
  .addEventListener("change", (e) => {
    includePreviousEveningRuns = e.target.checked;
    activeRunId = null;
    renderRuns();
    renderActiveRun();
});

document.getElementById("runEditModeToggle").addEventListener("change", (e) => {
  runEditMode = e.target.checked;
  renderRuns();
});

async function loadRunsFromDB() {
  const { data, error } = await supabaseClient
    .from("runs")
    .select("*")
    .order("run_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Error loading runs:", error);
    alert("Could not load runs from Supabase. Check console.");
    return;
  }

  console.log("Runs loaded from Supabase:", data);

  runs = {};

  data.forEach((row) => {
    runs[row.id] = {
      id: row.id,
      name: row.run_name || "Unknown",
      date: row.run_date,
      startTime: row.start_time ? row.start_time.slice(0, 5) : "",
      plannerRunNo: row.planner_run_no,
      stops: []
    };
  });

  renderRuns();
}