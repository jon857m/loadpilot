const jobs = {
  1001: [
    {
      key: "1001-0",
      pallets: 2,
      collect: {
        location: "Manchester",
        date: "2026-04-27",
        time: "09:00",
        isDepot: false
      },
      deliver: {
        location: "Depot",
        date: "2026-04-27",
        time: "17:00",
        isDepot: true
      }
    },
    {
      key: "1001-1",
      pallets: 2,
      collect: {
        location: "Depot",
        date: "2026-04-28",
        time: "07:00",
        isDepot: true
      },
      deliver: {
        location: "Oxford",
        date: "2026-04-28",
        time: "11:00",
        isDepot: false
      }
    }
  ],

  1002: [
    {
      key: "1002-0",
      pallets: 4,
      collect: {
        location: "Bristol",
        date: "2026-04-27",
        time: "10:00",
        isDepot: false
      },
      deliver: {
        location: "Swindon",
        date: "2026-04-27",
        time: "13:00",
        isDepot: false
      }
    }
  ]
};

function renderJobPot() {
  const jobList = document.querySelector(".job-list");
jobList.innerHTML = `
  <div class="job-header">
    <div></div>
    <div>Order</div>

    <div class="collect-head">C/D</div>
    <div class="collect-head">Depot</div>
    <div class="collect-head">Detail</div>

    <div class="deliver-head">C/D</div>
    <div class="deliver-head">Depot</div>
    <div class="deliver-head">Detail</div>

    <div>Pallets</div>
    <div>Load</div>
  </div>
`;

  const grouped = {};

  movements.forEach((movement) => {
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

        <div class="col cd-col collect-col">C</div>
        <div class="col location-col collect-col">${movement.collect.location}</div>
        <div class="col detail-col collect-col">${movement.collect.detail}</div>

        <div class="col cd-col deliver-col">D</div>
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
      isDepot: false
    },
    deliver: {
      location: "Depot",
      detail: "Tesco Oxford Ex Coop Manchester",
      date: "2026-04-27",
      time: "17:00",
      isDepot: true
    },
    runId: null
  },
  {
    id: "1001-1",
    orderId: "ORD-5001",
    jobId: "1001",
    customer: "Tesco",
    pallets: 2,
    collect: {
      location: "Depot",
      detail:"Tesco Oxford Ex Coop Manchester",
      date: "2026-04-28",
      time: "07:00",
      isDepot: true
    },
    deliver: {
      location: "Tesco Oxford",
      detail: "Ex Coop Manchester",
      date: "2026-04-28",
      time: "11:00",
      isDepot: false
    },
    runId: null
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
      isDepot: false
    },
    deliver: {
      location: "Aldi Swindon",
      detail: "Ex Aldi Bristol",
      date: "2026-04-27",
      time: "13:00",
      isDepot: false
    },
    runId: null
  }
];

function formatStop(action, stop) {
  return `${action} ${stop.location} ${stop.detail}`;
}

const runs = {
  1: { name: "Manchester Multi Drop", stops: [] },
  2: { name: "South West", stops: [] },
  3: { name: "London", stops: [] }
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

const movementAllocations = {};

renderJobPot();
attachJobPotEvents();

const runCards = document.querySelectorAll(".run-card");
const jobRows = document.querySelectorAll(".job-row");
const routeEmpty = document.querySelector(".route-empty");
const routeList = document.querySelector(".route-list");
const activeRouteHeader = document.querySelector(".bottom .panel-header h2");
const jobPot = document.querySelector(".job-list");

const unallocateDropzone = document.querySelector(".unallocate-dropzone");

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
        movementId: row.dataset.movementId
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
  activeRunId = runId;

  runCards.forEach((c) => c.classList.remove("active"));
  document.querySelector(`.run-card[data-run="${runId}"]`)?.classList.add("active");

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
    pallets: movement.pallets
    });

    runs[runId].stops.push({
    movementKey: movement.id,
    type: "deliver",
    ...movement.deliver,
    jobId: movement.jobId,
    orderId: movement.orderId,
    pallets: movement.pallets
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
  const orderMovements = movements.filter((m) => m.orderId === orderId);

  activeRouteHeader.textContent = `Order Detail — ${orderId}`;

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
      <div>${movement.jobId}</div>
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
}

function renderActiveRun() {
  if (!activeRunId) return;

  const run = runs[activeRunId];

  activeRouteHeader.textContent = `Active Route — Run ${activeRunId}: ${run.name}`;
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
        stopIndex: index
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

    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    applyJobPotFilters();
  });
});

