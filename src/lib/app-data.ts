export type RiskGrade = "A-" | "B+" | "B";

export type InvoiceStatus =
  | "Verified"
  | "Listed"
  | "Funded"
  | "Submitted"
  | "Rejected"
  | "Repaid"
  | "Claimed"
  | "Defaulted"
  | "Pending";

export type FundingStatus = "Open" | "Funded" | "Pending";
export type VerificationStatus = "Verified" | "Submitted" | "Rejected" | "Pending";

export type InvoiceRecord = {
  pubkey?: string;
  exporterWallet?: string;
  investorWallet?: string;
  id: string;
  exporter: string;
  debtor: string;
  debtorCountry: string;
  faceValue: number;
  purchasePrice: number;
  termDays: number;
  risk: RiskGrade;
  status: InvoiceStatus;
  expectedReturn: number;
  dueDate: string;
  documentHash: string;
  metadataHash: string;
  txSignature: string;
  duplicateCheck: "Clean" | "Flagged";
  goodsCategory: string;
};

export type MyInvoiceRow = {
  invoiceId: string;
  debtor: string;
  faceValue: number;
  purchasePrice: number;
  dueDate: string;
  verification: VerificationStatus;
  funding: FundingStatus;
};

export type PortfolioPosition = {
  invoiceId: string;
  invested: number;
  expectedRepayment: number;
  profit: number;
  dueDate: string;
  status: "Active" | "Repaid" | "Pending";
};

export type VerificationItem = {
  pubkey?: string;
  exporterWallet?: string;
  investorWallet?: string;
  invoiceId: string;
  exporter: string;
  debtor: string;
  amount: number;
  documents: string[];
  risk: RiskGrade;
  duplicateCheck: "Clean" | "Flagged";
  status: "Submitted" | "Verified" | "Listed" | "Funded" | "Rejected" | "Repaid" | "Claimed" | "Defaulted";
};

export const overviewMetrics = [
  { label: "Total Funded", value: "124,500 USDT", tone: "blue" },
  { label: "Pending Verification", value: "8 invoices", tone: "cyan" },
  { label: "Average Term", value: "60 days", tone: "emerald" },
  { label: "Investor Yield", value: "5.2%", tone: "purple" },
  { label: "Repayment Due", value: "32,000 USDT", tone: "blue" },
] as const;

export const pipelineBars = [
  { label: "Submitted", value: 32 },
  { label: "Verified", value: 24 },
  { label: "Listed", value: 18 },
  { label: "Funded", value: 14 },
  { label: "Repaid", value: 9 },
] as const;

export const recentActivity = [
  { time: "2m ago", text: "INV-2026-001 verified" },
  { time: "11m ago", text: "9,500 USDT funded by investor" },
  { time: "36m ago", text: "document_hash anchored on-chain" },
  { time: "1h ago", text: "repayment_event pending" },
  { time: "2h ago", text: "platform fee collected" },
] as const;

export const auditTrailPreview = [
  "invoice_pda: inv_8Kx...92a",
  "vault_state: initialized",
  "document_hash: 0x9f2a...c81e",
  "metadata_hash: 0xa71b...901d",
  "tx_signature: 5Nq2...xP9",
  "network: Solana Devnet",
] as const;

