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

function shortOrderLabel(orderId) {
  return String(orderId || "").replace(/^ORD-/, "");
}

function shortJobLabel(jobId) {
  const value = String(jobId || "");

  if (value.includes("-")) {
    return value.split("-").pop();
  }

  return value;
}

function shortJobFullLabel(jobId) {
  return String(jobId || "").replace(/^ORD-/, "");
}

function renderJobPot() {
  const jobList = document.querySelector(".job-list");
  jobList.innerHTML = `
<div class="job-header">
    <div>
      <input type="checkbox" id="selectVisibleJobsCheckbox" title="Select visible jobs" />
    </div>
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
      const shouldSplitStops =
        currentTypeFilter === "all" && includeDepot === false;

      const stopsToRender = [];

      if (shouldSplitStops) {
        if (!movement.collect.isDepot) {
          stopsToRender.push({
            side: "collect",
            cd: "C",
            stop: movement.collect,
          });
        }

        if (!movement.deliver.isDepot) {
          stopsToRender.push({
            side: "deliver",
            cd: "D",
            stop: movement.deliver,
          });
        }
      } else {
        stopsToRender.push({
          side: "movement",
          cd: null,
          stop: null,
        });
      }

      stopsToRender.forEach((stopView) => {
        const row = document.createElement("div");
        row.className = "job-row";
        row.setAttribute("draggable", "true");
        row.dataset.job = movement.jobId;
        row.dataset.move = index;
        row.dataset.movementId = movement.id;

        if (stopView.side !== "movement") {
          row.dataset.stopSide = stopView.side;
          row.classList.add("job-row-stop-view");
        }

        if (stopView.side === "movement") {
          row.innerHTML = `
          <div class="col select-col">
            <input type="checkbox" class="row-select" data-id="${movement.id}" />
          </div>

          <div class="col order-id">
          <button class="order-link" data-order="${movement.orderId}">${shortOrderLabel(movement.orderId)}</button>
          <span class="order-job-separator">|</span>
          <button class="job-leg-link" data-job="${movement.jobId}">${shortJobLabel(movement.jobId)}</button>
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
        }

        if (stopView.side !== "movement") {
          row.innerHTML = `
          <div class="col select-col">
            <input type="checkbox" class="row-select" data-id="${movement.id}" />
          </div>

          <div class="col order-id">
          <button class="order-link" data-order="${movement.orderId}">${shortOrderLabel(movement.orderId)}</button>
          <span class="order-job-separator">|</span>
          <button class="job-leg-link" data-job="${movement.jobId}">${shortJobLabel(movement.jobId)}</button>
          </div>

          <div class="col mode-col">
            <span class="mode-badge ${movement.planningMode === "direct" ? "mode-direct" : "mode-depot"}">
              ${movement.planningMode === "direct" ? "Direct" : "Via Depot"}
            </span>
          </div>

          <div class="col cd-col">${stopView.cd}</div>
          <div class="col date-col">${stopView.stop.date || ""}</div>
          <div class="col time-col">${stopView.stop.time || ""}</div>
          <div class="col location-col">${stopView.stop.location || ""}</div>
          <div class="col detail-col">${stopView.stop.detail || ""}</div>

          <div class="col cd-col"></div>
          <div class="col date-col"></div>
          <div class="col time-col"></div>
          <div class="col location-col"></div>
          <div class="col detail-col"></div>

          <div class="col pallets-col">${movement.pallets} pallets</div>

          <div class="col run-assign">
            <input class="run-input" type="text" placeholder="Run" />
            <button class="unassign-btn" title="Unallocate">×</button>
          </div>
        `;
        }

        group.appendChild(row);
      });
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

let currentDateFilter = "today";
let currentTypeFilter = "all";
let includeDepot = true;

let currentSearchTerm = "";

let customDateFilter = "";

let selectedMovements = new Set();
let selectedOrderMovements = new Set();

let runEditMode = false;

let activeModeFilter = "all";

let activeOrderId = null;
let showFullOrderMovements = false;

let activeJobLegId = null;

let editingJobNumber = null;

let currentRunDate = new Date().toISOString().split("T")[0];

let includePreviousEveningRuns = false;

const movementAllocations = {};

let addressBook = [];

async function loadAddressBookFromSupabase() {
  const accountId = await getAccountId();

  const { data, error } = await supabaseClient
    .from("addresses")
    .select("id, fast_lookup, name, town, postcode")
    .eq("account_id", accountId)
    .eq("active", true)
    .order("fast_lookup", { ascending: true });

  if (error) {
    console.error("Error loading address book:", error);
    return;
  }

  addressBook = data || [];

  const list = document.getElementById("addressLookupList");
  if (!list) return;

  list.innerHTML = "";

  addressBook.forEach((address) => {
    const option = document.createElement("option");
    option.value = address.name;
    option.label = `${address.fast_lookup || ""} — ${address.town || ""} ${address.postcode || ""}`;
    list.appendChild(option);
  });
}

function findAddressByName(name) {
  return addressBook.find(
    (address) => address.name.toLowerCase() === name.toLowerCase(),
  );
}

// renderJobPot();
// attachJobPotEvents();

document.getElementById("runDatePicker").value = currentRunDate;

const runCards = document.querySelectorAll(".run-card");
const jobRows = document.querySelectorAll(".job-row");
const routeEmpty = document.querySelector(".route-empty");
const routeList = document.querySelector(".route-list");
const activeRouteHeader = document.querySelector(".bottom .panel-header h2");
const jobPot = document.querySelector(".job-list");

let boxSelectActive = false;
let boxSelectPending = false;
let boxSelectStartX = 0;
let boxSelectStartY = 0;
let selectionBoxEl = null;

