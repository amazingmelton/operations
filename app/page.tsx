"use client";

import { FormEvent, useMemo, useState } from "react";

type TaskType = "Pickup" | "Delivery" | "Container";
type TaskStatus =
  | "Pending"
  | "Ready for Pickup"
  | "Ready for Delivery"
  | "Completed"
  | "Delayed"
  | "Cancelled";

type Task = {
  id: number;
  invoice: string;
  type: TaskType;
  description: string;
  items: string;
  warehouse: string;
  assignee: string;
  date: string;
  displayDate: string;
  status: TaskStatus;
  priority?: boolean;
};

type Transfer = {
  id: number;
  from: string;
  to: string;
  items: string;
  requester: string;
  requestedAt: string;
  status: "Requested" | "Approved" | "Rejected" | "Ready for Transfer" | "Received";
};

const warehouses = [
  {
    name: "Sunshine",
    label: "Head Office",
    address: "616 Somerville Road, Sunshine West VIC 3020",
    member: "Dipu Rai",
    initials: "DR",
  },
  {
    name: "Hoppers Crossing",
    label: "Warehouse",
    address: "24 Dunlop Road, Hoppers Crossing VIC 3029",
    member: "Ryan Kim",
    initials: "RK",
  },
  {
    name: "Melton",
    label: "Warehouse",
    address: "13 Zal Street, Melton VIC 3337",
    member: "Sam D'Souza",
    initials: "SD",
  },
];

const initialTasks: Task[] = [
  {
    id: 1,
    invoice: "INV-10482",
    type: "Delivery",
    description: "Calacatta Cloud tiles for Hawthorn Renovations",
    items: "24 boxes tiles · 5 bags adhesive",
    warehouse: "Sunshine",
    assignee: "Dipu Rai",
    date: "2026-07-25",
    displayDate: "25 Jul · 9:00 AM",
    status: "Ready for Delivery",
    priority: true,
  },
  {
    id: 2,
    invoice: "INV-10479",
    type: "Pickup",
    description: "Travertine Sand collection",
    items: "14 boxes tiles",
    warehouse: "Hoppers Crossing",
    assignee: "Ryan Kim",
    date: "2026-07-25",
    displayDate: "25 Jul · 10:30 AM",
    status: "Pending",
  },
  {
    id: 3,
    invoice: "INV-10471",
    type: "Container",
    description: "Port Melbourne import arrival",
    items: "18 pallets · Packing list attached",
    warehouse: "Sunshine",
    assignee: "Dipu Rai",
    date: "2026-07-25",
    displayDate: "25 Jul · 1:00 PM",
    status: "Delayed",
  },
  {
    id: 4,
    invoice: "INV-10467",
    type: "Delivery",
    description: "Stone Grey tiles for Melton Build Group",
    items: "31 boxes tiles · 8 bags grout",
    warehouse: "Melton",
    assignee: "Sam D'Souza",
    date: "2026-07-26",
    displayDate: "26 Jul · 8:30 AM",
    status: "Pending",
  },
  {
    id: 5,
    invoice: "INV-10461",
    type: "Pickup",
    description: "Carrara White customer collection",
    items: "8 boxes tiles",
    warehouse: "Melton",
    assignee: "Sam D'Souza",
    date: "2026-07-24",
    displayDate: "24 Jul · 3:15 PM",
    status: "Completed",
  },
  {
    id: 6,
    invoice: "INV-10455",
    type: "Delivery",
    description: "Ivory limestone site delivery",
    items: "2 pallets · 42 boxes",
    warehouse: "Hoppers Crossing",
    assignee: "Ryan Kim",
    date: "2026-07-24",
    displayDate: "24 Jul · 11:00 AM",
    status: "Completed",
  },
];

