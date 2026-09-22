// pitchStrategist.js — The Brain & Scoping Engine for Requirement-Centric Pitches
// Deconstructs { companyName, domain, requirement } into a structured, highly relevant Pitch Plan JSON
// with zero hardcoded vendor bias, zero cross-sector contamination, and completely distinct slides per sector/usecase.

import { findSectorPlaybook } from "./knowledge/ragRetriever.js";
import { fallbackUseCases } from "./fallbacks.js";

function truncate(str, max = 32) {
  if (!str) return "";
  return str.length > max ? str.slice(0, max) + "..." : str;
}

/**
 * Calculates a requirement relevance score (0-100) for a candidate concept or sub-domain.
 * Filters out out-of-scope domain topics (e.g. liquidity, treasury for fraud detection).
 */
export function scoreRelevance(candidateText, requirement, domain) {
  const reqLower = (requirement || "").toLowerCase();
  const candLower = (candidateText || "").toLowerCase();
  
  if (!reqLower) return 80;

  const reqWords = reqLower.split(/[\s,.;:()/-]+/).filter(w => w.length >= 4);
  if (reqWords.length === 0) return 80;

  let matches = 0;
  reqWords.forEach(w => {
    if (candLower.includes(w)) matches++;
  });

  const wordScore = (matches / reqWords.length) * 100;
  
  const isHighRelevance = 
    (reqLower.includes("fraud") && (candLower.includes("fraud") || candLower.includes("anomaly") || candLower.includes("risk") || candLower.includes("device") || candLower.includes("transaction"))) ||
    (reqLower.includes("bed") && (candLower.includes("bed") || candLower.includes("capacity") || candLower.includes("patient") || candLower.includes("flow") || candLower.includes("triage"))) ||
    (reqLower.includes("claim") && (candLower.includes("claim") || candLower.includes("denial") || candLower.includes("billing") || candLower.includes("revenue"))) ||
    (reqLower.includes("churn") && (candLower.includes("churn") || candLower.includes("retention") || candLower.includes("customer"))) ||
    (reqLower.includes("supply") && (candLower.includes("supply") || candLower.includes("inventory") || candLower.includes("logistics"))) ||
    (reqLower.includes("defect") && (candLower.includes("defect") || candLower.includes("quality") || candLower.includes("yield") || candLower.includes("assembly"))) ||
    (reqLower.includes("grid") && (candLower.includes("grid") || candLower.includes("outage") || candLower.includes("substation") || candLower.includes("telemetry"))) ||
    (reqLower.includes("flight") && (candLower.includes("flight") || candLower.includes("turnaround") || candLower.includes("gate") || candLower.includes("baggage")));

  if (isHighRelevance) return Math.max(85, Math.min(100, Math.round(wordScore + 40)));
  
  const isDistraction =
    (reqLower.includes("fraud") && (candLower.includes("liquidity") || candLower.includes("treasury") || candLower.includes("credit risk") || candLower.includes("churn") || candLower.includes("wealth"))) ||
    (reqLower.includes("bed") && (candLower.includes("pharmacy logistics") || candLower.includes("supply chain") || candLower.includes("claim denial"))) ||
    (reqLower.includes("retail") && (candLower.includes("underwriting") || candLower.includes("clinical")));

  if (isDistraction) return Math.min(40, Math.round(wordScore * 0.4));

  return Math.round(wordScore);
}

/**
 * Builds the complete structured Pitch Plan JSON tailored strictly to the client requirement and sector.
 */