function updateBoxSelection(e) {
  if (boxSelectPending && !boxSelectActive) {
    const movedEnough =
      Math.abs(e.clientX - boxSelectStartX) > 6 ||
      Math.abs(e.clientY - boxSelectStartY) > 6;

    if (!movedEnough) return;

    boxSelectActive = true;
    selectionBoxEl = document.createElement("div");
    selectionBoxEl.className = "selection-box";
    document.body.appendChild(selectionBoxEl);
  }

  if (!boxSelectActive || !selectionBoxEl) return;

  const left = Math.min(boxSelectStartX, e.clientX);
  const top = Math.min(boxSelectStartY, e.clientY);
  const width = Math.abs(e.clientX - boxSelectStartX);
  const height = Math.abs(e.clientY - boxSelectStartY);

  selectionBoxEl.style.left = `${left}px`;
  selectionBoxEl.style.top = `${top}px`;
  selectionBoxEl.style.width = `${width}px`;
  selectionBoxEl.style.height = `${height}px`;

  const box = selectionBoxEl.getBoundingClientRect();

  document.querySelectorAll(".job-row, .job-leg-row").forEach((row) => {
    const group = row.closest(".job-group");

    const isVisible =
      row.style.display !== "none" &&
      (!group || group.style.display !== "none");

    if (!isVisible) return;

    const rowBox = row.getBoundingClientRect();

    const overlaps =
      rowBox.left < box.right &&
      rowBox.right > box.left &&
      rowBox.top < box.bottom &&
      rowBox.bottom > box.top;

    row.classList.toggle("box-selecting", overlaps);
  });
}

function finishBoxSelection() {
  if (boxSelectPending && !boxSelectActive) {
    const jobPotMovementId = jobPot.dataset.shiftClickMovementId;
    const orderMovementId = routeList.dataset.shiftClickMovementId;

    if (jobPotMovementId) {
      const row = document.querySelector(
        `.job-row[data-movement-id="${jobPotMovementId}"]`,
      );

      if (row) {
        toggleJobPotRowSelection(row);
      }
    }

    if (orderMovementId) {
      toggleOrderMovementSelection(orderMovementId);
    }

    jobPot.dataset.shiftClickMovementId = "";
    routeList.dataset.shiftClickMovementId = "";
    boxSelectPending = false;
    return;
  }

  if (!boxSelectActive) return;

  document.querySelectorAll(".job-row.box-selecting").forEach((row) => {
    const checkbox = row.querySelector(".row-select");
    const movementId = row.dataset.movementId;

    if (!checkbox || !movementId) return;

    checkbox.checked = true;
    selectedMovements.add(movementId);

    row.classList.remove("box-selecting");
  });

  document.querySelectorAll(".job-leg-row.box-selecting").forEach((row) => {
    const movementId = row.dataset.movementId;

    if (!movementId) return;

    setOrderMovementSelection(movementId, true);
  });

  if (selectionBoxEl) {
    selectionBoxEl.remove();
    selectionBoxEl = null;
  }

  jobPot.dataset.shiftClickMovementId = "";
  routeList.dataset.shiftClickMovementId = "";

  boxSelectActive = false;
  boxSelectPending = false;
  updateSelectedCount();
}

function toggleJobPotRowSelection(row) {
  const movementId = row.dataset.movementId;
  if (!movementId) return;

  const checkbox = row.querySelector(".row-select");
  const shouldSelect = !selectedMovements.has(movementId);

  if (checkbox) {
    checkbox.checked = shouldSelect;
  }

  if (shouldSelect) {
    selectedMovements.add(movementId);
  } else {
    selectedMovements.delete(movementId);
  }

  updateSelectedCount();
}

function toggleOrderMovementSelection(movementId) {
  if (!movementId) return;

  const shouldSelect = !selectedOrderMovements.has(movementId);

  setOrderMovementSelection(movementId, shouldSelect);

  updateSelectedCount();
}

function getCombinedSelectedMovementIds() {
  return Array.from(new Set([...selectedMovements, ...selectedOrderMovements]));
}

function setOrderMovementSelection(movementId, shouldSelect) {
  if (!movementId) return;

  document
    .querySelectorAll(`.order-row-select[data-movement-id="${movementId}"]`)
    .forEach((checkbox) => {
      checkbox.checked = shouldSelect;
    });

  document
    .querySelectorAll(`.job-leg-row[data-movement-id="${movementId}"]`)
    .forEach((row) => {
      row.classList.remove("selected");
      row.classList.remove("box-selecting");
    });

  if (shouldSelect) {
    selectedOrderMovements.add(movementId);
  } else {
    selectedOrderMovements.delete(movementId);
  }
}

jobPot.addEventListener("mousedown", (e) => {
  if (!e.shiftKey) return;

  if (
    e.target.closest("button") ||
    e.target.closest("input") ||
    e.target.closest(".run-input")
  ) {
    return;
  }

  e.preventDefault();

  boxSelectPending = true;
  boxSelectActive = false;
  boxSelectStartX = e.clientX;
  boxSelectStartY = e.clientY;

  const clickedRow = e.target.closest(".job-row");

  jobPot.dataset.shiftClickMovementId = clickedRow
    ? clickedRow.dataset.movementId || ""
    : "";
});

routeList.addEventListener("mousedown", (e) => {
  if (!e.shiftKey) return;

  if (
    e.target.closest("button") ||
    e.target.closest("input") ||
    e.target.closest(".run-input")
  ) {
    return;
  }

  const clickedOrderRow = e.target.closest(".job-leg-row");

  if (!clickedOrderRow) return;

  e.preventDefault();

  boxSelectPending = true;
  boxSelectActive = false;
  boxSelectStartX = e.clientX;
  boxSelectStartY = e.clientY;

  routeList.dataset.shiftClickMovementId =
    clickedOrderRow.dataset.movementId || "";
});

document.querySelectorAll(".layout-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const layout = btn.dataset.layout;
    const app = document.querySelector(".app");

    app.classList.remove("layout-pot", "layout-default", "layout-runs");
    app.classList.add(`layout-${layout}`);

    document
      .querySelectorAll(".layout-btn")
      .forEach((b) => b.classList.remove("active"));

    btn.classList.add("active");
  });
});

document.addEventListener("mousemove", updateBoxSelection);