const initialTransfers: Transfer[] = [
  {
    id: 1,
    from: "Sunshine",
    to: "Melton",
    items: "Calacatta Cloud — 12 boxes",
    requester: "Sam D'Souza",
    requestedAt: "Today · 8:42 AM",
    status: "Requested",
  },
  {
    id: 2,
    from: "Hoppers Crossing",
    to: "Sunshine",
    items: "Travertine Sand — 8 boxes",
    requester: "Dipu Rai",
    requestedAt: "Yesterday · 4:16 PM",
    status: "Approved",
  },
  {
    id: 3,
    from: "Sunshine",
    to: "Hoppers Crossing",
    items: "Stone Grey — 16 boxes · Grout — 6 bags",
    requester: "Ryan Kim",
    requestedAt: "23 Jul · 2:20 PM",
    status: "Ready for Transfer",
  },
];

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "⌂" },
  { id: "tasks", label: "Tasks", icon: "✓" },
  { id: "transfers", label: "Stock Transfers", icon: "⇄" },
  { id: "warehouses", label: "Warehouses", icon: "▦" },
];

const typeIcons: Record<TaskType, string> = {
  Pickup: "□",
  Delivery: "▰",
  Container: "▤",
};

function StatusPill({ status }: { status: TaskStatus | Transfer["status"] }) {
  return <span className={`status-pill status-${status.toLowerCase().replaceAll(" ", "-")}`}>{status}</span>;
}

