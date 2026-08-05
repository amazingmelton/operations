"use client";

import { FormEvent, useMemo, useState, useSyncExternalStore } from "react";

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

type UserSession = {
  role: "manager" | "warehouse";
  name: string;
  email: string;
  warehouse?: string;
};

type IconName =
  | "dashboard"
  | "tasks"
  | "transfer"
  | "warehouse"
  | "pickup"
  | "delivery"
  | "container"
  | "schedule"
  | "warning"
  | "notifications"
  | "menu"
  | "search"
  | "manager"
  | "team"
  | "help"
  | "logout"
  | "arrow"
  | "close"
  | "check";

const iconPaths: Record<IconName, string> = {
  dashboard: "M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z",
  tasks: "M9 11.17 6.83 9l-1.42 1.41L9 14 18.59 4.41 17.17 3 9 11.17ZM19 19H5V5h9V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V9h-2v10Z",
  transfer: "m7.41 7.41 1.42 1.42L5.66 12H21v-2H5.66l3.17-3.17-1.42-1.42ZM16.59 16.59l-1.42-1.42L18.34 12H3v2h15.34l-3.17 3.17 1.42 1.42Z",
  warehouse: "M3 21V8l9-5 9 5v13h-6v-6H9v6H3Zm2-2h2v-6h10v6h2V9.18l-7-3.89-7 3.89V19Zm4-8h6V9H9v2Z",
  pickup: "M20 2H4a2 2 0 0 0-2 2v3.01A2 2 0 0 0 3 9v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0 1-1.73V4a2 2 0 0 0-2-2Zm-1 18H5V9h14v11Zm1-13H4V4h16v3Zm-5 5H9v2h6v-2Z",
  delivery: "M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2.17a3 3 0 0 0 5.66 0h6.34a3 3 0 0 0 5.66 0H23v-5l-3-4ZM6 18.5A1.5 1.5 0 1 1 6 15a1.5 1.5 0 0 1 0 3.5ZM15 15H8.82A3 3 0 0 0 3 15V6h12v9Zm3 3.5a1.5 1.5 0 1 1 0-3.5 1.5 1.5 0 0 1 0 3.5ZM17 12V9.5h2.5l1.96 2.5H17Z",
  container: "M3 4h18v16H3V4Zm2 2v12h2V6H5Zm4 0v12h2V6H9Zm4 0v12h2V6h-2Zm4 0v12h2V6h-2Z",
  schedule: "M11.99 2A10 10 0 1 0 12 22a10 10 0 0 0-.01-20ZM12 20a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7Z",
  warning: "M1 21h22L12 2 1 21Zm12-3h-2v-2h2v2Zm0-4h-2v-4h2v4Z",
  notifications: "M12 22a2.01 2.01 0 0 0 2-2h-4a2.01 2.01 0 0 0 2 2Zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2Z",
  menu: "M3 18h18v-2H3v2Zm0-5h18v-2H3v2Zm0-7v2h18V6H3Z",
  search: "M9.5 3A6.5 6.5 0 1 0 13.6 14.55L19.05 20 20.5 18.55l-5.45-5.45A6.5 6.5 0 0 0 9.5 3Zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z",
  manager: "M12 2 4 5v6c0 5.05 3.41 9.76 8 11 4.59-1.24 8-5.95 8-11V5l-8-3Zm0 5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Zm0 9.5c-1.67 0-3.14-.85-4-2.15.02-1.32 2.67-2.05 4-2.05 1.32 0 3.98.73 4 2.05a4.78 4.78 0 0 1-4 2.15Z",
  team: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5a3 3 0 1 0 0 6Zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5a3 3 0 1 0 0 6Zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5Z",
  help: "M11 18h2v-2h-2v2Zm1-16A10 10 0 1 0 12 22 10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm0-14a4 4 0 0 0-4 4h2a2 2 0 1 1 3.42 1.41C12.48 12.36 11 13.27 11 15h2c0-1 .75-1.51 1.66-2.43A4 4 0 0 0 12 6Z",
  logout: "M10.09 15.59 11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59ZM19 3H5a2 2 0 0 0-2 2v4h2V5h14v14H5v-4H3v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z",
  arrow: "m12 4-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8Z",
  close: "M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.41 4.29 19.71 2.88 18.3 9.17 12 2.88 5.7l1.41-1.41L10.59 10.59 16.89 4.29l1.41 1.42Z",
  check: "M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17Z",
};

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      className="material-icon"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <path d={iconPaths[name]} />
    </svg>
  );
}