document.querySelectorAll(".view-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentView = btn.dataset.view;

    document.querySelectorAll(".view-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    applyJobPotFilters();
  });
});

function applyJobPotFilters() {
  const today = "2026-04-27";
  const tomorrow = "2026-04-28";

  const selectedDate =
    currentDateFilter === "today" ? today :
    currentDateFilter === "tomorrow" ? tomorrow :
    currentDateFilter === "custom" ? customDateFilter :
    null;

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
        if (selectedDate && movement.collect.date !== selectedDate) return false;
        return true;
      }

      // DELIVERIES MODE
      if (currentTypeFilter === "deliver") {
        if (!includeDepot && movement.deliver.isDepot) return false;
        if (selectedDate && movement.deliver.date !== selectedDate) return false;
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

    document.querySelectorAll(".date-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    applyJobPotFilters();
  });
});

// TYPE
document.querySelectorAll(".type-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentTypeFilter = btn.dataset.type;

    document.querySelectorAll(".type-btn").forEach(b => b.classList.remove("active"));
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

  document.querySelectorAll(".date-btn").forEach(b => b.classList.remove("active"));

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
    // 1. Get the real Supabase run (we only have 1 for now)
    const { data: runData, error: runError } = await supabaseClient
      .from("runs")
      .select("id")
      .limit(1)
      .single();

    if (runError) throw runError;

    const runDbId = runData.id;

    // 2. Insert allocation
    const { error: insertError } = await supabaseClient
      .from("run_allocations")
      .insert({
        account_id: await getAccountId(),
        run_id: runDbId,
        movement_id: movementId,
        stop_sequence: 1
      });

    if (insertError) throw insertError;

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
  const { data, error } = await supabaseClient
    .from("run_allocations")
    .select(`
      movement_id,
      runs (
        id,
        run_name
      )
    `);

  if (error) {
    console.error("Error loading allocations:", error);
    return;
  }

  data.forEach((allocation) => {
    const movement = movements.find((m) => m.id === allocation.movement_id);
    if (!movement) return;

    movement.runId = "1";
    movementAllocations[movement.id] = "1";

    if (!runs["1"].stops.some((s) => s.movementKey === movement.id)) {
      runs["1"].stops.push({
        movementKey: movement.id,
        type: "collect",
        ...movement.collect,
        jobId: movement.jobId,
        orderId: movement.orderId,
        pallets: movement.pallets
      });

      runs["1"].stops.push({
        movementKey: movement.id,
        type: "deliver",
        ...movement.deliver,
        jobId: movement.jobId,
        orderId: movement.orderId,
        pallets: movement.pallets
      });
    }
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

async function loadPlannerDataFromSupabase() {
  const { data, error } = await supabaseClient
    .from("orders")
.select(`
  id,
  order_number,
  jobs (
    id,
    job_number,
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
      sequence_no
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
        transformedMovements.push({
          id: movement.id,
          orderId: order.order_number,
          jobId: job.job_number,
          customer: "Demo Customer",
          pallets: 1,
            collect: {
            location: job.collection_address?.name || "Collection address",
            detail: `${job.collection_address?.town || ""} ${job.collection_address?.postcode || ""}`.trim(),
            date: "2026-04-27",
            time: "09:00",
            isDepot: false
            },
            deliver: {
            location: job.delivery_address?.name || "Delivery address",
            detail: `${job.delivery_address?.town || ""} ${job.delivery_address?.postcode || ""}`.trim(),
            date: "2026-04-27",
            time: "17:00",
            isDepot: false
            },
          runId: null
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