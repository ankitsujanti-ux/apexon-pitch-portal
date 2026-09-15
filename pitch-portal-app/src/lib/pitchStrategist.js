// pitchStrategist.js — The Brain & Scoping Engine for Requirement-Centric Pitches
// Deconstructs { companyName, domain, requirement } into a structured, highly relevant Pitch Plan JSON.

import { findSectorPlaybook } from "./knowledge/ragRetriever.js";

/**
 * Calculates a requirement relevance score (0-100) for a candidate concept or sub-domain.
 * Filters out out-of-scope domain topics (e.g. liquidity, treasury for fraud detection).
 */
export function scoreRelevance(candidateText, requirement, domain) {
  const reqLower = (requirement || "").toLowerCase();
  const candLower = (candidateText || "").toLowerCase();
  
  if (!reqLower) return 80;

  // Key requirement tokens (words >= 4 chars)
  const reqWords = reqLower.split(/[\s,.;:()/-]+/).filter(w => w.length >= 4);
  if (reqWords.length === 0) return 80;

  let matches = 0;
  reqWords.forEach(w => {
    if (candLower.includes(w)) matches++;
  });

  const wordScore = (matches / reqWords.length) * 100;
  
  // Explicit boost if direct semantic overlap exists
  const isHighRelevance = 
    (reqLower.includes("fraud") && (candLower.includes("fraud") || candLower.includes("anomaly") || candLower.includes("risk") || candLower.includes("device") || candLower.includes("transaction"))) ||
    (reqLower.includes("bed") && (candLower.includes("bed") || candLower.includes("capacity") || candLower.includes("patient") || candLower.includes("flow") || candLower.includes("triage"))) ||
    (reqLower.includes("claim") && (candLower.includes("claim") || candLower.includes("denial") || candLower.includes("billing") || candLower.includes("revenue"))) ||
    (reqLower.includes("churn") && (candLower.includes("churn") || candLower.includes("retention") || candLower.includes("customer"))) ||
    (reqLower.includes("supply") && (candLower.includes("supply") || candLower.includes("inventory") || candLower.includes("logistics")));

  if (isHighRelevance) return Math.max(85, Math.min(100, Math.round(wordScore + 40)));
  
  // Explicit penalty for known cross-domain distractions
  const isDistraction =
    (reqLower.includes("fraud") && (candLower.includes("liquidity") || candLower.includes("treasury") || candLower.includes("credit risk") || candLower.includes("churn") || candLower.includes("wealth"))) ||
    (reqLower.includes("bed") && (candLower.includes("pharmacy logistics") || candLower.includes("supply chain") || candLower.includes("claim denial")));

  if (isDistraction) return Math.min(40, Math.round(wordScore * 0.4));

  return Math.round(wordScore);
}

/**
 * Builds the complete structured Pitch Plan JSON.
 */
