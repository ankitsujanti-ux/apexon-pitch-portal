// Sector Playbooks Knowledge Base
// Provides structured industry intelligence, operational systems, KPIs, compliance rules, and verified use-case patterns.

export const SECTOR_PLAYBOOKS = {
  healthcare: {
    sector: "Healthcare & Life Sciences",
    aliases: ["health", "hospital", "pharma", "payer", "provider", "clinic", "clinical", "medtech", "biotech"],
    businessAreas: [
      "Patient Flow & Bed Capacity",
      "Emergency Department Operations",
      "Revenue Cycle & Claim Denial Management",
      "Clinical Care Coordination & Prior Auth",
      "Preventive Quality Measures (HEDIS / Stars)",
      "Pharmacy & Supply Chain Logistics"
    ],
    commonKpis: [
      { name: "Average Length of Stay (ALOS)", why: "Measures inpatient flow efficiency and bed turnover." },
      { name: "ED Door-to-Doctor Time", why: "Critical emergency triage metric impacting patient survival and satisfaction." },
      { name: "First-Pass Clean Claim Rate", why: "Share of claims paid on initial submission without manual billing rework." },
      { name: "Denial Rate %", why: "Percentage of billed revenue rejected by commercial and government payers." },
      { name: "30-Day Readmission Rate", why: "Post-discharge clinical outcome penalized under CMS quality programs." },
      { name: "Bed Occupancy Rate", why: "Ratio of occupied licensed beds versus total inpatient capacity." }
    ],
    dataSystems: [
      { name: "EHR / EMR", role: "Clinical notes, vitals, physician orders, and diagnosis codes" },
      { name: "ADT Feeds", role: "Real-time Admission, Discharge, and Transfer telemetry" },
      { name: "Claims & Billing (837/835)", role: "Electronic remittance advice and claim submissions" },
      { name: "Bed Management Systems", role: "Real-time bed cleanliness and room assignment state" },
      { name: "LIMS / Diagnostic PACS", role: "Lab turnaround times and imaging telemetry" },
      { name: "Payer Coverage Webhooks", role: "Prior-authorization rules and fee schedule updates" }
    ],
    complianceGuards: [
      { n: "01", title: "HIPAA & PHI Security", body: "Patient identifiers de-identified or isolated with strict role-based access." },
      { n: "02", title: "Clinical Decision Support", body: "All AI insights presented as recommendations requiring physician/nurse sign-off." },
      { n: "03", title: "Audit Provenance", body: "Every algorithmic prompt and clinical alert logged with timestamp and source data hash." }
    ],
    useCaseLibrary: [
      {
        id: "hc_bed_capacity",
        name: "Live Bed Capacity & Inpatient Flow Command Center",
        keywords: ["bed", "capacity", "patient flow", "census", "occupancy", "inpatient", "house supervisor", "admissions", "ward"],
        businessProblem: "Bed availability state is fragmented across ADT feeds, dirty room queues, and nurse station whiteboards, causing 4+ hour boarding delays.",
        benefit: "Unifies real-time ADT telemetry, housekeeping status, and pending transfer orders into a live network-wide bed capacity command center.",
        dataFeeds: ["HL7 ADT feeds (A01/A02/A03/A08)", "Bed management telemetry", "Nurse call logs"],
        aiCapabilities: ["Real-time bed census reconciliation", "Dynamic room allocation optimization"],
        kpis: [
          { name: "Effective Bed Utilization %", why: "Maximizes occupancy of licensed inpatient beds without bottlenecking admissions." },
          { name: "Discharge-to-Occupancy TAT", why: "Minutes from physician discharge order to room cleaning and next patient placement." },
          { name: "ED Boarding Hours", why: "Hours admitted emergency patients wait in ED bays awaiting inpatient bed transfer." },
          { name: "Inter-Facility Transfer Time", why: "Turnaround time to route high-acuity patients to available network beds." }
        ],
        solutionMoves: [
          { lead: "Ingest ADT stream", detail: "Connects HL7 ADT message streams in real time to capture admissions, transfers, and discharges in <100ms." },
          { lead: "Unify bed ledger", detail: "Maintains a live occupancy ledger per bed, unit, and facility across the hospital network." },
          { lead: "Automate EVS dispatch", detail: "Dispatches mobile cleaning tasks to housekeeping immediately upon physician discharge order." }
        ]
      },
      {
        id: "hc_ed_triage_flow",
        name: "Predictive ED Triage & Arrival Surge Forecasting",
        keywords: ["ed", "emergency", "triage", "surge", "waiting room", "arrival", "boarding", "left without being seen", "lwbs"],
        businessProblem: "Emergency departments react to arrival surges after the waiting room is already overloaded, leading to extended wait times and walkouts.",
        benefit: "Combines EMS arrival feeds, community weather/influenza signals, and triage acuity scores to forecast ED patient volume 8–12 hours ahead.",
        dataFeeds: ["ED tracking board / EHR triage module", "EMS dispatch telemetry", "Nurse staffing rosters"],
        aiCapabilities: ["Emergency arrival time-series forecasting", "Triage acuity progression models"],
        kpis: [
          { name: "Door-to-Doctor Time", why: "Median minutes emergency patients wait before initial physician evaluation." },
          { name: "Left Without Being Seen (LWBS) %", why: "Percentage of emergency walk-in patients who leave prior to receiving medical care." },
          { name: "Surge Forecast Accuracy (12h)", why: "Precision of machine learning models predicting shift arrival volumes." },
          { name: "Triage-to-Bed Placement TAT", why: "Minutes from admission decision to physical bed occupancy." }
        ],
        solutionMoves: [
          { lead: "Forecast shift volume", detail: "Predicts emergency patient arrivals by acuity level across upcoming 8- to 12-hour shift windows." },
          { lead: "Balance nursing ratios", detail: "Recommends nurse and physician shift allocation based on predicted acuity distribution." },
          { lead: "Fast-track low acuity", detail: "Automatically routes ESI Level 4 and 5 patients to rapid-treatment bays to preserve acute capacity." }
        ]
      },
      {
        id: "hc_surgical_ot_optimization",
        name: "Operating Theatre (OT) & Surgical Schedule Optimization",
        keywords: ["ot", "surgical", "operating room", "surgery", "theatre", "block time", "cancellation", "surgeon", "anesthesia"],
        businessProblem: "Operating theatres suffer from unpredictable procedure overruns, last-minute cancellations, and underutilized surgical block times.",
        benefit: "Predicts surgical case durations based on patient comorbidities and surgeon history, dynamically packing OR schedules to maximize throughput.",
        dataFeeds: ["Surgical scheduling system (SIS)", "EHR pre-op clearance notes", "PACU recovery telemetry"],
        aiCapabilities: ["Case duration machine learning estimation", "Dynamic block time schedule optimizer"],
        kpis: [
          { name: "Operating Theatre Utilization %", why: "Proportion of staffed surgical theatre hours actively utilized for procedures." },
          { name: "Case Duration Variance", why: "Reduction in scheduling variance between estimated and actual surgical duration." },
          { name: "Same-Day Cancellation Rate %", why: "Proportion of elective surgeries cancelled due to missing pre-op clearances." },
          { name: "First-Case On-Time Start %", why: "Share of morning surgical procedures beginning at scheduled incision time." }
        ],
        solutionMoves: [
          { lead: "Estimate real case duration", detail: "Machine learning models predict actual procedure minutes based on surgeon and patient profile." },
          { lead: "Audit pre-op clearance", detail: "Flags missing lab tests, anesthesia sign-offs, or cardiac clearances 48 hours prior to surgery." },
          { lead: "Reallocate idle block time", detail: "Automatically releases unbooked surgeon block time to elective waitlists 72 hours in advance." }
        ]
      },
      {
        id: "hc_clinical_copilot",
        name: "AI Clinical Decision Support & Nurse Care Assistant (Copilot)",
        keywords: ["clinical", "nurse", "physician", "copilot", "decision support", "vitals", "alert", "rounds", "ehr", "deterioration"],
        businessProblem: "Clinicians spend 3+ hours per shift navigating dense EHR charts, while subtle early signs of patient deterioration go unnoticed.",
        benefit: "Continuous stream scoring analyzes patient vitals, lab trends, and nursing notes to flag early deterioration and synthesize shift handoff dossiers.",
        dataFeeds: ["EHR clinical notes & lab results", "Bedside vital sign telemetry", "Medication administration records (MAR)"],
        aiCapabilities: ["Clinical deterioration risk scoring (MEWS/NEWS2)", "Generative AI clinical handoff summarization"],
        kpis: [
          { name: "Early Deterioration Detection Lead Time", why: "Hours before clinical decompensation that nursing teams receive advance risk alerts." },
          { name: "Nurse Charting Time Reduction", why: "Hours saved per shift through automated clinical note drafting and structured data entry." },
          { name: "Code Blue Event Reduction", why: "Decrease in unplanned ICU transfers and emergency cardiac arrest activations." },
          { name: "Shift Handoff Completeness %", why: "Ensures critical clinical handoff items are communicated across nursing shift changes." }
        ],
        solutionMoves: [
          { lead: "Continuous vitals monitoring", detail: "Evaluates bedside telemetry and lab values to compute real-time deterioration trajectories." },
          { lead: "Generate shift handoff brief", detail: "Synthesizes concise, structured patient summaries for incoming shift physicians and nurses." },
          { lead: "Contextual alert triage", detail: "Suppresses non-actionable alarm fatigue while escalating genuine high-risk clinical events." }
        ]
      },
      {
        id: "hc_discharge_barrier_radar",
        name: "Early Discharge Barrier Resolution & Length-of-Stay Radar",
        keywords: ["discharge", "barrier", "los", "length of stay", "turnaround", "evs", "housekeeping", "pharmacy clearance", "transport"],
        businessProblem: "Discharge delays compound throughout the afternoon because pharmacy orders, physical therapy consults, and transport are addressed late.",
        benefit: "Identifies clinical and administrative discharge barriers 24 hours in advance, orchestrating multidisciplinary care teams for morning discharge.",
        dataFeeds: ["EHR discharge orders & milestones", "Hospital pharmacy dispensation feeds", "Physical therapy & social work consult logs"],
        aiCapabilities: ["Discharge milestone barrier NLP", "Predicted Length of Stay (pLOS) estimation"],
        kpis: [
          { name: "Morning Discharge % (Before 11 AM)", why: "Share of daily discharges completed before noon to free beds for incoming ED admissions." },
          { name: "Average Length of Stay (ALOS) Reduction", why: "Overall reduction in unnecessary inpatient hospital stay days." },
          { name: "Discharge Order to Departure TAT", why: "Minutes elapsed from physician discharge signature to patient exit." },
          { name: "30-Day Readmission Rate %", why: "Ensures early discharge initiatives maintain patient safety and post-acute coordination." }
        ],
        solutionMoves: [
          { lead: "Predict discharge readiness", detail: "Scans patient trajectory 24 hours ahead to predict probability of next-day discharge." },
          { lead: "Highlight pending barriers", detail: "Identifies outstanding discharge requirements (take-home meds, transport, DME equipment)." },
          { lead: "Trigger automated checklist", detail: "Alerts case managers, pharmacy, and transport coordinators to clear items before morning rounds." }
        ]
      },
      {
        id: "hc_smart_supply_equipment",
        name: "Medical Equipment Tracking & Smart Clinical Supply Chain",
        keywords: ["equipment", "telemetry", "infusion pump", "ventilator", "supply chain", "asset tracking", "inventory", "rfid", "par level"],
        businessProblem: "Nurses waste 20+ minutes per shift searching for infusion pumps, telemetry units, and critical surgical supplies.",
        benefit: "RTLS asset tracking and RFID inventory telemetry track equipment location and predict floor restocking needs in real time.",
        dataFeeds: ["RTLS equipment tag telemetry", "Pyxis / Omnicell supply cabinets", "Biomedical maintenance work orders"],
        aiCapabilities: ["Dynamic par level optimization", "Asset utilization & preventative maintenance analytics"],
        kpis: [
          { name: "Equipment Search Time Reduction", why: "Minutes saved per nurse per shift locating clean IV pumps, telemetry packs, and wheelchairs." },
          { name: "Supply Stockout Frequency", why: "Reduction in critical medical consumables reaching zero stock in floor supply rooms." },
          { name: "Biomedical Asset Utilization %", why: "Optimizes total fleet size of high-cost biomedical devices across hospital wings." },
          { name: "Expired Consumable Waste Reduction", why: "Prevents clinical inventory from expiring on shelves through FEFO automated tracking." }
        ],
        solutionMoves: [
          { lead: "Live asset tracking", detail: "Monitors real-time location and clean/dirty status of all mobile biomedical devices." },
          { lead: "Predict unit restocking", detail: "Forecasts supply consumption based on scheduled surgical cases and patient acuity." },
          { lead: "Automate replenishment runs", detail: "Dispatches optimized picking routes to central supply technicians before bins run dry." }
        ]
      },
      {
        id: "hc_claim_denials",
        name: "Pre-Submission Claim Denial Prevention",
        keywords: ["denial", "claim", "billing", "revenue cycle", "coding", "payer", "prior auth", "reimbursement", "cash flow", "837", "835"],
        businessProblem: "Hospitals discover coding omissions and authorization mismatches only after payers reject the claim 30–45 days later.",
        benefit: "Streaming claim scrub checks 837 EDI records against payer policy rules before batch submission to eliminate preventable denials.",
        dataFeeds: ["837/835 EDI feeds", "EHR clinical documentation", "Payer contract rules"],
        aiCapabilities: ["Payer policy rule engine", "Semantic clinical code validation"],
        kpis: [
          { name: "First-Pass Clean Claim %", why: "Proportion of claims settled on initial submission without billing appeals." },
          { name: "Denial Rate Reduction %", why: "Monthly gross revenue saved from billing disputes and technical write-offs." },
          { name: "Days in AR (Accounts Receivable)", why: "Velocity of cash collection from procedure date to bank settlement." },
          { name: "Appeal Overturn Success Rate", why: "Win rate on unavoidable complex clinical appeals using automated dossiers." }
        ],
        solutionMoves: [
          { lead: "Audit pre-bill stream", detail: "Every claim undergoes automated policy rules verification before filing to clearinghouses." },
          { lead: "Flag missing documentation", detail: "System flags procedures lacking required clinical attachments or prior authorization numbers." },
          { lead: "Auto-generate appeal dossier", detail: "Generates structured clinical evidence packets from EHR notes for disputed claims." }
        ]
      },
      {
        id: "hc_prior_auth",
        name: "Prior Authorization Turnaround Acceleration",
        keywords: ["prior auth", "authorization", "payer approval", "clinical review", "coverage", "precertification", "278"],
        businessProblem: "Physicians and care coordinators spend 14+ hours weekly assembling medical necessity documentation for payer portals.",
        benefit: "Extracts required chart notes and maps them directly to specific payer coverage criteria for rapid electronic authorization.",
        dataFeeds: ["EHR chart notes", "Diagnostic radiology reports", "278 prior authorization EDI transactions"],
        aiCapabilities: ["Medical necessity NLP extraction", "Payer guideline semantic matcher"],
        kpis: [
          { name: "Prior Auth Turnaround TAT", why: "Hours elapsed between physician order and complete payer approval." },
          { name: "First-Attempt Approval Rate %", why: "Percentage of requests approved without peer-to-peer reviews or re-submissions." },
          { name: "Coordinator Admin Hours Saved", why: "Weekly administrative burden redirected from faxing to direct patient care." },
          { name: "Rescheduled Procedure Reduction", why: "Prevents surgical and diagnostic cancellations caused by pending payer approvals." }
        ],
        solutionMoves: [
          { lead: "Extract coverage criteria", detail: "Parses payer medical policy guidelines and identifies required clinical justifications." },
          { lead: "Assemble evidence packet", detail: "Gathers diagnostic lab values, imaging reports, and physician notes into formatted submissions." },
          { lead: "Real-time status tracking", detail: "Monitors 278 EDI responses and payer portals to alert coordinators upon instant approval." }
        ]
      }
    ]
  },

  banking: {
    sector: "Banking & Financial Services",
    aliases: ["bank", "banking", "finance", "payment", "payments", "card", "lending", "credit", "fintech", "wealth", "treasury", "fraud"],
    businessAreas: [
      "Real-Time Fraud & Anomaly Detection",
      "Behavioral Biometrics & Device Intelligence",
      "Graph Network & Link Analysis for Fraud Rings",
      "AI-Prioritized Fraud Investigation Queues",
      "Intraday Liquidity & Real-Time Treasury",
      "AML / KYC Regulatory Compliance & Triage"
    ],
    commonKpis: [
      { name: "Confirmed Fraud Loss Reduction %", why: "Net capital protected by intercepting unauthorized card, UPI, and wire transactions." },
      { name: "Fraud False Positive Ratio", why: "Ratio of false alerts to genuine fraud, preserving customer trust during payments." },
      { name: "Decisioning Latency (p99)", why: "Milliseconds required to evaluate risk score before transaction authorization timeout." },
      { name: "Account Takeover (ATO) Catch Rate", why: "Percentage of credential stuffing and SIM-swap takeovers stopped before transfer." },
      { name: "Investigator Review Cycle Time", why: "Minutes required by fraud operations analysts to adjudicate high-risk alerts." },
      { name: "Intraday Liquidity Buffer Adherence", why: "Cushion maintained above clearing house threshold obligations." }
    ],
    dataSystems: [
      { name: "Payment Switch / Auth Stream (ISO 8583 / 20022)", role: "Real-time card, UPI, IMPS, and wire authorization messaging" },
      { name: "Core Banking Ledger", role: "Deposit accounts, transaction history, customer profiles, and ledger balances" },
      { name: "Mobile & Web SDK Telemetry", role: "Device fingerprints, behavioral biometrics, IP ASN, and emulator detection" },
      { name: "AML / Watchlist Feeds", role: "OFAC, PEP, and negative news compliance screening databases" },
      { name: "Card Scheme Portals (VROL / MasterCom)", role: "Visa Resolve Online and Mastercard dispute feeds" },
      { name: "Treasury Management System", role: "Correspondent account balances, repo positions, and central bank RTGS feeds" }
    ],
    complianceGuards: [
      { n: "01", title: "PCI-DSS & PAN Tokenization", body: "Cardholder primary account numbers (PAN) masked and tokenized at ingestion boundary." },
      { n: "02", title: "Explainable AI Governance (SR 11-7)", body: "Every algorithmic decision provides transparent SHAP/lime feature weights for regulatory compliance." },
      { n: "03", title: "SOX & Regulatory Audit Lineage", body: "Immutable ledger lineage tracing every balance and calculated risk score back to source feeds." }
    ],
    useCaseLibrary: [
      {
        id: "bfsi_transaction_fraud",
        name: "Sub-Second Omnichannel Transaction Risk Scoring",
        keywords: ["fraud", "transaction", "scoring", "risk", "card", "upi", "pos", "atm", "authorization", "sub-second", "payment"],
        businessProblem: "Fraud rules are fragmented across card switches, UPI hubs, and net banking, allowing sophisticated attacks to bypass static threshold limits.",
        benefit: "Streaming machine learning evaluates composite risk scores in under 40ms at the point of authorization across all digital and card channels.",
        dataFeeds: ["Payment Switch ISO 8583/20022 stream", "NPCI UPI feeds", "ATM transaction logs"],
        aiCapabilities: ["Sub-50ms ensemble risk scoring", "Real-time velocity and spend pattern anomaly detection"],
        kpis: [
          { name: "Gross Fraud Loss Reduction %", why: "Net dollars saved from intercepted fraudulent payment flows." },
          { name: "False Decline Rate Reduction", why: "Minimizes legitimate customer transactions erroneously blocked at checkout." },
          { name: "Decisioning Latency (p99)", why: "Sub-50ms evaluation time adhering to strict payment switch SLAs." },
          { name: "Zero-Day Attack Interception Rate", why: "Catches novel fraud patterns that static boolean rules overlook." }
        ],
        solutionMoves: [
          { lead: "Stream auth requests", detail: "Consumes payment authorization requests via real-time message brokers in <15ms." },
          { lead: "Score multi-channel risk", detail: "Evaluates historical spend baseline, velocity limits, and recipient risk simultaneously." },
          { lead: "Execute instant action", detail: "Returns Approve, Step-Up (2FA), or Block decision back to switch before timeout." }
        ]
      },
      {
        id: "bfsi_behavioral_biometrics",
        name: "Behavioral Biometrics & Dynamic Device Fingerprinting",
        keywords: ["behavioral", "biometrics", "device", "fingerprint", "sim swap", "account takeover", "typing", "emulator", "ato"],
        businessProblem: "Account takeover and SIM-swap attacks bypass OTP authentication, while legacy device binding relies on easily spoofed static IDs.",
        benefit: "Continuous SDK telemetry analyzes typing cadence, swipe velocity, device hardware attributes, and emulator flags to verify genuine user identity.",
        dataFeeds: ["Mobile & Web SDK telemetry", "Telco SIM-swap notification APIs", "IP ASN threat intelligence"],
        aiCapabilities: ["Behavioral biometric keystroke dynamics", "Dynamic device trust graph modeling"],
        kpis: [
          { name: "Account Takeover Catch Rate %", why: "Percentage of hijacked user credentials blocked before money movement." },
          { name: "SIM-Swap Fraud Interception", why: "Stops instant fund draining following unauthorized cellular SIM swaps." },
          { name: "User Authentication Friction", why: "Reduces unnecessary OTP prompts for trusted customer device sessions." },
          { name: "Emulator Detection Accuracy", why: "Identifies automated bot farms and rooted emulator environments." }
        ],
        solutionMoves: [
          { lead: "Capture session telemetry", detail: "Streams behavioral touch dynamics, gyro sensors, and hardware hashes passively." },
          { lead: "Compute device trust score", detail: "Compares current session attributes against 12-month historical user profile." },
          { lead: "Step up on anomaly", detail: "Triggers facial liveness biometric verification when behavioral deviation is detected." }
        ]
      },
      {
        id: "bfsi_geo_velocity",
        name: "Geo-Velocity & Impossible Travel Anomaly Interception",
        keywords: ["geo-velocity", "travel", "location", "gps", "ip", "velocity", "impossible travel", "distance", "atm"],
        businessProblem: "Fraud rings exploit geographical separation by executing card-present ATM withdrawals in one city seconds after online transactions in another.",
        benefit: "Calculates physical speed-over-ground between sequential customer events, intercepting impossible physical travel patterns across cards and digital channels.",
        dataFeeds: ["ATM / POS geo-coordinates", "Mobile app GPS telemetry", "Geo-IP ASN location streams"],
        aiCapabilities: ["Geospatial velocity calculation", "Location clustering & habitual route modeling"],
        kpis: [
          { name: "Impossible Travel Detection %", why: "Catches cloned card and credential attacks across geographically distant locations." },
          { name: "Card-Present Clone Interception", why: "Stops fraudulent magnetic stripe / EMV fallback replay attacks at ATMs." },
          { name: "Legitimate Traveler False Alerts", why: "Learns frequent flyer and travel booking patterns to avoid blocking vacation spend." },
          { name: "Detection-to-Lock Latency", why: "Restricts compromised card rails within seconds of first suspicious geo-event." }
        ],
        solutionMoves: [
          { lead: "Correlate geo-points", detail: "Calculates spatial distance and time delta between sequential transactions." },
          { lead: "Evaluate travel feasibility", detail: "Flags transactions requiring physical travel speeds exceeding commercial flight velocities." },
          { lead: "Temporary rail lock", detail: "Places automated temporary restriction on high-risk channel while alerting cardholder." }
        ]
      },
      {
        id: "bfsi_graph_fraud_rings",
        name: "Graph Network & Link Analysis for Coordinated Fraud Rings",
        keywords: ["network", "graph", "ring", "mule", "link analysis", "coordinated fraud", "circular flow", "synthetic identity"],
        businessProblem: "Coordinated fraud rings use synthetic identities and hundreds of linked mule accounts to disperse stolen funds in tiny, undetectable increments.",
        benefit: "Graph neural networks map relationships across shared device IDs, phone numbers, beneficiary accounts, and rapid circular fund flows in real time.",
        dataFeeds: ["Core banking transfer records", "Beneficiary account master tables", "Device and IP shared registry"],
        aiCapabilities: ["Graph Neural Network (GNN) community detection", "Circular fund flow cycle detection"],
        kpis: [
          { name: "Mule Network Interception %", why: "Discovers and freezes coordinated multi-account mule networks before cash-out." },
          { name: "Synthetic Identity Ring Catch Rate", why: "Identifies clusters of bogus accounts sharing common physical or digital attributes." },
          { name: "Recovered Stolen Capital", why: "Gross dollar amount preserved by halting downstream payout sweeps." },
          { name: "Ring Entity Resolution Speed", why: "Seconds required to link a new suspicious account to an existing known fraud cluster." }
        ],
        solutionMoves: [
          { lead: "Build real-time graph", detail: "Links accounts, devices, phone numbers, and beneficiary IBANs/UPI handles in a live graph store." },
          { lead: "Detect cyclic layering", detail: "Algorithms scan multi-hop transaction paths to detect rapid circular layering and dispersion." },
          { lead: "Freeze mule cluster", detail: "Automates coordinated restrictions across all linked nodes in the identified syndicate." }
        ]
      },
      {
        id: "bfsi_investigation_queue",
        name: "AI-Prioritized Fraud Investigation Case Queues & Dossiers",
        keywords: ["queue", "investigation", "investigator", "analyst", "triage", "dossier", "case management", "copilot", "sar"],
        businessProblem: "Fraud operations teams drown in 10,000+ daily alerts worked largely in first-in-first-out order, missing the highest-exposure cases.",
        benefit: "Ranks fraud cases dynamically by financial exposure and recoverability, generating complete Copilot incident dossiers for 3x faster analyst adjudication.",
        dataFeeds: ["Alert outputs from risk models", "Core customer transaction history", "Third-party identity intelligence"],
        aiCapabilities: ["Dynamic exposure-based case triage", "Generative AI SAR narrative & evidence synthesizer"],
        kpis: [
          { name: "Analyst Case Triage Productivity", why: "Cases adjudicated per fraud operations analyst per shift." },
          { name: "High-Loss Incident SLA Adherence", why: "Percentage of critical alerts reviewed within 15 minutes of occurrence." },
          { name: "SAR / Regulatory Filing Prep Time", why: "Hours saved drafting Suspicious Activity Reports using automated AI narratives." },
          { name: "Analyst Decision Quality %", why: "Accuracy of fraud dispositions backed by explainable factor evidence." }
        ],
        solutionMoves: [
          { lead: "Prioritize by exposure", detail: "Ranks investigator queues continuously by confirmed loss potential and recovery probability." },
          { lead: "Generate instant dossier", detail: "Assembles transaction timelines, device history, and geo-maps into a single screen." },
          { lead: "1-Click disposition & SAR", detail: "Enables one-click fund recovery holds and auto-drafts regulatory filing packets." }
        ]
      },
      {
        id: "bfsi_mule_cashout",
        name: "Mule Account & Rapid Cash-Out Interception",
        keywords: ["mule", "cash-out", "layering", "rapid movement", "p2p sweep", "structuring", "dormant account"],
        businessProblem: "Fraudsters activate dormant accounts to receive stolen funds and immediately drain the balance via ATM cash-out or P2P sweeps within 90 seconds.",
        benefit: "Monitors sudden velocity changes in previously dormant accounts, intercepting high-velocity inflows followed by immediate outbound sweep attempts.",
        dataFeeds: ["Core banking balance ledgers", "P2P payment messaging", "ATM cash withdrawal feeds"],
        aiCapabilities: ["Dormancy-to-velocity surge anomaly detection", "Outbound cash-out risk scoring"],
        kpis: [
          { name: "Cash-Out Interception Rate %", why: "Share of stolen funds halted before physical ATM withdrawal or crypto conversion." },
          { name: "Dormant Mule Account Detection", why: "Identifies compromised dormant accounts before initial illicit fund transfer." },
          { name: "Average Inflow-to-Lock Time", why: "Seconds required to restrict outbound withdrawals upon suspicious inbound credit." },
          { name: "P2P Payment Sweep Prevention", why: "Stops instant micro-transfer dispersion across third-party wallet apps." }
        ],
        solutionMoves: [
          { lead: "Detect dormancy spike", detail: "Flags accounts with months of inactivity suddenly receiving high-value credits." },
          { lead: "Evaluate sweep velocity", detail: "Scores outbound transfer requests created within minutes of inbound fund arrival." },
          { lead: "Automated withdrawal hold", detail: "Applies immediate outbound restriction while initiating verified customer contact." }
        ]
      },
      {
        id: "bfsi_treasury_pulse",
        name: "Intraday Liquidity & Real-Time Cash Ladder",
        keywords: ["liquidity", "treasury", "cash", "settlement", "clearing", "intraday", "overdraft", "fedwire", "swift", "rtgs"],
        businessProblem: "Treasury teams monitor multi-currency clearing balances on overnight reports, risking daylight overdraft penalties.",
        benefit: "Unifies RTGS, Fedwire, and currency corridor obligations into a live real-time liquidity ladder.",
        dataFeeds: ["SWIFT / Fedwire streams", "General ledger balances", "Open repo & securities positions"],
        aiCapabilities: ["Cash flow predictive forecasting", "Dynamic buffer optimization"],
        kpis: [
          { name: "Daylight Overdraft Penalties", why: "Penalty dollars avoided by proactively rebalancing correspondent accounts." },
          { name: "Idle Buffer Capital Reduction", why: "Capital freed from trapped buffer reserves for overnight investment." },
          { name: "Settlement Failure Rate %", why: "Percentage of outgoing transfers delayed due to local currency shortfalls." },
          { name: "Real-Time Visibility %", why: "Share of global correspondent balances updated in sub-minute latency." }
        ],
        solutionMoves: [
          { lead: "Live balance feed", detail: "Continuously aggregates inflows and outflows across global correspondent banks." },
          { lead: "Predict shortfalls", detail: "Forecasts intraday net settlement positions against central bank limits." },
          { lead: "Optimal sweeps", detail: "Recommends currency sweep timings to minimize cost of intraday borrowing." }
        ]
      }
    ]
  },

  retail: {
    sector: "Retail, E-Commerce & CPG",
    aliases: ["retail", "ecommerce", "e-comm", "store", "merchandise", "grocery", "cpg", "apparel", "omnichannel", "supermarket"],
    businessAreas: [
      "Store Replenishment & Stockout Prevention",
      "Dynamic Markdown & Pricing Optimization",
      "Omnichannel Order Routing & Fulfillment",
      "Customer Churn & Personalized Loyalty",
      "Return & Shrink Analytics",
      "Supplier Lead Time & Vendor Performance"
    ],
    commonKpis: [
      { name: "On-Shelf Availability (OSA)", why: "Percentage of active SKUs present on store shelves ready for purchase." },
      { name: "Out-of-Stock (OOS) Rate", why: "Lost revenue during peak shopping traffic due to empty shelf slots." },
      { name: "Inventory Turnover Ratio", why: "Speed at which inventory investment converts into settled store revenue." },
      { name: "Gross Margin Return on Inventory (GMROI)", why: "Profitability metric balancing gross margin and inventory investment." },
      { name: "Fulfillment Cost per Order", why: "Operating expense of picking, packing, and shipping customer orders." }
    ],
    dataSystems: [
      { name: "Point of Sale (POS)", role: "Live register scan telemetry, basket items, and tender types" },
      { name: "Order Management System (OMS)", role: "Omnichannel customer orders, BOPIS requests, and backorders" },
      { name: "Warehouse Management (WMS)", role: "Distribution center stock levels, bins, and picking queues" },
      { name: "ERP Inventory", role: "Master SKU catalogue, purchase orders, and cost data" },
      { name: "E-Commerce Clickstream", role: "Digital cart additions, page views, and search queries" },
      { name: "Store Sensor / RFID Feeds", role: "Shelf weight sensors and RFID gate inventory scans" }
    ],
    complianceGuards: [
      { n: "01", title: "Customer Privacy (GDPR/CCPA)", body: "Customer purchasing data anonymized and consent flags maintained." },
      { n: "02", title: "Pricing Accuracy", body: "Promotional markdowns strictly reconciled with local weights and measures regulations." },
      { n: "03", title: "Supply Chain Traceability", body: "Lot tracking maintained for perishable foods and recalled merchandise." }
    ],
    useCaseLibrary: [
      {
        id: "retail_stockout_radar",
        name: "Live Store Replenishment & Stockout Radar",
        keywords: ["stockout", "replenishment", "inventory", "shelf", "pos", "store", "wms", "out of stock", "demand"],
        businessProblem: "Phantom inventory and delayed warehouse reorders result in out-of-stock shelves while backroom stock sits idle.",
        benefit: "Combines live POS sales velocity with shelf scanning to trigger automatic backroom picks and warehouse replenishment.",
        dataFeeds: ["POS transaction streams", "Store backroom inventory", "WMS fulfillment queue"],
        aiCapabilities: ["Velocity anomaly detection", "Demand sensing predictive models"],
        kpis: [
          { name: "On-shelf availability", why: "Proportion of top-selling SKUs available for shopper purchase." },
          { name: "Stockout revenue loss", why: "Estimated sales lost during peak shopping hours due to empty facings." },
          { name: "Backroom-to-shelf TAT", why: "Minutes between replenishment alert and stock placement in aisle." },
          { name: "Phantom inventory %", why: "Discrepancy between ERP system counts and actual physical shelf availability." }
        ],
        solutionMoves: [
          { lead: "Sense velocity", detail: "Detects sudden drops in POS scan rates for top SKUs indicating empty shelves." },
          { lead: "Dispatch backroom pick", detail: "Sends store associates targeted mobile alerts to restock specific aisle locations." },
          { lead: "Trigger auto-reorder", detail: "Fires automated replenishment requests to regional DC before stock depletes." }
        ]
      },
      {
        id: "retail_dynamic_pricing",
        name: "Dynamic Markdown & Elasticity Optimizer",
        keywords: ["pricing", "markdown", "discount", "margin", "promotion", "clearance", "elasticity"],
        businessProblem: "Retailers apply broad blanket discounts across regions, sacrificing gross margin on fast-moving inventory.",
        benefit: "Localized price elasticity algorithms recommend store-specific markdowns based on sell-through velocity and weather.",
        dataFeeds: ["Competitor price feeds", "Store sell-through rates", "Aged inventory ledgers"],
        aiCapabilities: ["Price elasticity modeling", "Regional inventory clearance optimization"],
        kpis: [
          { name: "Gross margin preservation", why: "Margin retained by avoiding unnecessary blanket markdowns." },
          { name: "Sell-through rate %", why: "Percentage of seasonal inventory sold before clearance deadlines." },
          { name: "Markdown recovery rate", why: "Revenue recouped per dollar of marked-down merchandise." },
          { name: "Aged stock days", why: "Average days inventory lingers in stores past scheduled season." }
        ],
        solutionMoves: [
          { lead: "Track competitor delta", detail: "Monitors rival store and online pricing in real time." },
          { lead: "Model localized demand", detail: "Calculates optimal discount percentage per store cluster." },
          { lead: "Push electronic tags", detail: "Transmits approved price updates directly to digital shelf labels." }
        ]
      }
    ]
  },

  manufacturing: {
    sector: "Industrial Manufacturing",
    aliases: ["manufacturing", "plant", "factory", "industrial", "production", "oem", "assembly", "discrete", "process manufacturing"],
    businessAreas: [
      "Overall Equipment Effectiveness (OEE) & Downtime Reduction",
      "Predictive Asset Maintenance & Vibration Telemetry",
      "First-Pass Yield & Defect Radar",
      "Batch Traceability & Quality Hold Automation",
      "Supply Chain Parts Expediting & Production Scheduling",
      "Energy Consumption & Plant Carbon Footprint"
    ],
    commonKpis: [
      { name: "Overall Equipment Effectiveness (OEE)", why: "Comprehensive metric of machine Availability, Performance, and Quality." },
      { name: "First-Pass Yield (FPY)", why: "Percentage of manufactured units meeting quality standards without rework." },
      { name: "Mean Time Between Failures (MTBF)", why: "Operating hours equipment functions reliably between unplanned stops." },
      { name: "Unplanned Downtime Hours", why: "Costly production stoppages causing line idle time and delayed customer orders." },
      { name: "Scrap & Rework Cost", why: "Direct material and labor expenditure wasted on defective batches." }
    ],
    dataSystems: [
      { name: "MES (Manufacturing Execution System)", role: "Work orders, recipe parameters, machine state, and shift logs" },
      { name: "SCADA / PLC Telemetry", role: "Sensor readings, temperature, pressure, motor vibration, and speed" },
      { name: "QMS / LIMS", role: "Quality inspection records, defect codes, and laboratory assays" },
      { name: "CMMS (Maintenance System)", role: "Work order history, spare parts inventory, and technician logs" },
      { name: "Plant Historian", role: "High-frequency time-series telemetry archive" },
      { name: "ERP Production Planning", role: "Master production schedule, bill of materials, and inventory" }
    ],
    complianceGuards: [
      { n: "01", title: "ISO 9001 / IATF 16949 Quality", body: "Batch calibration and process parameter audit trails preserved for 7+ years." },
      { n: "02", title: "OT / Air-Gap Network Security", body: "Read-only diode telemetry ingestion protecting industrial control networks." },
      { n: "03", title: "Operator Safety (OSHA)", body: "Safety limits and physical interlocks cannot be overridden by automated models." }
    ],
    useCaseLibrary: [
      {
        id: "mfg_predictive_maint",
        name: "Asset Predictive Maintenance & Downtime Radar",
        keywords: ["maintenance", "downtime", "equipment", "machine", "vibration", "bearing", "sensor", "oee", "failure", "reliability"],
        businessProblem: "Critical machinery suffers unexpected catastrophic failures between scheduled overhaul cycles, idling assembly lines.",
        benefit: "Vibration and thermal telemetry analysis detects bearing fatigue and seal wear weeks before physical failure occurs.",
        dataFeeds: ["PLC vibration telemetry", "Thermal camera feeds", "CMMS maintenance records"],
        aiCapabilities: ["Acoustic & vibration FFT anomaly detection", "Remaining Useful Life (RUL) estimation"],
        kpis: [
          { name: "Unplanned downtime reduction", why: "Hours of assembly line stoppages avoided through timely component swap." },
          { name: "Mean Time To Repair (MTTR)", why: "Hours technicians spend repairing planned versus catastrophic failures." },
          { name: "Maintenance overtime cost", why: "Emergency repair labor expense incurred during off-shift hours." },
          { name: "Asset OEE score", why: "Overall production efficiency gains from reliable equipment uptime." }
        ],
        solutionMoves: [
          { lead: "Stream telemetry", detail: "Captures high-frequency acoustic and vibration signals from plant historians." },
          { lead: "Detect micro-drift", detail: "Identifies spectral harmonics indicative of bearing cage micro-cracks." },
          { lead: "Schedule during changeover", detail: "Automatically generates maintenance work order for next planned shift change." }
        ]
      },
      {
        id: "mfg_quality_radar",
        name: "In-Line Defect & First-Pass Yield Radar",
        keywords: ["quality", "defect", "yield", "scrap", "rework", "inspection", "tolerance", "batch", "first-pass"],
        businessProblem: "Defects are identified during end-of-line testing after entire production lots have been contaminated or misaligned.",
        benefit: "Computer vision and laser telemetry inspect parts in-flight, stopping out-of-spec tooling before defect cascades.",
        dataFeeds: ["In-line camera telemetry", "Laser dimensional sensors", "QMS inspection logs"],
        aiCapabilities: ["High-speed computer vision defect classification", "Process drift statistical process control"],
        kpis: [
          { name: "First-pass yield %", why: "Share of units meeting exact tolerance on initial machining run." },
          { name: "Scrap dollar reduction", why: "Material cost saved by preventing defective batch runs." },
          { name: "Defect escape rate", why: "Parts per million (PPM) shipped to customers with unnoticed flaws." },
          { name: "Root-cause diagnosis time", why: "Minutes required to trace defective part back to failing tool head." }
        ],
        solutionMoves: [
          { lead: "Inspect in-flight", detail: "Cameras capture 100% of finished assemblies at full line speed." },
          { lead: "Auto-isolate bad lots", detail: "Diverts out-of-tolerance units automatically before secondary packing." },
          { lead: "Tune tooling offset", detail: "Feeds tool wear compensation offsets directly back to CNC controllers." }
        ]
      }
    ]
  },

  automotive: {
    sector: "Automotive & Connected Mobility",
    aliases: ["automotive", "auto", "vehicle", "ev", "electric vehicle", "oem", "connected car", "dealership", "fleet mobility"],
    businessAreas: [
      "Connected Vehicle Telematics & Battery Health",
      "Assembly Line Quality & Warranty Prediction",
      "Dealership Service Scheduling & Recall Management",
      "Over-the-Air (OTA) Firmware Deployment Monitoring",
      "Supply Chain Tier-1 Parts Expediting",
      "Autonomous Driving Fleet Telemetry Analytics"
    ],
    commonKpis: [
      { name: "Warranty Claims per 100 Vehicles (R/100)", why: "Benchmark quality metric measuring early-life component failures." },
      { name: "Battery State of Health (SOH) Degradation", why: "Rate of EV battery cell capacity loss over drive cycles and charging history." },
      { name: "First-Time Fix Rate at Dealerships", why: "Percentage of vehicle repairs resolved without repeat customer visits." },
      { name: "Recall Response & Completion Velocity", why: "Days required to notify owners and complete critical safety recall remedies." },
      { name: "Assembly Takt Time Adherence", why: "Precision with which chassis move through assembly line work cells." }
    ],
    dataSystems: [
      { name: "Vehicle CAN-Bus / Telematics Feed", role: "Live OBD-II/CAN streaming speed, braking, battery temperature, and fault codes" },
      { name: "Dealership Management System (DMS)", role: "Repair orders, parts inventory, technician hours, and customer records" },
      { name: "Warranty & Recall Claims Database", role: "Historical failure codes, labor operations, and vendor recovery claims" },
      { name: "Battery Management System (BMS) Logs", role: "Cell voltage deltas, charge cycles, and thermal run curves" },
      { name: "OTA Firmware Campaign Server", role: "Software build versions, rollout rings, and flash status telemetry" }
    ],
    complianceGuards: [
      { n: "01", title: "ISO 26262 Functional Safety", body: "Safety-critical vehicle systems isolated from telemetry analytics pipelines." },
      { n: "02", title: "NHTSA Early Warning Reporting (TREAD Act)", body: "Fatalities, injuries, and property damage claims tracked for mandatory federal filing." },
      { n: "03", title: "Driver Geolocation Privacy", body: "Vehicle GPS traces pseudonymized and isolated from marketing CRM records." }
    ],
    useCaseLibrary: [
      {
        id: "auto_battery_health",
        name: "EV Battery State of Health & Thermal Anomaly Radar",
        keywords: ["battery", "ev", "soh", "thermal", "cell", "charging", "telematics", "electric vehicle", "range", "pack"],
        businessProblem: "Degrading battery cells cause sudden range drops and roadside stalls before standard dash warnings illuminate.",
        benefit: "Streaming CAN-bus analysis detects individual cell impedance drift and alerts drivers and service centers proactively.",
        dataFeeds: ["BMS telemetry streams", "Ambient temperature feeds", "Fast-charging session logs"],
        aiCapabilities: ["Electrochemical cell degradation modeling", "Thermal runaway early-warning classifier"],
        kpis: [
          { name: "Unplanned roadside stall reduction", why: "Battery-related breakdowns prevented through advance module swap." },
          { name: "Warranty claim cost savings", why: "Replacement of single degraded cell modules rather than whole battery packs." },
          { name: "Fleet battery life extension", why: "Months added to useful EV pack lifespan via smart charging recommendations." },
          { name: "Prediction lead time", why: "Days of advance notice before a cell reaches critical fault threshold." }
        ],
        solutionMoves: [
          { lead: "Ingest CAN stream", detail: "Monitors cell voltage spreads and pack temperatures during drive cycles." },
          { lead: "Detect cell imbalance", detail: "Flags modules where impedance rises faster than fleet peer benchmarks." },
          { lead: "Pre-order module", detail: "Dispatches replacement battery submodule directly to nearest certified dealer." }
        ]
      }
    ]
  },

  aviation: {
    sector: "Aviation, Airlines & Travel",
    aliases: ["aviation", "airline", "airlines", "airport", "flight", "aircraft", "travel", "baggage", "turnaround"],
    businessAreas: [
      "Aircraft Turnaround Time (TAT) & Gate Management",
      "Predictive Aircraft Maintenance (Engine Telemetry)",
      "Flight Crew Scheduling & IROPS Recovery",
      "Baggage Handling & Lost Luggage Radar",
      "Dynamic Fare & Ancillary Revenue Optimization",
      "Fuel Optimization & Flight Path Efficiency"
    ],
    commonKpis: [
      { name: "On-Time Arrival (A14) %", why: "Industry gold-standard measuring flights arriving within 14 minutes of schedule." },
      { name: "Aircraft Turnaround Time (TAT)", why: "Minutes required from gate arrival to pushback, maximizing fleet utilization." },
      { name: "Mishandled Baggage per 1,000 Passengers", why: "Global DOT passenger satisfaction and operational cost indicator." },
      { name: "Unscheduled Maintenance Ground Time (AOG)", why: "Costly aircraft on ground hours caused by unexpected mechanical faults." },
      { name: "Fuel Burn Variance vs Flight Plan", why: "Tons of jet fuel saved through optimal climb, cruise, and taxi profiles." }
    ],
    dataSystems: [
      { name: "ACARS / Flight Telemetry Feeds", role: "Live airframe sensor data, engine vibration, altitude, and fuel flow" },
      { name: "Airport Gate & Ramp Operations System", role: "Ground crew status, fueling trucks, catering, and baggage tugs" },
      { name: "Passenger Service System (PSS / DCS)", role: "Check-in status, boarding gate scans, and seat inventory" },
      { name: "Crew Management System", role: "Pilot and flight attendant duty limits, rest hours, and pairings" },
      { name: "Baggage Handling System (BHS) RFID", role: "Luggage sorting gate scans, transfer tug scans, and container tags" }
    ],
    complianceGuards: [
      { n: "01", title: "FAA / EASA Airworthiness Mandate", body: "Engine and structural maintenance records signed by certified A&P mechanics." },
      { n: "02", title: "FAA Part 117 Crew Flight and Duty Limitations", body: "Crew pairing changes strictly enforce mandatory rest periods." },
      { n: "03", title: "TSA Secure Flight Data Handling", body: "Passenger manifest data handled strictly in isolated federal security zones." }
    ],
    useCaseLibrary: [
      {
        id: "air_turnaround_radar",
        name: "Predictive Aircraft Turnaround & Gate Delay Radar",
        keywords: ["turnaround", "gate", "ramp", "delay", "boarding", "fueling", "baggage", "catering", "pushback", "a14"],
        businessProblem: "Uncoordinated ramp service providers (catering, fueling, baggage) cause cascading flight departure delays.",
        benefit: "Computer vision ramp cameras and IoT sensor telemetry synchronize turnaround milestones to ensure on-time pushback.",
        dataFeeds: ["Ramp camera feeds", "ACARS touchdown messages", "Baggage scanner streams"],
        aiCapabilities: ["Milestone bottleneck computer vision", "Turnaround delay predictive forecasting"],
        kpis: [
          { name: "A14 on-time departure %", why: "Share of flights departing gate within scheduled departure window." },
          { name: "Average turnaround duration", why: "Minutes saved per narrow-body turnaround across hub airports." },
          { name: "Cascading network delay reduction", why: "Downstream delays prevented across connecting flight legs." },
          { name: "Ground crew idle time %", why: "Labor efficiency gains from synchronized service provider dispatch." }
        ],
        solutionMoves: [
          { lead: "Monitor ramp milestones", detail: "Computer vision tracks bridge docking, fueling hookup, and baggage belt state." },
          { lead: "Spot service delay", detail: "Flags catering or cleaning delays 20 minutes before scheduled pushback." },
          { lead: "Re-sequence boarding", detail: "Coordinates gate agent boarding pace to match exact ramp completion time." }
        ]
      }
    ]
  },

  insurance: {
    sector: "Insurance & Risk Services",
    aliases: ["insurance", "carrier", "underwriting", "policy", "fnol", "claims", "actuarial", "subrogation", "broker", "reinsurance"],
    businessAreas: [
      "First Notice of Loss (FNOL) & Instant Triage",
      "Underwriting Risk & Catastrophe Pricing",
      "Subrogation & Third-Party Recovery Detection",
      "Claims Fraud (SIU) Interception",
      "Policyholder Retention & Renewal Optimization",
      "Catastrophe (CAT) Claim Surge Management"
    ],
    commonKpis: [
      { name: "FNOL-to-Assignment Time", why: "Speed of parsing incoming claims and routing to specialized adjusters." },
      { name: "Claims Settlement Cycle Time", why: "Total days from incident report to policyholder payment disbursement." },
      { name: "Loss Adjustment Expense (LAE)", why: "Operational overhead cost incurred per resolved insurance claim." },
      { name: "Subrogation Recovery Ratio", why: "Dollars recovered from third-party insurers as a percentage of paid losses." },
      { name: "Combined Operating Ratio", why: "Fundamental insurer profitability metric comparing losses + expenses to earned premiums." }
    ],
    dataSystems: [
      { name: "Policy Administration System (PAS)", role: "Policy terms, endorsements, deductibles, and covered perils" },
      { name: "Claims Intake / FNOL Portal", role: "Incident descriptions, mobile photo uploads, and police reports" },
      { name: "Actuarial Loss Triangles", role: "Historical claims severity, frequency, and reserve adequacy models" },
      { name: "Geospatial Hazard Feeds", role: "Flood maps, wildfire perimeters, hurricane track telemetry, and weather data" },
      { name: "Telematics / IoT Streams", role: "Vehicle braking/speed telemetry and connected home leak sensors" }
    ],
    complianceGuards: [
      { n: "01", title: "State Insurance Commissioner Compliance", body: "Underwriting models audited for disparate impact and non-discriminatory rating." },
      { n: "02", title: "Statutory Reserve Lineage", body: "NAIC and Solvency II reserving calculations traceable to claims logs." },
      { n: "03", title: "Fair Claims Settlement Practices", body: "Statutory response deadlines tracked with automated SLA escalations." }
    ],
    useCaseLibrary: [
      {
        id: "ins_fnol_triage",
        name: "First Notice of Loss & Smart Claims Triage",
        keywords: ["claims", "fnol", "triage", "adjuster", "intake", "settlement", "damage", "coverage", "loss"],
        businessProblem: "Manual intake queues delay claim evaluation for 3-5 days, frustrating policyholders and inflating rental car costs.",
        benefit: "Computer vision parses damage photos, verifies policy coverage, and assigns qualified repair networks instantly.",
        dataFeeds: ["Mobile FNOL uploads", "Policy admin coverage terms", "Preferred body shop network API"],
        aiCapabilities: ["Damage severity computer vision estimator", "Coverage verification NLP"],
        kpis: [
          { name: "Straight-through claim %", why: "Proportion of low-complexity claims settled without manual adjuster touch." },
          { name: "Intake-to-repair shop TAT", why: "Hours between accident report and vehicle drop-off at certified shop." },
          { name: "Loss adjustment expense", why: "Administrative processing cost saved per adjudicated claim." },
          { name: "Policyholder NPS", why: "Customer satisfaction score following streamlined digital claims intake." }
        ],
        solutionMoves: [
          { lead: "Classify damage", detail: "Vision models estimate parts replacement cost from customer photos in seconds." },
          { lead: "Check endorsements", detail: "Matches incident facts against policy exclusions and deductible levels." },
          { lead: "Direct route", detail: "Dispatches tow and reserves loaner vehicle within minutes of filing." }
        ]
      }
    ]
  },

  logistics: {
    sector: "Logistics & Supply Chain",
    aliases: ["logistics", "supply chain", "freight", "trucking", "fleet", "tms", "wms", "yard", "shipper", "3pl", "cargo"],
    businessAreas: [
      "Fleet & Freight Dynamic Tracking (ETA Radar)",
      "Yard & Dock Door Scheduling Optimization",
      "Spot Market Freight Rate & Carrier Allocation",
      "Cold-Chain & Cargo Sensor Integrity",
      "Driver Safety & Hours of Service (HOS) Optimization",
      "Warehouse Inventory Dwell & Slotting Optimization"
    ],
    commonKpis: [
      { name: "On-Time In-Full (OTIF) Rate", why: "Percentage of shipments delivered within scheduled appointment window without shortage." },
      { name: "Average Dock Dwell Time", why: "Hours drivers wait at consignee loading facilities, incurring detention fees." },
      { name: "Fleet Capacity Utilization", why: "Ratio of loaded revenue-generating miles versus empty deadhead miles." },
      { name: "Cost Per Ton-Mile", why: "Comprehensive freight operating expenditure including fuel and maintenance." },
      { name: "Detention Penalty Expenditure", why: "Fines paid to contract carriers for loading delays exceeding contract grace periods." }
    ],
    dataSystems: [
      { name: "TMS (Transportation Management)", role: "Load bookings, carrier tenders, rate tariffs, and route plans" },
      { name: "ELD / Fleet GPS Telematics", role: "Live tractor coordinates, driver hours of service, and speed" },
      { name: "WMS / Yard Management", role: "Trailer yard slots, dock door appointments, and warehouse staging" },
      { name: "IoT Reefer Sensors", role: "Trailer interior temperature, humidity, and door tamper state" },
      { name: "Live Weather & Traffic APIs", role: "Route corridor congestion, road closures, and storm forecasts" }
    ],
    complianceGuards: [
      { n: "01", title: "DOT & FMCSA Hours of Service", body: "Driver route recommendations strictly enforce mandatory rest break regulations." },
      { n: "02", title: "FDA Food Safety Modernization (FSMA)", body: "Continuous cold-chain temperature telemetry archived with tamper-proof signatures." },
      { n: "03", title: "Hazardous Materials (HAZMAT)", body: "Hazmat cargo routing adheres strictly to municipal tunnel and bridge restrictions." }
    ],
    useCaseLibrary: [
      {
        id: "log_eta_radar",
        name: "Fleet Tracking & Predictive ETA Exception Radar",
        keywords: ["fleet", "eta", "freight", "delay", "tracking", "route", "gps", "traffic", "shipment", "delivery", "otif"],
        businessProblem: "Dispatchers discover highway congestion and weather bottlenecks only after drivers miss warehouse appointments.",
        benefit: "Continuous telematics analysis recalculates delivery ETAs and alerts consignees 4+ hours before delivery windows fail.",
        dataFeeds: ["ELD GPS streams", "Corridor weather/traffic APIs", "TMS appointment bookings"],
        aiCapabilities: ["Dynamic route corridor travel time prediction", "Appointment conflict auto-rescheduler"],
        kpis: [
          { name: "OTIF delivery rate %", why: "Proportion of loads delivered within strict consignee time windows." },
          { name: "Detention cost reduction", why: "Dollars saved by pre-clearing dock gates before driver arrival." },
          { name: "Deadhead mile %", why: "Reduction in empty miles driven through dynamic backhaul matching." },
          { name: "Consignee inquiry calls", why: "Reduction in manual tracking inquiries." }
        ],
        solutionMoves: [
          { lead: "Recalculate live", detail: "Models evaluate traffic, driver remaining drive time, and weather continuously." },
          { lead: "Spot appointment risk", detail: "Flags loads that will miss consignee appointment times 6 hours out." },
          { lead: "Auto-adjust dock slot", detail: "Sends EDI appointment shift requests to warehouse scheduler automatically." }
        ]
      }
    ]
  },

  telecom: {
    sector: "Telecommunications & Networking",
    aliases: ["telecom", "telecommunications", "cellular", "ran", "5g", "telco", "mobile operator", "broadband", "cell tower", "radio access network"],
    businessAreas: [
      "Network Outage & Cell Site Congestion Radar",
      "Proactive Subscriber Churn Interception",
      "Field Technician Truck Roll Optimization",
      "5G Enterprise Network Slicing SLA Assurance",
      "Billing & Dispute Anomaly Resolution",
      "Tower Power & Backup Battery Management"
    ],
    commonKpis: [
      { name: "Mean Time to Repair (MTTR)", why: "Minutes required from network alarm trigger to service restoration." },
      { name: "Cell Site Call Drop Rate", why: "Percentage of voice and video calls disconnected due to signal degradation." },
      { name: "Subscriber Churn Rate %", why: "Monthly customer disconnections driven by coverage and quality friction." },
      { name: "First-Time Resolution (FTR)", why: "Customer service tickets resolved without secondary escalation or truck roll." },
      { name: "Truck Roll Avoidance Rate", why: "Customer premise issues resolved remotely via automated line diagnostics." }
    ],
    dataSystems: [
      { name: "RAN Telemetry (Radio Access Network)", role: "Cell tower throughput, signal-to-noise ratio, and packet loss" },
      { name: "OSS Alarm Feeds", role: "Equipment failure alarms, fiber cuts, and power outage notifications" },
      { name: "BSS / Billing Engines", role: "Subscriber rate plans, data usage meters, and billing records" },
      { name: "Customer Service CRM & IVR", role: "Call transcripts, support tickets, and speed test diagnostics" },
      { name: "Field Service Dispatch", role: "Technician schedules, spare parts inventory, and GPS coordinates" }
    ],
    complianceGuards: [
      { n: "01", title: "E911 & Emergency Service Mandate", body: "Emergency call priority and location accuracy strictly protected during maintenance." },
      { n: "02", title: "FCC Spectrum Compliance", body: "Tower radiation and power emission parameters monitored within regulatory limits." },
      { n: "03", title: "Customer Proprietary Network Info (CPNI)", body: "Call detail records and subscriber location data protected under federal privacy rules." }
    ],
    useCaseLibrary: [
      {
        id: "tel_outage_radar",
        name: "Cell Congestion & Network Outage Radar",
        keywords: ["outage", "network", "cell", "congestion", "ran", "5g", "tower", "call drop", "throughput", "fiber"],
        businessProblem: "Fiber cuts and cell sector degradation go unnoticed until thousands of frustrated subscribers overload call centers.",
        benefit: "Correlates telemetry alarms with sudden drop-off in subscriber traffic to isolate fiber degradation in under 60 seconds.",
        dataFeeds: ["RAN telemetry", "OSS alarm feeds", "Customer speed test pings"],
        aiCapabilities: ["Alarm storm topological root-cause analysis", "Traffic rerouting optimization"],
        kpis: [
          { name: "MTTR reduction", why: "Minutes shaved off outage resolution time through instant fault pinpointing." },
          { name: "Call drop rate %", why: "Voice and data session continuity maintained across busy cell sectors." },
          { name: "Affected subscriber minutes", why: "Total customer outage impact minimized through rapid traffic reroute." },
          { name: "NOC alarm overload %", why: "Reduction in duplicate alarms grouped into single incident tickets." }
        ],
        solutionMoves: [
          { lead: "Correlate alarms", detail: "Filters 10,000+ raw equipment alarms to isolate the single root fiber break." },
          { lead: "Reroute neighboring cells", detail: "Increases antenna tilt and power on adjacent towers to cover coverage hole." },
          { lead: "Dispatch nearest tech", detail: "Directs field repair crews with exact GPS fault location and replacement optic module." }
        ]
      }
    ]
  },

  energy: {
    sector: "Energy, Power & Utilities",
    aliases: ["energy", "utility", "utilities", "grid", "power", "renewable", "solar", "wind", "oil", "gas", "substation", "pipeline"],
    businessAreas: [
      "Smart Grid Load & Outage Management",
      "Renewable Generation & Dispatch Forecasting",
      "Turbine & Transformer Predictive Maintenance",
      "Meter-to-Cash Theft & Non-Technical Loss Detection",
      "Scope 1 & Scope 2 Emissions / ESG Compliance",
      "Pipeline Pressure & Methane Leak Detection"
    ],
    commonKpis: [
      { name: "SAIDI (System Outage Duration)", why: "Average minutes of interrupted electrical service per customer per year." },
      { name: "SAIFI (System Outage Frequency)", why: "Average number of service interruptions per customer per year." },
      { name: "Renewable Curtailment %", why: "Percentage of green solar/wind power rejected due to local grid transmission bottlenecks." },
      { name: "Non-Technical Loss %", why: "Unmetered energy loss caused by meter tampering and unbilled line taps." },
      { name: "Generation Heat Rate", why: "Thermal fuel efficiency of power plants converting energy into megawatts." }
    ],
    dataSystems: [
      { name: "SCADA / EMS (Energy Management)", role: "Substation voltage, switch positions, bus frequency, and power flows" },
      { name: "AMI (Advanced Metering Infrastructure)", role: "Smart meter 15-minute interval consumption and outage pings" },
      { name: "GIS (Geographic Information)", role: "Electrical circuit maps, transformer locations, and vegetation zones" },
      { name: "Generation Inverter Telemetry", role: "Solar irradiance, wind turbine rotor speed, and battery state-of-charge" },
      { name: "Continuous Emission Monitors (CEMS)", role: "Stack emissions, gas turbine burn rates, and fuel purchase logs" }
    ],
    complianceGuards: [
      { n: "01", title: "NERC-CIP Grid Cybersecurity", body: "Critical infrastructure protection standards strictly enforced for grid telemetry." },
      { n: "02", title: "EPA Clean Air Act Compliance", body: "Stack emission thresholds monitored with automated generation curtailment triggers." },
      { n: "03", title: "Public Utility Commission (PUC) Reporting", body: "SAIDI/SAIFI outage reporting verified with timestamped smart meter logs." }
    ],
    useCaseLibrary: [
      {
        id: "energy_grid_radar",
        name: "Smart Grid Load & Outage Response Radar",
        keywords: ["grid", "outage", "power", "scada", "transformer", "ami", "smart meter", "load", "blackout", "feeder"],
        businessProblem: "Storms cause widespread distribution line faults that take hours to physically locate and isolate in the field.",
        benefit: "Smart meter outage signals and SCADA switch telemetry pinpoint fault locations instantly and coordinate automated restoration.",
        dataFeeds: ["SCADA switch telemetry", "AMI meter last-gasp pings", "Live weather radar"],
        aiCapabilities: ["Distribution fault location estimation", "Dynamic switching sequence optimizer"],
        kpis: [
          { name: "SAIDI outage minutes", why: "Annual customer interruption minutes reduced through faster sectionalizing." },
          { name: "Fault location time", why: "Minutes required to identify exact downed wire span on rural feeders." },
          { name: "Truck roll reduction", why: "Avoided manual patrols by dispatching crews directly to confirmed fault pole." },
          { name: "Substation load balance %", why: "Prevention of transformer overload through automated load shifting." }
        ],
        solutionMoves: [
          { lead: "Triangulate fault", detail: "Combines smart meter outage pings with circuit impedance to locate break." },
          { lead: "Isolate damaged span", detail: "Fires automated SCADA reclosers to restore power to upstream customers." },
          { lead: "Dispatch repair crew", detail: "Sends field crews directly to pole coordinates with required wire splice kit." }
        ]
      }
    ]
  },

  media: {
    sector: "Media, Streaming & Entertainment",
    aliases: ["media", "entertainment", "streaming", "content", "broadcast", "gaming", "publishing", "advertising", "ott"],
    businessAreas: [
      "Subscriber Churn & Content Recommendation Radar",
      "Live Video Streaming Quality of Experience (QoE)",
      "Ad Impression Yield & Dynamic Ad Insertion (DAI)",
      "Digital Rights Management (DRM) & Content Piracy Interception",
      "Production Asset Metadata & Generative Tagging"
    ],
    commonKpis: [
      { name: "Video Start Failure (VSF) %", why: "Percentage of playback attempts failing to render video to viewers." },
      { name: "Rebuffer Ratio %", why: "Proportion of total playback time interrupted by stream buffering." },
      { name: "Subscriber 30-Day Retention %", why: "Viewer engagement sustaining active paid subscription renewals." },
      { name: "Effective CPM (eCPM)", why: "Monetization yield per 1,000 ad impressions rendered." },
      { name: "Content Engagement Hours", why: "Average streaming watch time per active daily account." }
    ],
    dataSystems: [
      { name: "CDN Edge Telemetry", role: "Bitrate switching, buffer health, origin latency, and error codes" },
      { name: "Player Video Analytics SDK", role: "Client-side startup time, frame drop counts, and player events" },
      { name: "Subscriber Billing & Subscription Hub", role: "Subscription tiers, payment methods, and cancellation flows" },
      { name: "Ad Server / SSP Feeds", role: "Real-time bidding requests, win rates, and ad completion rates" },
      { name: "Content Metadata Graph", role: "Show metadata, cast, genre tags, and viewer affinity ratings" }
    ],
    complianceGuards: [
      { n: "01", title: "COPPA & Minor Privacy", body: "Viewing data from children's profiles strictly isolated from behavioral ad targeting." },
      { n: "02", title: "Digital Rights Management (DRM)", body: "Content keys and studio license windows verified before stream delivery." },
      { n: "03", title: "Ad Fraud & MRC Standards", body: "Impression telemetry filtered for bot traffic and invalid viewability." }
    ],
    useCaseLibrary: [
      {
        id: "media_qoe_radar",
        name: "Video Quality of Experience (QoE) & Buffer Radar",
        keywords: ["video", "streaming", "buffer", "qoe", "cdn", "bitrate", "playback", "ott", "churn"],
        businessProblem: "CDN edge degradation causes playback stalls and stream failures, driving instant subscriber app abandonment.",
        benefit: "Client-side player telemetry shifts streaming sessions to backup CDNs before viewers experience buffering.",
        dataFeeds: ["Player SDK telemetry", "CDN edge server metrics", "ISP routing performance"],
        aiCapabilities: ["Real-time multi-CDN traffic switching optimizer", "Bitrate ladder adaptation"],
        kpis: [
          { name: "Rebuffer time reduction %", why: "Total buffering minutes avoided during peak prime-time streaming." },
          { name: "Video start time (VST)", why: "Seconds from play button tap to first frame rendering." },
          { name: "Early stream abandonment", why: "Percentage of viewers quitting playback within first 15 seconds." },
          { name: "CDN egress cost optimization", why: "Dollars saved by routing traffic to lowest-cost performing CDN." }
        ],
        solutionMoves: [
          { lead: "Ingest player pings", detail: "Collects 5-second buffer health pulses from millions of connected TVs and phones." },
          { lead: "Detect CDN ISP choke", detail: "Identifies regional ISP peering congestion degrading primary CDN delivery." },
          { lead: "Switch mid-stream", detail: "Dynamically instructs player app to switch chunk URLs to alternate CDN seamlessly." }
        ]
      }
    ]
  },

  education: {
    sector: "Education & EdTech",
    aliases: ["education", "university", "school", "edtech", "learning", "student", "campus", "academic", "higher ed"],
    businessAreas: [
      "Student Academic At-Risk & Dropout Prevention",
      "Course Registration & Campus Facility Capacity",
      "Adaptive Learning Assessment & Grading Assistance",
      "Alumni Giving & Advancement Campaign Intelligence",
      "Campus Safety & Student Wellbeing Services"
    ],
    commonKpis: [
      { name: "First-to-Second Year Retention Rate", why: "Key institutional metric measuring undergraduate persistence." },
      { name: "Course Completion Rate %", why: "Proportion of enrolled students successfully achieving passing grades." },
      { name: "Early At-Risk Identification Lead Time", why: "Weeks in advance an academic advisor is alerted before midterm failure." },
      { name: "Student Support Ticket Resolution Time", why: "Hours required to resolve financial aid and registration queries." },
      { name: "Classroom Utilization %", why: "Efficient scheduling of physical lecture halls and laboratory space." }
    ],
    dataSystems: [
      { name: "LMS (Learning Management System)", role: "Assignment submissions, quiz scores, discussion activity, and login frequency" },
      { name: "SIS (Student Information System)", role: "Degree progress, GPA history, prerequisites, and registration holds" },
      { name: "Campus Card / Access Control", role: "Library, dining hall, and dorm facility swipe telemetry" },
      { name: "Financial Aid & Tuition Ledger", role: "FAFSA status, scholarship disbursements, and payment balances" },
      { name: "Advising CRM Portal", role: "Advisor notes, appointment scheduling, and intervention tracking" }
    ],
    complianceGuards: [
      { n: "01", title: "FERPA Student Privacy", body: "Educational records and GPA data protected with strict role-based access." },
      { n: "02", title: "Algorithmic Fairness", body: "Retention prediction models audited for equity across demographic groups." },
      { n: "03", title: "Accessibility (ADA / Section 508)", body: "All digital recommendations and dashboards meet WCAG 2.1 AA contrast standards." }
    ],
    useCaseLibrary: [
      {
        id: "edu_at_risk_radar",
        name: "Early Academic Intervention & Retention Radar",
        keywords: ["student", "retention", "at-risk", "lms", "dropout", "academic", "advisor", "grades", "graduation"],
        businessProblem: "Students falling behind on coursework go unnoticed until failing midterm exams make recovery impossible.",
        benefit: "LMS engagement analysis alerts academic advisors during weeks 2-4 when subtle inactivity signals appear.",
        dataFeeds: ["LMS activity streams", "Historical course grade curves", "SIS degree audits"],
        aiCapabilities: ["Student attrition risk classifier", "Personalized tutoring path recommender"],
        kpis: [
          { name: "Freshman retention lift %", why: "Direct improvement in cohort retention from freshman to sophomore year." },
          { name: "Intervention lead time", why: "Weeks before midterm exams that struggling students receive tutoring." },
          { name: "Course drop rate reduction", why: "Fewer late course withdrawals and lost tuition credits." },
          { name: "Advisor caseload efficiency", why: "Advisors spend time on high-need students rather than manual audit checks." }
        ],
        solutionMoves: [
          { lead: "Track weekly cadence", detail: "Monitors assignment submission punctuality and quiz score trajectories." },
          { lead: "Spot drift early", detail: "Flags students whose activity drops 2 standard deviations below course peer average." },
          { lead: "Trigger advisor outreach", detail: "Schedules proactive advising appointment and recommends supplemental peer tutoring." }
        ]
      }
    ]
  }
};