export const baseInvoices: InvoiceRecord[] = [
  {
    id: "INV-2026-001",
    exporter: "Anatolia Olive Export Ltd",
    debtor: "Berlin Gourmet GmbH",
    debtorCountry: "Germany",
    faceValue: 10000,
    purchasePrice: 9500,
    termDays: 60,
    risk: "B+",
    status: "Verified",
    expectedReturn: 5.26,
    dueDate: "2026-08-10",
    documentHash: "0x9f2a...c81e",
    metadataHash: "0xa71b...901d",
    txSignature: "5Nq2...xP9",
    duplicateCheck: "Clean",
    goodsCategory: "Food Export",
  },
  {
    id: "INV-2026-014",
    exporter: "Istanbul Textile Co",
    debtor: "Munich Retail GmbH",
    debtorCountry: "Germany",
    faceValue: 24000,
    purchasePrice: 22700,
    termDays: 45,
    risk: "A-",
    status: "Listed",
    expectedReturn: 5.72,
    dueDate: "2026-07-19",
    documentHash: "0x5de1...ac72",
    metadataHash: "0x3f14...18ad",
    txSignature: "2Pc8...vT1",
    duplicateCheck: "Clean",
    goodsCategory: "Textiles",
  },
  {
    id: "INV-2026-032",
    exporter: "Aegean Foods Export",
    debtor: "Hamburg Market AG",
    debtorCountry: "Germany",
    faceValue: 16500,
    purchasePrice: 15600,
    termDays: 75,
    risk: "B",
    status: "Funded",
    expectedReturn: 5.77,
    dueDate: "2026-09-03",
    documentHash: "0x6a2b...e5d0",
    metadataHash: "0x88cc...134f",
    txSignature: "9Qa3...tR6",
    duplicateCheck: "Clean",
    goodsCategory: "Food Export",
  },
  {
    id: "INV-2026-047",
    exporter: "Bursa Machinery Parts",
    debtor: "Cologne Industrial GmbH",
    debtorCountry: "Germany",
    faceValue: 42000,
    purchasePrice: 39800,
    termDays: 90,
    risk: "B+",
    status: "Verified",
    expectedReturn: 5.53,
    dueDate: "2026-09-22",
    documentHash: "0x7731...8ab1",
    metadataHash: "0xee3f...72c1",
    txSignature: "7ML2...kN5",
    duplicateCheck: "Clean",
    goodsCategory: "Machinery",
  },
];

export const myInvoicesSeed: MyInvoiceRow[] = [
  {
    invoiceId: "INV-2026-001",
    debtor: "Berlin Gourmet GmbH",
    faceValue: 10000,
    purchasePrice: 9500,
    dueDate: "2026-08-10",
    verification: "Verified" as VerificationStatus,
    funding: "Open" as FundingStatus,
  },
  {
    invoiceId: "INV-2026-009",
    debtor: "Rotterdam Fresh BV",
    faceValue: 18000,
    purchasePrice: 17020,
    dueDate: "2026-08-26",
    verification: "Submitted" as VerificationStatus,
    funding: "Pending" as FundingStatus,
  },
  {
    invoiceId: "INV-2026-011",
    debtor: "Naples Foods SRL",
    faceValue: 12800,
    purchasePrice: 12050,
    dueDate: "2026-09-14",
    verification: "Verified" as VerificationStatus,
    funding: "Funded" as FundingStatus,
  },
];

export const portfolioSeed: PortfolioPosition[] = [
  {
    invoiceId: "INV-2026-001",
    invested: 9500,
    expectedRepayment: 10000,
    profit: 500,
    dueDate: "2026-08-10",
    status: "Active",
  },
  {
    invoiceId: "INV-2026-032",
    invested: 15600,
    expectedRepayment: 16500,
    profit: 900,
    dueDate: "2026-09-03",
    status: "Pending",
  },
  {
    invoiceId: "INV-2025-118",
    invested: 8700,
    expectedRepayment: 9200,
    profit: 500,
    dueDate: "2026-05-02",
    status: "Repaid",
  },
];

export const verificationSeed: VerificationItem[] = [
  {
    invoiceId: "INV-2026-058",
    exporter: "Marmara Metals Export",
    debtor: "Vienna Build AG",
    amount: 31000,
    documents: ["invoice.pdf", "shipment-proof.pdf"],
    risk: "B+",
    duplicateCheck: "Clean",
    status: "Submitted",
  },
  {
    invoiceId: "INV-2026-059",
    exporter: "Ankara Agro Logistics",
    debtor: "Prague Foods s.r.o.",
    amount: 14500,
    documents: ["invoice.pdf", "packing-list.pdf"],
    risk: "A-",
    duplicateCheck: "Clean",
    status: "Submitted",
  },
  {
    invoiceId: "INV-2026-060",
    exporter: "Izmir Fresh Produce",
    debtor: "Brussels Market NV",
    amount: 22000,
    documents: ["invoice.pdf", "awb.pdf"],
    risk: "B",
    duplicateCheck: "Flagged",
    status: "Submitted",
  },
];

export const invoiceTimeline = [
  "Invoice submitted",
  "Documents checked",
  "Invoice verified",
  "Listed on marketplace",
  "Funded by investor",
  "Repayment pending",
  "Claimed",
] as const;