export function buildPitchPlan({ companyName, domain, requirement }) {
  const { playbook } = findSectorPlaybook(domain, requirement);
  const reqText = requirement || `Transforming ${domain} operations through unified real-time data and AI intelligence.`;
  const reqLower = reqText.toLowerCase();

  // 1. Identify primary business domain
  let primaryDomain = `${domain} Operations`;
  if (reqLower.includes("fraud") || reqLower.includes("financial crime") || reqLower.includes("transaction")) {
    primaryDomain = "Payments, Fraud Risk & Financial Crime";
  } else if (reqLower.includes("bed") || reqLower.includes("patient flow") || reqLower.includes("triage")) {
    primaryDomain = "Patient Flow, Emergency Triage & Capacity Operations";
  } else if (reqLower.includes("claim") || reqLower.includes("denial") || reqLower.includes("revenue cycle")) {
    primaryDomain = "Revenue Cycle & Claim Denial Prevention";
  } else if (reqLower.includes("churn") || reqLower.includes("retention")) {
    primaryDomain = "Customer Retention & Behavioral Intelligence";
  } else if (reqLower.includes("underwriting") || reqLower.includes("credit")) {
    primaryDomain = "Credit Risk & Dynamic Underwriting";
  } else if (reqLower.includes("supply") || reqLower.includes("inventory")) {
    primaryDomain = "Supply Chain & Inventory Velocity";
  }

  // 2. Derive business objectives directly from the requirement
  const businessObjectives = [
    `Detect and resolve operational exceptions in real time before business or financial impact occurs.`,
    `Significantly reduce false positives and manual investigation overhead across frontline teams.`,
    `Prioritize high-risk, high-urgency cases with explainable AI scores for immediate human action.`,
    `Establish a continuous feedback loop that adapts models to emerging behavioral patterns.`
  ];

  // 3. Define Requirement-Specific Data Foundation & Readiness
  let dataFoundation = [];
  let realTimeSignals = [];
  let explainableExample = null;
  let behavioralProfile = null;
  let investigationQueue = [];
  let solutionKpis = [];

  if (reqLower.includes("fraud") || (domain.toLowerCase().includes("bank") && reqLower.includes("transaction"))) {
    // Specific Fraud Pitch Plan
    dataFoundation = [
      {
        category: "Transaction & Payment Feeds",
        desc: "Real-time card, UPI, IMPS, wire authorization events, transaction amounts, and terminal IDs.",
        sourceSystems: "Payment Switch (ISO 8583/20022), Core Banking Ledger, UPI Gateway",
        fields: "txn_id, account_id, amount, currency, merchant_id, mcc_code, timestamp, channel",
        frequency: "Real-Time Streaming (<50ms)",
        readiness: "To be validated during discovery"
      },
      {
        category: "Device & Digital Signals",
        desc: "Device fingerprinting, IP address, OS/browser, mobile app version, and login session tokens.",
        sourceSystems: "Mobile Banking App, Web Portal, IAM / Auth Gateway",
        fields: "device_id, ip_address, browser_fp, os_version, session_duration, failed_attempts",
        frequency: "Real-Time Event (<100ms)",
        readiness: "To be validated during discovery"
      },
      {
        category: "Customer & Account History",
        desc: "Historical baseline spending profiles, typical locations, average transaction size, and beneficiary lists.",
        sourceSystems: "Core Banking System, CRM, Customer 360 Lakehouse",
        fields: "customer_id, typical_spend_range, frequent_locations, frequent_devices, account_age",
        frequency: "Continuous Lakehouse Sync",
        readiness: "To be validated during discovery"
      },
      {
        category: "Geographic & Terminal Telemetry",
        desc: "IP geolocation, terminal GPS coordinates, ATM address coordinates, and impossible travel velocity checks.",
        sourceSystems: "GeoIP Feeds, Terminal Master DB, ATM Controller",
        fields: "latitude, longitude, country_code, city, travel_velocity_kmh",
        frequency: "Real-Time Calculation",
        readiness: "To be validated during discovery"
      },
      {
        category: "Fraud Intelligence & Labels",
        desc: "Historical confirmed fraud cases, chargebacks, customer dispute logs, and negative watchlists.",
        sourceSystems: "Fraud Management Platform, Dispute Portal, Sanctions Watchlist",
        fields: "fraud_case_id, fraud_type, resolution_label, confirmed_loss, chargeback_date",
        frequency: "Batch & Event Updates",
        readiness: "To be validated during discovery"
      }
    ];

    realTimeSignals = [
      "Sudden transaction amount surge vs 90-day baseline",
      "New, unrecognized device ID or emulator signature",
      "Impossible geographic displacement (>800 km/h speed)",
      "Unusual merchant category code during off-peak hours (02:00–05:00)",
      "Multiple rapid sequential authorization attempts (velocity spike)",
      "Sudden alteration in recipient / beneficiary addition"
    ];

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

  } else if (reqLower.includes("bed") || reqLower.includes("patient flow") || reqLower.includes("hospital")) {
    // Specific Healthcare / Hospital Bed Flow Pitch Plan
    dataFoundation = [
      {
        category: "Admission, Discharge & Transfer (ADT)",
        desc: "Real-time HL7/FHIR admission feeds, room assignments, pending transfer requests, and discharge orders.",
        sourceSystems: "EHR / EMR (Epic, Cerner, Meditech), ADT Interface Engine",
        fields: "patient_id, bed_id, unit_id, admission_ts, expected_discharge_ts, discharge_order_ts",
        frequency: "Real-Time Stream (<100ms)",
        readiness: "To be validated during discovery"
      },
      {
        category: "Emergency Department & Triage Feeds",
        desc: "Live ED waiting room queue, triage acuity scores (ESI 1–5), boarder counts, and pending bed requests.",
        sourceSystems: "ED Information System (EDIS), Triage Workstation",
        fields: "encounter_id, esi_level, door_ts, triage_ts, bed_request_ts, disposition_ts",
        frequency: "Real-Time Streaming",
        readiness: "To be validated during discovery"
      },
      {
        category: "Diagnostic & Lab Turnaround Feeds",
        desc: "Live lab order timestamps, critical result releases, radiology/PACS scanning and report availability.",
        sourceSystems: "LIMS, Radiology PACS, Clinical Portal",
        fields: "order_id, test_type, order_ts, specimen_collected_ts, result_verified_ts",
        frequency: "Real-Time Webhooks",
        readiness: "To be validated during discovery"
      },
      {
        category: "Environmental Services & Bed Turnover",
        desc: "Bed vacancy signals, housekeeping dispatch times, cleaning cycle progress, and nurse station confirmation.",
        sourceSystems: "Bed Management Platform, Housekeeping Mobile App",
        fields: "bed_id, bed_status, dirty_ts, assigned_ts, cleaning_complete_ts, occupied_ts",
        frequency: "Real-Time Mobile Telemetry",
        readiness: "To be validated during discovery"
      }
    ];

    realTimeSignals = [
      "Discharge order entered but patient still occupying bed > 90 min",
      "Surge in ESI Level 2 & 3 emergency admissions during shift handover",
      "ICU step-down delay caused by telemetry bed shortage on med-surg floor",
      "Housekeeping cleaning turnaround latency exceeding 45-minute target",
      "Lab critical result ready but pending physician review for discharge clearance"
    ];

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

  } else {
    // Dynamic Synthesis for any specific requirement
    dataFoundation = (playbook.dataSystems || []).slice(0, 5).map(s => ({
      category: s.name,
      desc: s.role || "Operational system feed",
      sourceSystems: `Enterprise ${s.name} System, Core DB, Streaming Hub`,
      fields: "entity_id, event_type, status_code, metric_value, timestamp, user_id",
      frequency: "Real-Time / Event-Driven",
      readiness: "To be validated during discovery"
    }));

    realTimeSignals = [
      `Sudden deviation in primary ${domain.toLowerCase()} operational metrics`,
      `Cross-system coordination latency exceeding acceptable SLA threshold`,
      `Predictive anomaly detected across upstream operational feeds`,
      `Unusual spike in manual escalations or exception volume`
    ];

    explainableExample = {
      txnId: "OPS-ALERT-101",
      amount: "High Priority Operational Exception",
      channel: `Live ${domain} Operating Hub`,
      timestamp: "Real-Time Event",
      merchant: `Core ${domain} Business Unit`,
      location: "Enterprise Operations",
      baselineLocation: "Standard Operating Baseline",
      device: "Operational Telemetry Feed",
      baselineDevice: "Nominal Operating Range",
      riskScore: 86,
      riskLevel: "HIGH URGENCY",
      decision: "TRIGGER PROACTIVE WORKFLOW & NOTIFY OPERATING LEAD",
      factors: [
        { factor: "Operational Velocity Bottleneck", weight: "+34", reason: "Handoff cycle time is 2.8x higher than baseline" },
        { factor: "System Data Discrepancy", weight: "+26", reason: "Asynchronous status mismatch detected across core feeds" },
        { factor: "SLA Breach Window Approaching", weight: "+18", reason: "Less than 45 minutes remaining before customer SLA impact" },
        { factor: "Unusual Volume Concentration", weight: "+8", reason: "Batch volume exceeds 95th percentile for this time window" }
      ]
    };

    behavioralProfile = {
      entityName: `Primary ${domain} Operating Workflow`,
      baseline: [
        { dimension: "Nominal Processing Cycle", value: "Standard turn-around within SLA", status: "Baseline" },
        { dimension: "Average Daily Volume", value: "Within expected variance bounds", status: "Baseline" },
        { dimension: "Error / Exception Rate", value: "< 2% nominal exception rate", status: "Baseline" }
      ],
      anomaly: [
        { dimension: "Current Cycle Time", value: "Elevated latency detected across feeds", status: "Delay (+34)" },
        { dimension: "Current Exception Rate", value: "Spike in unhandled exceptions", status: "Friction (+26)" },
        { dimension: "SLA Impact Window", value: "High risk of breach without intervention", status: "Urgent (+18)" }
      ],
      conclusion: "Operational bottleneck flagged prior to downstream customer or financial impact."
    };

    investigationQueue = [
      { caseId: "#OPS-101", entity: "Critical Workflow A", amount: "SLA Breach Risk", riskScore: 86, priority: "CRITICAL", trigger: "Multi-system handoff latency spike", action: "Escalate & Re-route" },
      { caseId: "#OPS-102", entity: "High-Volume Queue B", amount: "Data Discrepancy", riskScore: 78, priority: "HIGH", trigger: "Unreconciled record backlog", action: "Trigger Auto-Sync" },
      { caseId: "#OPS-103", entity: "Standard Workflow C", amount: "Minor Variance", riskScore: 52, priority: "MEDIUM", trigger: "Off-peak volume deviation", action: "Monitor" },
      { caseId: "#OPS-104", entity: "Routine Flow D", amount: "Nominal", riskScore: 20, priority: "LOW", trigger: "Within normal operating parameters", action: "Auto-Logged" }
    ];

    solutionKpis = (playbook.commonKpis || []).slice(0, 4).map(k => ({
      name: k.name,
      benchmark: "Illustrative 20–30% Lift",
      desc: k.why || "Operational performance improvement",
      type: "Business Outcome"
    }));
  }

  // 4. Return the complete Pitch Plan JSON
  return {
    client: companyName,
    sector: domain,
    primary_business_domain: primaryDomain,
    requirement: reqText,
    business_objectives: businessObjectives,
    scope_filter: {
      included: [primaryDomain, ...realTimeSignals.slice(0, 3)],
      excluded: ["Unrelated Sector Verticals", "Out-of-Scope Enterprise Workflows", "Generic IT Infrastructure Topics"]
    },
    data_foundation: dataFoundation,
    real_time_signals: realTimeSignals,
    explainable_example: explainableExample,
    behavioral_profile: behavioralProfile,
    investigation_queue: investigationQueue,
    solution_kpis: solutionKpis,
    ai_decision_framework: {
      decisions: ["Approve", "Challenge / Step-Up", "Decline / Block", "Route to Investigation Queue"],
      priority_tiers: ["Critical (Immediate Action)", "High (Priority Review)", "Medium (Monitored)", "Low (Automated Pass)"]
    },
    fabric_architecture: {
      ingestion: "Fabric Eventstream & Real-Time Data Ingestion (<50ms)",
      storage: "OneLake Lakehouse & Delta Parquet (Single Source of Truth)",
      analytics: "KQL Database Real-Time Stream Engine & Anomaly Classifier",
      ai_layer: "Fabric Machine Learning & Real-Time Feature Store Scoring",
      action: "Power BI Live Command Radar, Real-Time Alert Router & Teams / Webhook Dispatcher"
    }
  };
}
