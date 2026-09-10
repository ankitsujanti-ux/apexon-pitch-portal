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
        id: "hc_patient_flow",
        name: "Predictive Bed Capacity & Flow Radar",
        keywords: ["bed", "capacity", "patient flow", "waiting time", "emergency", "ed", "discharge", "occupancy", "crowding", "admissions"],
        businessProblem: "Delayed discharges and unpredictable emergency arrivals cause ED boarding and severe bed shortages.",
        benefit: "Forecasting bed demand 8-12 hours in advance enables proactive transfer and discharge staffing.",
        dataFeeds: ["ADT feeds", "ED tracker telemetry", "Nurse staffing logs"],
        aiCapabilities: ["Time-series demand forecasting", "Discharge barrier NLP classification"],
        kpis: [
          { name: "Bed wait time", why: "Minutes patients wait in ED after admission order is signed." },
          { name: "Forecast accuracy (8h)", why: "Variance between predicted and actual bed vacancies per unit." },
          { name: "Discharge turnaround time", why: "Hours from physician discharge order to actual room turnover." },
          { name: "ED boarding rate", why: "Percentage of ED bays occupied by admitted patients awaiting inpatient beds." }
        ],
        solutionMoves: [
          { lead: "Predict surges", detail: "Machine learning models forecast unit-level bed demand across 8-hour shift windows." },
          { lead: "Spot barriers", detail: "NLP identifies uncompleted lab tests or physical therapy consults delaying discharge." },
          { lead: "Coordinate beds", detail: "Bed placement coordinators receive automated room assignment suggestions." }
        ]
      },
      {
        id: "hc_claim_denials",
        name: "Pre-Submission Claim Denial Prevention",
        keywords: ["denial", "claim", "billing", "revenue cycle", "coding", "payer", "prior auth", "reimbursement", "cash flow"],
        businessProblem: "Hospitals discover coding omissions and authorization mismatches only after payers reject the claim.",
        benefit: "Streaming claim scrub checks 837 EDI records against payer policy rules before batch submission.",
        dataFeeds: ["837/835 EDI feeds", "EHR clinical documentation", "Payer contract rules"],
        aiCapabilities: ["Payer policy rule engine", "Semantic clinical code validation"],
        kpis: [
          { name: "First-pass clean claim %", why: "Proportion of claims settled on initial submission without appeals." },
          { name: "Denial dollar volume", why: "Monthly gross revenue delayed in dispute or lost to write-offs." },
          { name: "Days in AR", why: "Velocity of cash collection from procedure date to bank settlement." },
          { name: "Appeal turnaround time", why: "Hours spent by billing teams preparing secondary appeals." }
        ],
        solutionMoves: [
          { lead: "Audit pre-bill", detail: "Every claim encounters automated rules verification before filing to clearinghouses." },
          { lead: "Flag missing auth", detail: "System flags procedures lacking payer prior authorization prior to submission." },
          { lead: "Auto-generate appeals", detail: "Generates evidence packets from EHR clinical notes for unavoidable denials." }
        ]
      },
      {
        id: "hc_prior_auth",
        name: "Prior Authorization Clinical Assistant",
        keywords: ["prior auth", "authorization", "payer approval", "clinical review", "coverage", "precertification"],
        businessProblem: "Physicians and coordinators spend 14+ hours weekly assembling medical necessity documentation for payers.",
        benefit: "Extracts required chart notes and maps them directly to specific payer criteria for instant packet completion.",
        dataFeeds: ["EHR chart notes", "Diagnostic radiology reports", "Payer authorization APIs"],
        aiCapabilities: ["Medical necessity NLP extraction", "Payer guideline semantic matcher"],
        kpis: [
          { name: "Auth submission TAT", why: "Hours elapsed between physician order and complete packet submission." },
          { name: "Approval rate (first attempt)", why: "Percentage of requests approved without peer-to-peer appeals." },
          { name: "Coordinator hours saved", why: "Weekly administrative burden redirected to direct patient care." },
          { name: "Procedure delay reduction", why: "Days reduced from diagnosis to scheduled operating room slot." }
        ],
        solutionMoves: [
          { lead: "Extract criteria", detail: "Reads payer medical policies and identifies required clinical justifications." },
          { lead: "Assemble packet", detail: "Gathers diagnostic lab values and notes into formatted insurer submissions." },
          { lead: "Track status", detail: "Polls payer portals and alerts teams immediately upon approval or query." }
        ]
      }
    ]
  },

  banking: {
    sector: "Banking & Financial Services",
    aliases: ["bank", "banking", "finance", "payment", "payments", "card", "lending", "credit", "fintech", "wealth", "treasury"],
    businessAreas: [
      "Real-Time Fraud & Anomaly Detection",
      "Intraday Liquidity & Treasury Management",
      "AML / KYC Regulatory Compliance & Triage",
      "Dispute & Chargeback Resolution",
      "Credit Risk & Dynamic Underwriting",
      "Customer Churn & Wealth Advisory Intelligence"
    ],
    commonKpis: [
      { name: "Fraud False Positive Ratio", why: "Measures legitimate transactions blocked by risk rules, preserving customer trust." },
      { name: "Detection-to-Action Latency", why: "Milliseconds between transaction auth stream ingestion and decision." },
      { name: "Chargeback Settlement Velocity", why: "Days to resolve cardholder dispute representments with scheme operators." },
      { name: "Intraday Liquidity Buffer", why: "Cushion maintained above clearing house threshold obligations." },
      { name: "AML Alert Review Cycle Time", why: "Days required by compliance analysts to adjudicate SAR filings." }
    ],
    dataSystems: [
      { name: "Core Banking Ledger", role: "Deposit accounts, transaction history, and account balances" },
      { name: "Payment Switch / Auth Stream", role: "Real-time ISO 8583 / ISO 20022 card and wire messaging" },
      { name: "AML / Sanctions Watchlist", role: "OFAC, PEP, and negative news feeds" },
      { name: "Credit Bureau Webhooks", role: "FICO updates, delinquency signals, and inquiry records" },
      { name: "Dispute Portals", role: "Visa Resolve Online (VROL) and Mastercard MasterCom feeds" },
      { name: "Treasury Management System", role: "Correspondent account balances, repo positions, and FX hedges" }
    ],
    complianceGuards: [
      { n: "01", title: "PCI-DSS & Tokenization", body: "Cardholder primary account numbers (PAN) masked and tokenized at ingestion." },
      { n: "02", title: "Explainable AI (SR 11-7)", body: "Model risk governance with feature importance explanations for every credit or risk decision." },
      { n: "03", title: "SOX & Regulatory Lineage", body: "Immutable ledger lineage tracing every balance and calculated ratio back to source feeds." }
    ],
    useCaseLibrary: [
      {
        id: "bfsi_fraud_radar",
        name: "Real-Time Transaction Fraud & Anomaly Radar",
        keywords: ["fraud", "anomaly", "suspicious", "card", "transaction", "payment", "unauthorized", "wire", "settlement"],
        businessProblem: "Sophisticated cross-border fraud and account takeovers bypass static rules and settle before detection.",
        benefit: "Streaming machine learning scores behavioral anomalies in under 40 milliseconds at the point of authorization.",
        dataFeeds: ["Auth switch telemetry", "Device fingerprinting", "Historical transaction graph"],
        aiCapabilities: ["Graph neural networks", "Real-time behavioral anomaly scoring"],
        kpis: [
          { name: "Fraud loss reduction %", why: "Net dollars saved from intercepted fraudulent payment flows." },
          { name: "False positive ratio", why: "Ratio of false alerts to true fraud, minimizing merchant friction." },
          { name: "Scoring latency (p99)", why: "Milliseconds to evaluate risk before authorization timeout." },
          { name: "Account takeover catch rate", why: "Percentage of hijacked credentials intercepted prior to transfer." }
        ],
        solutionMoves: [
          { lead: "Ingest stream", detail: "Consumes payment auth requests via real-time message brokers in milliseconds." },
          { lead: "Graph scoring", detail: "Evaluates device, geolocation, velocity, and recipient network risk in real time." },
          { lead: "Automated step-up", detail: "Triggers biometric 2FA or temporary hold without human analyst delay." }
        ]
      },
      {
        id: "bfsi_treasury_pulse",
        name: "Intraday Liquidity & Cash Ladder Pulse",
        keywords: ["liquidity", "treasury", "cash", "settlement", "clearing", "intraday", "overdraft", "fedwire", "swift"],
        businessProblem: "Treasury teams monitor multi-currency clearing balances on overnight reports, risking daylight overdraft penalties.",
        benefit: "Unifies RTGS, Fedwire, and currency corridor obligations into a live real-time liquidity ladder.",
        dataFeeds: ["SWIFT / Fedwire streams", "General ledger balances", "Open repo & securities positions"],
        aiCapabilities: ["Cash flow predictive forecasting", "Dynamic buffer optimization"],
        kpis: [
          { name: "Daylight overdraft fees", why: "Penalty dollars avoided by proactively rebalancing correspondent accounts." },
          { name: "Idle buffer reduction", why: "Capital freed from trapped buffer reserves for overnight investment." },
          { name: "Settlement failure rate", why: "Percentage of outgoing transfers delayed due to local currency shortfalls." },
          { name: "Real-time visibility %", why: "Share of global correspondent balances updated in sub-minute latency." }
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