const SESSION_KEY = "amazing-tiles-session";

function subscribeToSession(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("amazing-tiles-session", onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("amazing-tiles-session", onStoreChange);
  };
}

function getSessionSnapshot() {
  return (
    window.sessionStorage.getItem(SESSION_KEY) ??
    window.localStorage.getItem(SESSION_KEY)
  );
}

function getServerSessionSnapshot() {
  return null;
}

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
  { id: "dashboard", label: "Dashboard", icon: "dashboard" as IconName },
  { id: "tasks", label: "Tasks", icon: "tasks" as IconName },
  { id: "transfers", label: "Stock Transfers", icon: "transfer" as IconName },
  { id: "warehouses", label: "Warehouses", icon: "warehouse" as IconName },
];

const typeIcons: Record<TaskType, IconName> = {
  Pickup: "pickup",
  Delivery: "delivery",
  Container: "container",
};

function StatusPill({ status }: { status: TaskStatus | Transfer["status"] }) {
  return <span className={`status-pill status-${status.toLowerCase().replaceAll(" ", "-")}`}>{status}</span>;
}

export default function Home() {
  const [section, setSection] = useState("dashboard");
  const [mobileNav, setMobileNav] = useState(false);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<TaskType>("Pickup");
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [transfers, setTransfers] = useState<Transfer[]>(initialTransfers);
  const [warehouseFilter, setWarehouseFilter] = useState("All warehouses");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [search, setSearch] = useState("");
  const storedSession = useSyncExternalStore(
    subscribeToSession,
    getSessionSnapshot,
    getServerSessionSnapshot,
  );
  const session = useMemo(() => {
    if (!storedSession) return null;
    try {
      return JSON.parse(storedSession) as UserSession;
    } catch {
      return null;
    }
  }, [storedSession]);

  function signIn(nextSession: UserSession, remember: boolean) {
    const storage = remember ? window.localStorage : window.sessionStorage;
    window.localStorage.removeItem(SESSION_KEY);
    window.sessionStorage.removeItem(SESSION_KEY);
    storage.setItem(SESSION_KEY, JSON.stringify(nextSession));
    window.dispatchEvent(new Event("amazing-tiles-session"));
    setSection("dashboard");
  }

  function signOut() {
    window.localStorage.removeItem(SESSION_KEY);
    window.sessionStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new Event("amazing-tiles-session"));
    setSection("dashboard");
    setMobileNav(false);
  }

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

  if (!session) {
    return <LoginScreen onSignIn={signIn} />;
  }

  const mode = session.role;
  const activeWarehouse = session.warehouse ?? "Sunshine";
  const currentWarehouse =
    warehouses.find((warehouse) => warehouse.name === activeWarehouse) ?? warehouses[0];
  const initials = session.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const pageTitle =
    mode === "warehouse" && section === "dashboard"
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
          {(mode === "manager"
            ? navItems
            : [
                { id: "dashboard", label: "My tasks", icon: "tasks" as IconName },
                { id: "warehouses", label: "Warehouse network", icon: "warehouse" as IconName },
              ]
          ).map((item) => (
            <button
              className={section === item.id ? "active" : ""}
              key={item.id}
              onClick={() => {
                setSection(item.id);
                setMobileNav(false);
              }}
            >
              <span><Icon name={item.icon} /></span>
              {item.label}
              {item.id === "transfers" && counts.transfers > 0 ? (
                <b className="nav-count">{counts.transfers}</b>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="warehouse-summary">
          <p>{mode === "manager" ? "Warehouse network" : "Signed in at"}</p>
          <strong>{mode === "manager" ? "3 locations online" : activeWarehouse}</strong>
          <div className="online-row">
            {mode === "manager" ? (
              <>
                <span />
                <span />
                <span />
              </>
            ) : (
              <span />
            )}
          </div>
        </div>

        <div className="sidebar-footer">
          <button className="help-link">
            <span><Icon name="help" /></span>
            Help &amp; support
          </button>
          <button className="signout-link" onClick={signOut}>
            <span><Icon name="logout" /></span>
            Sign out
          </button>
        </div>
      </aside>

      {mobileNav ? <button className="nav-scrim" onClick={() => setMobileNav(false)} aria-label="Close menu" /> : null}

      <div className="main-frame">
        <header className="topbar">
          <button className="menu-button" onClick={() => setMobileNav(true)} aria-label="Open navigation">
            <Icon name="menu" size={24} />
          </button>
          <div className="session-context">
            <span>{mode === "manager" ? "Manager workspace" : `${activeWarehouse} warehouse`}</span>
            <i />
            <small>Prototype access</small>
          </div>
          <div className="top-actions">
            <button className="icon-button" aria-label="Notifications">
              <Icon name="notifications" size={20} />
              <i />
            </button>
            <div className="profile">
              <span>{initials}</span>
              <div>
                <strong>{session.name}</strong>
                <small>{mode === "manager" ? "Operations Manager" : "Warehouse Team"}</small>
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
                  ? `Your ${activeWarehouse} tasks are pinned first. Update them as work progresses.`
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

          {mode === "warehouse" && section === "dashboard" ? (
            <WarehouseDashboard
              tasks={tasks}
              onStatus={updateTaskStatus}
              activeWarehouse={activeWarehouse}
              teamMember={session.name}
            />
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
          ) : section === "warehouses" ? (
            <WarehousesView tasks={tasks} />
          ) : (
            <WarehouseDashboard
              tasks={tasks}
              onStatus={updateTaskStatus}
              activeWarehouse={activeWarehouse}
              teamMember={currentWarehouse.member}
            />
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

function LoginScreen({
  onSignIn,
}: {
  onSignIn: (session: UserSession, remember: boolean) => void;
}) {
  const [role, setRole] = useState<UserSession["role"]>("manager");
  const [warehouse, setWarehouse] = useState("Sunshine");
  const [showPassword, setShowPassword] = useState(false);

  function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onSignIn(
      {
        role,
        name: String(data.get("name")).trim(),
        email: String(data.get("email")).trim(),
        warehouse: role === "warehouse" ? warehouse : undefined,
      },
      data.get("remember") === "on",
    );
  }

  return (
    <main className="login-page">
      <section className="login-story" aria-label="Amazing Tiles Operations introduction">
        <div className="login-brand">
          <div className="brand-tile">AT</div>
          <div>
            <strong>Amazing Tiles</strong>
            <span>Operations</span>
          </div>
        </div>

        <div className="story-copy">
          <p className="login-eyebrow">One connected operation</p>
          <h1>Every warehouse.<br />One clear plan.</h1>
          <p>
            Keep pickups, deliveries, container arrivals and stock transfers organised
            across Sunshine, Hoppers Crossing and Melton.
          </p>
        </div>

        <div className="warehouse-route" aria-label="Connected warehouse locations">
          {warehouses.map((item, index) => (
            <div className="route-location" key={item.name}>
              <span>{item.name.slice(0, 2).toUpperCase()}</span>
              <div>
                <strong>{item.name}</strong>
                <small>{item.label}</small>
              </div>
              {index < warehouses.length - 1 ? <i /> : null}
            </div>
          ))}
        </div>

        <div className="login-note">
          <span><Icon name="check" size={18} /></span>
          <p>
            <strong>Built for the daily warehouse workflow</strong>
            <small>Clear assignments, live statuses and fewer missed tasks.</small>
          </p>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <div className="login-heading">
            <p>Welcome back</p>
            <h2>Sign in to Operations</h2>
            <span>Choose your access type to continue.</span>
          </div>

          <div className="role-picker" aria-label="Choose login type">
            <button className={role === "manager" ? "active" : ""} onClick={() => setRole("manager")}>
              <span className="role-icon"><Icon name="manager" size={20} /></span>
              <span>
                <strong>Manager</strong>
                <small>All warehouses</small>
              </span>
              <i />
            </button>
            <button className={role === "warehouse" ? "active" : ""} onClick={() => setRole("warehouse")}>
              <span className="role-icon"><Icon name="team" size={20} /></span>
              <span>
                <strong>Warehouse team</strong>
                <small>Assigned tasks</small>
              </span>
              <i />
            </button>
          </div>

          <form className="login-form" onSubmit={submitLogin}>
            <label>
              Full name
              <input
                name="name"
                autoComplete="name"
                placeholder={role === "manager" ? "e.g. Alex Morgan" : "e.g. Dipu Rai"}
                required
              />
            </label>
            <label>
              Work email
              <input
                name="email"
                type="email"
                autoComplete="email"
                placeholder="name@amazingtiles.com.au"
                required
              />
            </label>
            {role === "warehouse" ? (
              <label>
                Your warehouse
                <select value={warehouse} onChange={(event) => setWarehouse(event.target.value)}>
                  {warehouses.map((item) => (
                    <option key={item.name}>{item.name}</option>
                  ))}
                </select>
              </label>
            ) : null}
            <label>
              Password
              <span className="password-field">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  minLength={4}
                  required
                />
                <button type="button" onClick={() => setShowPassword((visible) => !visible)}>
                  {showPassword ? "Hide" : "Show"}
                </button>
              </span>
            </label>

            <div className="login-options">
              <label>
                <input name="remember" type="checkbox" defaultChecked />
                Remember this device
              </label>
              <span>Contact your manager for access</span>
            </div>

            <button className="login-submit" type="submit">
              Sign in as {role === "manager" ? "Manager" : "Warehouse Team"}
              <span><Icon name="arrow" size={18} /></span>
            </button>
          </form>

          <div className="prototype-notice">
            <span>i</span>
            <p>
              <strong>Prototype login</strong>
              <small>Use any email and password. Passwords are never saved.</small>
            </p>
          </div>
        </div>

        <footer className="login-footer">
          <span>© 2026 Amazing Tiles &amp; Stone</span>
          <span>Private operations workspace</span>
        </footer>
      </section>
    </main>
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
    { label: "Pending today", value: counts.pending, note: "Across 3 warehouses", icon: "schedule" as IconName, tone: "blue" },
    { label: "Completed today", value: counts.completed, note: "2 completed on time", icon: "check" as IconName, tone: "green" },
    { label: "Delayed", value: counts.delayed, note: "Needs your attention", icon: "warning" as IconName, tone: "red" },
    { label: "Stock requests", value: counts.transfers, note: "Waiting for approval", icon: "transfer" as IconName, tone: "amber" },
  ];

  return (
    <>
      <section className="metric-grid" aria-label="Operations summary">
        {metrics.map((metric) => (
          <article className="summary-card" key={metric.label}>
            <div className={`metric-icon ${metric.tone}`}><Icon name={metric.icon} size={22} /></div>
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
                <div className="route-badge"><Icon name="transfer" size={20} /></div>
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
                  <i><Icon name={typeIcons[task.type]} size={16} /></i>
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
          <span><Icon name="search" size={20} /></span>
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
              <div className="warehouse-icon"><Icon name="warehouse" size={22} /></div>
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
  activeWarehouse,
  teamMember,
}: {
  tasks: Task[];
  onStatus: (id: number, status: TaskStatus) => void;
  activeWarehouse: string;
  teamMember: string;
}) {
  const [scope, setScope] = useState<"mine" | "all">("mine");
  const visible = scope === "mine" ? tasks.filter((task) => task.warehouse === activeWarehouse) : tasks;

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
          <i /> {activeWarehouse} · {teamMember} · Online
        </span>
      </div>
      <section className="mobile-task-list">
        <div className="date-divider">
          <span>Today</span>
          <i />
          <small>{visible.filter((task) => task.date === "2026-07-25").length} tasks</small>
        </div>
        {visible.map((task) => (
          <article className={task.warehouse === activeWarehouse ? "own-task" : ""} key={task.id}>
            <div className={`task-type-icon type-${task.type.toLowerCase()}`}><Icon name={typeIcons[task.type]} size={22} /></div>
            <div className="mobile-task-copy">
              <div>
                <strong>{task.invoice}</strong>
                {task.priority ? <span className="priority-label">Priority</span> : null}
              </div>
              <h3>{task.description}</h3>
              <p>{task.items}</p>
              <div className="task-meta">
                <span><Icon name="schedule" size={15} /> {task.displayDate}</span>
                <span><Icon name="warehouse" size={15} /> {task.warehouse}</span>
              </div>
            </div>
            <div className="task-card-actions">
              <StatusPill status={task.status} />
              {task.warehouse === activeWarehouse && task.status === "Pending" ? (
                <button
                  onClick={() =>
                    onStatus(task.id, task.type === "Pickup" ? "Ready for Pickup" : "Ready for Delivery")
                  }
                >
                  Mark ready
                </button>
              ) : task.warehouse === activeWarehouse && task.status.includes("Ready") ? (
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
          <button onClick={onClose} aria-label="Close"><Icon name="close" size={20} /></button>
        </div>
        <div className="type-tabs">
          {(["Pickup", "Delivery", "Container"] as TaskType[]).map((type) => (
            <button
              className={selectedType === type ? "active" : ""}
              key={type}
              onClick={() => setSelectedType(type)}
            >
              <span><Icon name={typeIcons[type]} size={18} /></span>
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