document.addEventListener("mouseup", finishBoxSelection);

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

    if (dragPayload.type === "jobMovementGroup") {
      dragPayload.movementIds.forEach((movementId) => {
        assignMovementToRun(movementId, runId);
      });
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
      const movementId = row.dataset.movementId;

      const combinedSelected = getCombinedSelectedMovementIds();

      if (
        combinedSelected.includes(movementId) &&
        combinedSelected.length > 1
      ) {
        dragPayload = {
          type: "jobMovementGroup",
          movementIds: combinedSelected,
        };
      } else {
        dragPayload = {
          type: "jobMovement",
          movementId,
        };
      }
    });

    row.addEventListener("dblclick", () => {
      const movementId = row.dataset.movementId;
      const runId = movementAllocations[movementId];

      if (!runId) return;

      focusRun(runId);
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

  const selectVisibleCheckbox = document.getElementById(
    "selectVisibleJobsCheckbox",
  );

  if (selectVisibleCheckbox) {
    selectVisibleCheckbox.addEventListener("change", (e) => {
      const shouldSelect = e.target.checked;

      document.querySelectorAll(".job-row").forEach((row) => {
        const group = row.closest(".job-group");

        const isVisible =
          row.style.display !== "none" &&
          (!group || group.style.display !== "none");

        if (!isVisible) return;

        const checkbox = row.querySelector(".row-select");
        const movementId = row.dataset.movementId;

        if (!checkbox || !movementId) return;

        checkbox.checked = shouldSelect;

        if (shouldSelect) {
          selectedMovements.add(movementId);
        } else {
          selectedMovements.delete(movementId);
        }
      });

      updateSelectedCount();
    });
  }

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

  document.querySelectorAll(".job-leg-link").forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      renderJobLegDetail(button.dataset.job);
    });
  });
}

document.getElementById("jobSearchInput").addEventListener("input", (e) => {
  currentSearchTerm = e.target.value.trim().toLowerCase();
  applyJobPotFilters();
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
    updateUnallocateDropzoneVisibility();
  }
}

function focusRun(runId) {
  const run = runs[runId];

  if (!run) {
    alert("Run not found.");
    return;
  }

  currentRunDate = normaliseDate(run.date);
  document.getElementById("runDatePicker").value = currentRunDate;

  document
    .querySelectorAll(".run-date-btn")
    .forEach((b) => b.classList.remove("active"));

  activeRunId = runId;

  renderRuns();

  document.querySelectorAll(".run-card").forEach((card) => {
    card.classList.toggle("active", card.dataset.run === activeRunId);
  });

  renderActiveRun();
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

  if (activeRunId) {
    renderActiveRun();
  } else if (activeJobLegId) {
    renderJobLegDetail(activeJobLegId);
  } else if (activeOrderId) {
    renderOrderDetail(activeOrderId);
  }

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

  if (activeRunId) {
    renderActiveRun();
  } else if (activeJobLegId) {
    renderJobLegDetail(activeJobLegId);
  } else if (activeOrderId) {
    renderOrderDetail(activeOrderId);
  }

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

function closeBottomPanel() {
  activeOrderId = null;
  activeJobLegId = null;
  activeRunId = null;

  selectedOrderMovements.clear();

  activeRouteHeader.textContent = "Active Route";
  routeList.innerHTML = "";
  routeList.style.display = "none";

  routeEmpty.style.display = "block";
  routeEmpty.innerText = "Select a run to begin planning";

  document.querySelectorAll(".selected").forEach((el) => {
    el.classList.remove("selected");
  });

  renderRuns();
  renderJobPot();
  attachJobPotEvents();
  updateJobPotAllocationDisplay();
  updateUnallocateDropzoneVisibility();
}

function updateUnallocateDropzoneVisibility() {
  const shouldShow =
    activeRunId || activeJobLegId || (activeOrderId && showFullOrderMovements);

  unallocateDropzone.style.display = shouldShow ? "block" : "none";
}

function renderOrderDetail(orderId) {
  activeJobLegId = null;
  activeOrderId = orderId;

  const orderMovements = movements.filter((m) => m.orderId === orderId);

  const jobsById = {};

  orderMovements.forEach((movement) => {
    if (!jobsById[movement.jobId]) {
      jobsById[movement.jobId] = {
        jobId: movement.jobId,
        orderId: movement.orderId,
        planningMode: movement.planningMode,
        pallets: movement.pallets,
        runIds: new Set(),
        movements: [],
      };
    }

    jobsById[movement.jobId].movements.push(movement);

    if (movement.runId) {
      jobsById[movement.jobId].runIds.add(movement.runId);
    }
  });

  const orderJobs = Object.values(jobsById);

  activeRouteHeader.innerHTML = `
    <span>Order Detail — ${orderId}</span>

    <label style="font-size: 12px; font-weight: 500; display: inline-flex; align-items: center; gap: 6px; margin-left: 12px;">
      <input type="checkbox" id="fullOrderToggle" ${showFullOrderMovements ? "checked" : ""} />
      Full order movements
    </label>

    <button id="addJobBtn" class="primary-btn" data-order="${orderId}">Add Job</button>
    <button id="closeOrderBtn" class="danger-btn" data-order="${orderId}">×</button>
  `;

  routeEmpty.style.display = "none";
  routeList.style.display = "flex";

  routeList.innerHTML = `
    <div class="order-detail-header order-detail-row">
      <div>Job</div>
      <div>Mode</div>
      <div>C/D</div>
      <div>Date</div>
      <div>Time</div>
      <div>From</div>
      <div>Detail</div>
      <div>C/D</div>
      <div>Date</div>
      <div>Time</div>
      <div>To</div>
      <div>Detail</div>
      <div>Pallets</div>
      <div>Load</div>
    </div>
  `;

  if (showFullOrderMovements) {
    renderFullOrderMovementRows(orderMovements, orderId);
  } else {
    orderJobs.forEach((job) => {
      const firstMovement = job.movements[0];
      const lastMovement = job.movements[job.movements.length - 1];

      const row = document.createElement("div");
      row.className = "order-detail-row";

      const modeLabel = job.planningMode === "direct" ? "Direct" : "Via Depot";
      const modeClass =
        job.planningMode === "direct" ? "mode-direct" : "mode-depot";

      const runBadges = Array.from(job.runIds)
        .map((runId) => {
          const plannerRunNo = runs[runId]?.plannerRunNo;

          return `
          <button class="run-badge run-jump-btn" data-run-id="${runId}">
            ${plannerRunNo ? String(Number(plannerRunNo)) : runId}
          </button>
        `;
        })
        .join("");

      row.innerHTML = `
      <div class="order-row-inner">
        <button class="job-delete-btn" data-job="${job.jobId}">×</button>
        <button class="job-link" data-job="${job.jobId}">
          ${job.jobId}
        </button>
      </div>

      <div>
        <span class="mode-badge ${modeClass}">
          ${modeLabel}
        </span>
      </div>

      <div>C</div>
      <div>${firstMovement.collect.date || ""}</div>
      <div>${firstMovement.collect.time || ""}</div>
      <div>${firstMovement.collect.location || ""}</div>
      <div>${firstMovement.collect.detail || ""}</div>

      <div>D</div>
      <div>${lastMovement.deliver.date || ""}</div>
      <div>${lastMovement.deliver.time || ""}</div>
      <div>${lastMovement.deliver.location || ""}</div>
      <div>${lastMovement.deliver.detail || ""}</div>

      <div>${job.pallets || ""} pallets</div>

      <div>
        ${runBadges || `<span class="run-badge run-badge--empty">Unallocated</span>`}
      </div>
    `;

      routeList.appendChild(row);
    });
    updateUnallocateDropzoneVisibility();
  }

  const fullOrderToggle = document.getElementById("fullOrderToggle");

  if (fullOrderToggle) {
    fullOrderToggle.addEventListener("change", (e) => {
      showFullOrderMovements = e.target.checked;
      renderOrderDetail(orderId);
    });
  }

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

  document.querySelectorAll(".run-jump-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      focusRun(button.dataset.runId);
    });
  });

  document.querySelectorAll(".job-delete-btn").forEach((button) => {
    button.addEventListener("click", async (e) => {
      e.stopPropagation();
      await softDeleteJob(button.dataset.job);
    });
  });

  const closeOrderBtn = document.getElementById("closeOrderBtn");

  if (closeOrderBtn) {
    closeOrderBtn.addEventListener("click", closeBottomPanel);
  }
}

