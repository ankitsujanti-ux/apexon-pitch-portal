// pitchStrategist.js — The Brain & Scoping Engine for Requirement-Centric Pitches
// Deconstructs { companyName, domain, requirement } into a structured, highly relevant Pitch Plan JSON
// with zero hardcoded cross-sector contamination.

import { findSectorPlaybook } from "./knowledge/ragRetriever.js";

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
export function buildPitchPlan({ companyName, domain, requirement }) {
  const { playbook } = findSectorPlaybook(domain, requirement, companyName);
  const reqText = requirement || `Transforming ${domain} operations through unified real-time data and AI intelligence.`;
  const reqLower = reqText.toLowerCase();
  const domLower = (domain || "").toLowerCase();

  // Helper to test requirement tokens
  const has = (...tokens) => tokens.some(t => reqLower.includes(t) || domLower.includes(t));

  // Determine Primary Business Domain & Intent
  let primaryDomain = `${domain} Operations`;
  let domainKey = "generic";

  if (has("fraud", "financial crime", "payment auth", "transaction pattern")) {
    primaryDomain = "Payments, Fraud Risk & Financial Crime";
    domainKey = "banking_fraud";
  } else if (has("liquidity", "treasury", "cash ladder", "clearing")) {
    primaryDomain = "Intraday Liquidity & Treasury Operations";
    domainKey = "banking_liquidity";
  } else if (has("bed", "patient flow", "emergency triage", "ed boarding")) {
    primaryDomain = "Patient Flow, Emergency Triage & Capacity Operations";
    domainKey = "healthcare_bed";
  } else if (has("claim", "denial", "revenue cycle", "billing 837")) {
    primaryDomain = "Revenue Cycle & Claim Denial Prevention";
    domainKey = "healthcare_claims";
  } else if (has("prior auth", "authorization", "clinical review")) {
    primaryDomain = "Prior Authorization & Clinical Workflow";
    domainKey = "healthcare_auth";
  } else if (has("inventory", "stockout", "demand forecast", "replenishment", "store allocation")) {
    primaryDomain = "Omnichannel Inventory & Demand Fulfillment";
    domainKey = "retail_inventory";
  } else if (has("defect", "yield", "quality inspection", "assembly line", "oee")) {
    primaryDomain = "Smart Manufacturing & Assembly Quality";
    domainKey = "manufacturing_quality";
  } else if (has("telematics", "ev battery", "battery thermal", "connected vehicle", "charging")) {
    primaryDomain = "Connected Vehicle & EV Battery Telematics";
    domainKey = "automotive_ev";
  } else if (has("flight turnaround", "gate allocation", "baggage", "aircraft dispatch")) {
    primaryDomain = "Flight Operations & Aircraft Turnaround";
    domainKey = "aviation_ops";
  } else if (has("underwriting", "claims triage", "fnol", "policy loss")) {
    primaryDomain = "Insurance Underwriting & Claims Triage";
    domainKey = "insurance_claims";
  } else if (has("grid", "outage", "substation", "scada", "transformer")) {
    primaryDomain = "Smart Grid Reliability & Substation Telemetry";
    domainKey = "energy_grid";
  } else if (has("churn", "retention", "customer attrition")) {
    primaryDomain = "Customer Retention & Behavioral Intelligence";
    domainKey = "customer_churn";
  } else if (has("fleet", "shipment", "eta", "freight", "warehouse route")) {
    primaryDomain = "Logistics Dispatch & Route Optimization";
    domainKey = "logistics_fleet";
  } else if (has("network", "ran", "cell tower", "fiber latency", "subscriber churn")) {
    primaryDomain = "Telco Network Telemetry & SLA Assurance";
    domainKey = "telecom_network";
  }

  // Generate domain-specific components
  let challenges = [];
  let dataFoundation = [];
  let realTimeSignals = [];
  let fabricArchitecture = {};
  let commandCenter = {};
  let explainableExample = {};
  let behavioralProfile = {};
  let investigationQueue = [];
  let solutionKpis = [];
  let closedLoopSteps = [];
  let roadmapPhases = [];
  let nextSteps = [];

  switch (domainKey) {
    case "banking_fraud":
      challenges = [
        { title: "Sub-Second Latency Gap", desc: "Sophisticated account takeovers settle before batch rule engines finish scoring, locking in financial loss." },
        { title: "High False Positive Friction", desc: "Rigid static thresholds block legitimate high-value customers, creating churn and call center spikes." },
        { title: "Cross-Channel Blind Spots", desc: "Fraud rings exploit disconnected visibility across UPI, cards, net banking, and ATM terminals." },
        { title: "Unexplained AI Scoring", desc: "Legacy black-box risk scores provide no reasoning, forcing analysts to manually gather evidence across 5 systems." },
        { title: "Manual Queue Overload", desc: "Unranked alert queues force investigators to treat ₹2,000 alerts with the same urgency as ₹5,00,000 fraud." },
        { title: "Static Rule Drift", desc: "Fraud patterns evolve daily, while rule updates require weeks of engineering release cycles." }
      ];
      dataFoundation = [
        { category: "Transaction & Payment Feeds", desc: "Real-time card, UPI, IMPS, wire authorization events, and terminal telemetry.", sourceSystems: "Payment Switch (ISO 8583/20022), Core Banking Ledger, UPI Gateway", fields: "txn_id, account_id, amount, currency, merchant_id, mcc_code, timestamp, channel", frequency: "Real-Time Streaming (<50ms)", readiness: "To be validated during discovery" },
        { category: "Device & Digital Signals", desc: "Device fingerprinting, IP address, OS/browser, mobile app version, and login session tokens.", sourceSystems: "Mobile Banking App, Web Portal, IAM / Auth Gateway", fields: "device_id, ip_address, browser_fp, os_version, session_duration, failed_attempts", frequency: "Real-Time Event (<100ms)", readiness: "To be validated during discovery" },
        { category: "Customer & Account History", desc: "Historical baseline spending profiles, typical locations, average transaction size, and beneficiary lists.", sourceSystems: "Core Banking System, CRM, Customer 360 Lakehouse", fields: "customer_id, typical_spend_range, frequent_locations, frequent_devices, account_age", frequency: "Continuous Lakehouse Sync", readiness: "To be validated during discovery" },
        { category: "Geographic & Terminal Telemetry", desc: "IP geolocation, terminal GPS coordinates, ATM address coordinates, and impossible travel velocity checks.", sourceSystems: "GeoIP Feeds, Terminal Master DB, ATM Controller", fields: "latitude, longitude, country_code, city, travel_velocity_kmh", frequency: "Real-Time Calculation", readiness: "To be validated during discovery" },
        { category: "Fraud Intelligence & Labels", desc: "Historical confirmed fraud cases, chargebacks, customer dispute logs, and negative watchlists.", sourceSystems: "Fraud Management Platform, Dispute Portal, Sanctions Watchlist", fields: "fraud_case_id, fraud_type, resolution_label, confirmed_loss, chargeback_date", frequency: "Batch & Event Updates", readiness: "To be validated during discovery" }
      ];
      realTimeSignals = [
        "Sudden transaction amount surge vs 90-day baseline",
        "New, unrecognized device ID or emulator signature",
        "Impossible geographic displacement (>800 km/h speed)",
        "Unusual merchant category code during off-peak hours (02:00–05:00)",
        "Multiple rapid sequential authorization attempts (velocity spike)"
      ];
      fabricArchitecture = {
        ingestion: { title: "1. Event Ingestion", subtitle: "Fabric Eventstream", items: ["Card / UPI / IMPS Switch", "Mobile & Web Telemetry", "Terminal GPS Location Feeds", "Core Ledger Change Data Capture"] },
        storage: { title: "2. Unified Storage", subtitle: "OneLake & Delta Parquet", items: ["12-Month Behavioral History", "Customer 360 Feature Store", "Device Fingerprint Repository", "Historical Confirmed Labels"] },
        analytics: { title: "3. Real-Time Analytics", subtitle: "KQL Real-Time Database", items: ["Sub-50ms Stream Processing", "Velocity & Amount Aggregations", "Geographic Displacement Check", "Rule Filter & Anomaly Radar"] },
        ai_layer: { title: "4. AI Scoring Engine", subtitle: "Fabric Machine Learning", items: ["Composite Risk Score (0–100)", "Transparent Feature Weights", "Behavioral Outlier Classifier", "Action Decision Engine"] },
        action: { title: "5. Frontline Action", subtitle: "Power BI & Automated Router", items: ["Instant Approve / Challenge / Block", "Prioritized Analyst Work Queue", "One-Click Evidence Dossier", "Teams & SMS Alert Dispatch"] }
      };
      commandCenter = {
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
        entityName: "Retail High-Net-Worth Account (Customer #HDFC-49102)",
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
        conclusion: "Current event deviates across 5 independent behavioral dimensions from 12-month baseline profile."
      };
      investigationQueue = [
        { caseId: "#FR-89421", entity: "Acct #49102", amount: "₹1,85,000", riskScore: 92, priority: "CRITICAL", trigger: "Geo displacement + New Device + High Value", action: "Step-Up MFA / Block & Call" },
        { caseId: "#FR-89418", entity: "Acct #11849", amount: "₹95,000", riskScore: 84, priority: "CRITICAL", trigger: "Velocity spike (4 txns in 90 sec) + Foreign IP", action: "Instant Card Freeze" },
        { caseId: "#FR-89405", entity: "Acct #77291", amount: "₹42,000", riskScore: 68, priority: "HIGH", trigger: "Unusual merchant category + Amount deviation", action: "SMS / App OTP Challenge" },
        { caseId: "#FR-89392", entity: "Acct #30214", amount: "₹18,500", riskScore: 45, priority: "MEDIUM", trigger: "Off-hours transaction from known device", action: "Passive Risk Log" },
        { caseId: "#FR-89381", entity: "Acct #65120", amount: "₹3,200", riskScore: 12, priority: "LOW", trigger: "Normal recurring utility payment", action: "Auto-Approved" }
      ];
      solutionKpis = [
        { name: "Fraud Loss Avoided", benchmark: "30–45% Reduction", desc: "Interception of high-value unauthorized transactions prior to settlement.", type: "Financial Impact" },
        { name: "False Positive Ratio", benchmark: "< 1.5% False Alert Rate", desc: "Minimizes unnecessary friction for legitimate high-value customers.", type: "Customer Experience" },
        { name: "Real-Time Scoring Latency", benchmark: "< 60 ms Decision TAT", desc: "Sub-second AI scoring within standard payment authorization time limits.", type: "Technical Performance" },
        { name: "Investigation Triage Velocity", benchmark: "3x Faster Case Resolution", desc: "Automated evidence assembly shortens analyst investigation cycle times.", type: "Operational Velocity" }
      ];
      closedLoopSteps = [
        { title: "1. Real-Time Scoring", desc: "Live event stream evaluated against ML feature store in <60ms." },
        { title: "2. Priority Routing", desc: "High-risk alerts instantly routed to analyst queue with explainable factors." },
        { title: "3. Investigator Decision", desc: "Analyst confirms or dismisses case with 1-click evidence dossier." },
        { title: "4. Automated Model Update", desc: "Outcome fed back to OneLake to continuously reduce future false positives." }
      ];
      roadmapPhases = [
        { title: "1. Setup & Data Discovery", time: "Weeks 1–6", items: ["Stand up secure Fabric workspace & OneLake", "Connect primary real-time payment eventstream", "Validate source fields and data quality", "Establish role-based governance & security"] },
        { title: "2. Quick-Win Pilot", time: "Weeks 6–12", items: [`Launch live ${primaryDomain} Pilot`, "Deploy explainable AI scoring model", "Test real-time investigation queue with analysts", "Measure baseline loss reduction & false positive rate"] },
        { title: "3. Enterprise Scale", time: "Months 3–6", items: ["Scale streaming to 100% of payment channels", "Integrate automated challenge/MFA webhooks", "Deploy mobile alerts & Teams bot dispatch", "Establish continuous retraining feature store"] },
        { title: "4. Continuous Value", time: "Months 6+", items: ["Expand behavioral models across all business units", "Automate cross-channel intelligence sharing", "Benchmark enterprise-wide ROI with executive board"] }
      ];
      nextSteps = [
        { num: "01", title: "3-Week Technical Discovery & Data Audit", desc: "Collaborate with payment & security engineering teams to review authorization streams, ISO schemas, and API boundaries." },
        { num: "02", title: "Baseline Measurement & KPI Definition", desc: "Jointly establish current baseline metrics (false positive rate, decision latency, investigation time) and confirm success targets." },
        { num: "03", title: "8-Week Rapid Production Pilot Deployment", desc: "Deploy the Microsoft Fabric command center connected to live payment streams with active triage workflows for fraud analysts." }
      ];
      break;

    case "healthcare_bed":
      challenges = [
        { title: "Emergency Department Boarding", desc: "Admitted patients wait 4+ hours in ED hallways because inpatient bed availability is not visible in real time." },
        { title: "Uncoordinated Discharge Handoffs", desc: "Physicians sign discharge orders hours before nursing, pharmacy, and patient transport prepare the patient." },
        { title: "Housekeeping Turnover Delays", desc: "Dirty beds sit unassigned for 60+ minutes because cleaning requests rely on manual phone calls and radio checks." },
        { title: "Clinical Unit Mismatches", desc: "Patients requiring telemetry or step-down beds are misrouted, causing acute care bottlenecks." },
        { title: "Unpredictable Inpatient Surges", desc: "Bed placement leads have zero predictive visibility into afternoon emergency and post-op surgical admissions." },
        { title: "Siloed EHR & Bed Systems", desc: "Nursing staff spend 25% of their shift updating manual whiteboards and tracking down bed statuses." }
      ];
      dataFoundation = [
        { category: "Admission, Discharge & Transfer (ADT)", desc: "Real-time HL7/FHIR admission feeds, room assignments, transfer requests, and discharge orders.", sourceSystems: "EHR / EMR (Epic, Cerner, Meditech), ADT Interface Engine", fields: "patient_id, bed_id, unit_id, admission_ts, expected_discharge_ts, discharge_order_ts", frequency: "Real-Time Stream (<100ms)", readiness: "To be validated during discovery" },
        { category: "Emergency Department & Triage Feeds", desc: "Live ED waiting queue, triage acuity scores (ESI 1–5), boarder counts, and bed requests.", sourceSystems: "ED Information System (EDIS), Triage Workstation", fields: "encounter_id, esi_level, door_ts, triage_ts, bed_request_ts, disposition_ts", frequency: "Real-Time Streaming", readiness: "To be validated during discovery" },
        { category: "Diagnostic & Lab Turnaround Feeds", desc: "Live lab order timestamps, critical result releases, radiology/PACS scanning and report availability.", sourceSystems: "LIMS, Radiology PACS, Clinical Portal", fields: "order_id, test_type, order_ts, specimen_collected_ts, result_verified_ts", frequency: "Real-Time Webhooks", readiness: "To be validated during discovery" },
        { category: "Environmental Services & Bed Turnover", desc: "Bed vacancy signals, housekeeping dispatch times, cleaning cycle progress, and nurse confirmation.", sourceSystems: "Bed Management Platform, Housekeeping Mobile App", fields: "bed_id, bed_status, dirty_ts, assigned_ts, cleaning_complete_ts, occupied_ts", frequency: "Real-Time Mobile Telemetry", readiness: "To be validated during discovery" }
      ];
      realTimeSignals = [
        "Discharge order entered but patient still occupying bed > 90 min",
        "Surge in ESI Level 2 & 3 emergency admissions during shift handover",
        "ICU step-down delay caused by telemetry bed shortage on med-surg floor",
        "Housekeeping cleaning turnaround latency exceeding 45-minute target",
        "Lab critical result ready but pending physician review for discharge clearance"
      ];
      fabricArchitecture = {
        ingestion: { title: "1. Clinical Ingestion", subtitle: "Fabric Eventstream", items: ["HL7 / FHIR ADT Feeds", "ED Triage & Boarding Telemetry", "LIMS Lab & PACS Imaging Feeds", "EVS Mobile Housekeeping Signals"] },
        storage: { title: "2. Clinical Lakehouse", subtitle: "OneLake & Delta Parquet", items: ["Unit-Level Occupancy History", "Clinical Flow Feature Store", "Bed State & Turnaround Logs", "CMS Quality & ALOS Baselines"] },
        analytics: { title: "3. Real-Time Flow Engine", subtitle: "KQL Real-Time Database", items: ["Sub-Second Unit Capacity Radar", "Discharge Barrier NLP Classifier", "Inpatient Surge Predictor", "Nurse Staffing Balance Stream"] },
        ai_layer: { title: "4. Capacity AI Engine", subtitle: "Fabric Machine Learning", items: ["8-Hour Bed Demand Forecast", "Discharge Readiness Score", "Step-Down Routing Recommender", "ED Boarding Risk Model"] },
        action: { title: "5. Frontline Care Action", subtitle: "Power BI & Care Dispatch", items: ["Bed Placement Command Board", "Automated EVS Cleaning Dispatch", "Discharge Meds Priority Queue", "Nurse Station Mobile Alerts"] }
      };
      commandCenter = {
        metrics: [
          { label: "Today's Monitored Inpatients", val: "1,280 Patients", note: "< 45 ms stream latency" },
          { label: "Priority Discharges Expedited", val: "42 Beds", note: "100% routed to priority EVS" },
          { label: "ED Boarding Hours Saved", val: "185 Hours", note: "Zero transfer delays" },
          { label: "Average Bed Turnaround Time", val: "38 min", note: "Well below 45 min target" }
        ],
        headers: ["Event Ref", "Patient Unit / Room", "Channel & Device", "Hospital Location", "Status / Transfer", "Urgency Score", "Recommended Action"],
        colW: [1.5, 2.0, 2.2, 2.0, 1.4, 1.3, 1.88],
        channelName: "Nurse Station / ADT Feed",
        locDomestic: "Wing B Telemetry Floor",
        locForeign: "ED Acute Triage Bay"
      };
      explainableExample = {
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
      investigationQueue = [
        { caseId: "#BED-402", entity: "Room 412 (Step-down)", amount: "ICU Transfer Waiting", riskScore: 88, priority: "CRITICAL", trigger: "ICU patient waiting for clean telemetry bed > 90 min", action: "Dispatch Housekeeping Priority" },
        { caseId: "#BED-398", entity: "Room 308 (Med-Surg)", amount: "ED Boarder Waiting", riskScore: 82, priority: "CRITICAL", trigger: "ESI-2 patient boarding in ED for 140 min", action: "Expedite Pharmacy Meds" },
        { caseId: "#BED-391", entity: "Room 520 (Ortho)", amount: "Pending Discharge", riskScore: 65, priority: "HIGH", trigger: "Transport delay for post-op discharge", action: "Alert Patient Transport" },
        { caseId: "#BED-384", entity: "Room 214 (Pediatrics)", amount: "Routine Turnover", riskScore: 40, priority: "MEDIUM", trigger: "Scheduled cleaning in progress", action: "Standard Monitoring" },
        { caseId: "#BED-379", entity: "Room 105 (Observation)", amount: "Normal Flow", riskScore: 15, priority: "LOW", trigger: "Patient admitted without delay", action: "Auto-Logged" }
      ];
      solutionKpis = [
        { name: "Average Length of Stay (ALOS)", benchmark: "0.5–0.8 Day Reduction", desc: "Shortens non-clinical wait times on day of discharge.", type: "Clinical & Capacity" },
        { name: "ED Boarding Hours", benchmark: "25–35% Reduction", desc: "Reduces hours patients spend waiting in ED for inpatient beds.", type: "Patient Flow" },
        { name: "Bed Cleaning Turnaround", benchmark: "< 45 min Average TAT", desc: "Accelerates room turnover between patient discharge and admission.", type: "Operational Velocity" },
        { name: "Early Morning Discharge %", benchmark: "↑ 20–30% Lift", desc: "Increases discharges completed before 11:00 AM to unlock bed supply.", type: "Capacity Optimization" }
      ];
      closedLoopSteps = [
        { title: "1. Real-Time Bed Sensing", desc: "Live ADT discharge orders and bed state updates streamed in <50ms." },
        { title: "2. Bottleneck Detection", desc: "AI identifies discharge delays (meds, transport, clean) before shift end." },
        { title: "3. Coordinated Dispatch", desc: "Bed placement leads trigger automated mobile task dispatch to EVS & transport." },
        { title: "4. Capacity Model Retraining", desc: "Actual turnaround times fed back into OneLake to sharpen daily unit forecasts." }
      ];
      roadmapPhases = [
        { title: "1. Clinical Data Discovery", time: "Weeks 1–6", items: ["Stand up secure HIPAA-compliant Fabric workspace", "Connect live ADT and ED tracker eventstreams", "Validate HL7 interface engine message quality", "Establish role-based clinical security"] },
        { title: "2. Pilot Unit Deployment", time: "Weeks 6–12", items: [`Launch live ${primaryDomain} on 2 pilot floors`, "Deploy predictive bed turnaround model", "Train bed coordinators and charge nurses on live command radar", "Measure baseline ED boarding time reduction"] },
        { title: "3. Hospital-Wide Rollout", time: "Months 3–6", items: ["Expand to all inpatient floors, ICU units, and surgical suites", "Integrate automated housekeeping mobile dispatch", "Deploy real-time nursing executive dashboards", "Establish continuous model calibration"] },
        { title: "4. Network Value Expansion", time: "Months 6+", items: ["Deploy cross-hospital transfer orchestration", "Optimize multi-facility patient load balancing", "Benchmark ALOS reduction with executive clinical leadership"] }
      ];
      nextSteps = [
        { num: "01", title: "3-Week Clinical IT & ADT Data Audit", desc: "Collaborate with hospital clinical IT teams to review HL7/FHIR message streams, EHR interfaces, and room state schemas." },
        { num: "02", title: "Baseline Measurement & KPI Definition", desc: "Jointly establish current baseline metrics (ALOS, ED boarding hours, room turnover times) and set target improvement thresholds." },
        { num: "03", title: "8-Week Rapid Clinical Pilot Deployment", desc: "Deploy the Microsoft Fabric bed operations command center connected to live hospital ADT feeds on pilot inpatient units." }
      ];
      break;

    case "retail_inventory":
      challenges = [
        { title: "Costly Out-of-Stock Spikes", desc: "Fast-selling SKUs run out of stock during peak promotional weekends before regional distribution centers can react." },
        { title: "Excess Safety Stock Buildup", desc: "Store managers hoard buffer inventory in backrooms, tying up working capital and driving seasonal markdowns." },
        { title: "Channel Inventory Blind Spots", desc: "Online fulfillment centers and physical stores lack unified real-time stock visibility, causing cancelled orders." },
        { title: "Slow Demand Sensing", desc: "Regional demand shifts are discovered weeks later in monthly sales reports rather than in live POS streams." },
        { title: "Manual Store Replenishment", desc: "Store associates spend hours weekly compiling replenishment orders across fragmented supplier portals." },
        { title: "Supplier Lead-Time Volatility", desc: "Inbound vendor delivery delays trigger cascading stockouts across entire regional retail clusters." }
      ];
      dataFoundation = [
        { category: "Point-of-Sale (POS) & E-Commerce Streams", desc: "Live store register sales, online cart checkouts, returns, and inventory scan events.", sourceSystems: "Store POS System, E-Commerce Platform (Shopify/SAP Commerce), Mobile App", fields: "sku_id, store_id, units_sold, unit_price, return_flag, timestamp, channel", frequency: "Real-Time Streaming (<100ms)", readiness: "To be validated during discovery" },
        { category: "Warehouse & Inventory Ledger", desc: "On-hand inventory, in-transit purchase orders, backroom counts, and bin locations.", sourceSystems: "Warehouse Management System (WMS), ERP (SAP/Oracle)", fields: "sku_id, warehouse_id, qty_on_hand, qty_reserved, qty_in_transit, safety_stock", frequency: "Continuous Stream & CDC", readiness: "To be validated during discovery" },
        { category: "Supplier & Purchase Orders", desc: "Inbound vendor shipments, estimated arrival dates, supplier fill rates, and lead-time logs.", sourceSystems: "Supplier EDI Portal, Supply Chain Control Tower", fields: "po_number, vendor_id, expected_delivery_ts, actual_delivery_ts, fill_rate", frequency: "Daily & Webhook Updates", readiness: "To be validated during discovery" },
        { category: "Pricing & Promotional Calendar", desc: "Active marketing campaigns, seasonal discounts, local weather forecasts, and regional events.", sourceSystems: "Merchandising Engine, Marketing DB, Weather API", fields: "campaign_id, discount_pct, start_date, end_date, regional_temp_delta", frequency: "Daily Scheduled Sync", readiness: "To be validated during discovery" }
      ];
      realTimeSignals = [
        "Store SKU sell-through rate 3x higher than hourly replenishment baseline",
        "Warehouse buffer inventory dropping below 2-day safety threshold",
        "Inbound supplier container delayed at port exceeding 48-hour buffer",
        "Spike in online 'BOPIS' (Buy Online Pick Up in Store) reservations at urban stores",
        "Unseasonal weather shift driving sudden demand surge in regional clusters"
      ];
      fabricArchitecture = {
        ingestion: { title: "1. Retail Stream Ingestion", subtitle: "Fabric Eventstream", items: ["Store POS & Register Feeds", "E-Commerce Cart Checkouts", "WMS Inventory Barcode Scans", "Supplier Inbound EDI Feeds"] },
        storage: { title: "2. Omnichannel Lakehouse", subtitle: "OneLake & Delta Parquet", items: ["Unified Store & DC Stock Ledger", "SKU Demand History & Seasonality", "Supplier Performance Feature Store", "Promotional Elasticity Logs"] },
        analytics: { title: "3. Real-Time Demand Engine", subtitle: "KQL Real-Time Database", items: ["Hourly SKU Sell-Through Velocity", "Stockout Risk Anomaly Detector", "Cross-Store Transfer Matcher", "Promotional Lift Calculator"] },
        ai_layer: { title: "4. Dynamic AI Allocator", subtitle: "Fabric Machine Learning", items: ["Multi-Echelon Demand Forecaster", "Automated Reorder Quantity Model", "Markdown Optimization Engine", "Vendor Lead-Time Risk Model"] },
        action: { title: "5. Frontline Retail Action", subtitle: "Power BI & Automated Orders", items: ["Live Store Inventory Command Board", "Automated Supplier PO Trigger", "Store-to-Store Transfer Dispatch", "Merchandiser Alert Workbench"] }
      };
      commandCenter = {
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
      investigationQueue = [
        { caseId: "#SKU-902", entity: "Store #104 (Mumbai)", amount: "4 Units Remaining", riskScore: 91, priority: "CRITICAL", trigger: "Sell-through velocity 4.5x surge + 2h stock left", action: "Trigger Fast-Track DC Dispatch" },
        { caseId: "#SKU-895", entity: "Store #208 (Delhi)", amount: "8 Units Remaining", riskScore: 84, priority: "CRITICAL", trigger: "Promotional campaign stock depletion spike", action: "Cross-Store Transfer from Store #212" },
        { caseId: "#SKU-882", entity: "Store #315 (Pune)", amount: "15 Units Remaining", riskScore: 68, priority: "HIGH", trigger: "Inbound supplier PO delayed 24h", action: "Reallocate DC Buffer Stock" },
        { caseId: "#SKU-870", entity: "Store #402 (Chennai)", amount: "32 Units (Nominal)", riskScore: 35, priority: "MEDIUM", trigger: "Slight weekend demand variation", action: "Standard Replenishment Order" },
        { caseId: "#SKU-861", entity: "Store #510 (Hyderabad)", amount: "65 Units (Balanced)", riskScore: 10, priority: "LOW", trigger: "Normal inventory velocity", action: "Auto-Logged" }
      ];
      solutionKpis = [
        { name: "Out-of-Stock Rate", benchmark: "25–40% Reduction", desc: "Eliminates empty shelves during high-demand promotional peaks.", type: "Revenue & Availability" },
        { name: "Safety Stock Capital Unlocked", benchmark: "15–20% Reduction", desc: "Lowers excess backroom inventory and inventory holding costs.", type: "Working Capital" },
        { name: "Forecast Accuracy Lift", benchmark: "↑ 18–25% Accuracy", desc: "Sharpens store-level demand forecasting using real-time POS streams.", type: "Operational Velocity" },
        { name: "Replenishment Cycle Time", benchmark: "50% Faster Fulfillment", desc: "Automates reorder triggers directly to regional distribution centers.", type: "Supply Chain Velocity" }
      ];
      closedLoopSteps = [
        { title: "1. Real-Time POS Ingestion", desc: "Live register transactions and online orders ingested to OneLake in <100ms." },
        { title: "2. Demand Anomaly Detection", desc: "ML models compare hourly sales against seasonal forecasts to flag stockout risks." },
        { title: "3. Automated Allocation", desc: "System auto-generates optimized DC transfers and supplier reorders." },
        { title: "4. Continuous Demand Tuning", desc: "Sales lift from promotions is fed back to fine-tune future demand elasticity." }
      ];
      roadmapPhases = [
        { title: "1. Supply Chain Data Audit", time: "Weeks 1–6", items: ["Stand up secure Fabric workspace & OneLake", "Connect live POS streams and WMS inventory feeds", "Validate SKU master data and barcode event schemas", "Establish inventory governance rules"] },
        { title: "2. Pilot Cluster Rollout", time: "Weeks 6–12", items: [`Launch live ${primaryDomain} on 50 pilot stores`, "Deploy real-time stockout risk radar", "Automate daily store replenishment recommendations", "Measure stockout reduction and on-shelf availability"] },
        { title: "3. Enterprise Chain Scale", time: "Months 3–6", items: ["Scale streaming to 100% of retail stores and e-commerce DCs", "Integrate automated supplier purchase order webhooks", "Deploy store manager mobile inventory apps", "Enable cross-channel inventory pooling"] },
        { title: "4. Advanced Merchandising Value", time: "Months 6+", items: ["Deploy dynamic markdown optimization models", "Automate vendor supply lead-time forecasting", "Benchmark inventory turnover lift with retail leadership"] }
      ];
      nextSteps = [
        { num: "01", title: "3-Week POS & WMS Data Architecture Audit", desc: "Collaborate with retail systems engineering to review POS streams, WMS feeds, and supplier EDI gateways." },
        { num: "02", title: "Baseline Measurement & KPI Definition", desc: "Jointly establish current baseline metrics (out-of-stock rates, inventory turnover, stockout lost sales) and confirm targets." },
        { num: "03", title: "8-Week Rapid Retail Pilot Deployment", desc: "Deploy the Microsoft Fabric inventory command center connected to live POS feeds across pilot retail stores." }
      ];
      break;

    default:
      // Dynamically tailored synthesis from sectorPlaybook for all other domains
      const systems = playbook.dataSystems || [];
      const kpis = playbook.commonKpis || [];
      const areas = playbook.businessAreas || [];

      challenges = [
        { title: `Operational Latency in ${areas[0] || domain}`, desc: `Frontline teams discover bottlenecks hours after they occur, forcing costly reactive workarounds.` },
        { title: `Fragmented Systems of Record`, desc: `Critical operational data is scattered across ${systems.slice(0, 3).map(s => s.name).join(", ") || "legacy enterprise databases"}, creating blind spots.` },
        { title: `High False Alert Noise`, desc: `Static monitoring thresholds overwhelm operating teams with low-priority notifications, obscuring critical exceptions.` },
        { title: `Lack of Explainable AI`, desc: `Operators lack transparent decision justifications, slowing down resolution and emergency intervention times.` },
        { title: `Unranked Operational Queues`, desc: `Operating leads treat all issues with uniform priority without automated risk or SLA breach scoring.` },
        { title: `Absence of Continuous Learning`, desc: `Frontline incident resolutions are not captured to train predictive models, causing repeated operational friction.` }
      ];

      dataFoundation = systems.slice(0, 4).map((sys, idx) => ({
        category: sys.name,
        desc: sys.role || `Core operational feed for ${domain.toLowerCase()}`,
        sourceSystems: `Enterprise ${sys.name} System, Core DB, Streaming Gateway`,
        fields: `entity_id, event_type, status_code, metric_value, timestamp, operator_id`,
        frequency: idx < 2 ? "Real-Time Streaming (<100ms)" : "Continuous CDC & Event Sync",
        readiness: "To be validated during discovery"
      }));

      realTimeSignals = [
        `Sudden deviation in primary ${domain.toLowerCase()} operational parameters`,
        `Cross-system handoff latency exceeding target SLA thresholds`,
        `Predictive anomaly detected across upstream ${systems[0]?.name || "telemetry"} feeds`,
        `Unusual spike in manual exception escalations during peak shifts`
      ];

      fabricArchitecture = {
        ingestion: { title: "1. Event Ingestion", subtitle: "Fabric Eventstream", items: systems.slice(0, 4).map(s => `${s.name} Feed`) },
        storage: { title: "2. Governed Lakehouse", subtitle: "OneLake & Delta Parquet", items: [`12-Month ${domain} History`, "Operational Feature Store", "Entity State Repository", "Compliance & SLA Logs"] },
        analytics: { title: "3. Real-Time Stream Engine", subtitle: "KQL Real-Time Database", items: ["Sub-Second Stream Processing", "Cross-Feed Correlation", "Threshold & Anomaly Classifier", "Real-Time Alert Router"] },
        ai_layer: { title: "4. AI Scoring Engine", subtitle: "Fabric Machine Learning", items: ["Operational Urgency Score (0–100)", "Transparent Risk Factor Weights", "Predictive Bottleneck Classifier", "Recommended Action Engine"] },
        action: { title: "5. Frontline Action", subtitle: "Power BI & Work Dispatch", items: [`Live ${domain} Command Board`, "Automated Task Dispatch", "One-Click Evidence Dossier", "Teams & Mobile Alerts"] }
      };

      commandCenter = {
        metrics: [
          { label: "Today's Monitored Events", val: "850,000 Events", note: "< 45 ms stream latency" },
          { label: "Critical Exceptions Flagged", val: "36 Incidents", note: "100% routed to priority leads" },
          { label: "Operational Value Protected", val: "High Impact", note: "Zero SLA breaches" },
          { label: "Active False Alert Rate", val: "0.95%", note: "Well below 2.0% target" }
        ],
        headers: ["Event Ref", "Operational Unit", "Channel & Device", "Facility / Location", "Observed Value", "Risk Score", "Recommended Action"],
        colW: [1.5, 2.0, 2.2, 2.0, 1.4, 1.3, 1.88],
        channelName: `Live ${domain} Telemetry Stream`,
        locDomestic: "Primary Production Hub",
        locForeign: "Regional Operating Node"
      };

      explainableExample = {
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

      investigationQueue = [
        { caseId: "#OPS-101", entity: "Primary Facility Unit A", amount: "SLA Breach Risk", riskScore: 89, priority: "CRITICAL", trigger: "Cross-system latency spike + State discrepancy", action: "Trigger Fast-Track Workflow" },
        { caseId: "#OPS-102", entity: "High-Volume Node B", amount: "Data Discrepancy", riskScore: 81, priority: "CRITICAL", trigger: "Unreconciled record backlog across feeds", action: "Automated Data Re-Sync" },
        { caseId: "#OPS-103", entity: "Regional Unit C", amount: "Minor Variance", riskScore: 62, priority: "HIGH", trigger: "Shift volume deviation above threshold", action: "Alert Operating Lead" },
        { caseId: "#OPS-104", entity: "Standard Line D", amount: "Nominal Check", riskScore: 38, priority: "MEDIUM", trigger: "Scheduled maintenance check in progress", action: "Monitor" },
        { caseId: "#OPS-105", entity: "Facility Node E", amount: "Normal Operation", riskScore: 12, priority: "LOW", trigger: "Within normal operating parameters", action: "Auto-Logged" }
      ];

      solutionKpis = kpis.slice(0, 4).map(k => ({
        name: k.name,
        benchmark: "Illustrative 20–30% Lift",
        desc: k.why || "Operational performance improvement",
        type: "Business Outcome"
      }));

      closedLoopSteps = [
        { title: "1. Real-Time Telemetry", desc: `Operational feeds ingested into OneLake Delta Lakehouse in <100ms.` },
        { title: "2. Predictive AI Scoring", desc: "Machine learning models detect bottlenecks and score urgency in real time." },
        { title: "3. Operator Action", desc: "Frontline teams resolve incidents using 1-click contextual dossiers." },
        { title: "4. Continuous Feedback", desc: "Incident resolutions retrain models to continuously sharpen accuracy." }
      ];

      roadmapPhases = [
        { title: "1. Technical Data Discovery", time: "Weeks 1–6", items: ["Stand up secure Fabric workspace & OneLake", `Connect primary ${domain.toLowerCase()} eventstreams`, "Validate source schemas and data quality", "Establish role-based governance & security"] },
        { title: "2. Quick-Win Pilot", time: "Weeks 6–12", items: [`Launch live ${primaryDomain} Pilot`, "Deploy explainable AI scoring models", "Validate triage workflows with frontline operating leads", "Measure baseline performance improvement"] },
        { title: "3. Enterprise Scale", time: "Months 3–6", items: ["Scale ingestion across all operating locations & lines", "Integrate automated notification & workflow dispatch", "Deploy real-time executive Power BI dashboards", "Enable continuous retraining pipelines"] },
        { title: "4. Continuous Value", time: "Months 6+", items: ["Expand predictive models across all business units", "Automate cross-department workflow routing", "Benchmark enterprise-wide ROI with executive board"] }
      ];

      nextSteps = [
        { num: "01", title: `3-Week ${domain} Data & Architecture Audit`, desc: "Collaborate with your enterprise data engineering teams to review event streams, schemas, and API boundaries." },
        { num: "02", title: "Baseline Measurement & KPI Definition", desc: "Jointly establish current baseline metrics (cycle times, exception rates, manual hours) and confirm success targets." },
        { num: "03", title: "8-Week Rapid Production Pilot Deployment", desc: "Deploy the Microsoft Fabric command center connected to live operational feeds with active workflows for frontline teams." }
      ];
      break;
  }

  return {
    client: companyName,
    sector: domain,
    primary_business_domain: primaryDomain,
    requirement: reqText,
    business_objectives: [
      `Detect and resolve ${primaryDomain.toLowerCase()} exceptions in real time before operational or business impact occurs.`,
      `Significantly reduce false alerts and manual triage overhead across frontline operating teams.`,
      `Prioritize high-urgency incidents with explainable AI scores for immediate, confident action.`,
      `Establish a continuous feedback loop that automatically adapts models to emerging operational patterns.`
    ],
    operational_challenges: challenges,
    data_foundation: dataFoundation,
    real_time_signals: realTimeSignals,
    fabric_architecture: fabricArchitecture,
    command_center: commandCenter,
    explainable_example: explainableExample,
    behavioral_profile: behavioralProfile,
    investigation_queue: investigationQueue,
    solution_kpis: solutionKpis,
    closed_loop_steps: closedLoopSteps,
    roadmap_phases: roadmapPhases,
    next_steps: nextSteps
  };
}