// Dynamic Universal Domain Synthesizer
// Generates rich domain intelligence, systems, KPIs, and use cases for ANY domain or requirement entered by the user.
export function synthesizeDynamicDomainPlaybook(domain = "Enterprise Operations", requirement = "", companyName = "the enterprise") {
  const domClean = String(domain || "Enterprise Operations").trim();
  const reqClean = String(requirement || "Unified Data and AI Platform").trim();
  
  return {
    sector: `${domClean}`,
    aliases: [domClean.toLowerCase()],
    businessAreas: [
      `${domClean} Real-Time Operational Monitoring`,
      `${domClean} Process Bottleneck & Delay Reduction`,
      `${domClean} Predictive Quality & Exception Radar`,
      `${domClean} Resource & Capacity Optimization`,
      `${domClean} Regulatory Compliance & Data Governance`,
      `${domClean} End-to-End Performance Intelligence`
    ],
    commonKpis: [
      { name: `${domClean} Operational Efficiency %`, why: `Measures end-to-end process throughput and turnaround speed across ${companyName}.` },
      { name: "Exception Resolution Cycle Time", why: "Hours required to detect, triage, and resolve operational anomalies." },
      { name: "Operating Cost / Unit Reduction", why: "Direct savings generated by eliminating manual rework and delayed decisions." },
      { name: "Data Ingestion Latency", why: "Time elapsed from operational event generation to executive visibility." },
      { name: "First-Time Success Rate %", why: `Proportion of ${domClean.toLowerCase()} tasks completed without secondary interventions.` }
    ],
    dataSystems: [
      { name: `${domClean} Core System of Record`, role: `Master transactions, operational ledgers, and workflow logs for ${domClean}` },
      { name: "Operational Telemetry & Event Streams", role: `Live event streams, status updates, and machine/user activity logs` },
      { name: "Enterprise ERP & Resource Ledgers", role: "Financial ledgers, resource planning, and procurement status" },
      { name: "CRM & Stakeholder Interaction Hub", role: "Customer tickets, service requests, and communication logs" },
      { name: "Historical Analytics Mart", role: "Historical performance baselines, audit tables, and compliance records" }
    ],
    complianceGuards: [
      { n: "01", title: "Enterprise Data Governance & Lineage", body: `Strict access controls, audit logs, and provenance tracking across all ${domClean} data sources.` },
      { n: "02", title: "Role-Based Security & Isolation", body: "Sensitive operational and stakeholder data isolated with granular entitlement policies." },
      { n: "03", title: "Regulatory Audit Readiness", body: "Every automated recommendation and alert recorded with immutable timestamped telemetry." }
    ],
    useCaseLibrary: [
      {
        id: "universal_anomaly_radar",
        name: `${domClean} Real-Time Exception & Anomaly Radar`,
        keywords: ["anomaly", "exception", "delay", "monitoring", "alert", "real-time", "radar"],
        businessProblem: `Operational bottlenecks and data discrepancies across ${companyName} sit in separate silos and are discovered only after business impact occurs.`,
        benefit: `Streaming intelligence unifies ${domClean} telemetry to detect anomalies in real time and trigger proactive automated resolutions.`,
        dataFeeds: [`${domClean} transaction streams`, "ERP resource ledgers", "Event telemetry logs"],
        aiCapabilities: ["Real-time time-series anomaly detection", "Automated root-cause classification"],
        kpis: [
          { name: "Exception detection latency", why: "Minutes from anomaly occurrence to operational alert." },
          { name: "Operational downtime / delay reduction", why: "Hours saved by proactively fixing process stalls." },
          { name: "Manual review overhead %", why: "Reduction in repetitive spreadsheet reconciliation." }
        ],
        solutionMoves: [
          { lead: "Ingest live events", detail: `Continuously streams operational data from ${domClean} core systems.` },
          { lead: "Detect variances", detail: "Machine learning models flag deviations from expected operational baselines." },
          { lead: "Trigger workflow", detail: "Dispatches automated recommendations and alerts directly to operational owners." }
        ]
      }
    ]
  };
}
