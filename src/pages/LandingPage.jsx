import { Link } from "react-router-dom";
import PilotLeadForm from "../components/PilotLeadForm";
import "./frother-explainer.css";
const mascot = "/frother-explainer-mascot.png";
const customerSteps = [
  { icon: "tap", title: "Spot it", text: "See the NFC tag or QR code at the counter." },
  { icon: "phone", title: "Tap or scan", text: "Open the experience straight from your phone." },
  { icon: "coffee", title: "Get your card", text: "A mobile loyalty card opens in the browser." },
  { icon: "stamp", title: "Stack stamps", text: "Earn stamps on qualifying purchases." },
  { icon: "repeat", title: "Froth on", text: "Unlock a reward, then come back for another." }
];
const staffSteps = [
  { icon: "coffee", title: "Confirm purchase", text: "Check the order qualifies for a stamp." },
  { icon: "phone", title: "Open stamper", text: "Use the staff-facing stamping interface." },
  { icon: "shield", title: "Verify card", text: "Match the correct customer loyalty card." },
  { icon: "stamp", title: "Award stamp", text: "Staff control when a stamp is added." },
  { icon: "reward", title: "Redeem reward", text: "Verify the earned reward before redemption." }
];
const ownerSteps = [
  { icon: "store", title: "Create programme", text: "Set up the caf\xE9 loyalty experience." },
  { icon: "settings", title: "Set the rules", text: "Configure stamps and reward milestones." },
  { icon: "team", title: "Manage staff", text: "Control who can access staff tools." },
  { icon: "chart", title: "See activity", text: "Monitor participation and redemptions." },
  { icon: "repeat", title: "Build retention", text: "Give customers a reason to return." }
];
const journey = [
  { icon: "phone", label: "Customer" },
  { icon: "tap", label: "NFC / QR" },
  { icon: "coffee", label: "Digital card" },
  { icon: "stamp", label: "Staff stamp" },
  { icon: "reward", label: "Reward" },
  { icon: "repeat", label: "Repeat visit" }
];
const mapNodes = [
  {
    title: "Customer Experience",
    text: "Tap, card, stamps, reward",
    icon: "phone",
    position: "map-northwest",
    tone: "yellow"
  },
  {
    title: "Staff Operations",
    text: "Verify, stamp, redeem",
    icon: "stamp",
    position: "map-north",
    tone: "turquoise"
  },
  {
    title: "Caf\xE9 Owner Dashboard",
    text: "Setup, access, activity",
    icon: "store",
    position: "map-northeast",
    tone: "orange"
  },
  {
    title: "NFC / QR Access",
    text: "Fast browser entry",
    icon: "tap",
    position: "map-west",
    tone: "turquoise"
  },
  {
    title: "Loyalty Rules",
    text: "Qualifying buys + milestones",
    icon: "settings",
    position: "map-east",
    tone: "yellow"
  },
  {
    title: "Rewards & Redemptions",
    text: "Earn, verify, redeem",
    icon: "reward",
    position: "map-southwest",
    tone: "orange"
  },
  {
    title: "Security & Fraud Prevention",
    text: "Staff-controlled actions",
    icon: "shield",
    position: "map-south",
    tone: "yellow"
  },
  {
    title: "Analytics & Retention",
    text: "Participation + return signals",
    icon: "chart",
    position: "map-southeast",
    tone: "turquoise"
  },
  {
    title: "Future Integrations",
    text: "Planned / unverified",
    icon: "link",
    position: "map-future",
    tone: "cream",
    planned: true
  }
];
function Icon({ name }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.4,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="icon">{name === "phone" && <><rect x="6.5" y="2.5" width="11" height="19" rx="2.5" {...common} /><path d="M10 18.5h4" {...common} /></>}{name === "stamp" && <><path d="M8.5 11.5c.7-1.1 1.1-2.5 1.1-4.3a2.4 2.4 0 0 1 4.8 0c0 1.8.4 3.2 1.1 4.3" {...common} /><path d="M6 11.5h12v4H6zM4.5 19.5h15" {...common} /></>}{name === "coffee" && <><path d="M4 7h13v8.5A3.5 3.5 0 0 1 13.5 19h-6A3.5 3.5 0 0 1 4 15.5V7Z" {...common} /><path d="M17 9h1.5a2.5 2.5 0 0 1 0 5H17M7 3.5v1M11 3.5v1M15 3.5v1" {...common} /></>}{name === "store" && <><path d="M4 10v10h16V10M3 10l2-6h14l2 6" {...common} /><path d="M3 10a3 3 0 0 0 5 2 3 3 0 0 0 4 0 3 3 0 0 0 4 0 3 3 0 0 0 5-2M9 20v-5h6v5" {...common} /></>}{name === "settings" && <><circle cx="12" cy="12" r="3" {...common} /><path d="M12 2.8v3M12 18.2v3M21.2 12h-3M5.8 12h-3M18.5 5.5l-2.1 2.1M7.6 16.4l-2.1 2.1M18.5 18.5l-2.1-2.1M7.6 7.6 5.5 5.5" {...common} /></>}{name === "team" && <><circle cx="9" cy="8" r="3" {...common} /><circle cx="17" cy="9" r="2.2" {...common} /><path d="M3.5 20v-2.2A4.8 4.8 0 0 1 8.3 13h1.4a4.8 4.8 0 0 1 4.8 4.8V20M15 14h1.7a3.8 3.8 0 0 1 3.8 3.8V20" {...common} /></>}{name === "chart" && <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" {...common} /><path d="m4 7 6-4 6 6 5-5" {...common} /></>}{name === "repeat" && <><path d="M18.5 7.5A8 8 0 0 0 5 6l-2 2M3 4v4h4M5.5 16.5A8 8 0 0 0 19 18l2-2M21 20v-4h-4" {...common} /></>}{name === "shield" && <><path d="M12 2.5 20 6v5.5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-3.5Z" {...common} /><path d="m8.5 12 2.2 2.2 4.8-5" {...common} /></>}{name === "tap" && <><path d="M8 12V7.5a2 2 0 0 1 4 0V12M12 11V9.5a2 2 0 0 1 4 0V12M16 11a2 2 0 0 1 4 0v4.3c0 3.5-2.7 6.2-6.2 6.2h-1.2a6 6 0 0 1-4.8-2.4L4.5 15.7a2 2 0 0 1 3-2.7l.5.5" {...common} /><path d="M3.5 3.5a6 6 0 0 1 4-2M3.5 7.5a2.5 2.5 0 0 1 2-2" {...common} /></>}{name === "reward" && <><path d="M4 9h16v12H4zM2.5 5.5h19V9h-19zM12 5.5V21" {...common} /><path d="M12 5.5C9.2 5.5 7 4.7 7 2.8c0-2.4 4.2-1.1 5 2.7ZM12 5.5c2.8 0 5-.8 5-2.7 0-2.4-4.2-1.1-5 2.7Z" {...common} /></>}{name === "link" && <><path d="m9.5 14.5 5-5M7.5 17.5l-1 1a3.5 3.5 0 0 1-5-5l4-4a3.5 3.5 0 0 1 5 0M16.5 6.5l1-1a3.5 3.5 0 0 1 5 5l-4 4a3.5 3.5 0 0 1-5 0" {...common} /></>}</svg>;
}
function Eyebrow({ children }) {
  return <div className="eyebrow">{children}</div>;
}
function StepCard({
  index,
  icon,
  title,
  text
}) {
  return <div className="step-card"><div className="step-topline"><span className="step-number">{String(index + 1).padStart(2, "0")}</span><span className="step-icon"><Icon name={icon} /></span></div><div className="step-title">{title}</div><div className="step-text">{text}</div></div>;
}
function Swimlane({
  number,
  title,
  subtitle,
  steps,
  tone
}) {
  return <section className={`swimlane ${tone}`}><div className="lane-heading"><span className="lane-number">{number}</span><div><div className="lane-title" role="heading" aria-level={3}>{title}</div><div className="lane-subtitle">{subtitle}</div></div></div><div className="steps">{steps.map((step, index) => <StepCard key={step.title} index={index} {...step} />)}</div></section>;
}
function JourneyDiagram() {
  return <section className="journey-section"><div className="section-heading split-heading"><div><Eyebrow>The 30-second loop</Eyebrow><div className="section-title" role="heading" aria-level={2}>
            From flat white to full circle.
          </div></div><div className="no-app-badge">No mandatory app download</div></div><div className="journey">{journey.map((item, index) => <div className="journey-part" key={item.label}><div className="journey-node"><span className="journey-icon"><Icon name={item.icon} /></span><span>{item.label}</span></div>{index < journey.length - 1 && <span className="journey-arrow">→</span>}</div>)}</div><div className="feature-strip"><span>NFC + QR access</span><span>Mobile-first</span><span>Staff-controlled stamps</span><span>Configurable rewards</span><span>Lightweight onboarding</span></div></section>;
}
function MindMap() {
  return <section className="mindmap-section" id="system-map"><div className="section-heading map-heading"><div><Eyebrow>Second visual · System mind map</Eyebrow><div className="section-title" role="heading" aria-level={2}>
            One loyalty loop. Nine connected ideas.
          </div></div><div className="legend" aria-label="Mind map legend"><span><i className="solid-sample" /> Core product concept</span><span><i className="dashed-sample" /> Planned or unverified</span></div></div><div className="mindmap"><svg className="map-lines" viewBox="0 0 1200 720" preserveAspectRatio="none" aria-hidden="true"><path d="M600 360 190 138M600 360 600 112M600 360 1010 138M600 360 165 360M600 360 1035 360M600 360 210 585M600 360 600 610M600 360 990 585" /><path className="planned-line" d="M600 360 1040 675" /></svg><div className="map-centre"><img src={mascot} alt="" /><div>FROTHER</div><span>Tap · Stamp · Return</span></div>{mapNodes.map((node) => <div
    key={node.title}
    className={`map-node ${node.position} ${node.tone}${node.planned ? " planned" : ""}`}
  ><span className="map-node-icon"><Icon name={node.icon} /></span><div><div className="map-node-title">{node.title}</div><div className="map-node-text">{node.text}</div></div></div>)}</div></section>;
}
function LandingPage() {
  return <main className="frother-explainer"><header className="topbar"><div className="wordmark"><img src={mascot} alt="" /><span>FROTHER</span></div><div className="topbar-meta"><a href="#for-venues">How it works</a><span className="dot" /><span>by ESO ES</span></div></header><section className="hero"><div className="hero-copy"><Eyebrow>Digital loyalty for local cafés</Eyebrow><div className="hero-title" role="heading" aria-level={1}>
            Tap in.<br />
            Stack stamps.<br /><span>Froth on.</span></div><div className="hero-intro">
            NFC and QR-powered loyalty that moves from counter to customer in seconds—not another
            app clogging up their home screen.
          </div><div className="explainer-actions"><Link to="/demo" className="explainer-button primary">Try customer demo ↗</Link><Link to="/demo?view=staff" className="explainer-button">Try staff demo ↗</Link><a href="#pilot-lead" className="explainer-text-link">For your venue →</a></div><p className="demo-note">Interactive demo · Fictional customers · No signup needed</p><div className="hero-chips"><span>Tap</span><span>Stamp</span><span>Reward</span><span>Return</span></div></div><div className="hero-visual"><div className="sunburst" /><div className="mascot-disc"><img src={mascot} alt="FROTHER smiling coffee mascot" /></div><div className="float-card float-nfc"><Icon name="tap" /><span>NFC / QR</span><small>Tap here</small></div><div className="float-card float-stamp"><Icon name="stamp" /><span>+1 stamp</span><small>Nice one!</small></div><div className="coffee-scribble" aria-hidden="true">GOOD<br />COFFEE.<br />GOOD LOOP.</div></div></section><JourneyDiagram /><section className="lanes-section" id="for-venues"><div className="section-heading lanes-heading"><div><Eyebrow>Three connected swimlanes</Eyebrow><div className="section-title" role="heading" aria-level={2}>
              Everyone knows their next move.
            </div></div><div className="mini-note">One shared loop, three clear roles.</div></div><Swimlane
    number="01"
    title="Customer"
    subtitle="Tap. Collect. Come back."
    steps={customerSteps}
    tone="customer"
  /><Swimlane
    number="02"
    title="Café staff"
    subtitle="Check. Stamp. Keep it moving."
    steps={staffSteps}
    tone="staff"
  /><Swimlane
    number="03"
    title="Business owner"
    subtitle="Configure. Observe. Retain."
    steps={ownerSteps}
    tone="owner"
  /><div className="threshold-card"><div className="threshold-stamps" aria-label="Three purchase threshold">{[1, 2, 3].map((stamp) => <span key={stamp}><Icon name="coffee" /></span>)}<i>3</i></div><div className="threshold-copy"><div className="status-pill">Intended journey · not yet verified</div><div className="threshold-title">Three purchases → a fuller customer account</div><div className="threshold-text">
              FROTHER is intended to keep entry lightweight, then invite a customer to create a
              fuller account after their third qualifying purchase. This threshold is a proposed
              journey and should not be read as confirmed live functionality.
            </div></div></div></section><MindMap /><section className="explainer-pilot"><div className="explainer-pilot-intro"><Eyebrow>Put it on your counter</Eyebrow><h2 className="section-title">Your regulars.<br />Your loyalty loop.</h2><p>Explore the demo, then talk to us about a pilot for your café, pub or restaurant.</p><p className="pilot-price">Pilot offer: $499 setup · $99/month</p><div className="explainer-actions"><Link to="/demo" className="explainer-button primary">Try the demo ↗</Link><a href="#pilot-lead" className="explainer-button">Request pilot setup ↓</a></div></div><PilotLeadForm /></section><footer><div className="footer-lockup"><img src={mascot} alt="" /><div><strong>FROTHER</strong><span>A digital loyalty platform by ESO ES</span></div></div><div className="footer-note">
          Product explainer · Proposed workflow · No claim of production readiness
        </div></footer></main>;
}
export {
  LandingPage as default
};
