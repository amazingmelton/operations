const jobs = [
  {
    time: "8:30",
    meridiem: "AM",
    type: "Pickup",
    customer: "Hawthorn Renovations",
    details: "22 boxes · Calacatta Cloud",
    status: "Ready",
    tone: "ready",
  },
  {
    time: "10:15",
    meridiem: "AM",
    type: "Delivery",
    customer: "North & Co. Interiors",
    details: "14 boxes · Travertine Sand",
    status: "En route",
    tone: "route",
  },
  {
    time: "1:40",
    meridiem: "PM",
    type: "Delivery",
    customer: "Melton Build Group",
    details: "31 boxes · Stone Grey",
    status: "Scheduled",
    tone: "scheduled",
  },
];

const metrics = [
  { label: "Pickups today", value: "12", note: "4 ready now", accent: "red" },
  { label: "Deliveries", value: "08", note: "5 en route", accent: "charcoal" },
  { label: "On-time rate", value: "96%", note: "Above target", accent: "green" },
  { label: "Need attention", value: "03", note: "Review jobs", accent: "amber" },
];

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Amazing Tiles home">
          <span className="brand-mark" aria-hidden="true">
            AT
          </span>
          <span>
            <strong>Amazing Tiles</strong>
            <small>Pickup &amp; Delivery</small>
          </span>
        </a>
        <nav aria-label="Primary navigation">
          <a className="nav-link active" href="#overview">
            Overview
          </a>
          <a className="nav-link" href="#schedule">
            Schedule
          </a>
          <a className="nav-link" href="#drivers">
            Drivers
          </a>
        </nav>
        <div className="header-actions">
          <span className="live-pill">
            <i aria-hidden="true" />
            Live sample
          </span>
          <button className="avatar" aria-label="Open profile menu">
            AM
          </button>
        </div>
      </header>

      <section className="page-shell" id="top">
        <div className="intro" id="overview">
          <div>
            <p className="eyebrow">Saturday · 25 July</p>
            <h1>Pickup &amp; delivery operations</h1>
            <p className="intro-copy">
              A quick view of today&apos;s tile movements across Melbourne.
            </p>
          </div>
          <button className="primary-button">
            <span aria-hidden="true">＋</span>
            Create job
          </button>
        </div>

        <section className="metrics-grid" aria-label="Today’s overview">
          {metrics.map((metric) => (
            <article className={`metric-card ${metric.accent}`} key={metric.label}>
              <div className="metric-top">
                <span>{metric.label}</span>
                <span className="metric-icon" aria-hidden="true">
                  ↗
                </span>
              </div>
              <strong>{metric.value}</strong>
              <p>{metric.note}</p>
            </article>
          ))}
        </section>

        <section className="workspace-grid">
          <article className="schedule-card" id="schedule">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Today&apos;s movement</p>
                <h2>Next jobs</h2>
              </div>
              <a href="#schedule">View full schedule</a>
            </div>

            <div className="job-list">
              {jobs.map((job) => (
                <div className="job-row" key={`${job.time}-${job.customer}`}>
                  <div className="job-time">
                    <strong>{job.time}</strong>
                    <span>{job.meridiem}</span>
                  </div>
                  <span className="job-type">{job.type}</span>
                  <div className="job-customer">
                    <strong>{job.customer}</strong>
                    <span>{job.details}</span>
                  </div>
                  <span className={`status ${job.tone}`}>{job.status}</span>
                  <button aria-label={`Open ${job.customer} job`}>→</button>
                </div>
              ))}
            </div>
          </article>

          <aside className="dispatch-card" id="drivers">
            <div className="dispatch-head">
              <p className="eyebrow">Live dispatch</p>
              <span>3 active</span>
            </div>
            <h2>Drivers on the move</h2>
            <div className="route-visual" aria-label="Stylised route overview">
              <div className="route-line one" />
              <div className="route-line two" />
              <span className="route-pin pin-a">1</span>
              <span className="route-pin pin-b">2</span>
              <span className="route-pin pin-c">3</span>
              <span className="suburb north">Coburg</span>
              <span className="suburb city">Melbourne</span>
              <span className="suburb west">Melton</span>
            </div>
            <div className="driver-strip">
              <div className="driver-stack" aria-hidden="true">
                <span>JL</span>
                <span>RK</span>
                <span>SD</span>
              </div>
              <div>
                <strong>All drivers on schedule</strong>
                <p>Next check-in in 12 minutes</p>
              </div>
            </div>
          </aside>
        </section>

        <footer>
          <span>Amazing Tiles Operations · Sample deployment</span>
          <span>Melbourne, Australia</span>
        </footer>
      </section>
    </main>
  );
}