function renderFullOrderMovementRows(orderMovements, orderId) {
  routeList.innerHTML = `
    <div class="route-header job-leg-grid">
      <div><input type="checkbox" id="orderSelectAll" /></div>
      <div>Job</div>
      <div>C/D</div>
      <div>Date / Time</div>
      <div>Depot</div>
      <div>Detail</div>
      <div>Pallets</div>
      <div>Load</div>
    </div>
  `;

  orderMovements.forEach((movement, index) => {
    const runId = movement.runId || movementAllocations[movement.id];

    const runLabel =
      runId && runs[runId]?.plannerRunNo
        ? String(Number(runs[runId].plannerRunNo))
        : runId && runs[runId]
          ? runId
          : "Unallocated";

    const isAllocated = !!runId && !!runs[runId];

    const makeOrderLegRow = (type, stop, seq) => {
      const row = document.createElement("div");
      row.className = `route-stop job-leg-grid job-leg-row ${isAllocated ? "allocated" : ""}`;
      row.setAttribute("draggable", "true");

      row.dataset.movementId = movement.id;
      row.dataset.orderId = orderId;
      row.dataset.runId = runId || "";

      row.innerHTML = `
        <div>
          <input 
            type="checkbox" 
            class="order-row-select" 
            data-movement-id="${movement.id}" 
          />
        </div>
        <div>${shortJobFullLabel(movement.jobId)}</div>
        <div>${type === "collect" ? "C" : "D"}</div>
        <div>${formatDateTime(stop.date, stop.time)}</div>
        <div>${stop.location || ""}</div>
        <div>${stop.detail || ""}</div>
        <div class="pallets-col">${movement.pallets || ""} pallets</div>
        <div class="col run-assign">
          ${
            isAllocated
              ? `
                <input class="run-input" type="text" value="${runLabel}" />
                <button class="unassign-btn" title="Unallocate">×</button>
              `
              : `
                <input class="run-input" type="text" placeholder="Run" />
              `
          }
        </div>
      `;

      const checkbox = row.querySelector(".order-row-select");

        if (checkbox) {
          checkbox.addEventListener("change", () => {
            const movementId = checkbox.dataset.movementId;
            const isChecked = checkbox.checked;

            setOrderMovementSelection(movementId, isChecked);
            updateSelectedCount();
          });
        }

      if (showFullOrderMovements) {
        row.addEventListener("dragstart", () => {
          const combinedSelected = getCombinedSelectedMovementIds();

          if (
            combinedSelected.includes(movement.id) &&
            combinedSelected.length > 1
          ) {
            dragPayload = {
              type: "jobMovementGroup",
              movementIds: combinedSelected,
            };
          } else {
            dragPayload = {
              type: "jobMovement",
              movementId: movement.id,
            };
          }
        });
      }

      row.addEventListener("dblclick", () => {
        if (!isAllocated || !runId) return;
        focusRun(runId);
      });

      row.querySelector(".unassign-btn")?.addEventListener("click", (e) => {
        e.stopPropagation();
        unallocateMovement(movement.id);
      });

      row.querySelector(".run-input")?.addEventListener("keydown", (e) => {
        if (e.key !== "Enter") return;

        const runValue = e.target.value.trim();

        if (!runs[runValue]) {
          alert("That run does not exist.");
          e.target.value = "";
          return;
        }

        assignMovementToRun(movement.id, runValue);
      });

      return row;
    };

    const previousMovement = orderMovements[index - 1];
    const nextMovement = orderMovements[index + 1];

    const isFirstMovementForJob =
      !previousMovement || previousMovement.jobId !== movement.jobId;

    const isLastMovementForJob =
      !nextMovement || nextMovement.jobId !== movement.jobId;

    const collectRow = makeOrderLegRow("collect", movement.collect, index + 1);
    const deliverRow = makeOrderLegRow("deliver", movement.deliver, index + 1);

    if (isFirstMovementForJob) {
      collectRow.classList.add("order-job-group-start");
    }

    if (isLastMovementForJob) {
      deliverRow.classList.add("order-job-group-end");
    }

    routeList.appendChild(collectRow);
    routeList.appendChild(deliverRow);
  });
    updateUnallocateDropzoneVisibility();
}

