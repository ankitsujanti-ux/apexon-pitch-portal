// Sector Playbooks Knowledge Base
// Provides structured industry intelligence, operational systems, KPIs, and verified use-case patterns.

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
    aliases: ["bank", "banking", "finance", "payment", "payments", "card", "lending", "credit", "fintech", "wealth"],
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
      { name: "Dispute Portals", role: "Visa Resolve Online (VROL) and Mastercard MasterCom feeds" }
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
    sector: "Retail & E-Commerce",
      aliases: ["retail", "ecommerce", "e-comm", "store", "merchandise", "grocery", "cpg", "apparel", "omnichannel"],
      businessAreas: [
        "Store Replenishment & Stockout Prevention",
        "Dynamic Markdown & Pricing Optimization",
        "Omnichannel Order Routing & Fulfillment",
        "Customer Churn & Personalized Loyalty",
        "Return & Shrink Analytics"
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
        { name: "E-Commerce Clickstream", role: "Digital cart additions, page views, and search queries" }
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
    aliases: ["manufacturing", "plant", "factory", "industrial", "automotive", "production", "oem", "assembly"],
    businessAreas: [
      "Overall Equipment Effectiveness (OEE) & Downtime Reduction",
      "Predictive Asset Maintenance & Vibration Telemetry",
      "First-Pass Yield & Defect Radar",
      "Batch Traceability & Quality Hold Automation",
      "Supply Chain Parts Expediting & Production Scheduling"
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
      { name: "Plant Historian", role: "High-frequency time-series telemetry archive" }
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

  insurance: {
    sector: "Insurance & Risk Services",
    aliases: ["insurance", "carrier", "underwriting", "policy", "fnol", "claims", "actuarial", "subrogation", "broker"],
    businessAreas: [
      "First Notice of Loss (FNOL) & Instant Triage",
      "Underwriting Risk & Catastrophe Pricing",
      "Subrogation & Third-Party Recovery Detection",
      "Claims Fraud (SIU) Interception",
      "Policyholder Retention & Renewal Optimization"
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
    aliases: ["logistics", "supply chain", "freight", "trucking", "fleet", "tms", "wms", "yard", "shipper", "3pl"],
    businessAreas: [
      "Fleet & Freight Dynamic Tracking (ETA Radar)",
      "Yard & Dock Door Scheduling Optimization",
      "Spot Market Freight Rate & Carrier Allocation",
      "Cold-Chain & Cargo Sensor Integrity",
      "Driver Safety & Hours of Service (HOS) Optimization"
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
          { name: "Consignee inquiry calls", why: "Reduction in manual 'where is my freight' tracking phone calls." }
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
    aliases: ["telecom", "telecommunications", "network", "ran", "5g", "mobile", "broadband", "carrier", "tower"],
    businessAreas: [
      "Network Outage & Cell Site Congestion Radar",
      "Proactive Subscriber Churn Interception",
      "Field Technician Truck Roll Optimization",
      "5G Enterprise Network Slicing SLA Assurance",
      "Billing & Dispute Anomaly Resolution"
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
    sector: "Energy & Utilities",
    aliases: ["energy", "utility", "utilities", "grid", "power", "renewable", "solar", "wind", "oil", "gas", "substation"],
    businessAreas: [
      "Smart Grid Load & Outage Management",
      "Renewable Generation & Dispatch Forecasting",
      "Turbine & Transformer Predictive Maintenance",
      "Meter-to-Cash Theft & Non-Technical Loss Detection",
      "Scope 1 & Scope 2 Emissions / ESG Compliance"
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
  }
};