export function buildPitchPlan({ companyName, domain, requirement, useCases, research, researchStructured }) {
  const { playbook } = findSectorPlaybook(domain, requirement, companyName);
  const reqText = requirement || `Transforming ${domain} operations through unified real-time data and AI intelligence.`;
  const reqLower = reqText.toLowerCase();
  const domLower = (domain || "").toLowerCase();

  const has = (...tokens) => tokens.some(t => reqLower.includes(t) || domLower.includes(t));

  let primaryDomain = `${domain} Operations`;
  let domainKey = "generic";

  if (has("fraud", "financial crime", "payment auth", "transaction pattern", "card fraud", "upi fraud")) {
    primaryDomain = "Payments, Fraud Risk & Financial Crime";
    domainKey = "banking_fraud";
  } else if (has("liquidity", "treasury", "cash ladder", "clearing", "settlement", "nostro")) {
    primaryDomain = "Intraday Liquidity & Treasury Operations";
    domainKey = "banking_liquidity";
  } else if (has("bed", "patient flow", "emergency triage", "ed boarding", "hospital capacity", "inpatient flow")) {
    primaryDomain = "Patient Flow, Emergency Triage & Capacity Operations";
    domainKey = "healthcare_bed";
  } else if (has("claim", "denial", "revenue cycle", "billing 837", "prior auth", "remittance 835")) {
    primaryDomain = "Revenue Cycle & Claim Denial Prevention";
    domainKey = "healthcare_claims";
  } else if (has("inventory", "stockout", "demand forecast", "replenishment", "store allocation", "retail", "pos", "omnichannel")) {
    primaryDomain = "Omnichannel Inventory & Demand Fulfillment";
    domainKey = "retail_inventory";
  } else if (has("defect", "yield", "quality inspection", "assembly line", "oee", "manufacturing", "plant", "scrap rate")) {
    primaryDomain = "Smart Manufacturing & Assembly Quality";
    domainKey = "manufacturing_quality";
  } else if (has("telematics", "ev battery", "battery thermal", "connected vehicle", "charging", "automotive", "fleet telematics")) {
    primaryDomain = "Connected Vehicle & EV Battery Telematics";
    domainKey = "automotive_ev";
  } else if (has("grid", "outage", "substation", "scada", "transformer", "energy", "utility", "load forecasting")) {
    primaryDomain = "Smart Grid Reliability & Substation Telemetry";
    domainKey = "energy_grid";
  } else if (has("flight", "turnaround", "gate allocation", "baggage", "aircraft", "aviation", "airline", "ramp handling")) {
    primaryDomain = "Flight Operations & Aircraft Turnaround";
    domainKey = "aviation_ops";
  } else if (has("underwriting", "claims triage", "fnol", "policy loss", "insurance", "actuarial")) {
    primaryDomain = "Insurance Underwriting & Claims Triage";
    domainKey = "insurance_claims";
  } else if (has("freight", "shipment", "eta", "warehouse route", "logistics", "last-mile", "carrier dispatch")) {
    primaryDomain = "Logistics Dispatch & Route Optimization";
    domainKey = "logistics_fleet";
  } else if (has("network", "ran", "cell tower", "fiber latency", "telecom", "5g", "cdr stream")) {
    primaryDomain = "Telco Network Telemetry & SLA Assurance";
    domainKey = "telecom_network";
  } else if (has("churn", "retention", "customer attrition", "subscriber churn")) {
    primaryDomain = "Customer Retention & Behavioral Intelligence";
    domainKey = "customer_churn";
  }

  // Generate domain-specific components
  let agendaItems = [];
  let challengesMeta = {};
  let challenges = [];
  let visionMeta = {};
  let visionStages = [];
  let dataFoundationMeta = {};
  let dataFoundation = [];
  let realTimeSignals = [];
  let architectureMeta = {};
  let solutionArchitecture = {};
  let commandCenter = {};
  let explainableExample = {};
  let behavioralProfile = {};
  let queueMeta = {};
  let investigationQueue = [];
  let outcomesMeta = {};
  let solutionKpis = [];
  let closedLoopTitle = "CLOSED-LOOP CONTINUOUS LEARNING ARCHITECTURE";
  let closedLoopSteps = [];
  let readinessMeta = {};
  let roadmapMeta = {};
  let roadmapPhases = [];
  let nextStepsMeta = {};
  let nextSteps = [];

  switch (domainKey) {
    case "banking_fraud":
      agendaItems = [
        { num: "01", title: "Fraud Threat Landscape", desc: "Why sub-second payment fraud bypasses legacy batch risk rules" },
        { num: "02", title: "Real-Time Solution Vision", desc: "Unifying transaction streams, devices, and histories into instant action" },
        { num: "03", title: "Payment Data Foundation", desc: "Connecting ISO payment switches, device fingerprints, and customer records" },
        { num: "04", title: "Fraud Solution Architecture", desc: "End-to-end governed pipeline from real-time streaming to analyst triage" },
        { num: "05", title: "Live Fraud Command Radar", desc: "Sub-50ms transaction stream monitoring and risk scoring" },
        { num: "06", title: "Explainable AI Decision Engine", desc: "Decomposing composite risk scores into clear factor weights" },
        { num: "07", title: "Analyst Triage & Next Steps", desc: "Priority investigation queue, data readiness matrix, and phased pilot" }
      ];
      challengesMeta = {
        kicker: "PAYMENT FRAUD CHALLENGES",
        title: `Sub-Second Attacks Expose Legacy Banking Controls`,
        subtitle: `${companyName} processes millions of transactions daily, but disconnected fraud tools create critical settlement blind spots.`
      };
      challenges = [
        { title: "Sub-Second Latency Gap", desc: "Sophisticated account takeovers settle before batch rule engines finish scoring, locking in financial loss." },
        { title: "High False Positive Friction", desc: "Rigid static thresholds block legitimate high-value customers, creating churn and call center spikes." },
        { title: "Cross-Channel Blind Spots", desc: "Fraud rings exploit disconnected visibility across UPI, cards, net banking, and ATM terminals." },
        { title: "Unexplained AI Scoring", desc: "Legacy black-box risk scores provide no reasoning, forcing analysts to manually gather evidence across 5 systems." },
        { title: "Manual Queue Overload", desc: "Unranked alert queues force investigators to treat ₹2,000 alerts with the same urgency as ₹5,00,000 fraud." },
        { title: "Static Rule Drift", desc: "Fraud patterns evolve daily, while rule updates require weeks of engineering release cycles." }
      ];
      visionMeta = {
        kicker: "FRAUD DEFENSE VISION",
        title: `One Unified Real-Time Fraud Defense Engine`,
        subtitle: `A real-time data & AI intelligence platform empowering ${companyName} to intercept fraudulent transactions before settlement without friction.`
      };
      visionStages = [
        { num: "01", step: "Connect Streams", desc: "Securely ingest card, UPI, IMPS, and wire authorization feeds in real time (<50ms).", color: "1D6EE4" },
        { num: "02", step: "Unify Intelligence", desc: "Assemble 12-month behavioral spending baselines and device fingerprint repositories in the lakehouse.", color: "0E7C66" },
        { num: "03", step: "Score & Explain", desc: "Run transparent AI models to calculate composite risk scores (0–100) and identify exact fraud drivers.", color: "6366F1" },
        { num: "04", step: "Automate Action", desc: "Trigger instant Approve / Challenge / Block actions and route high-risk alerts to analyst queues.", color: "E54A24" }
      ];
      dataFoundationMeta = {
        kicker: "BANKING DATA FOUNDATION",
        title: `${companyName} Payment & Identity Data Foundation`,
        subtitle: "Connecting core payment switches, device telemetry, and customer histories to power real-time fraud AI."
      };
      dataFoundation = [
        { category: "Payment & Switch Authorizations", desc: "Real-time card, UPI, IMPS, wire authorization events, and terminal telemetry.", sourceSystems: "Payment Switch (ISO 8583/20022), Core Banking Ledger, UPI Gateway", fields: "txn_id, account_id, amount, currency, merchant_id, mcc_code, timestamp, channel", frequency: "Real-Time Streaming (<50ms)", readiness: "High Feasibility (Standard ISO Stream)" },
        { category: "Device Fingerprints & Digital Tokens", desc: "Device fingerprinting, IP address, OS/browser, mobile app version, and login session tokens.", sourceSystems: "Mobile Banking App, Web Portal, IAM / Auth Gateway", fields: "device_id, ip_address, browser_fp, os_version, session_duration, failed_attempts", frequency: "Real-Time Event (<100ms)", readiness: "SDK Telemetry Interface Ready" },
        { category: "Customer 360 & Account Baselines", desc: "Historical baseline spending profiles, typical locations, average transaction size, and beneficiary lists.", sourceSystems: "Core Banking System, CRM, Customer 360 Lakehouse", fields: "customer_id, typical_spend_range, frequent_locations, frequent_devices, account_age", frequency: "Continuous Lakehouse Sync", readiness: "Existing Lakehouse Ingestion" },
        { category: "Geographic Telemetry & ATM Feeds", desc: "IP geolocation, terminal GPS coordinates, ATM address coordinates, and impossible travel velocity checks.", sourceSystems: "GeoIP Feeds, Terminal Master DB, ATM Controller", fields: "latitude, longitude, country_code, city, travel_velocity_kmh", frequency: "Real-Time Calculation", readiness: "Direct Real-Time Feed Active" },
        { category: "AML Sanctions & Watchlist DB", desc: "Global sanctions, PEP records, internal fraud blacklist, and compromised card repositories.", sourceSystems: "AML Screening Engine, Fraud Bureau Watchlist", fields: "entity_name, sanction_id, match_confidence, risk_category", frequency: "Sub-Second Query", readiness: "API Query Ready" }
      ];
      architectureMeta = {
        kicker: "SOLUTION ARCHITECTURE",
        title: `Modern Real-Time Architecture for Sub-50ms Fraud Defense`,
        subtitle: "An end-to-end governed pipeline from payment event streaming to frontline investigator action."
      };
      solutionArchitecture = {
        ingestion: { title: "1. Stream Ingestion", subtitle: "Real-Time Event Streams", items: ["Card / UPI / IMPS Switch", "Mobile & Web Telemetry", "Terminal GPS Location Feeds", "Core Ledger Change Data Capture"] },
        storage: { title: "2. Unified Storage", subtitle: "Enterprise Delta Lakehouse", items: ["12-Month Behavioral History", "Customer 360 Feature Store", "Device Fingerprint Repository", "Historical Confirmed Labels"] },
        analytics: { title: "3. Real-Time Analytics", subtitle: "Streaming Query Engine", items: ["Sub-50ms Stream Processing", "Velocity & Amount Aggregations", "Geographic Displacement Check", "Rule Filter & Anomaly Radar"] },
        ai_layer: { title: "4. AI Scoring Engine", subtitle: "Machine Learning Layer", items: ["Composite Risk Score (0–100)", "Transparent Feature Weights", "Behavioral Outlier Classifier", "Action Decision Engine"] },
        action: { title: "5. Frontline Action", subtitle: "Command Board & Dispatch", items: ["Instant Approve / Challenge / Block", "Prioritized Analyst Work Queue", "One-Click Evidence Dossier", "Teams & SMS Alert Dispatch"] }
      };
      commandCenter = {
        kicker: "FRAUD THREAT RADAR  |  LIVE COMMAND CENTER",
        title: `${companyName} Real-Time Fraud Command Center`,
        subtitle: "Continuous sub-second evaluation of incoming payment streams with instant risk scoring and threat classification.",
        metrics: [
          { label: "Today's Evaluated Events", val: "1,420,850", note: "< 45 ms avg latency" },
          { label: "Critical Anomalies Intercepted", val: "48 Events", note: "100% routed to priority queue" },
          { label: "Direct Loss Prevented Today", val: "₹1.42 Cr", note: "Zero customer friction" },
          { label: "Current Active False Positive Rate", val: "0.82%", note: "Well below 1.5% target" }
        ],
        headers: ["Event ID", "Account / Entity", "Channel & Device", "Location Signal", "Amount", "Risk Score", "Decision Action"],
        colW: [1.5, 2.0, 2.2, 2.0, 1.4, 1.3, 1.88],
        channelName: "Mobile Banking App (iOS 18)",
        locDomestic: "Hyderabad (Domestic)",
        locForeign: "Dubai (Foreign IP Node)"
      };
      explainableExample = {
        kicker: "TRANSPARENT AI  |  EXPLAINABLE RISK ENGINE",
        title: "Why Did the AI Model Flag This Transaction?",
        subtitle: "Every automated decision provides an instant, transparent breakdown of risk factors for frontline analysts.",
        dossierTitle: "INSPECTED TRANSACTION DOSSIER",
        factorsTitle: "TRANSPARENT RISK FACTOR DECOMPOSITION",
        txnId: "TXN-89421",
        amount: "₹1,85,000",
        channel: "Mobile Banking App (Instant Transfer)",
        timestamp: "02:37 AM (Off-peak)",
        merchant: "High-Value Consumer Electronics",
        location: "Dubai, UAE (IP Geolocation)",
        baselineLocation: "Hyderabad, India (Established)",
        device: "New Device (iPhone 16 Pro — First Seen)",
        baselineDevice: "Samsung Galaxy S24 (Known 18 mos)",
        riskScore: 92,
        riskLevel: "CRITICAL RISK",
        decision: "CHALLENGE & ROUTE TO PRIORITY QUEUE",
        factors: [
          { factor: "Unrecognized Device Signature", weight: "+28", reason: "First authorization event recorded on this device ID" },
          { factor: "Impossible Travel / Geo Anomaly", weight: "+32", reason: "Physical distance 2,500 km from transaction 45 min earlier" },
          { factor: "High Transaction Value Outlier", weight: "+18", reason: "Value is 14x higher than customer's 90-day average spend" },
          { factor: "Off-Peak Time Window", weight: "+14", reason: "Attempt occurred at 02:37 AM outside typical active hours" }
        ]
      };
      behavioralProfile = {
        kicker: "BEHAVIORAL INTELLIGENCE  |  CUSTOMER PROFILE",
        title: "12-Month Spending Baseline vs. Cross-Border Outlier",
        subtitle: "Continuous machine learning compares every live transaction against 12 months of individual customer history.",
        baselineTitle: "ESTABLISHED 12-MONTH SPENDING PROFILE",
        anomalyTitle: "CURRENT HIGH-RISK TRANSACTION DEVIATION",
        entityName: "Retail High-Net-Worth Account (#HDFC-49102)",
        baseline: [
          { dimension: "Normal Geographic Area", value: "Hyderabad & Bengaluru, India", status: "Baseline" },
          { dimension: "Registered Primary Device", value: "Samsung Galaxy S24 (Android 14)", status: "Baseline" },
          { dimension: "Typical Transaction Size", value: "₹2,500 to ₹15,000 (Max ₹35,000)", status: "Baseline" },
          { dimension: "Active Daily Hours", value: "08:00 AM – 10:30 PM IST", status: "Baseline" },
          { dimension: "Frequent Merchant Types", value: "Groceries, Dining, Fuel, Utilities", status: "Baseline" }
        ],
        anomaly: [
          { dimension: "Current Geo Location", value: "Dubai, UAE (Foreign IP Node)", status: "Deviation (+32)" },
          { dimension: "Current Device", value: "Unverified iPhone 16 Pro (iOS 18)", status: "Deviation (+28)" },
          { dimension: "Current Amount", value: "₹1,85,000 Single Instant Push", status: "Deviation (+18)" },
          { dimension: "Current Time", value: "02:37 AM IST (High-Risk Window)", status: "Deviation (+14)" },
          { dimension: "Merchant Category", value: "High-Risk Luxury Electronics", status: "Deviation (+8)" }
        ],
        conclusion: "Current transaction deviates across 5 independent behavioral dimensions from 12-month baseline profile."
      };
      queueMeta = {
        kicker: "FRAUD INVESTIGATION  |  ACTION QUEUE",
        title: "AI-Prioritized Fraud Investigation Queue",
        subtitle: "Critical risk alerts are ranked with pre-assembled evidence dossiers so analysts triage cases in seconds.",
        headers: ["Priority Tier", "Case Ref", "Account / Entity", "Attempted Amount", "Primary Fraud Trigger", "One-Click Operational Action"],
        colW: [1.8, 1.4, 1.8, 1.6, 3.4, 2.48]
      };
      investigationQueue = [
        { caseId: "#FR-89421", entity: "Acct #49102", amount: "₹1,85,000", riskScore: 92, priority: "CRITICAL", trigger: "Geo displacement + New Device + High Value", action: "Step-Up MFA / Block & Call" },
        { caseId: "#FR-89418", entity: "Acct #11849", amount: "₹95,000", riskScore: 84, priority: "CRITICAL", trigger: "Velocity spike (4 txns in 90 sec) + Foreign IP", action: "Instant Card Freeze" },
        { caseId: "#FR-89405", entity: "Acct #77291", amount: "₹42,000", riskScore: 68, priority: "HIGH", trigger: "Unusual merchant category + Amount deviation", action: "SMS / App OTP Challenge" },
        { caseId: "#FR-89392", entity: "Acct #30214", amount: "₹18,500", riskScore: 45, priority: "MEDIUM", trigger: "Off-hours transaction from known device", action: "Passive Risk Log" },
        { caseId: "#FR-89381", entity: "Acct #65120", amount: "₹3,200", riskScore: 12, priority: "LOW", trigger: "Normal recurring utility payment", action: "Auto-Approved" }
      ];
      outcomesMeta = {
        kicker: "MEASURABLE BUSINESS IMPACT  |  FRAUD ROI",
        title: `Measurable Fraud Risk Performance for ${companyName}`,
        subtitle: "Projected operational benchmarks tailored specifically to payment fraud risk and analyst efficiency."
      };
      solutionKpis = [
        { name: "Fraud Loss Avoided", benchmark: "30–45% Reduction", desc: "Interception of high-value unauthorized transactions prior to settlement.", type: "Financial Impact" },
        { name: "False Positive Ratio", benchmark: "< 1.5% False Alert Rate", desc: "Minimizes unnecessary friction for legitimate high-value customers.", type: "Customer Experience" },
        { name: "Real-Time Scoring Latency", benchmark: "< 60 ms Decision TAT", desc: "Sub-second AI scoring within standard payment authorization time limits.", type: "Technical Performance" },
        { name: "Investigation Triage Velocity", benchmark: "3x Faster Case Resolution", desc: "Automated evidence assembly shortens analyst investigation cycle times.", type: "Operational Velocity" }
      ];
      closedLoopTitle = "CLOSED-LOOP FRAUD LEARNING ARCHITECTURE";
      closedLoopSteps = [
        { title: "1. Sub-Second Scoring", desc: "Live transaction evaluated against 12-month behavioral feature store in <60ms." },
        { title: "2. Priority Threat Routing", desc: "High-risk alerts instantly routed to analyst queue with transparent risk factors." },
        { title: "3. Investigator Triage", desc: "Analyst confirms fraud or clears customer with 1-click contextual evidence dossier." },
        { title: "4. Automated Model Retraining", desc: "Confirmed resolution retrains ML models to continuously eliminate false positives." }
      ];
      readinessMeta = {
        kicker: "DATA READINESS & FEASIBILITY MATRIX",
        title: "Payment Systems Integration & Data Feasibility",
        subtitle: "All required fraud telemetry feeds connect to existing payment switches without disrupting production auth flows."
      };
      roadmapMeta = {
        kicker: "DELIVERY ROADMAP",
        title: "A Phased Path to Sub-Second Fraud Defense",
        subtitle: `A structured milestone plan delivering live fraud protection across ${companyName} within 8 weeks.`
      };
      roadmapPhases = [
        { title: "1. Payment Ingestion & Tokenization Setup", time: "Weeks 1–4", items: ["Stand up secure PCI-DSS cloud lakehouse", "Connect ISO payment switch authorization streams", "Ingest mobile device fingerprint telemetry", "Establish cryptographic tokenization & masking"] },
        { title: "2. Sub-Second AI Model Pilot", time: "Weeks 5–8", items: ["Deploy real-time fraud scoring engine in shadow mode", "Calibrate explainable risk factor weights", "Train fraud analysts on prioritized triage queue", "Measure baseline fraud catch rate & false positive ratio"] },
        { title: "3. Full Channel Production Rollout", time: "Months 3–6", items: ["Activate real-time blocking across UPI, cards, and net banking", "Integrate automated step-up MFA challenge webhooks", "Deploy fraud investigator mobile alerts & Teams bot", "Automate closed-loop chargeback feedback retraining"] },
        { title: "4. Cross-Border & Ring Graph Scaling", time: "Months 6+", items: ["Expand behavioral models across business banking & wealth", "Enable cross-channel fraud ring graph analytics", "Benchmark fraud loss reduction with executive board", "Deploy federated learning for emerging attack vectors"] }
      ];
      nextStepsMeta = {
        kicker: "NEXT STEPS & ENGAGEMENT PLAN",
        title: `Next Steps to Initiate Fraud Discovery for ${companyName}`,
        subtitle: "A collaborative 3-step path to validate payment stream readiness and launch the live fraud pilot."
      };
      nextSteps = [
        { num: "01", title: "3-Week Payment Switch & ISO Message Audit", desc: `Collaborate with ${companyName} payment engineering to review ISO 8583 message streams, device SDK payloads, and sub-50ms latency boundaries.` },
        { num: "02", title: "Fraud Loss & False Positive Baseline Measurement", desc: "Analyze 90 days of historical authorization logs to quantify current false positive rates, missed fraud loss, and analyst review cycle times." },
        { num: "03", title: "8-Week Shadow Pilot & Real-Time Scoring Launch", desc: "Deploy the sub-second fraud decision engine running in parallel with existing payment switches to validate a 30%+ loss reduction." }
      ];
      break;

    case "healthcare_bed":
      agendaItems = [
        { num: "01", title: "Inpatient Bottlenecks", desc: "Why delayed discharges and ED boarding create hospital capacity strain" },
        { num: "02", title: "Patient Flow Vision", desc: "Connecting ADT feeds, nurse stations, and EVS housekeeping into one live radar" },
        { num: "03", title: "Clinical Data Foundation", desc: "Integrating EHR orders, ED triage acuity, and room clean state without disruption" },
        { num: "04", title: "Hospital Flow Architecture", desc: "End-to-end governed pipeline from HL7 event streams to bed placement dispatch" },
        { num: "05", title: "Hospital Bed Command Board", desc: "Real-time occupancy tracking, bed turnaround timers, and acuity heatmaps" },
        { num: "06", title: "Predictive Discharge Assistant", desc: "Pinpointing discharge barriers (lab results, transport, meds) hours in advance" },
        { num: "07", title: "EVS Dispatch & Next Steps", desc: "Automated housekeeping queue, clinical readiness matrix, and pilot roadmap" }
      ];
      challengesMeta = {
        kicker: "CLINICAL CAPACITY BOTTLENECKS",
        title: `Siloed Bed Data Causes Emergency Boarding Delays`,
        subtitle: `${companyName} manages hundreds of inpatient admissions daily, but disconnected EHR and housekeeping tools slow patient transfers.`
      };
      challenges = [
        { title: "Emergency Department Boarding", desc: "Admitted patients wait 4+ hours in ED hallways because inpatient bed availability is not visible in real time." },
        { title: "Uncoordinated Discharge Handoffs", desc: "Physicians sign discharge orders hours before nursing, pharmacy, and patient transport prepare the patient." },
        { title: "Housekeeping Turnover Delays", desc: "Dirty beds sit unassigned for 60+ minutes because cleaning requests rely on manual phone calls and radio checks." },
        { title: "Clinical Unit Mismatches", desc: "Patients requiring telemetry or step-down beds are misrouted, causing acute care bottlenecks." },
        { title: "Unpredictable Inpatient Surges", desc: "Bed placement leads have zero predictive visibility into afternoon emergency and post-op surgical admissions." },
        { title: "Siloed EHR & Bed Systems", desc: "Nursing staff spend 25% of their shift updating manual whiteboards and tracking down bed statuses." }
      ];
      visionMeta = {
        kicker: "PATIENT FLOW VISION",
        title: `One Unified Real-Time Hospital Capacity Hub`,
        subtitle: `A unified real-time clinical intelligence platform connecting ADT feeds, nursing stations, and environmental services into an active patient flow cockpit.`
      };
      visionStages = [
        { num: "01", step: "Connect HL7 Feeds", desc: "Ingest real-time ADT feeds, ED triage trackers, and nurse station orders in <100ms.", color: "1D6EE4" },
        { num: "02", step: "Unify Bed State", desc: "Create a single live census and bed availability state across all hospital floors in the clinical lakehouse.", color: "0E7C66" },
        { num: "03", step: "Predict Surges", desc: "Forecast unit-level bed demand 8–12 hours ahead and identify uncompleted discharge barriers.", color: "6366F1" },
        { num: "04", step: "Orchestrate Care", desc: "Dispatch mobile cleaning tasks to housekeeping and recommend optimal room placements.", color: "E54A24" }
      ];
      dataFoundationMeta = {
        kicker: "CLINICAL DATA FOUNDATION",
        title: `${companyName} EHR & Patient Flow Data Foundation`,
        subtitle: "Integrating ADT messages, ED triage feeds, and EVS housekeeping telemetry into a unified clinical lakehouse."
      };
      dataFoundation = [
        { category: "Admission, Discharge & Transfer (ADT)", desc: "Real-time HL7/FHIR admission feeds, room assignments, transfer requests, and discharge orders.", sourceSystems: "EHR / EMR (Epic, Cerner, Meditech), ADT Interface Engine", fields: "patient_id, bed_id, unit_id, admission_ts, expected_discharge_ts, discharge_order_ts", frequency: "Real-Time Stream (<100ms)", readiness: "High Feasibility (HL7v2 / FHIR)" },
        { category: "Emergency Department Triage Feeds", desc: "Live ED waiting queue, triage acuity scores (ESI 1–5), boarder counts, and bed requests.", sourceSystems: "ED Information System (EDIS), Triage Workstation", fields: "encounter_id, esi_level, door_ts, triage_ts, bed_request_ts, disposition_ts", frequency: "Real-Time Streaming", readiness: "Interface Engine Active" },
        { category: "LIMS Lab & Diagnostic Turnaround", desc: "Live lab order timestamps, critical result releases, radiology/PACS scanning and report availability.", sourceSystems: "LIMS, Radiology PACS, Clinical Portal", fields: "order_id, test_type, order_ts, specimen_collected_ts, result_verified_ts", frequency: "Real-Time Webhooks", readiness: "Standard API Connector" },
        { category: "EVS Housekeeping & Bed Turnover", desc: "Bed vacancy signals, housekeeping dispatch times, cleaning cycle progress, and nurse confirmation.", sourceSystems: "Bed Management Platform, Housekeeping Mobile App", fields: "bed_id, bed_status, dirty_ts, assigned_ts, cleaning_complete_ts, occupied_ts", frequency: "Real-Time Mobile Telemetry", readiness: "Mobile App Webhook Ready" },
        { category: "Pharmacy Discharge Medication Dispense", desc: "Medication reconciliation status, discharge prescription order entry, and bedside delivery confirmation.", sourceSystems: "Inpatient Pharmacy Dispense System", fields: "rx_id, med_type, dispense_ts, delivery_ts", frequency: "Continuous Stream & CDC", readiness: "Direct Database Sync Active" }
      ];
      architectureMeta = {
        kicker: "CLINICAL SOLUTION ARCHITECTURE",
        title: `How Real-Time Data & AI Powers Intelligent Patient Flow`,
        subtitle: "An end-to-end governed pipeline from HL7 clinical events to frontline bed coordinator dispatch."
      };
      solutionArchitecture = {
        ingestion: { title: "1. Clinical Ingestion", subtitle: "HL7 & Telemetry Streams", items: ["HL7 / FHIR ADT Feeds", "ED Triage & Boarding Telemetry", "LIMS Lab & PACS Imaging Feeds", "EVS Mobile Housekeeping Signals"] },
        storage: { title: "2. Clinical Lakehouse", subtitle: "Secure Delta Lakehouse", items: ["Unit-Level Occupancy History", "Clinical Flow Feature Store", "Bed State & Turnaround Logs", "CMS Quality & ALOS Baselines"] },
        analytics: { title: "3. Real-Time Flow Engine", subtitle: "Streaming Analytics Engine", items: ["Sub-Second Unit Capacity Radar", "Discharge Barrier NLP Classifier", "Inpatient Surge Predictor", "Nurse Staffing Balance Stream"] },
        ai_layer: { title: "4. Capacity AI Engine", subtitle: "Predictive Clinical AI", items: ["8-Hour Bed Demand Forecast", "Discharge Readiness Score", "Step-Down Routing Recommender", "ED Boarding Risk Model"] },
        action: { title: "5. Frontline Care Action", subtitle: "Clinical Care Dispatch", items: ["Bed Placement Command Board", "Automated EVS Cleaning Dispatch", "Discharge Meds Priority Queue", "Nurse Station Mobile Alerts"] }
      };
      commandCenter = {
        kicker: "CAPACITY COMMAND  |  BED ORCHESTRATION",
        title: `${companyName} Inpatient Flow & Bed Command Center`,
        subtitle: "Continuous sub-second tracking of unit occupancy, discharge orders, and housekeeping turnaround state.",
        metrics: [
          { label: "Today's Monitored Inpatients", val: "1,280 Patients", note: "< 45 ms stream latency" },
          { label: "Priority Discharges Expedited", val: "42 Beds", note: "100% routed to priority EVS" },
          { label: "ED Boarding Hours Saved", val: "185 Hours", note: "Zero transfer delays" },
          { label: "Average Bed Turnaround Time", val: "38 min", note: "Well below 45 min target" }
        ],
        headers: ["Event Ref", "Patient Unit / Room", "Channel & Source", "Hospital Location", "Status / Transfer", "Urgency Score", "Recommended Action"],
        colW: [1.5, 2.0, 2.2, 2.0, 1.4, 1.3, 1.88],
        channelName: "Nurse Station / ADT Feed",
        locDomestic: "Wing B Telemetry Floor",
        locForeign: "ED Acute Triage Bay"
      };
      explainableExample = {
        kicker: "CLINICAL AI  |  DISCHARGE BOTTLENECK DETECTION",
        title: "Why Was This Bed Turnaround Flagged for Delay?",
        subtitle: "AI analyzes clinical notes, pending orders, and room status to pinpoint the exact handoff barrier.",
        dossierTitle: "PATIENT FLOW BOTTLENECK DOSSIER",
        factorsTitle: "CLINICAL DELAY FACTOR BREAKDOWN",
        txnId: "BED-ORCH-402",
        amount: "Bed #ICU-08 → Med-Surg Step-Down",
        channel: "Clinical Bed Orchestrator",
        timestamp: "10:15 AM (Peak Morning Discharge)",
        merchant: "General Medicine Floor 4",
        location: "Main Hospital Tower, Wing B",
        baselineLocation: "Standard ICU Step-Down Flow",
        device: "Nurse Station Workstation & Bed Sensor",
        baselineDevice: "Standard 45-min turnover target",
        riskScore: 88,
        riskLevel: "HIGH DELAY RISK",
        decision: "PRIORITIZE EVS DISPATCH & ESCALATE PHARMACY DISCHARGE MEDS",
        factors: [
          { factor: "Discharge Order Signed but Bed Occupied", weight: "+35", reason: "Discharge order entered 110 min ago; waiting on take-home medications" },
          { factor: "ED Boarding Pressure for Telemetry", weight: "+28", reason: "3 cardiac patients waiting in ED with >2h boarding time" },
          { factor: "Housekeeping Queue Latency", weight: "+15", reason: "No housekeeping staff currently assigned to Room 412 clean" },
          { factor: "Pending Diagnostic Lab Verification", weight: "+10", reason: "Final blood chemistry panel released 12 min ago" }
        ]
      };
      behavioralProfile = {
        kicker: "CAPACITY RADAR  |  UNIT OPERATING PROFILE",
        title: "Target Turnaround Baseline vs. Shift Surge Outlier",
        subtitle: "Continuous machine learning tracks unit discharge velocity against 12 months of floor performance.",
        baselineTitle: "ESTABLISHED UNIT PERFORMANCE BASELINE",
        anomalyTitle: "CURRENT DISCHARGE BOTTLENECK DEVIATION",
        entityName: "Inpatient Floor Unit 4B (Cardiac Telemetry)",
        baseline: [
          { dimension: "Target Bed Turnaround Time", value: "45 minutes from discharge to ready", status: "Target" },
          { dimension: "Average Discharge Time", value: "11:00 AM – 01:30 PM daily", status: "Baseline" },
          { dimension: "Average Length of Stay (ALOS)", value: "3.8 days for general telemetry", status: "Baseline" },
          { dimension: "Housekeeping Response Time", value: "Within 15 minutes of request", status: "Baseline" }
        ],
        anomaly: [
          { dimension: "Current Bed Turnaround Time", value: "118 minutes (73 min delay)", status: "Delay (+35)" },
          { dimension: "Current Inpatient Occupancy", value: "98.5% with 4 ED patients boarding", status: "Surge (+28)" },
          { dimension: "Pending Housekeeping Clean", value: "3 beds dirty with no staff assigned", status: "Queue (+15)" },
          { dimension: "Pharmacy Discharge Wait", value: "42 minutes average delay", status: "Friction (+10)" }
        ],
        conclusion: "Early discharge bottlenecks identified 3 hours before afternoon ED admission peak."
      };
      queueMeta = {
        kicker: "CARE DISPATCH  |  BED EXPEDITE QUEUE",
        title: "AI-Prioritized Bed Placement & Clean Dispatch Queue",
        subtitle: "Critical capacity bottlenecks are prioritized so bed placement coordinators and EVS teams act in seconds.",
        headers: ["Priority Tier", "Case Ref", "Unit / Bed Ref", "Patient Handoff Status", "Primary Delay Factor", "One-Click Operational Action"],
        colW: [1.8, 1.4, 1.8, 1.6, 3.4, 2.48]
      };
      investigationQueue = [
        { caseId: "#BED-402", entity: "Room 412 (Step-down)", amount: "ICU Transfer Waiting", riskScore: 88, priority: "CRITICAL", trigger: "ICU patient waiting for clean telemetry bed > 90 min", action: "Dispatch Housekeeping Priority" },
        { caseId: "#BED-398", entity: "Room 308 (Med-Surg)", amount: "ED Boarder Waiting", riskScore: 82, priority: "CRITICAL", trigger: "ESI-2 patient boarding in ED for 140 min", action: "Expedite Pharmacy Meds" },
        { caseId: "#BED-391", entity: "Room 520 (Ortho)", amount: "Pending Discharge", riskScore: 65, priority: "HIGH", trigger: "Transport delay for post-op discharge", action: "Alert Patient Transport" },
        { caseId: "#BED-384", entity: "Room 214 (Pediatrics)", amount: "Routine Turnover", riskScore: 40, priority: "MEDIUM", trigger: "Scheduled cleaning in progress", action: "Standard Monitoring" },
        { caseId: "#BED-379", entity: "Room 105 (Observation)", amount: "Normal Flow", riskScore: 15, priority: "LOW", trigger: "Patient admitted without delay", action: "Auto-Logged" }
      ];
      outcomesMeta = {
        kicker: "MEASURABLE CLINICAL IMPACT  |  CAPACITY ROI",
        title: `Measurable Flow & Capacity Performance for ${companyName}`,
        subtitle: "Projected operational benchmarks tailored specifically to inpatient bed turnover and ED throughput."
      };
      solutionKpis = [
        { name: "Average Length of Stay (ALOS)", benchmark: "0.5–0.8 Day Reduction", desc: "Shortens non-clinical wait times on day of discharge.", type: "Clinical & Capacity" },
        { name: "ED Boarding Hours", benchmark: "25–35% Reduction", desc: "Reduces hours patients spend waiting in ED for inpatient beds.", type: "Patient Flow" },
        { name: "Bed Cleaning Turnaround", benchmark: "< 45 min Average TAT", desc: "Accelerates room turnover between patient discharge and admission.", type: "Operational Velocity" },
        { name: "Early Morning Discharge %", benchmark: "↑ 20–30% Lift", desc: "Increases discharges completed before 11:00 AM to unlock bed supply.", type: "Capacity Optimization" }
      ];
      closedLoopTitle = "CONTINUOUS CLINICAL DISCHARGE FEEDBACK LOOP";
      closedLoopSteps = [
        { title: "1. Real-Time Bed Sensing", desc: "Live ADT discharge orders and bed state updates streamed in <50ms." },
        { title: "2. AI Barrier Detection", desc: "Predicts pending lab results, medication delivery, and transport delays hours before shift end." },
        { title: "3. Frontline Care Orchestration", desc: "Bed placement leads trigger automated mobile task dispatch to EVS housekeeping and pharmacy." },
        { title: "4. Inpatient Flow Calibration", desc: "Actual floor turnaround times fed back into the lakehouse to sharpen unit capacity forecasts." }
      ];
      readinessMeta = {
        kicker: "CLINICAL DATA READINESS & FEASIBILITY MATRIX",
        title: "EHR Integration & Clinical Data Feasibility Assessment",
        subtitle: "All required patient flow streams connect via standard HL7/FHIR interfaces without touching core EHR clinical databases."
      };
      roadmapMeta = {
        kicker: "DELIVERY ROADMAP",
        title: "A Phased Path to Hospital-Wide Patient Flow",
        subtitle: `A structured milestone plan delivering live bed capacity orchestration across ${companyName} within 8 weeks.`
      };
      roadmapPhases = [
        { title: "1. Clinical Ingestion & HIPAA Lakehouse Setup", time: "Weeks 1–4", items: ["Stand up secure HIPAA-compliant cloud lakehouse", "Connect live HL7 ADT and ED triage eventstreams", "Validate clinical message schema fidelity", "Implement role-based clinical access controls"] },
        { title: "2. Pilot Inpatient Floor Deployment", time: "Weeks 5–8", items: ["Deploy bed flow command board on 2 pilot floors", "Calibrate discharge barrier prediction model", "Train bed placement leads & nurse coordinators", "Establish baseline ED boarding time benchmarks"] },
        { title: "3. Hospital-Wide Floor & ICU Rollout", time: "Months 3–6", items: ["Expand live tracking to all acute & ICU units", "Integrate automated EVS housekeeping dispatch", "Deploy clinical leadership executive analytics", "Activate automated pharmacy discharge alerts"] },
        { title: "4. Health Network Capacity Optimization", time: "Months 6+", items: ["Deploy cross-hospital transfer orchestration", "Optimize multi-facility patient load balancing", "Benchmark network-wide ALOS reduction with leadership", "Enable continuous machine learning retraining"] }
      ];
      nextStepsMeta = {
        kicker: "NEXT STEPS & ENGAGEMENT PLAN",
        title: `Next Steps to Initiate Bed Flow Discovery for ${companyName}`,
        subtitle: "A collaborative 3-step path to validate clinical data readiness and launch the live capacity pilot."
      };
      nextSteps = [
        { num: "01", title: "3-Week Clinical IT & HL7 Interface Audit", desc: `Collaborate with ${companyName} clinical IT and EHR teams to map ADT feeds, room clean states, and ED tracker endpoints.` },
        { num: "02", title: "Unit Baseline Measurement & Flow Target Definition", desc: "Jointly establish current floor metrics (ALOS, ED boarding hours, room turnover times) and set target improvement thresholds with nursing leads." },
        { num: "03", title: "8-Week Rapid Clinical Floor Deployment", desc: "Deploy the live bed operations command center connected to hospital ADT feeds across 2 pilot inpatient units to prove immediate throughput gains." }
      ];
      break;

    case "retail_inventory":
      agendaItems = [
        { num: "01", title: "Omnichannel Stock Friction", desc: "Why delayed POS sensing and siloed DCs trigger costly store stockouts" },
        { num: "02", title: "Demand Sensing Vision", desc: "Connecting register POS streams, online carts, and WMS ledgers in real time" },
        { num: "03", title: "Retail Data Foundation", desc: "Integrating store inventory, DC buffer stocks, and vendor purchase orders" },
        { num: "04", title: "Supply Chain Architecture", desc: "End-to-end governed flow from store barcode scans to automated PO generation" },
        { num: "05", title: "Inventory Fulfillment Tower", desc: "Real-time SKU velocity tracking, stockout risk heatmaps, and fill rates" },
        { num: "06", title: "Dynamic Demand Forecaster", desc: "Explaining hourly sell-through surges and weather/promotional lift drivers" },
        { num: "07", title: "Store Reorder Triage & Pilot", desc: "Automated replenishment queue, supply readiness matrix, and rollout roadmap" }
      ];
      challengesMeta = {
        kicker: "RETAIL SUPPLY CHAIN CHALLENGES",
        title: `Delayed POS Signals Drive Stockouts & Excess Inventory`,
        subtitle: `${companyName} manages thousands of retail SKUs across stores and warehouses, but batch replenishment misses real-time demand spikes.`
      };
      challenges = [
        { title: "Costly Out-of-Stock Spikes", desc: "Fast-selling SKUs run out of stock during peak promotional weekends before regional distribution centers can react." },
        { title: "Excess Safety Stock Buildup", desc: "Store managers hoard buffer inventory in backrooms, tying up working capital and driving seasonal markdowns." },
        { title: "Channel Inventory Blind Spots", desc: "Online fulfillment centers and physical stores lack unified real-time stock visibility, causing cancelled orders." },
        { title: "Slow Demand Sensing", desc: "Regional demand shifts are discovered weeks later in monthly sales reports rather than in live POS streams." },
        { title: "Manual Store Replenishment", desc: "Store associates spend hours weekly compiling replenishment orders across fragmented supplier portals." },
        { title: "Supplier Lead-Time Volatility", desc: "Inbound vendor delivery delays trigger cascading stockouts across entire regional retail clusters." }
      ];
      visionMeta = {
        kicker: "DEMAND SENSING VISION",
        title: `One Unified Omnichannel Inventory Control Tower`,
        subtitle: `A unified real-time data & AI platform connecting store POS feeds, e-commerce orders, and warehouse inventory into an automated replenishment hub.`
      };
      visionStages = [
        { num: "01", step: "Ingest POS Streams", desc: "Stream live register sales, online carts, and barcode scans in real time (<100ms).", color: "1D6EE4" },
        { num: "02", step: "Unify Stock Ledger", desc: "Maintain a single source of inventory truth across all stores and DCs in the omnichannel lakehouse.", color: "0E7C66" },
        { num: "03", step: "Forecast Demand", desc: "Predict store-level SKU demand taking into account local weather, promotions, and seasonality.", color: "6366F1" },
        { num: "04", step: "Automate Reorder", desc: "Generate automated DC transfer orders and supplier purchase orders before shelves empty.", color: "E54A24" }
      ];
      dataFoundationMeta = {
        kicker: "RETAIL DATA FOUNDATION",
        title: `${companyName} POS & Supply Chain Data Foundation`,
        subtitle: "Integrating store checkout streams, e-commerce cart events, and warehouse inventory ledgers into the lakehouse."
      };
      dataFoundation = [
        { category: "Point-of-Sale (POS) Checkout Streams", desc: "Live store register sales, online cart checkouts, returns, and inventory scan events.", sourceSystems: "Store POS System, E-Commerce Platform (Shopify/SAP Commerce), Mobile App", fields: "sku_id, store_id, units_sold, unit_price, return_flag, timestamp, channel", frequency: "Real-Time Streaming (<100ms)", readiness: "High Feasibility (Direct POS Stream)" },
        { category: "Warehouse & DC Inventory Ledgers", desc: "On-hand inventory, in-transit purchase orders, backroom counts, and bin locations.", sourceSystems: "Warehouse Management System (WMS), ERP (SAP/Oracle)", fields: "sku_id, warehouse_id, qty_on_hand, qty_reserved, qty_in_transit, safety_stock", frequency: "Continuous Stream & CDC", readiness: "Standard ERP / WMS CDC Ready" },
        { category: "Supplier Inbound EDI Purchase Orders", desc: "Inbound vendor shipments, estimated arrival dates, supplier fill rates, and lead-time logs.", sourceSystems: "Supplier EDI Portal (EDI 850/856), Supply Chain Tower", fields: "po_number, vendor_id, expected_delivery_ts, actual_delivery_ts, fill_rate", frequency: "Daily & Webhook Updates", readiness: "Standard EDI Translator Ready" },
        { category: "Promotional & Regional Weather Calendars", desc: "Active marketing campaigns, seasonal discounts, local weather forecasts, and regional events.", sourceSystems: "Merchandising Engine, Marketing DB, Weather API", fields: "campaign_id, discount_pct, start_date, end_date, regional_temp_delta", frequency: "Daily Scheduled Sync", readiness: "External REST API Available" },
        { category: "Customer Loyalty & Return Signals", desc: "Customer repeat purchases, store return rates, and omnichannel cart abandonment events.", sourceSystems: "Customer Data Platform (CDP), Loyalty Engine", fields: "customer_id, return_reason, abandoned_sku, loyalty_tier", frequency: "Hourly Event Ingestion", readiness: "CDP Connector Ready" }
      ];
      architectureMeta = {
        kicker: "SUPPLY CHAIN ARCHITECTURE",
        title: `How Real-Time Data & AI Powers Demand Fulfillment`,
        subtitle: "An end-to-end governed pipeline from store register scans to automated supplier purchase orders."
      };
      solutionArchitecture = {
        ingestion: { title: "1. Retail Stream Ingestion", subtitle: "POS & Event Streams", items: ["Store POS & Register Feeds", "E-Commerce Cart Checkouts", "WMS Inventory Barcode Scans", "Supplier Inbound EDI Feeds"] },
        storage: { title: "2. Omnichannel Lakehouse", subtitle: "Unified Delta Lakehouse", items: ["Unified Store & DC Stock Ledger", "SKU Demand History & Seasonality", "Supplier Performance Feature Store", "Promotional Elasticity Logs"] },
        analytics: { title: "3. Real-Time Demand Engine", subtitle: "Real-Time Query Engine", items: ["Hourly SKU Sell-Through Velocity", "Stockout Risk Anomaly Detector", "Cross-Store Transfer Matcher", "Promotional Lift Calculator"] },
        ai_layer: { title: "4. Dynamic AI Allocator", subtitle: "Predictive Demand AI", items: ["Multi-Echelon Demand Forecaster", "Automated Reorder Quantity Model", "Markdown Optimization Engine", "Vendor Lead-Time Risk Model"] },
        action: { title: "5. Frontline Retail Action", subtitle: "Store & Merchandiser Action", items: ["Live Store Inventory Command Board", "Automated Supplier PO Trigger", "Store-to-Store Transfer Dispatch", "Merchandiser Alert Workbench"] }
      };
      commandCenter = {
        kicker: "FULFILLMENT TOWER  |  OMNICHANNEL INVENTORY",
        title: `${companyName} Omnichannel Inventory Control Tower`,
        subtitle: "Continuous real-time tracking of store on-hand stock, warehouse buffers, and hourly SKU sell-through rates.",
        metrics: [
          { label: "Today's Monitored SKUs", val: "450,000 SKUs", note: "< 50 ms stock updates" },
          { label: "Imminent Stockouts Prevented", val: "128 Items", note: "Auto-reorder dispatched" },
          { label: "Working Capital Unlocked", val: "₹3.8 Cr", note: "Safety stock optimized" },
          { label: "Omnichannel On-Time Fill Rate", val: "98.4%", note: "Above 95% SLA target" }
        ],
        headers: ["SKU / Item Ref", "Store / Warehouse", "Channel & Category", "Regional Location", "On-Hand vs Demand", "Stockout Risk", "Automated Action"],
        colW: [1.6, 2.0, 2.2, 1.8, 1.6, 1.2, 1.88],
        channelName: "Store POS / E-Commerce Feed",
        locDomestic: "Mumbai Metro DC",
        locForeign: "Bengaluru Flagship Store"
      };
      explainableExample = {
        kicker: "DEMAND SENSING  |  STOCKOUT RISK PREDICTOR",
        title: "Why Was This SKU Flagged for Immediate Replenishment?",
        subtitle: "AI compares hourly register sell-through against backroom stock and supplier lead times.",
        dossierTitle: "SKU REPLENISHMENT DOSSIER",
        factorsTitle: "DEMAND SURGE FACTOR BREAKDOWN",
        txnId: "SKU-OPT-902",
        amount: "SKU #APP-55201 (Premium Outerwear)",
        channel: "Regional POS & E-Commerce Hub",
        timestamp: "11:30 AM (Weekend Peak)",
        merchant: "Western Regional Retail Cluster",
        location: "Mumbai Flagship Store (Store #104)",
        baselineLocation: "Standard Weekend Run Rate (12 units/day)",
        device: "Store POS Stream & RFID Backroom Scan",
        baselineDevice: "Standard 7-day replenishment cycle",
        riskScore: 91,
        riskLevel: "CRITICAL STOCKOUT RISK",
        decision: "TRIGGER EMERGENCY DC REPLENISHMENT & CROSS-STORE TRANSFER",
        factors: [
          { factor: "Sell-Through Velocity Surge", weight: "+38", reason: "Current hourly sales rate is 4.5x higher than historical Sunday baseline" },
          { factor: "Backroom Stock Exhaustion", weight: "+28", reason: "Only 4 units remain in store backroom; projected stockout in 110 minutes" },
          { factor: "Regional DC Proximity", weight: "+15", reason: "Mumbai Metro DC has 450 units on-hand with 2-hour delivery window" },
          { factor: "Promotional Weekend Campaign", weight: "+10", reason: "Active 20% seasonal promotion driving heightened footfall" }
        ]
      };
      behavioralProfile = {
        kicker: "STORE PROFILE  |  DEMAND ELASTICITY BASELINE",
        title: "Store Baseline Sell-Through vs. Weekend Promo Surge",
        subtitle: "Continuous machine learning evaluates local store sales velocity against 12 months of POS history.",
        baselineTitle: "ESTABLISHED 12-MONTH SALES VELOCITY BASELINE",
        anomalyTitle: "CURRENT PROMOTIONAL DEMAND SPIKE",
        entityName: "Store #104 Inventory Profile (High-Volume Apparel)",
        baseline: [
          { dimension: "Normal Daily Sell-Through", value: "8–14 units per weekend day", status: "Baseline" },
          { dimension: "Target Backroom Buffer", value: "3 days safety stock on-hand", status: "Target" },
          { dimension: "Lead Time from DC", value: "Next-day scheduled replenishment", status: "Baseline" },
          { dimension: "On-Time In-Stock Rate", value: "95% nominal availability", status: "Baseline" }
        ],
        anomaly: [
          { dimension: "Current Hourly Velocity", value: "18 units sold in 2 hours", status: "Surge (+38)" },
          { dimension: "Current Stock Level", value: "4 units remaining (under 2h runway)", status: "Critical (+28)" },
          { dimension: "Local DC Availability", value: "450 units ready for rapid transfer", status: "Available (+15)" },
          { dimension: "Projected Lost Sales", value: "₹2.4 Lakhs if unfulfilled today", status: "High Risk (+10)" }
        ],
        conclusion: "Stockout bottleneck flagged 4 hours before store inventory depletion."
      };
      queueMeta = {
        kicker: "SUPPLY CHAIN ACTION  |  REORDER QUEUE",
        title: "AI-Prioritized Store Replenishment Queue",
        subtitle: "High-risk stockouts are ranked with automated transfer recommendations so merchandisers fulfill demand in minutes.",
        headers: ["Priority Tier", "Case Ref", "Store / Warehouse", "Current Stock Runway", "Primary Demand Trigger", "One-Click Operational Action"],
        colW: [1.8, 1.4, 1.8, 1.6, 3.4, 2.48]
      };
      investigationQueue = [
        { caseId: "#SKU-902", entity: "Store #104 (Mumbai)", amount: "4 Units Remaining", riskScore: 91, priority: "CRITICAL", trigger: "Sell-through velocity 4.5x surge + 2h stock left", action: "Trigger Fast-Track DC Dispatch" },
        { caseId: "#SKU-895", entity: "Store #208 (Delhi)", amount: "8 Units Remaining", riskScore: 84, priority: "CRITICAL", trigger: "Promotional campaign stock depletion spike", action: "Cross-Store Transfer from Store #212" },
        { caseId: "#SKU-882", entity: "Store #315 (Pune)", amount: "15 Units Remaining", riskScore: 68, priority: "HIGH", trigger: "Inbound supplier PO delayed 24h", action: "Reallocate DC Buffer Stock" },
        { caseId: "#SKU-870", entity: "Store #402 (Chennai)", amount: "32 Units (Nominal)", riskScore: 35, priority: "MEDIUM", trigger: "Slight weekend demand variation", action: "Standard Replenishment Order" },
        { caseId: "#SKU-861", entity: "Store #510 (Hyderabad)", amount: "65 Units (Balanced)", riskScore: 10, priority: "LOW", trigger: "Normal inventory velocity", action: "Auto-Logged" }
      ];
      outcomesMeta = {
        kicker: "MEASURABLE BUSINESS IMPACT  |  SUPPLY CHAIN ROI",
        title: `Measurable Inventory & Fulfillment ROI for ${companyName}`,
        subtitle: "Projected operational benchmarks tailored specifically to store on-shelf availability and working capital."
      };
      solutionKpis = [
        { name: "Out-of-Stock Rate", benchmark: "25–40% Reduction", desc: "Eliminates empty shelves during high-demand promotional peaks.", type: "Revenue & Availability" },
        { name: "Safety Stock Capital Unlocked", benchmark: "15–20% Reduction", desc: "Lowers excess backroom inventory and inventory holding costs.", type: "Working Capital" },
        { name: "Forecast Accuracy Lift", benchmark: "↑ 18–25% Accuracy", desc: "Sharpens store-level demand forecasting using real-time POS streams.", type: "Operational Velocity" },
        { name: "Replenishment Cycle Time", benchmark: "50% Faster Fulfillment", desc: "Automates reorder triggers directly to regional distribution centers.", type: "Supply Chain Velocity" }
      ];
      closedLoopTitle = "CLOSED-LOOP DEMAND SENSING & REPLENISHMENT";
      closedLoopSteps = [
        { title: "1. Real-Time POS Demand Sensing", desc: "Live register transactions and online cart checkouts ingested in real time (<100ms)." },
        { title: "2. Stockout Velocity Prediction", desc: "ML models compare hourly sales against backroom stock to flag imminent stockout risks." },
        { title: "3. Automated DC & Store Dispatch", desc: "System auto-generates optimized DC transfers and supplier reorders before shelves empty." },
        { title: "4. Promotional Elasticity Tuning", desc: "Actual promotional sales lift is fed back to fine-tune future seasonal demand elasticity." }
      ];
      readinessMeta = {
        kicker: "RETAIL DATA READINESS & FEASIBILITY MATRIX",
        title: "POS & Supply Chain Data Feasibility Assessment",
        subtitle: "All required inventory streams connect via standard POS streaming and WMS APIs without disruption."
      };
      roadmapMeta = {
        kicker: "DELIVERY ROADMAP",
        title: "A Phased Path to Omnichannel Fulfillment",
        subtitle: `A structured milestone plan delivering live replenishment automation across ${companyName} within 8 weeks.`
      };
      roadmapPhases = [
        { title: "1. POS & WMS Stream Ingestion Setup", time: "Weeks 1–4", items: ["Stand up enterprise supply chain lakehouse", "Connect live store POS register streams & online carts", "Ingest WMS on-hand inventory ledgers", "Establish unified SKU master data model"] },
        { title: "2. 50-Store Pilot Replenishment Rollout", time: "Weeks 5–8", items: ["Launch real-time replenishment radar across 50 pilot stores", "Deploy store-level hourly demand forecasting model", "Train store managers on mobile stockout alert app", "Measure reduction in out-of-stock lost sales"] },
        { title: "3. Chain-Wide Automated Allocation", time: "Months 3–6", items: ["Scale real-time demand sensing to 100% of retail stores", "Automate DC cross-dock and transfer order generation", "Integrate supplier purchase order EDI webhooks", "Deploy merchandiser allocation workbench"] },
        { title: "4. Dynamic Pricing & Network Pooling", time: "Months 6+", items: ["Deploy promotional markdown optimization models", "Enable dynamic omnichannel inventory pooling", "Automate vendor supply lead-time risk scoring", "Benchmark working capital savings with leadership"] }
      ];
      nextStepsMeta = {
        kicker: "NEXT STEPS & ENGAGEMENT PLAN",
        title: `Next Steps to Initiate Inventory Discovery for ${companyName}`,
        subtitle: "A collaborative 3-step path to validate POS data readiness and launch the live fulfillment pilot."
      };
      nextSteps = [
        { num: "01", title: "3-Week Store POS & WMS Data Flow Discovery", desc: `Collaborate with ${companyName} retail IT to map register POS streams, WMS inventory sync frequencies, and supplier EDI gateways.` },
        { num: "02", title: "Out-of-Stock Baseline & Shrinkage Impact Analysis", desc: "Analyze historical POS stockouts, lost sales volume, and buffer inventory carrying costs across representative store clusters." },
        { num: "03", title: "8-Week Pilot Cluster Replenishment Deployment", desc: "Deploy the automated inventory command center connected to live POS feeds across 50 pilot stores to demonstrate a 25%+ drop in stockouts." }
      ];
      break;

    default:
      const systems = playbook.dataSystems || [];
      const kpis = playbook.commonKpis || [];
      const areas = playbook.businessAreas || [];

      agendaItems = [
        { num: "01", title: `Operational Challenges`, desc: `Why latency and blind spots slow down ${primaryDomain.toLowerCase()}` },
        { num: "02", title: `Solution Vision`, desc: `Connecting daily ${domain.toLowerCase()} telemetry into a single real-time platform` },
        { num: "03", title: `Data Foundation`, desc: `Integrating existing enterprise systems without replacing what works` },
        { num: "04", title: `Solution Architecture`, desc: `A secure, end-to-end governed pipeline for enterprise AI operations` },
        { num: "05", title: `Live Operations Command Radar`, desc: `Real-time stream monitoring, anomaly classification, and active gauges` },
        { num: "06", title: `Explainable AI Engine`, desc: `Transparent risk scoring and root-cause breakdown for operators` },
        { num: "07", title: `Prioritization & Delivery Plan`, desc: `Action queue triage, data readiness matrix, and phased pilot roadmap` }
      ];
      challengesMeta = {
        kicker: `${domain.toUpperCase()} OPERATIONAL CHALLENGES`,
        title: `Disconnected Data Creates Friction in ${primaryDomain}`,
        subtitle: `${companyName} generates valuable operational signals every minute, but fragmented tools force staff into reactive firefighting.`
      };
      challenges = [
        { title: `Operational Latency in ${areas[0] || domain}`, desc: `Frontline teams discover bottlenecks hours after they occur, forcing costly reactive workarounds.` },
        { title: `Fragmented Systems of Record`, desc: `Critical operational data is scattered across ${systems.slice(0, 3).map(s => s.name).join(", ") || "legacy enterprise databases"}, creating blind spots.` },
        { title: `High False Alert Noise`, desc: `Static monitoring thresholds overwhelm operating teams with low-priority notifications, obscuring critical exceptions.` },
        { title: `Lack of Explainable AI`, desc: `Operators lack transparent decision justifications, slowing down resolution and emergency intervention times.` },
        { title: `Unranked Operational Queues`, desc: `Operating leads treat all issues with uniform priority without automated risk or SLA breach scoring.` },
        { title: `Absence of Continuous Learning`, desc: `Frontline incident resolutions are not captured to train predictive models, causing repeated operational friction.` }
      ];
      visionMeta = {
        kicker: "THE SOLUTION VISION",
        title: `One Unified ${primaryDomain} Operating Hub`,
        subtitle: `A unified real-time data & AI platform connecting daily operational systems into a single operating hub for ${companyName}.`
      };
      visionStages = [
        { num: "01", step: `Connect ${domain} Feeds`, desc: `Securely link core enterprise records and streaming telemetry in real time (<100ms).`, color: "1D6EE4" },
        { num: "02", step: `Unify in Lakehouse`, desc: `Organize all ${domain.toLowerCase()} data into a single source of truth with governed feature stores.`, color: "0E7C66" },
        { num: "03", step: "Predict & Classify", desc: `Apply transparent machine learning models to detect bottlenecks and anomalies hours in advance.`, color: "6366F1" },
        { num: "04", step: "Empower Frontline", desc: `Deliver real-time operational command boards and automated task dispatch directly to operating leads.`, color: "E54A24" }
      ];
      dataFoundationMeta = {
        kicker: `${domain.toUpperCase()} DATA FOUNDATION`,
        title: `${companyName} Data Foundation for ${primaryDomain}`,
        subtitle: `Connecting the exact operational feeds, telemetry, and historical records needed to power real-time AI.`
      };
      dataFoundation = systems.slice(0, 5).map((sys, idx) => ({
        category: sys.name,
        desc: sys.role || `Core operational feed for ${domain.toLowerCase()}`,
        sourceSystems: `Enterprise ${sys.name} System, Core DB, Streaming Gateway`,
        fields: `entity_id, event_type, status_code, metric_value, timestamp, operator_id`,
        frequency: idx < 2 ? "Real-Time Streaming (<100ms)" : "Continuous CDC & Event Sync",
        readiness: idx < 2 ? "High Feasibility (Live Stream)" : "Standard Enterprise API Ready"
      }));
      realTimeSignals = [
        `Sudden deviation in primary ${domain.toLowerCase()} operational parameters`,
        `Cross-system handoff latency exceeding target SLA thresholds`,
        `Predictive anomaly detected across upstream ${systems[0]?.name || "telemetry"} feeds`,
        `Unusual spike in manual exception escalations during peak shifts`
      ];
      architectureMeta = {
        kicker: "SOLUTION ARCHITECTURE",
        title: `Modern Data & AI Reference Architecture for ${companyName}`,
        subtitle: `An end-to-end governed pipeline from real-time event streaming to automated frontline action.`
      };
      solutionArchitecture = {
        ingestion: { title: "1. Event Ingestion", subtitle: "Streaming Event Bus", items: systems.slice(0, 4).map(s => `${s.name} Feed`) },
        storage: { title: "2. Governed Lakehouse", subtitle: "Enterprise Delta Lakehouse", items: [`12-Month ${domain} History`, "Operational Feature Store", "Entity State Repository", "Compliance & SLA Logs"] },
        analytics: { title: "3. Real-Time Stream Engine", subtitle: "Streaming Query Engine", items: ["Sub-Second Stream Processing", "Cross-Feed Correlation", "Threshold & Anomaly Classifier", "Real-Time Alert Router"] },
        ai_layer: { title: "4. AI Scoring Engine", subtitle: "Machine Learning Layer", items: ["Operational Urgency Score (0–100)", "Transparent Risk Factor Weights", "Predictive Bottleneck Classifier", "Recommended Action Engine"] },
        action: { title: "5. Frontline Action", subtitle: "Operational Dispatch", items: [`Live ${domain} Command Board`, "Automated Task Dispatch", "One-Click Evidence Dossier", "Teams & Mobile Alerts"] }
      };
      commandCenter = {
        kicker: `OPERATIONS COMMAND  |  ${domain.toUpperCase()}`,
        title: `${companyName} Live Operations Command Center`,
        subtitle: `Continuous sub-second tracking of incoming operational streams, system status, and exception risk levels.`,
        metrics: [
          { label: "Today's Monitored Events", val: "850,000 Events", note: "< 45 ms stream latency" },
          { label: "Critical Exceptions Flagged", val: "36 Incidents", note: "100% routed to priority leads" },
          { label: "Operational Value Protected", val: "High Impact", note: "Zero SLA breaches" },
          { label: "Active False Alert Rate", val: "0.95%", note: "Well below 2.0% target" }
        ],
        headers: ["Event Ref", "Operational Unit", "Channel & Source", "Facility / Location", "Observed Value", "Risk Score", "Recommended Action"],
        colW: [1.5, 2.0, 2.2, 2.0, 1.4, 1.3, 1.88],
        channelName: `Live ${domain} Telemetry Stream`,
        locDomestic: "Primary Production Hub",
        locForeign: "Regional Operating Node"
      };
      explainableExample = {
        kicker: `TRANSPARENT AI  |  ROOT CAUSE ANALYSIS`,
        title: `Why Was This ${domain} Incident Flagged for Action?`,
        subtitle: "Every automated decision provides an instant, transparent breakdown of risk factors for operating leads.",
        dossierTitle: "INSPECTED EVENT DOSSIER",
        factorsTitle: "TRANSPARENT RISK FACTOR DECOMPOSITION",
        txnId: "OPS-ALERT-101",
        amount: `High-Urgency ${domain} Exception`,
        channel: `Live ${domain} Operations Hub`,
        timestamp: "10:45 AM (Peak Shift)",
        merchant: `Core ${domain} Operating Facility`,
        location: "Main Production Node",
        baselineLocation: "Standard Operating Baseline",
        device: `${systems[0]?.name || "Telemetry Sensor"}`,
        baselineDevice: "Nominal Operating Range",
        riskScore: 89,
        riskLevel: "HIGH URGENCY",
        decision: "TRIGGER AUTOMATED WORKFLOW & NOTIFY OPERATING LEAD",
        factors: [
          { factor: "Operational Velocity Bottleneck", weight: "+34", reason: "Handoff cycle time is 3x higher than baseline" },
          { factor: "Cross-System State Discrepancy", weight: "+26", reason: "Status mismatch detected across core upstream feeds" },
          { factor: "SLA Breach Window Approaching", weight: "+18", reason: "Less than 45 minutes remaining before customer SLA impact" },
          { factor: "Off-Peak Parameter Drift", weight: "+11", reason: "Sensor reading deviates from 90-day standard baseline" }
        ]
      };
      behavioralProfile = {
        kicker: `BEHAVIORAL BASELINE  |  ${domain.toUpperCase()}`,
        title: `Operational Baseline vs. Real-Time Parameter Deviation`,
        subtitle: `Continuous machine learning tracks current operations against 12 months of historical performance.`,
        baselineTitle: "ESTABLISHED OPERATIONAL BASELINE",
        anomalyTitle: "CURRENT ANOMALOUS EVENT DEVIATION",
        entityName: `Primary ${domain} Operating Workflow`,
        baseline: [
          { dimension: "Nominal Processing Cycle", value: "Standard turn-around within SLA", status: "Baseline" },
          { dimension: "Average Shift Volume", value: "Within expected variance bounds", status: "Baseline" },
          { dimension: "Error / Exception Rate", value: "< 2% nominal exception rate", status: "Baseline" },
          { dimension: "System Availability", value: "99.9% uptime across core nodes", status: "Baseline" }
        ],
        anomaly: [
          { dimension: "Current Cycle Time", value: "Elevated latency detected across feeds", status: "Delay (+34)" },
          { dimension: "Current Exception Rate", value: "Spike in unhandled exceptions", status: "Friction (+26)" },
          { dimension: "SLA Impact Window", value: "High risk of breach without intervention", status: "Urgent (+18)" },
          { dimension: "Telemetry Signal", value: "Reading outside nominal tolerance", status: "Anomaly (+11)" }
        ],
        conclusion: "Operational bottleneck flagged prior to downstream customer or financial impact."
      };
      queueMeta = {
        kicker: "OPERATIONAL TRIAGE  |  ACTION QUEUE",
        title: "AI-Prioritized Case Triage & Frontline Action Queue",
        subtitle: `High-urgency incidents are ranked Critical/High with pre-assembled dossiers so teams act in seconds.`,
        headers: ["Priority Tier", "Case Ref", "Operational Unit", "Observed Parameter", "Primary Trigger", "One-Click Operational Action"],
        colW: [1.8, 1.4, 1.8, 1.6, 3.4, 2.48]
      };
      investigationQueue = [
        { caseId: "#OPS-101", entity: "Primary Facility Unit A", amount: "SLA Breach Risk", riskScore: 89, priority: "CRITICAL", trigger: "Cross-system latency spike + State discrepancy", action: "Trigger Fast-Track Workflow" },
        { caseId: "#OPS-102", entity: "High-Volume Node B", amount: "Data Discrepancy", riskScore: 81, priority: "CRITICAL", trigger: "Unreconciled record backlog across feeds", action: "Automated Data Re-Sync" },
        { caseId: "#OPS-103", entity: "Regional Unit C", amount: "Minor Variance", riskScore: 62, priority: "HIGH", trigger: "Shift volume deviation above threshold", action: "Alert Operating Lead" },
        { caseId: "#OPS-104", entity: "Standard Line D", amount: "Nominal Check", riskScore: 38, priority: "MEDIUM", trigger: "Scheduled maintenance check in progress", action: "Monitor" },
        { caseId: "#OPS-105", entity: "Facility Node E", amount: "Normal Operation", riskScore: 12, priority: "LOW", trigger: "Within normal operating parameters", action: "Auto-Logged" }
      ];
      outcomesMeta = {
        kicker: "BUSINESS PERFORMANCE  |  OUTCOMES",
        title: `Measurable Solution Performance for ${companyName}`,
        subtitle: `Projected operational benchmarks tailored specifically to ${primaryDomain}.`
      };
      solutionKpis = kpis.slice(0, 4).map(k => ({
        name: k.name,
        benchmark: "Illustrative 20–30% Lift",
        desc: k.why || "Operational performance improvement",
        type: "Business Outcome"
      }));
      closedLoopTitle = "CLOSED-LOOP OPERATIONAL LEARNING ARCHITECTURE";
      closedLoopSteps = [
        { title: "1. Real-Time Telemetry", desc: `Operational feeds ingested into the enterprise lakehouse in <100ms.` },
        { title: "2. Predictive AI Scoring", desc: "Machine learning models detect bottlenecks and score urgency in real time." },
        { title: "3. Operator Action", desc: "Frontline teams resolve incidents using 1-click contextual dossiers." },
        { title: "4. Continuous Feedback", desc: "Incident resolutions retrain models to continuously sharpen accuracy." }
      ];
      readinessMeta = {
        kicker: "DATA READINESS & FEASIBILITY MATRIX",
        title: "Fast-Track Integration & Feasibility Assessment",
        subtitle: `All required data feeds connect to existing enterprise infrastructure without requiring system replacements.`
      };
      roadmapMeta = {
        kicker: "DELIVERY ROADMAP",
        title: "A Phased Path from Fast Pilot to Enterprise Scale",
        subtitle: `A structured milestone plan delivering live operational value across ${companyName} within 8 weeks.`
      };
      roadmapPhases = [
        { title: `1. ${domain} Ingestion & Lakehouse Setup`, time: "Weeks 1–4", items: ["Stand up secure enterprise cloud lakehouse", `Connect primary ${domain.toLowerCase()} eventstreams`, "Validate source schemas and data quality", "Establish role-based governance & security"] },
        { title: `2. ${primaryDomain} Pilot Launch`, time: "Weeks 5–8", items: [`Launch live ${primaryDomain} pilot command radar`, "Deploy explainable AI scoring models", "Validate triage workflows with frontline operating leads", "Measure baseline performance improvement"] },
        { title: "3. Enterprise Production Rollout", time: "Months 3–6", items: ["Scale ingestion across all operating locations & lines", "Integrate automated notification & workflow dispatch", "Deploy real-time executive dashboards", "Enable continuous retraining pipelines"] },
        { title: "4. Continuous AI Optimization & Scaling", time: "Months 6+", items: ["Expand predictive models across all business units", "Automate cross-department workflow routing", "Benchmark enterprise-wide ROI with executive board", "Deploy self-tuning anomaly detection"] }
      ];
      nextStepsMeta = {
        kicker: "NEXT STEPS & ENGAGEMENT PLAN",
        title: `Next Steps to Initiate Discovery for ${companyName}`,
        subtitle: `A collaborative 3-step path to validate data readiness and launch the live operational pilot.`
      };
      nextSteps = [
        { num: "01", title: `3-Week ${domain} Architecture & Data Stream Audit`, desc: `Collaborate with ${companyName} enterprise data engineering teams to review event streams, schemas, and API boundaries.` },
        { num: "02", title: "Operational Baseline & Target SLA Calibration", desc: "Jointly establish current baseline metrics (cycle times, exception rates, manual hours) and confirm success targets." },
        { num: "03", title: "8-Week Rapid Production Pilot Deployment", desc: "Deploy the real-time command center connected to live operational feeds with active workflows for frontline teams." }
      ];
      break;
  }

  const plan = {
    client: companyName,
    sector: domain,
    primary_business_domain: primaryDomain,
    requirement: reqText,
    agenda_items: agendaItems,
    challenges_meta: challengesMeta,
    operational_challenges: challenges,
    vision_meta: visionMeta,
    vision_stages: visionStages,
    data_foundation_meta: dataFoundationMeta,
    data_foundation: dataFoundation,
    real_time_signals: realTimeSignals,
    architecture_meta: architectureMeta,
    solution_architecture: solutionArchitecture,
    fabric_architecture: solutionArchitecture, // backwards compatibility
    command_center: commandCenter,
    explainable_example: explainableExample,
    behavioral_profile: behavioralProfile,
    queue_meta: queueMeta,
    investigation_queue: investigationQueue,
    outcomes_meta: outcomesMeta,
    solution_kpis: solutionKpis,
    closed_loop_title: closedLoopTitle,
    closed_loop_steps: closedLoopSteps,
    readiness_meta: readinessMeta,
    roadmap_meta: roadmapMeta,
    roadmap_phases: roadmapPhases,
    next_steps_meta: nextStepsMeta,
    next_steps: nextSteps
  };

  // If dynamic AI generated use cases exist from Claude, enrich the presentation with this client's exact data
  if (useCases && Array.isArray(useCases.useCases) && useCases.useCases.length > 0) {
    let ucs = [...useCases.useCases];
    if (ucs.length < 5) {
      const fallbackPack = fallbackUseCases({ companyName, domain, requirement, numUseCases: 5 });
      (fallbackPack.useCases || []).forEach(fUc => {
        if (ucs.length < 5 && !ucs.some(u => (u.title || "").toLowerCase().includes((fUc.title || "").toLowerCase().slice(0, 12)))) {
          ucs.push(fUc);
        }
      });
    }

    if (useCases.deckTitle && useCases.deckTitle.length > 5) {
      let cleanTitle = useCases.deckTitle;
      const compRegex = new RegExp(`^${companyName}['s]*\\s*`, 'i');
      cleanTitle = cleanTitle.replace(compRegex, "").trim();
      if (cleanTitle && cleanTitle.length > 3) {
        plan.primary_business_domain = cleanTitle;
      }
    }

    // Dynamic Agenda mapping Claude's use cases
    if (ucs.length >= 3) {
      plan.agenda_items = [
        { num: "01", title: "Operational Landscape", desc: `Core bottlenecks and operational friction across ${companyName}` },
        { num: "02", title: "Strategic Solution Vision", desc: `Unifying real-time telemetry into automated frontline action` },
        { num: "03", title: "Enterprise Data Foundation", desc: `Connecting existing operational systems and streaming gateways` },
        { num: "04", title: "Solution Architecture", desc: `Governed real-time pipeline from source ingestion to action dispatch` },
        { num: "05", title: ucs[0]?.title ? ucs[0].title.split(/[:\u2014\u2013|]/)[0].trim() : "Live Operational Radar", desc: ucs[0]?.subtitle || ucs[0]?.benefit || "Real-time decision tracking" },
        { num: "06", title: ucs[1]?.title ? ucs[1].title.split(/[:\u2014\u2013|]/)[0].trim() : "Predictive AI Decision Engine", desc: ucs[1]?.subtitle || ucs[1]?.benefit || "Factor-level risk scoring and root cause" },
        { num: "07", title: ucs[2]?.title ? ucs[2].title.split(/[:\u2014\u2013|]/)[0].trim() : "Action Queue & Roadmap", desc: ucs[2]?.subtitle || ucs[2]?.benefit || "Prioritized work queue and phased delivery" }
      ];
    }

    // Dynamic Operational Challenges from Claude
    const dynamicChallenges = [];
    ucs.forEach((uc, idx) => {
      if (uc.challenge || uc.businessProblem) {
        dynamicChallenges.push({
          num: String(dynamicChallenges.length + 1).padStart(2, "0"),
          title: uc.title ? uc.title.split(/[:\u2014\u2013|]/)[0].trim() : `Operational Bottleneck ${idx + 1}`,
          desc: uc.businessProblem || uc.challenge
        });
      }
    });
    if (researchStructured && Array.isArray(researchStructured.implications)) {
      researchStructured.implications.forEach((imp, idx) => {
        if (dynamicChallenges.length < 6 && (imp.finding || imp.whyItMatters)) {
          dynamicChallenges.push({
            num: String(dynamicChallenges.length + 1).padStart(2, "0"),
            title: imp.finding ? imp.finding.slice(0, 32) : `Process Delay ${idx + 1}`,
            desc: imp.whyItMatters || imp.finding
          });
        }
      });
    }
    if (dynamicChallenges.length >= 3) {
      plan.operational_challenges = dynamicChallenges.slice(0, 6);
    }

    // Dynamic Data Foundation (Slide 5) from Claude research systems and use cases
    const candidateSystems = [];
    if (researchStructured && Array.isArray(researchStructured.systems)) {
      researchStructured.systems.forEach(s => {
        if (s && s.name) candidateSystems.push({ name: s.name, role: s.role || `Core ${domain} data feed`, confidence: s.confidence });
      });
    }
    ucs.forEach(uc => {
      if (Array.isArray(uc.worksWith)) {
        uc.worksWith.forEach(w => {
          if (w && !candidateSystems.some(cs => cs.name.toLowerCase() === w.toLowerCase())) {
            candidateSystems.push({ name: w, role: `Operational feed for ${uc.title ? uc.title.slice(0, 30) : domain}`, confidence: "integrated" });
          }
        });
      }
    });

    if (candidateSystems.length >= 2) {
      plan.data_foundation_meta = {
        kicker: `${domain.toUpperCase()} DATA FOUNDATION`,
        title: `${companyName} Data Foundation for ${plan.primary_business_domain}`,
        subtitle: `Connecting core operational telemetry, live system feeds, and historical records to power real-time AI.`
      };

      const isHealth = /health|hospital|clinic|patient|bed|clinical/i.test(`${domain} ${reqText}`);
      const isBank = /bank|payment|card|fraud|finance|lending/i.test(`${domain} ${reqText}`);

      const domainFeedTypes = isHealth
        ? [
            "patient_mrn, encounter_id, unit_code, bed_state, timestamp_utc",
            "adt_event_type, admission_order_ts, attending_physician, acuity_score",
            "order_id, discharge_status, evs_task_id, room_turnaround_min",
            "device_telemetry, vital_signs, o2_saturation, heart_rate, alert_flag",
            "historical_patient_id, 30d_readmit_risk, baseline_los, audit_hash"
          ]
        : isBank
        ? [
            "pan_token, auth_amount, currency, merchant_mcc, timestamp_utc, terminal_id",
            "ip_asn, device_hash, emulator_flag, sim_swap_status, typing_biometric_score",
            "sender_account, beneficiary_account, transfer_type, velocity_1h_count",
            "historical_profile_id, 90d_spend_mean, geo_distance_km, composite_risk_score",
            "case_id, investigator_id, disposition_code, sar_filing_status, audit_hash"
          ]
        : [
            "event_id, entity_id, timestamp_utc, transaction_type, status_code",
            "telemetry_stream, sensor_reading, operating_band, latency_ms",
            "order_id, resource_id, queue_depth, dispatch_priority",
            "historical_profile_id, baseline_mean, deviation_sigma, audit_hash",
            "audit_log_id, user_role, permission_boundary, change_event_hash"
          ];

      const readinessBadges = [
        "High Feasibility (Live Stream Ready)",
        "Interface Engine Active",
        "Real-Time CDC Delta Lakehouse Sync",
        "REST API Webhook Ready",
        "Batch Lakehouse Ingestion"
      ];

      plan.data_foundation = candidateSystems.slice(0, 5).map((sys, idx) => {
        const isRealTime = idx < 2;
        return {
          category: sys.name,
          desc: sys.role || `Core operational feed for ${domain.toLowerCase()}`,
          sourceSystems: `${sys.name} (${sys.confidence || "Enterprise Gateway"})`,
          fields: domainFeedTypes[idx % domainFeedTypes.length],
          frequency: isRealTime ? "Real-Time Streaming (<50ms)" : "Continuous CDC & Event Sync",
          readiness: readinessBadges[idx % readinessBadges.length]
        };
      });
    }

    // Dynamic Solution Architecture (Slide 6) from Claude
    if (useCases.architecture && Array.isArray(useCases.architecture.stages) && useCases.architecture.stages.length >= 3) {
      const arch = useCases.architecture;
      const sourcesList = (arch.sources || []).map(s => (typeof s === "string" ? s : s.name)).filter(Boolean).slice(0, 4);
      plan.solution_architecture = {
        meta: {
          title: arch.title || "SOLVING WITH REAL-TIME DATA & AI",
          subtitle: arch.subtitle || `An end-to-end governed pipeline from operational streams to frontline action.`
        },
        ingestion: {
          title: "1. Stream Ingestion",
          subtitle: "Real-Time Feeds",
          items: sourcesList.length ? sourcesList : candidateSystems.slice(0, 4).map(s => `${s.name} Stream`)
        },
        storage: {
          title: "2. Unified Storage",
          subtitle: "Enterprise Delta Lakehouse",
          items: [`12-Month ${domain} Baselines`, "Real-Time Feature Store", "Unified Master Entity Model", "Audit & Lineage Logs"]
        },
        analytics: {
          title: "3. Streaming Engine",
          subtitle: "Real-Time Event Processing",
          items: arch.stages[1]?.steps?.slice(0, 4) || ["Sub-Second Anomaly Radar", "Sliding Window Aggregations", "Threshold Evaluation Engine", "Cross-Channel Graph Sync"]
        },
        ai_layer: {
          title: "4. Predictive AI Engine",
          subtitle: "Transparent Machine Learning",
          items: arch.stages[2]?.steps?.slice(0, 4) || ["Composite Urgency Scoring", "Root-Cause Explainability Model", "Predictive Bottleneck Forecaster", "Automated Action Recommender"]
        },
        action: {
          title: "5. Frontline Action",
          subtitle: "Operational Dispatch",
          items: [ucs[0]?.title?.slice(0, 32) || "Live Incident Command Board", ucs[1]?.title?.slice(0, 32) || "Prioritized Analyst Queue", "1-Click Operational Dispatch", "Automated Mobile Alerts"]
        }
      };
      plan.fabric_architecture = plan.solution_architecture;
    }

    // Dynamic Explainable AI (Slide 8) from Claude's top use case
    const topUc = ucs[0];
    const shortTitle = topUc ? (topUc.title?.split(/[:\u2014\u2013|]/)[0]?.trim() || "Operational Anomaly") : "Operational Anomaly";
    
    if (topUc) {
      const factor1 = topUc.insight ? topUc.insight.slice(0, 36) : "Primary Anomaly Threshold Breach";
      const factor2 = topUc.challenge ? topUc.challenge.slice(0, 36) : "Operational Bottleneck Detected";
      const factor3 = topUc.solutionMoves?.[0]?.lead ? topUc.solutionMoves[0].lead.slice(0, 36) : "Latency & Capacity Constraint";
      const factor4 = topUc.worksWith?.[0] ? `${topUc.worksWith[0]} State Discrepancy` : "Cross-System Dependency Lag";

      plan.explainable_example = {
        kicker: "OPERATIONAL CAPABILITY 2 OF 5  |  TRANSPARENT AI",
        title: `Why Did the AI Model Flag This ${shortTitle}?`,
        subtitle: topUc.subtitle || "Every automated decision provides an instant, transparent breakdown of risk factors for frontline teams.",
        dossierTitle: `INSPECTED ${shortTitle.toUpperCase()} DOSSIER`,
        factorsTitle: "TRANSPARENT RISK FACTOR DECOMPOSITION",
        txnId: `INC-${Math.floor(10000 + Math.random() * 90000)}`,
        amount: topUc.proofPoint || "High Severity Outlier",
        channel: topUc.worksWith?.[0] || "Operational Stream",
        timestamp: "Live Telemetry Feed (Peak Window)",
        location: topUc.worksWith?.[1] || "Primary Operating Center",
        baselineLocation: "Standard Operating Profile",
        device: topUc.worksWith?.[2] || "Enterprise System Feed",
        baselineDevice: "Nominal Operating Baseline",
        riskScore: 88,
        riskLevel: "CRITICAL ACTION REQUIRED",
        decision: topUc.decision ? topUc.decision.slice(0, 60).toUpperCase() : "TRIGGER 1-CLICK OPERATIONAL DISPATCH",
        factors: [
          { weight: "+35", score: "+35", factor: factor1, reason: topUc.businessProblem?.slice(0, 80) || "Observed deviation from normal historical threshold", desc: topUc.businessProblem?.slice(0, 80) || "Observed deviation from normal historical threshold" },
          { weight: "+28", score: "+28", factor: factor2, reason: topUc.whyItMatters?.slice(0, 80) || "Immediate risk of downstream SLA failure", desc: topUc.whyItMatters?.slice(0, 80) || "Immediate risk of downstream SLA failure" },
          { weight: "+15", score: "+15", factor: factor3, reason: topUc.solutionMoves?.[0]?.detail?.slice(0, 80) || "Queue backlog exceeds target threshold", desc: topUc.solutionMoves?.[0]?.detail?.slice(0, 80) || "Queue backlog exceeds target threshold" },
          { weight: "+10", score: "+10", factor: factor4, reason: `Telemetry mismatch detected across ${topUc.worksWith?.[0] || 'upstream'} and downstream feeds`, desc: `Telemetry mismatch detected across ${topUc.worksWith?.[0] || 'upstream'} and downstream feeds` }
        ]
      };
    }

    // Dynamic Multi-Dimensional Baseline vs. Outlier Radar (Slide 9)
    if (topUc) {
      plan.behavioral_profile = {
        kicker: "OPERATIONAL CAPABILITY 3 OF 5  |  BEHAVIORAL RADAR",
        title: `Multi-Dimensional Baseline vs. Anomaly Radar: ${shortTitle}`,
        subtitle: `Continuous machine learning compares every live event against 12 months of ${companyName} operational history.`,
        baselineTitle: `ESTABLISHED 12-MONTH BASELINE: ${truncate(companyName + " " + shortTitle, 32)}`,
        anomalyTitle: "CURRENT LIVE ANOMALOUS DEVIATION",
        entityName: `${companyName} ${shortTitle} (#${Math.floor(10000 + Math.random() * 90000)})`,
        baseline: [
          { dimension: "Nominal Cycle Latency", value: "Standard turn-around within verified SLA target", status: "Baseline" },
          { dimension: "Shift Throughput Band", value: "Operating within ±8% nominal volume variance", status: "Baseline" },
          { dimension: "Primary Feeds Interface", value: `Verified 2-way handshake via ${topUc.worksWith?.[0] || 'Core Gateway'}`, status: "Baseline" },
          { dimension: "Exception Failure Rate", value: "< 1.5% historical exception frequency", status: "Baseline" },
          { dimension: "State Synchronization", value: "Zero unreconciled discrepancies across nodes", status: "Baseline" }
        ],
        anomaly: [
          { dimension: "Current Latency / SLA", value: topUc.challenge ? topUc.challenge.slice(0, 52) : "SLA breach threshold exceeded", status: "Deviation (+35)" },
          { dimension: "Current Queue Load", value: topUc.insight ? topUc.insight.slice(0, 52) : "Queue backlog exceeds maximum target", status: "Urgent (+28)" },
          { dimension: "Observed Feeds Status", value: `${topUc.worksWith?.[0] || 'Upstream System'} response latency elevated`, status: "Bottleneck (+15)" },
          { dimension: "SLA Impact Risk", value: "High risk of SLA breach without automated dispatch", status: "High Risk (+10)" },
          { dimension: "Action Status", value: topUc.decision ? topUc.decision.slice(0, 52) : "1-Click automated triage dispatch required", status: "Action Flagged" }
        ],
        conclusion: topUc.insight ? `${topUc.insight.slice(0, 110)} — 1-Click Operational Dispatch triggered.` : `Multi-dimensional anomaly detected across core ${domain} systems. Fast-track remediation initiated.`
      };
    }

    // Dynamic 5 Dedicated Use Cases (Slides 7-11)
    plan.use_cases = ucs.slice(0, 5).map((uc, i) => {
      const title = uc.title ? uc.title.replace(/[:\u2014\u2013|]/, " — ") : `Operational Capability ${i + 1}`;
      const subtitle = uc.subtitle || uc.tagline || (uc.proofPoint ? `Delivering ${uc.proofPoint}` : "Real-time stream intelligence & automated action");
      const challenge = uc.challenge || uc.businessProblem || `Operational friction and delayed telemetry in ${domain} create settlement and service bottlenecks.`;
      const solutionFit = uc.solutionFit || uc.benefit || uc.insight || (Array.isArray(uc.solutionMoves) && uc.solutionMoves.length ? uc.solutionMoves.map(m => m.detail || m.lead).join(". ") : `Real-time stream intelligence unifies telemetry feeds into automated frontline action.`);
      const worksWith = (Array.isArray(uc.worksWith) && uc.worksWith.length) ? uc.worksWith : (candidateSystems.slice(0, 3).map(s => s.name));
      const techComponents = (Array.isArray(uc.techComponents) && uc.techComponents.length) ? uc.techComponents : ["Eventstream", "Delta Lakehouse", "Predictive AI Models", "Real-Time Dashboards", "Frontline Action"];
      
      let impactStats = [];
      if (Array.isArray(uc.impactStats) && uc.impactStats.length >= 3) {
        impactStats = uc.impactStats;
      } else if (Array.isArray(uc.kpis) && uc.kpis.length >= 2) {
        impactStats = [
          { value: uc.kpis[0].value || uc.proofPoint || "<500ms", label: uc.kpis[0].name || "Target KPI benchmark" },
          { value: uc.kpis[1]?.value || "-35%", label: uc.kpis[1]?.name || "Operational bottleneck reduction" },
          { value: uc.kpis[2]?.value || "Live", label: uc.kpis[2]?.name || "Continuous automated scoring" }
        ];
      } else {
        const defaultValues = ["<500ms", "-40%", "Live", "18–22%", "-30%", "2.5x", "-50%", "+40%"];
        impactStats = [
          { value: uc.proofPoint || defaultValues[i % defaultValues.length], label: uc.kpis?.[0]?.name || "Primary KPI improvement" },
          { value: defaultValues[(i + 1) % defaultValues.length], label: "Operational efficiency lift" },
          { value: "Live", label: "100% real-time scoring across streams" }
        ];
      }

      const readinessOptions = ["High", "Medium", "High", "Medium", "High"];
      const complexityOptions = ["Low", "Medium", "Low", "High", "Low"];
      const ttvOptions = ["6–8 weeks", "8–10 weeks", "6–8 weeks", "12–16 weeks", "6–8 weeks"];

      const dataReadiness = uc.dataPointer?.availability === "existing" ? "High" : uc.dataPointer?.availability === "new" ? "Medium" : readinessOptions[i % readinessOptions.length];
      const complexity = uc.difficulty === "harder" ? "High" : uc.difficulty === "moderate" ? "Medium" : uc.difficulty === "easier" ? "Low" : complexityOptions[i % complexityOptions.length];
      const timeToValue = ttvOptions[i % ttvOptions.length];
      const feasibilityNote = uc.difficultyWhy || (i === 0 ? `Reuses existing ${worksWith[0] || 'core'} stream & event telemetry` : i === 1 ? `Standard connector and baseline modeling` : `Integrates with existing ${worksWith[0] || 'enterprise'} systems without rip-and-replace`);

      return {
        title,
        subtitle,
        challenge,
        solutionFit,
        worksWith,
        techComponents,
        impactStats,
        dataReadiness,
        complexity,
        timeToValue,
        feasibilityNote
      };
    });

    // Populate Slide 12 Feasibility Matrix
    plan.feasibility_matrix = plan.use_cases.map(uc => ({
      title: uc.title,
      dataReadiness: uc.dataReadiness,
      complexity: uc.complexity,
      timeToValue: uc.timeToValue,
      feasibilityNote: uc.feasibilityNote
    }));

    // Dynamic Solution KPIs & Overall Impact (Slide 14) from Claude
    if (useCases.hub && Array.isArray(useCases.hub.kpis) && useCases.hub.kpis.length >= 4) {
      plan.overall_impact_kpis = useCases.hub.kpis.slice(0, 4).map((k) => ({
        value: k.value || "25–35%",
        name: k.name || "Target Operational KPI",
        why: k.why || "Quantified business outcome"
      }));
    } else {
      plan.overall_impact_kpis = [
        { value: plan.use_cases[0]?.impactStats[0]?.value || "35–45%", name: plan.use_cases[0]?.impactStats[0]?.label || "Improvement in Primary Operations" },
        { value: plan.use_cases[1]?.impactStats[0]?.value || "-30%", name: plan.use_cases[1]?.impactStats[0]?.label || "Bottleneck & Latency Reduction" },
        { value: "20–30%", name: "Lower Operational Overhead & Cost" },
        { value: "50%", name: "Faster Frontline Incident & Triage Time" }
      ];
    }

    plan.solution_kpis = plan.overall_impact_kpis.map(k => ({
      benchmark: k.value,
      name: k.name,
      desc: k.why || "Quantified business outcome",
      type: "Business Outcome"
    }));

    plan.closed_loop_steps = [
      { title: "1. Real-Time Ingestion", desc: `Live events from ${candidateSystems[0]?.name || 'core systems'} ingested into Lakehouse in <50ms.` },
      { title: "2. Predictive AI Scoring", desc: `Machine learning models score ${shortTitle} risk and isolate root-cause factors.` },
      { title: "3. Frontline Triage", desc: "Operating teams resolve incidents via prioritized queue and 1-click dossiers." },
      { title: "4. Continuous Retraining", desc: "Resolved case outcomes continuously retrain AI models to prevent false alerts." }
    ];

    // Dynamic Technical Feasibility Matrix (Slide 12)
    plan.readiness_meta = {
      kicker: "TECHNICAL FEASIBILITY",
      title: "Feasible on Existing Systems — No Rip-and-Replace",
      subtitle: `Each use case connects to ${companyName}'s current systems through standard connectors and layers real-time AI on top.`
    };

    // Dynamic Phased Delivery Roadmap (Slide 13)
    const uc1Short = plan.use_cases[0]?.title?.slice(0, 24) || "Core Operations";
    const uc2Short = plan.use_cases[1]?.title?.slice(0, 24) || "Predictive AI";
    const uc3Short = plan.use_cases[2]?.title?.slice(0, 24) || "Advanced Modules";

    plan.roadmap_meta = {
      kicker: "IMPLEMENTATION ROADMAP",
      title: `A Phased Path from Pilot to Network-Wide Scale for ${companyName}`,
      subtitle: `A structured milestone plan delivering live operational value across ${companyName} within 8 weeks.`
    };
    plan.roadmap_phases = [
      {
        title: "Foundation",
        time: "Weeks 1–8",
        items: [
          "Stand up secure enterprise cloud lakehouse environment",
          `Connect ${candidateSystems[0]?.name || 'core'} streams and telemetry feeds`,
          "Ingest historical records & baseline profiles",
          "Establish enterprise role-based access & governance"
        ]
      },
      {
        title: "Pilot",
        time: "Weeks 8–16",
        items: [
          `Launch live ${uc1Short} & ${uc2Short} use cases`,
          "Validate AI scoring with operating leads in shadow mode",
          "Calibrate explainable risk factor weights & false positives",
          "Measure baseline SLA and operational lift"
        ]
      },
      {
        title: "Scale",
        time: "Months 4–9",
        items: [
          `Roll out ${uc3Short} across all units & facilities`,
          `Integrate automated 1-click dispatch into ${candidateSystems[1]?.name || 'core systems'}`,
          "Deploy real-time executive cockpit & KPI dashboards",
          "Introduce AI Copilot for frontline operating leads"
        ]
      },
      {
        title: "Optimize",
        time: "Months 9+",
        items: [
          "Activate continuous model feedback retraining loops",
          "Expand predictive intelligence across additional business units",
          "Benchmark multi-year ROI with executive board",
          "Deploy self-tuning adaptive anomaly thresholds"
        ]
      }
    ];

    // Dynamic Immediate Next Steps (Slide 14)
    plan.next_steps_meta = {
      kicker: "EXPECTED IMPACT & NEXT STEPS",
      title: `From Pilot to Measurable Network-Wide Value for ${companyName}`,
      subtitle: `A collaborative 3-step engagement plan to validate data readiness and launch the live operational pilot.`
    };
    plan.next_steps = [
      {
        num: "01",
        title: "Confirm Priority Scope & Channels",
        desc: `Confirm priority facilities, units, and transaction segments for the initial pilot (${uc1Short} recommended first).`
      },
      {
        num: "02",
        title: `4-Week ${domain} Discovery & Data Readiness Audit`,
        desc: `Run a 4-week collaborative technical assessment across ${candidateSystems[0]?.name || 'core system'} schemas, API endpoints, and latency boundaries.`
      },
      {
        num: "03",
        title: "Stand Up Platform & Launch Live Pilot in 8–10 Weeks",
        desc: `Deploy the real-time command platform and launch the first live operational use case with active frontline triage workflows within 8–10 weeks.`
      }
    ];
  }

  return plan;
}