export default function Home() {
  const [section, setSection] = useState("dashboard");
  const [mode, setMode] = useState<"manager" | "warehouse">("manager");
  const [mobileNav, setMobileNav] = useState(false);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<TaskType>("Pickup");
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [transfers, setTransfers] = useState<Transfer[]>(initialTransfers);
  const [warehouseFilter, setWarehouseFilter] = useState("All warehouses");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [search, setSearch] = useState("");

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tasks.filter(
      (task) =>
        (warehouseFilter === "All warehouses" || task.warehouse === warehouseFilter) &&
        (statusFilter === "All statuses" || task.status === statusFilter) &&
        (!query ||
          task.invoice.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query) ||
          task.assignee.toLowerCase().includes(query)),
    );
  }, [tasks, warehouseFilter, statusFilter, search]);

  const counts = {
    pending: tasks.filter((task) => task.status === "Pending").length,
    completed: tasks.filter((task) => task.status === "Completed").length,
    delayed: tasks.filter((task) => task.status === "Delayed").length,
    transfers: transfers.filter((transfer) => transfer.status === "Requested").length,
  };

  function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const warehouse = String(form.get("warehouse"));
    const warehouseRecord = warehouses.find((item) => item.name === warehouse) ?? warehouses[0];
    const date = String(form.get("date"));
    const invoice = String(form.get("invoice")).trim();
    const description = String(form.get("description")).trim();
    const item = String(form.get("item")).trim();
    const qty = String(form.get("quantity")).trim();

    setTasks((current) => [
      {
        id: Date.now(),
        invoice,
        type: selectedType,
        description,
        items: `${item} · Qty ${qty}`,
        warehouse,
        assignee: warehouseRecord.member,
        date,
        displayDate: `${date.split("-").reverse().slice(0, 2).join("/")} · Scheduled`,
        status: "Pending",
        priority: form.get("priority") === "on",
      },
      ...current,
    ]);
    setNewTaskOpen(false);
    setSection("tasks");
  }

  function updateTaskStatus(id: number, status: TaskStatus) {
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, status } : task)));
  }

  function updateTransfer(id: number, status: Transfer["status"]) {
    setTransfers((current) =>
      current.map((transfer) => (transfer.id === id ? { ...transfer, status } : transfer)),
    );
  }

  const pageTitle =
    mode === "warehouse"
      ? "My tasks"
      : section === "dashboard"
        ? "Operations overview"
        : section === "tasks"
          ? "All tasks"
          : section === "transfers"
            ? "Stock transfers"
            : "Warehouses";

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "mobile-open" : ""}`}>
        <div className="brand-lockup">
          <div className="brand-tile">AT</div>
          <div>
            <strong>Amazing Tiles</strong>
            <span>Operations</span>
          </div>
        </div>

        <nav className="side-nav" aria-label="Main navigation">
          <p>Workspace</p>
          {navItems.map((item) => (
            <button
              className={section === item.id && mode === "manager" ? "active" : ""}
              key={item.id}
              onClick={() => {
                setSection(item.id);
                setMode("manager");
                setMobileNav(false);
              }}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
              {item.id === "transfers" && counts.transfers > 0 ? (
                <b className="nav-count">{counts.transfers}</b>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="warehouse-summary">
          <p>Warehouse network</p>
          <strong>3 locations online</strong>
          <div className="online-row">
            <span />
            <span />
            <span />
          </div>
        </div>

        <button className="help-link">
          <span>?</span>
          Help &amp; support
        </button>
      </aside>

      {mobileNav ? <button className="nav-scrim" onClick={() => setMobileNav(false)} aria-label="Close menu" /> : null}

      <div className="main-frame">
        <header className="topbar">
          <button className="menu-button" onClick={() => setMobileNav(true)} aria-label="Open navigation">
            ☰
          </button>
          <div className="view-switcher" aria-label="Switch prototype view">
            <button className={mode === "manager" ? "active" : ""} onClick={() => setMode("manager")}>
              Manager view
            </button>
            <button className={mode === "warehouse" ? "active" : ""} onClick={() => setMode("warehouse")}>
              Warehouse view
            </button>
          </div>
          <div className="top-actions">
            <button className="icon-button" aria-label="Notifications">
              ◌
              <i />
            </button>
            <div className="profile">
              <span>AM</span>
              <div>
                <strong>Alex Morgan</strong>
                <small>Operations Manager</small>
              </div>
            </div>
          </div>
        </header>

        <main className="content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">Saturday, 25 July</p>
              <h1>{pageTitle}</h1>
              <p>
                {mode === "warehouse"
                  ? "Your Sunshine tasks are pinned first. Update them as work progresses."
                  : section === "dashboard"
                    ? "Everything moving through your warehouse network today."
                    : section === "tasks"
                      ? "Plan, assign and track every pickup, delivery and container."
                      : section === "transfers"
                        ? "Review requests and keep stock moving between locations."
                        : "Your three active Amazing Tiles warehouse locations."}
              </p>
            </div>
            {mode === "manager" && section !== "warehouses" ? (
              <button className="new-task-button" onClick={() => setNewTaskOpen(true)}>
                <span>＋</span> New task
              </button>
            ) : null}
          </div>

          {mode === "warehouse" ? (
            <WarehouseDashboard tasks={tasks} onStatus={updateTaskStatus} />
          ) : section === "dashboard" ? (
            <Dashboard
              tasks={tasks}
              transfers={transfers}
              counts={counts}
              onSeeTasks={() => setSection("tasks")}
              onTransfer={() => setSection("transfers")}
            />
          ) : section === "tasks" ? (
            <TasksView
              tasks={filteredTasks}
              warehouseFilter={warehouseFilter}
              statusFilter={statusFilter}
              search={search}
              setWarehouseFilter={setWarehouseFilter}
              setStatusFilter={setStatusFilter}
              setSearch={setSearch}
            />
          ) : section === "transfers" ? (
            <TransfersView transfers={transfers} onUpdate={updateTransfer} />
          ) : (
            <WarehousesView tasks={tasks} />
          )}
        </main>
      </div>

      {newTaskOpen ? (
        <NewTaskModal
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          onClose={() => setNewTaskOpen(false)}
          onSubmit={createTask}
        />
      ) : null}
    </div>
  );
}

function Dashboard({
  tasks,
  transfers,
  counts,
  onSeeTasks,
  onTransfer,
}: {
  tasks: Task[];
  transfers: Transfer[];
  counts: { pending: number; completed: number; delayed: number; transfers: number };
  onSeeTasks: () => void;
  onTransfer: () => void;
}) {
  const metrics = [
    { label: "Pending today", value: counts.pending, note: "Across 3 warehouses", icon: "◷", tone: "blue" },
    { label: "Completed today", value: counts.completed, note: "2 completed on time", icon: "✓", tone: "green" },
    { label: "Delayed", value: counts.delayed, note: "Needs your attention", icon: "!", tone: "red" },
    { label: "Stock requests", value: counts.transfers, note: "Waiting for approval", icon: "⇄", tone: "amber" },
  ];

  return (
    <>
      <section className="metric-grid" aria-label="Operations summary">
        {metrics.map((metric) => (
          <article className="summary-card" key={metric.label}>
            <div className={`metric-icon ${metric.tone}`}>{metric.icon}</div>
            <div>
              <p>{metric.label}</p>
              <strong>{String(metric.value).padStart(2, "0")}</strong>
              <span className={metric.tone === "red" ? "attention" : ""}>{metric.note}</span>
            </div>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="panel task-panel">
          <PanelHeading eyebrow="Live operations" title="Today’s task board" action="View all tasks" onAction={onSeeTasks} />
          <TaskTable tasks={tasks.slice(0, 5)} />
        </article>

        <aside className="panel transfer-panel">
          <PanelHeading eyebrow="Approvals" title="Stock requests" action="Open queue" onAction={onTransfer} />
          <div className="transfer-mini-list">
            {transfers.slice(0, 2).map((transfer) => (
              <button onClick={onTransfer} key={transfer.id}>
                <div className="route-badge">⇄</div>
                <div>
                  <strong>
                    {transfer.from} <span>→</span> {transfer.to}
                  </strong>
                  <p>{transfer.items}</p>
                  <small>{transfer.requestedAt}</small>
                </div>
                <span className="arrow">›</span>
              </button>
            ))}
          </div>
          <div className="network-note">
            <div className="stacked-avatars">
              {warehouses.map((warehouse) => (
                <span key={warehouse.name}>{warehouse.initials}</span>
              ))}
            </div>
            <p>
              <strong>All teams online</strong>
              <span>Last update 4 minutes ago</span>
            </p>
          </div>
        </aside>
      </section>
    </>
  );
}

function PanelHeading({
  eyebrow,
  title,
  action,
  onAction,
}: {
  eyebrow: string;
  title: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="panel-heading">
      <div>
        <p>{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      <button onClick={onAction}>
        {action} <span>→</span>
      </button>
    </div>
  );
}

function TaskTable({ tasks }: { tasks: Task[] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Invoice</th>
            <th>Type</th>
            <th>Warehouse</th>
            <th>Assigned to</th>
            <th>Scheduled</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td>
                <strong>{task.invoice}</strong>
                {task.priority ? <span className="priority-dot" title="Priority task" /> : null}
              </td>
              <td>
                <span className={`type-tag type-${task.type.toLowerCase()}`}>
                  <i>{typeIcons[task.type]}</i>
                  {task.type}
                </span>
              </td>
              <td>{task.warehouse}</td>
              <td>
                <span className="assignee-cell">
                  <i>{task.assignee.split(" ").map((name) => name[0]).join("")}</i>
                  {task.assignee}
                </span>
              </td>
              <td>{task.displayDate}</td>
              <td>
                <StatusPill status={task.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TasksView({
  tasks,
  warehouseFilter,
  statusFilter,
  search,
  setWarehouseFilter,
  setStatusFilter,
  setSearch,
}: {
  tasks: Task[];
  warehouseFilter: string;
  statusFilter: string;
  search: string;
  setWarehouseFilter: (value: string) => void;
  setStatusFilter: (value: string) => void;
  setSearch: (value: string) => void;
}) {
  return (
    <section className="panel full-panel">
      <div className="filter-bar">
        <label className="search-field">
          <span>⌕</span>
          <input
            aria-label="Search tasks"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search invoice, description or team member"
          />
        </label>
        <label>
          <span>Warehouse</span>
          <select value={warehouseFilter} onChange={(event) => setWarehouseFilter(event.target.value)}>
            <option>All warehouses</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.name}>{warehouse.name}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Status</span>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option>All statuses</option>
            <option>Pending</option>
            <option>Ready for Pickup</option>
            <option>Ready for Delivery</option>
            <option>Completed</option>
            <option>Delayed</option>
            <option>Cancelled</option>
          </select>
        </label>
      </div>
      {tasks.length ? <TaskTable tasks={tasks} /> : <div className="empty-state">No tasks match these filters.</div>}
    </section>
  );
}

function TransfersView({
  transfers,
  onUpdate,
}: {
  transfers: Transfer[];
  onUpdate: (id: number, status: Transfer["status"]) => void;
}) {
  return (
    <div className="transfer-page-grid">
      <section className="panel approval-panel">
        <div className="section-title">
          <div>
            <span>{transfers.filter((transfer) => transfer.status === "Requested").length}</span>
            <div>
              <p>Manager queue</p>
              <h2>Awaiting approval</h2>
            </div>
          </div>
          <small>Review quantities before approving</small>
        </div>
        <div className="approval-list">
          {transfers
            .filter((transfer) => transfer.status === "Requested")
            .map((transfer) => (
              <article key={transfer.id}>
                <div className="transfer-route">
                  <span>{transfer.from.slice(0, 2).toUpperCase()}</span>
                  <div>
                    <i />
                    <b>→</b>
                    <i />
                  </div>
                  <span>{transfer.to.slice(0, 2).toUpperCase()}</span>
                </div>
                <div className="transfer-copy">
                  <p>
                    {transfer.from} <span>to</span> {transfer.to}
                  </p>
                  <h3>{transfer.items}</h3>
                  <small>
                    Requested by {transfer.requester} · {transfer.requestedAt}
                  </small>
                </div>
                <div className="approval-actions">
                  <button className="approve" onClick={() => onUpdate(transfer.id, "Approved")}>
                    Approve
                  </button>
                  <button onClick={() => onUpdate(transfer.id, "Rejected")}>Reject</button>
                </div>
              </article>
            ))}
          {transfers.every((transfer) => transfer.status !== "Requested") ? (
            <div className="empty-state">All transfer requests have been reviewed.</div>
          ) : null}
        </div>
      </section>

      <section className="panel tracking-panel">
        <div className="section-title simple">
          <div>
            <p>Transfer activity</p>
            <h2>In progress</h2>
          </div>
        </div>
        {transfers
          .filter((transfer) => transfer.status !== "Requested")
          .map((transfer) => (
            <article className="tracking-card" key={transfer.id}>
              <div>
                <strong>
                  {transfer.from} → {transfer.to}
                </strong>
                <p>{transfer.items}</p>
              </div>
              <StatusPill status={transfer.status} />
              {transfer.status === "Approved" ? (
                <button onClick={() => onUpdate(transfer.id, "Ready for Transfer")}>Mark ready</button>
              ) : transfer.status === "Ready for Transfer" ? (
                <button onClick={() => onUpdate(transfer.id, "Received")}>Confirm received</button>
              ) : null}
            </article>
          ))}
      </section>
    </div>
  );
}

function WarehousesView({ tasks }: { tasks: Task[] }) {
  return (
    <section className="warehouse-grid">
      {warehouses.map((warehouse) => {
        const warehouseTasks = tasks.filter(
          (task) => task.warehouse === warehouse.name && task.status !== "Completed",
        );
        return (
          <article className="warehouse-card" key={warehouse.name}>
            <div className="warehouse-card-top">
              <div className="warehouse-icon">▦</div>
              <StatusPill status="Approved" />
            </div>
            <p>{warehouse.label}</p>
            <h2>{warehouse.name}</h2>
            <address>{warehouse.address}</address>
            <div className="warehouse-stats">
              <div>
                <strong>{warehouseTasks.length}</strong>
                <span>Active tasks</span>
              </div>
              <div>
                <strong>{warehouseTasks.filter((task) => task.status.includes("Ready")).length}</strong>
                <span>Ready now</span>
              </div>
            </div>
            <div className="warehouse-member">
              <span>{warehouse.initials}</span>
              <div>
                <strong>{warehouse.member}</strong>
                <small>Warehouse team member</small>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}

function WarehouseDashboard({
  tasks,
  onStatus,
}: {
  tasks: Task[];
  onStatus: (id: number, status: TaskStatus) => void;
}) {
  const [scope, setScope] = useState<"mine" | "all">("mine");
  const visible = scope === "mine" ? tasks.filter((task) => task.warehouse === "Sunshine") : tasks;

  return (
    <>
      <div className="warehouse-toolbar">
        <div className="scope-toggle">
          <button className={scope === "mine" ? "active" : ""} onClick={() => setScope("mine")}>
            My warehouse
          </button>
          <button className={scope === "all" ? "active" : ""} onClick={() => setScope("all")}>
            All warehouses
          </button>
        </div>
        <span>
          <i /> Sunshine · Online
        </span>
      </div>
      <section className="mobile-task-list">
        <div className="date-divider">
          <span>Today</span>
          <i />
          <small>{visible.filter((task) => task.date === "2026-07-25").length} tasks</small>
        </div>
        {visible.map((task) => (
          <article className={task.warehouse === "Sunshine" ? "own-task" : ""} key={task.id}>
            <div className={`task-type-icon type-${task.type.toLowerCase()}`}>{typeIcons[task.type]}</div>
            <div className="mobile-task-copy">
              <div>
                <strong>{task.invoice}</strong>
                {task.priority ? <span className="priority-label">Priority</span> : null}
              </div>
              <h3>{task.description}</h3>
              <p>{task.items}</p>
              <div className="task-meta">
                <span>◷ {task.displayDate}</span>
                <span>▦ {task.warehouse}</span>
              </div>
            </div>
            <div className="task-card-actions">
              <StatusPill status={task.status} />
              {task.warehouse === "Sunshine" && task.status === "Pending" ? (
                <button
                  onClick={() =>
                    onStatus(task.id, task.type === "Pickup" ? "Ready for Pickup" : "Ready for Delivery")
                  }
                >
                  Mark ready
                </button>
              ) : task.warehouse === "Sunshine" && task.status.includes("Ready") ? (
                <button onClick={() => onStatus(task.id, "Completed")}>Complete</button>
              ) : null}
            </div>
          </article>
        ))}
      </section>
    </>
  );
}

function NewTaskModal({
  selectedType,
  setSelectedType,
  onClose,
  onSubmit,
}: {
  selectedType: TaskType;
  setSelectedType: (type: TaskType) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="modal-layer" role="dialog" aria-modal="true" aria-labelledby="new-task-title">
      <button className="modal-backdrop" onClick={onClose} aria-label="Close new task form" />
      <div className="task-modal">
        <div className="modal-header">
          <div>
            <p>Operations</p>
            <h2 id="new-task-title">Create new task</h2>
          </div>
          <button onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="type-tabs">
          {(["Pickup", "Delivery", "Container"] as TaskType[]).map((type) => (
            <button
              className={selectedType === type ? "active" : ""}
              key={type}
              onClick={() => setSelectedType(type)}
            >
              <span>{typeIcons[type]}</span>
              {type}
            </button>
          ))}
        </div>
        <form onSubmit={onSubmit}>
          <div className="form-grid">
            <label>
              Invoice number
              <input name="invoice" placeholder="e.g. INV-10483" required />
            </label>
            <label>
              Scheduled date
              <input name="date" type="date" defaultValue="2026-07-26" required />
            </label>
            <label className="full">
              Description
              <textarea
                name="description"
                placeholder="Short summary of the order or operational work"
                required
              />
            </label>
            <label>
              Item
              <input name="item" placeholder="e.g. Calacatta Cloud tiles" required />
            </label>
            <label>
              Quantity
              <input name="quantity" type="number" min="1" placeholder="24" required />
            </label>
            <label>
              Warehouse
              <select name="warehouse" defaultValue="Sunshine">
                {warehouses.map((warehouse) => (
                  <option key={warehouse.name}>{warehouse.name}</option>
                ))}
              </select>
            </label>
            <label>
              Assign to
              <select name="assignee" defaultValue="Dipu Rai">
                {warehouses.map((warehouse) => (
                  <option key={warehouse.member}>{warehouse.member}</option>
                ))}
              </select>
            </label>
            {selectedType === "Container" ? (
              <label className="full upload-field">
                Packing list
                <input name="packing-list" type="file" accept=".pdf,image/*" />
                <span>PDF, JPG or PNG · Prototype only</span>
              </label>
            ) : null}
            <label className="full">
              Notes
              <textarea name="notes" placeholder="Access details, customer instructions or internal notes" />
            </label>
          </div>
          <label className="priority-toggle">
            <input name="priority" type="checkbox" />
            <span />
            Flag as priority
          </label>
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button className="save" type="submit">Create task</button>
          </div>
        </form>
      </div>
    </div>
  );
}