function renderActiveRun() {
  if (!activeRunId) return;

  const run = runs[activeRunId];

  activeRouteHeader.innerHTML = `
    Active Route — Run 
    <input 
      id="activeRunJumpInput" 
      class="active-run-jump-input" 
      value="${run.plannerRunNo ? String(Number(run.plannerRunNo)) : ""}" 
    />
    : ${run.name}
  `;

  const activeRunInput = document.getElementById("activeRunJumpInput");

  if (activeRunInput) {
    activeRunInput.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;

      const runId = resolveRunIdFromInput(e.target.value);

      if (!runId) {
        alert("That run does not exist.");
        return;
      }

      e.target.blur();
      focusRun(runId);
    });
  }

  routeList.innerHTML = "";

  if (!run.stops.length) {
    routeEmpty.style.display = "block";
    routeEmpty.textContent = "No stops planned yet";
    routeList.style.display = "none";
    updateUnallocateDropzoneVisibility();
    return;
  }

  routeEmpty.style.display = "none";
  routeList.style.display = "flex";

  routeList.innerHTML = `
    <div class="route-header job-leg-grid">
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

    updateUnallocateDropzoneVisibility();
}

function updateJobPotAllocationDisplay() {
  document.querySelectorAll(".job-row").forEach((row) => {
    const movementId = row.dataset.movementId;
    const input = row.querySelector(".run-input");

    if (!input) return;

    const runId =
      movementAllocations[movementId] ||
      movements.find((m) => m.id === movementId)?.runId;

    const hasValidRun = !!runId && !!runs[runId];

    if (hasValidRun) {
      input.value = runs[runId]?.plannerRunNo
        ? String(Number(runs[runId].plannerRunNo))
        : "";

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

  if (!dragPayload) return;

  if (dragPayload.type === "routeMovement") {
    unallocateMovement(dragPayload.movementKey);
  }

  if (dragPayload.type === "jobMovement") {
    unallocateMovement(dragPayload.movementId);
  }

  if (dragPayload.type === "jobMovementGroup") {
    dragPayload.movementIds.forEach((movementId) => {
      unallocateMovement(movementId);
    });
  }

  dragPayload = null;

  clearSelectedMovements();

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

function normaliseFilterDate(value) {
  if (!value) return "";

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }

  // Convert DD/MM/YYYY to YYYY-MM-DD
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split("/");
    return `${year}-${month}-${day}`;
  }

  return value;
}

function formatDateLabel(value) {
  if (!value) return "";

  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function updateActiveDateLabel(selectedDate) {
  const label = document.getElementById("activeDateLabel");
  if (!label) return;

  if (!selectedDate) {
    label.textContent = "Showing: All dates";
    return;
  }

  label.textContent = `Showing: ${formatDateLabel(selectedDate)}`;
}

function updateActiveRunDateLabel(selectedDate) {
  const label = document.getElementById("activeRunDateLabel");
  if (!label) return;

  if (!selectedDate) {
    label.textContent = "";
    return;
  }

  label.textContent = `Runs: ${formatDateLabel(selectedDate)}`;
}

function updateNoJobsMessage() {
  const existingMessage = document.getElementById("jobPotEmptyMessage");

  if (existingMessage) {
    existingMessage.remove();
  }

  const hasVisibleRows = Array.from(document.querySelectorAll(".job-row")).some(
    (row) => {
      const group = row.closest(".job-group");

      return (
        row.style.display !== "none" &&
        (!group || group.style.display !== "none")
      );
    },
  );

  if (hasVisibleRows) return;

  jobPot.insertAdjacentHTML(
    "beforeend",
    `<div id="jobPotEmptyMessage" class="job-empty-message">
      No jobs match this filter
    </div>`,
  );
}

function refreshJobPot() {
  renderJobPot();
  attachJobPotEvents();
  updateJobPotAllocationDisplay();
}

function applyJobPotFilters() {
  const now = new Date();

  const today = now.toISOString().split("T")[0];

  const tomorrowDate = new Date();
  tomorrowDate.setDate(now.getDate() + 1);
  const tomorrow = tomorrowDate.toISOString().split("T")[0];

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

      if (!movement) return false;

      const isAllocated = !!movement.runId;

      if (currentFilter === "unallocated" && isAllocated) return false;
      if (currentFilter === "allocated" && !isAllocated) return false;

      const searchableText = [
        movement.orderId,
        movement.jobId,
        movement.planningMode,
        movement.collect?.location,
        movement.collect?.detail,
        movement.collect?.date,
        movement.collect?.time,
        movement.deliver?.location,
        movement.deliver?.detail,
        movement.deliver?.date,
        movement.deliver?.time,
        movement.pallets,
      ]
        .join(" ")
        .toLowerCase();

      if (currentSearchTerm && !searchableText.includes(currentSearchTerm)) {
        return false;
      }

      const collectDate = normaliseFilterDate(movement.collect.date);
      const deliverDate = normaliseFilterDate(movement.deliver.date);

      const matchesCollectDate = !selectedDate || collectDate === selectedDate;
      const matchesDeliverDate = !selectedDate || deliverDate === selectedDate;

      // Special stop-view rows:
      // All + Include depot OFF creates separate C and D rows.
      // These must filter by their own stop date, not the whole movement.
      if (row.dataset.stopSide === "collect") {
        if (movement.collect.isDepot) return false;
        return matchesCollectDate;
      }

      if (row.dataset.stopSide === "deliver") {
        if (movement.deliver.isDepot) return false;
        return matchesDeliverDate;
      }

      if (currentTypeFilter === "collect") {
        if (!includeDepot && movement.collect.isDepot) return false;
        return matchesCollectDate;
      }

      if (currentTypeFilter === "deliver") {
        if (!includeDepot && movement.deliver.isDepot) return false;
        return matchesDeliverDate;
      }

      const collectVisible =
        (includeDepot || !movement.collect.isDepot) && matchesCollectDate;

      const deliverVisible =
        (includeDepot || !movement.deliver.isDepot) && matchesDeliverDate;

      return collectVisible || deliverVisible;
    });

    if (currentView === "jobs") {
      const anyVisible = rowMatches.some(Boolean);

      group.style.display = anyVisible ? "block" : "none";

      rows.forEach((row, index) => {
        row.style.display = rowMatches[index] ? "grid" : "none";
      });

      return;
    }

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

  updateActiveDateLabel(selectedDate);
  updateNoJobsMessage();
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
    attachJobPotEvents();
    updateJobPotAllocationDisplay();
  });
});

// TYPE
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

    refreshJobPot();
  });
});

// DEPOT
document.getElementById("toggleDepot").addEventListener("change", (e) => {
  includeDepot = e.target.checked;
  refreshJobPot();
});

document.getElementById("jobDatePicker").addEventListener("change", (e) => {
  customDateFilter = e.target.value;
  currentDateFilter = "custom";

  document
    .querySelectorAll(".date-btn")
    .forEach((b) => b.classList.remove("active"));

  applyJobPotFilters();
});

function shiftDateInput(inputId, days) {
  const picker = document.getElementById(inputId);
  if (!picker) return;

  const baseDate = picker.value || new Date().toISOString().split("T")[0];

  const [year, month, day] = baseDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  date.setDate(date.getDate() + days);

  const nextValue = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

  picker.value = nextValue;
  picker.dispatchEvent(new Event("change"));
}

document.getElementById("jobDatePrevBtn")?.addEventListener("click", () => {
  shiftDateInput("jobDatePicker", -1);
});

document.getElementById("jobDateNextBtn")?.addEventListener("click", () => {
  shiftDateInput("jobDatePicker", 1);
});

document.getElementById("runDatePrevBtn")?.addEventListener("click", () => {
  shiftDateInput("runDatePicker", -1);
});

document.getElementById("runDateNextBtn")?.addEventListener("click", () => {
  shiftDateInput("runDatePicker", 1);
});

document.getElementById("assignSelectedBtn").addEventListener("click", () => {
  const runId = document.getElementById("bulkRunInput").value.trim();

  if (!runs[runId]) {
    alert("Invalid run");
    return;
  }

  getCombinedSelectedMovementIds().forEach((movementId) => {
    assignMovementToRun(movementId, runId);
  });

  clearAllSelectedMovements();
});

function clearSelectedMovements() {
  selectedMovements.clear();
  selectedOrderMovements.clear();

  document.querySelectorAll(".row-select").forEach((checkbox) => {
    checkbox.checked = false;
  });

  document.querySelectorAll(".order-row-select").forEach((checkbox) => {
    checkbox.checked = false;
  });

  document.querySelectorAll(".job-row, .job-leg-row").forEach((row) => {
    row.classList.remove("selected");
    row.classList.remove("box-selecting");
  });

  const selectVisibleCheckbox = document.getElementById(
    "selectVisibleJobsCheckbox",
  );

  if (selectVisibleCheckbox) {
    selectVisibleCheckbox.checked = false;
  }

  const orderSelectAll = document.getElementById("orderSelectAll");

  if (orderSelectAll) {
    orderSelectAll.checked = false;
  }

  updateSelectedCount();
}


function updateSelectedCount() {
  const countEl = document.getElementById("selectedCount");
  if (!countEl) return;

  const totalSelected = getCombinedSelectedMovementIds().length;

  countEl.textContent = `${totalSelected} selected`;
}

async function saveAllocationToSupabase(movementId, runId) {
  try {
    const run = runs[runId];

    if (!run) {
      console.error("Cannot save allocation. Run not found:", runId);
      return;
    }

    const accountId = await getAccountId();

    const { error: upsertError } = await supabaseClient
      .from("run_allocations")
      .upsert(
        {
          account_id: accountId,
          run_id: run.id,
          movement_id: movementId,
          stop_sequence: 1,
        },
        {
          onConflict: "movement_id",
        },
      );

    if (upsertError) throw upsertError;

    console.log("Saved allocation:", movementId, "→ run", run.plannerRunNo);
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

    const runId = allocation.runs?.id;

    if (!runId || !runs[runId]) return;

    movement.runId = runId;
    movementAllocations[movement.id] = runId;

    if (!runs[runId].stops.some((s) => s.movementKey === movement.id)) {
      runs[runId].stops.push({
        movementKey: movement.id,
        type: "collect",
        sequence: allocation.collect_sequence || allocation.stop_sequence || 1,
        ...movement.collect,
        jobId: movement.jobId,
        orderId: movement.orderId,
        pallets: movement.pallets,
      });

      runs[runId].stops.push({
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

function clearAllSelectedMovements() {
  selectedMovements.clear();
  selectedOrderMovements.clear();

  document.querySelectorAll(".row-select").forEach((checkbox) => {
    checkbox.checked = false;
  });

  document.querySelectorAll(".order-row-select").forEach((checkbox) => {
    checkbox.checked = false;
  });

  document.querySelectorAll(".job-row, .job-leg-row").forEach((row) => {
    row.classList.remove("selected");
    row.classList.remove("box-selecting");
  });

  const selectVisibleCheckbox = document.getElementById("selectVisibleJobsCheckbox");
  if (selectVisibleCheckbox) {
    selectVisibleCheckbox.checked = false;
  }

  const orderSelectAll = document.getElementById("orderSelectAll");
  if (orderSelectAll) {
    orderSelectAll.checked = false;
  }

  updateSelectedCount();
}

document.getElementById("clearSelectionBtn").addEventListener("click", () => {
  clearAllSelectedMovements();
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
    status,
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
      if (job.status === "deleted") return;

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

loadAddressBookFromSupabase();

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

  const selectedCollectionAddress = findAddressByName(
    document.getElementById("wizardCollectName").value.trim(),
  );

  const selectedDeliveryAddress = findAddressByName(
    document.getElementById("wizardDeliverName").value.trim(),
  );

  if (!selectedCollectionAddress) {
    alert("Please select a valid collection address from the address book.");
    return;
  }

  if (!selectedDeliveryAddress) {
    alert("Please select a valid delivery address from the address book.");
    return;
  }

  const wizardData = {
    collectionAddressId: selectedCollectionAddress.id,
    deliveryAddressId: selectedDeliveryAddress.id,
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

    if (!wizardData.collectionAddressId || !wizardData.deliveryAddressId) {
      alert(
        "Collection and delivery addresses must be selected from the address book.",
      );
      return;
    }

    const accountId = await getAccountId();

    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .select("id, order_number")
      .eq("order_number", orderNumber)
      .single();

    if (orderError) throw orderError;

    const collectionAddress = {
      id: wizardData.collectionAddressId,
    };

    const deliveryAddress = {
      id: wizardData.deliveryAddressId,
    };

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
        .eq("is_depot", true)
        .eq("active", true)
        .order("fast_lookup", { ascending: true })
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

    // 2. Update job core fields (including address IDs)
    const { error: updateJobError } = await supabaseClient
      .from("jobs")
      .update({
        pallets: wizardData.pallets,
        planning_mode: wizardData.planningMode,

        collection_address_id: wizardData.collectionAddressId,
        delivery_address_id: wizardData.deliveryAddressId,

        collection_date: wizardData.collectionDate || null,
        collection_time: wizardData.collectionTime || null,
        delivery_date: wizardData.deliveryDate || null,
        delivery_time: wizardData.deliveryTime || null,
      })
      .eq("id", job.id);

    if (updateJobError) throw updateJobError;

    // 3. Delete old movements + allocations
    const { data: existingMovements } = await supabaseClient
      .from("movements")
      .select("id")
      .eq("job_id", job.id);

    if (existingMovements && existingMovements.length) {
      const movementIds = existingMovements.map((m) => m.id);

      // delete allocations
      await supabaseClient
        .from("run_allocations")
        .delete()
        .in("movement_id", movementIds);

      // clear local state
      movementIds.forEach((movementId) => {
        delete movementAllocations[movementId];

        const movement = movements.find((m) => m.id === movementId);
        if (movement) {
          movement.runId = null;
        }
      });

      // remove stops from runs
      Object.values(runs).forEach((run) => {
        run.stops = run.stops.filter(
          (stop) => !movementIds.includes(stop.movementKey),
        );
      });

      // delete movements
      await supabaseClient.from("movements").delete().eq("job_id", job.id);
    }

    // 4. Recreate movements using NEW address IDs (THIS IS THE FIX)
    if (wizardData.planningMode === "direct") {
      const { error: movementError } = await supabaseClient
        .from("movements")
        .insert({
          account_id: accountId,
          job_id: job.id,
          movement_type: "direct",
          from_address_id: wizardData.collectionAddressId,
          to_address_id: wizardData.deliveryAddressId,
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
        .eq("is_depot", true)
        .eq("active", true)
        .order("fast_lookup", { ascending: true })
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
            from_address_id: wizardData.collectionAddressId,
            to_address_id: depotAddress.id,
            sequence_no: 1,
            active: true,
          },
          {
            account_id: accountId,
            job_id: job.id,
            movement_type: "from_depot",
            from_address_id: depotAddress.id,
            to_address_id: wizardData.deliveryAddressId,
            sequence_no: 2,
            active: true,
          },
        ]);

      if (movementError) throw movementError;
    }

    alert("Job updated");

    closeOrderWizard();

    await loadPlannerDataFromSupabase();

    renderRuns();
    updateJobPotAllocationDisplay();

    if (activeOrderId) {
      renderOrderDetail(activeOrderId);
    }

    if (activeRunId) {
      renderActiveRun();
    }
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
      <div class="run-ref">
        #${run.plannerRunNo ? String(Number(run.plannerRunNo)) : ""}
        ${runEditMode ? `<button class="run-delete-btn" data-run-id="${run.id}">×</button>` : ""}
      </div>
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

    card
      .querySelector(".run-delete-btn")
      ?.addEventListener("click", async (e) => {
        e.stopPropagation();
        await softDeleteRun(run.id);
      });

    card.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    card.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!dragPayload) return;

      if (dragPayload.type === "jobMovement") {
        assignMovementToRun(dragPayload.movementId, run.id);
      }

      if (dragPayload.type === "jobMovementGroup") {
        dragPayload.movementIds.forEach((movementId) => {
          assignMovementToRun(movementId, run.id);
        });
      }

      if (dragPayload.type === "routeMovement") {
        moveMovementToRun(dragPayload.movementKey, run.id);
      }

      dragPayload = null;
      clearSelectedMovements();
      unallocateDropzone.classList.remove("visible", "drag-over");
    });

    runList.appendChild(card);
  });

  updateActiveRunDateLabel(currentRunDate);
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
      currentRunDate = new Date().toISOString().split("T")[0];
    }

    if (btn.dataset.runDate === "tomorrow") {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      currentRunDate = tomorrow.toISOString().split("T")[0];
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
  const accountId = await getAccountId();

  const existingRunNumbers = Object.values(runs)
    .map((run) => Number(run.plannerRunNo))
    .filter((number) => Number.isFinite(number));

  const nextRunNumber =
    existingRunNumbers.length > 0 ? Math.max(...existingRunNumbers) + 1 : 1;

  const plannerRunNo = String(nextRunNumber).padStart(7, "0");

  const { data, error } = await supabaseClient
    .from("runs")
    .insert([
      {
        account_id: accountId,
        run_name: "New Run",
        run_date: currentRunDate,
        start_time: null,
        planner_run_no: plannerRunNo,
        status: "active",
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating run:", error);
    alert("Could not create run. Check console.");
    return;
  }

  runs[data.id] = {
    id: data.id,
    name: data.run_name || "New Run",
    date: data.run_date,
    startTime: data.start_time ? data.start_time.slice(0, 5) : "",
    plannerRunNo: data.planner_run_no,
    stops: [],
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
    .or("status.is.null,status.neq.deleted")
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
      stops: [],
    };
  });

  renderRuns();
}

async function softDeleteRun(runId) {
  const run = runs[runId];

  if (!run) return;

  const hasStops = run.stops && run.stops.length > 0;

  if (hasStops) {
    const proceed = confirm(
      "This run has jobs allocated to it. Delete the run and return all jobs to the pot?",
    );

    if (!proceed) return;

    const movementIds = [...new Set(run.stops.map((stop) => stop.movementKey))];

    const { error: allocationError } = await supabaseClient
      .from("run_allocations")
      .delete()
      .eq("run_id", runId);

    if (allocationError) {
      console.error("Could not remove run allocations:", allocationError);
      alert("Could not remove allocations. Run was not deleted.");
      return;
    }

    movementIds.forEach((movementId) => {
      delete movementAllocations[movementId];

      const movement = movements.find((m) => m.id === movementId);
      if (movement) {
        movement.runId = null;
      }
    });
  }

  const { error } = await supabaseClient
    .from("runs")
    .update({ status: "deleted" })
    .eq("id", runId);

  if (error) {
    console.error("Could not delete run:", error);
    alert("Could not delete run.");
    return;
  }

  delete runs[runId];

  if (activeRunId === runId) {
    activeRunId = null;
    activeRouteHeader.textContent = "Active Route";
    routeEmpty.style.display = "block";
    routeEmpty.textContent = "Select a run to begin planning";
    routeList.style.display = "none";
    routeList.innerHTML = "";
  }

  renderRuns();
  updateJobPotAllocationDisplay();
}

async function softDeleteJob(jobNumber) {
  const confirmDelete = confirm(
    `Delete job ${jobNumber}? It will be removed from runs and hidden from the planner.`,
  );

  if (!confirmDelete) return;

  try {
    const jobMovements = movements.filter((m) => m.jobId === jobNumber);
    const movementIds = jobMovements.map((m) => m.id);

    if (movementIds.length > 0) {
      const { error: allocationError } = await supabaseClient
        .from("run_allocations")
        .delete()
        .in("movement_id", movementIds);

      if (allocationError) throw allocationError;
    }

    Object.values(runs).forEach((run) => {
      run.stops = run.stops.filter(
        (stop) => !movementIds.includes(stop.movementKey),
      );
    });

    movementIds.forEach((movementId) => {
      delete movementAllocations[movementId];
    });

    const { error: jobError } = await supabaseClient
      .from("jobs")
      .update({ status: "deleted" })
      .eq("job_number", jobNumber);

    if (jobError) throw jobError;

    movements = movements.filter((m) => m.jobId !== jobNumber);

    // check if order now empty
    const hasJobsLeft = movements.some((m) => m.orderId === activeOrderId);

    if (!hasJobsLeft && activeOrderId) {
      try {
        await supabaseClient.from("orders").update({ status: "deleted" });
        await deleteOrderIfEmpty(activeOrderId);

        console.log(`Order ${activeOrderId} marked as deleted`);
      } catch (err) {
        console.error("Failed to update order status:", err);
      }
    }

    cleanupEmptyOrderView();

    renderJobPot();
    attachJobPotEvents();
    updateJobPotAllocationDisplay();

    if (activeOrderId) {
      renderOrderDetail(activeOrderId);
    } else if (activeRunId) {
      renderActiveRun();
    }

    alert(`Job ${jobNumber} deleted`);
  } catch (err) {
    console.error("Could not delete job:", err);
    alert("Could not delete job. Check console.");
  }
}

function cleanupEmptyOrderView() {
  const hasJobs = movements.some((m) => m.orderId === activeOrderId);

  if (!hasJobs) {
    activeOrderId = null;
    routeList.innerHTML = "";
    routeEmpty.style.display = "block";
  }
}

async function deleteOrderIfEmpty(orderNumber) {
  const hasJobs = movements.some((m) => m.orderId === orderNumber);

  if (hasJobs) return;

  try {
    const { error } = await supabaseClient
      .from("orders")
      .update({ status: "deleted" })
      .eq("order_number", orderNumber);

    if (error) {
      console.error("Order delete failed:", error);
    } else {
      console.log(`Order ${orderNumber} marked as deleted`);
    }
  } catch (err) {
    console.error("Failed to delete order:", err);
  }
}

function renderJobLegDetail(jobId) {
  activeJobLegId = jobId;

  const jobMovements = movements.filter((m) => m.jobId === jobId);

  if (!jobMovements.length) {
    alert("No legs found for this job.");
    return;
  }

  const firstMovement = jobMovements[0];

  activeOrderId = firstMovement.orderId;
  activeRunId = null;

  activeRouteHeader.innerHTML = `
      Job Legs — ${shortJobFullLabel(jobId)}
      <button id="backToOrderBtn" class="primary-btn" data-order="${firstMovement.orderId}">
        Back to Order
      </button>
      <button id="closeLegBtn" class="danger-btn">×</button>
    `;

  routeEmpty.style.display = "none";
  routeList.style.display = "flex";

  routeList.innerHTML = `
    <div class="route-header job-leg-grid">
      <div>Seq</div>
      <div>Job</div>
      <div>C/D</div>
      <div>Date / Time</div>
      <div>Depot</div>
      <div>Detail</div>
      <div>Pallets</div>
      <div>Load</div>
    </div>
  `;

  jobMovements.forEach((movement, index) => {
    const runId = movement.runId || movementAllocations[movement.id];
    const runLabel =
      runId && runs[runId]?.plannerRunNo
        ? String(Number(runs[runId].plannerRunNo))
        : runId && runs[runId]
          ? runId
          : "Unallocated";

    const isAllocated = !!runId && !!runs[runId];

    const makeLegRow = (type, stop, seq) => {
      const row = document.createElement("div");
      row.className = `route-stop job-leg-grid job-leg-row ${isAllocated ? "allocated" : ""}`;
      row.setAttribute("draggable", "true");
      row.dataset.movementId = movement.id;
      row.dataset.runId = runId || "";

      row.innerHTML = `
        <div>${seq}</div>
        <div>${shortJobFullLabel(movement.jobId)}</div>
        <div>${type === "collect" ? "C" : "D"}</div>
        <div>${formatDateTime(stop.date, stop.time)}</div>
        <div>${stop.location || ""}</div>
        <div>${stop.detail || ""}</div>
        <div class="pallets-col">${movement.pallets || ""} pallets</div>
        <div class="col run-assign">
          ${
            isAllocated
              ? `
                <input class="run-input" type="text" value="${runLabel}" readonly />
                <button class="unassign-btn" title="Unallocate">×</button>
              `
              : `
                <input class="run-input" type="text" placeholder="Run" readonly />
              `
          }
        </div>
      `;

      row.addEventListener("dragstart", () => {
        dragPayload = {
          type: "jobMovement",
          movementId: movement.id,
        };
      });

      row.addEventListener("dblclick", () => {
        if (!isAllocated || !runId) return;
        focusRun(runId);
      });

      row.querySelector(".unassign-btn")?.addEventListener("click", (e) => {
        e.stopPropagation();
        unallocateMovement(movement.id);
      });

      return row;
    };

    routeList.appendChild(makeLegRow("collect", movement.collect, index + 1));
    routeList.appendChild(makeLegRow("deliver", movement.deliver, index + 1));
  });

  document.getElementById("backToOrderBtn")?.addEventListener("click", () => {
    renderOrderDetail(firstMovement.orderId);
  });

  const closeLegBtn = document.getElementById("closeLegBtn");

  if (closeLegBtn) {
    closeLegBtn.addEventListener("click", closeBottomPanel);
  }
}
