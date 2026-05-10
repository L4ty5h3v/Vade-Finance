export type InvoiceStatus =
  | 'Draft'
  | 'Documents Uploaded'
  | 'Buyer Confirmed'
  | 'Under Review'
  | 'Verified'
  | 'Funded'
  | 'Repaid'
  | 'Rejected'

export type DocumentType =
  | 'Commercial Invoice'
  | 'Purchase Order'
  | 'Shipping Document'
  | 'Customs Declaration'
  | 'Buyer Confirmation'

export type RiskLevel = 'Low' | 'Medium' | 'High'

export interface DocumentRecord {
  type: DocumentType
  fileName: string
  hash: string
  uploaded: boolean
  uploadedAt?: string
}

export interface FinancingTerms {
  invoiceAmount: number
  advanceRate: number
  paymentTermDays: number
  investorFeePct: number
  platformFeePct: number
  verifierFee: number
}

export interface InvoiceRequest {
  id: string
  exporter: string
  exporterLocation: string
  exporterSector: string
  buyer: string
  buyerCountry: string
  amount: number
  currency: string
  paymentTermDays: number
  advanceRate: number
  advanceAmount: number
  status: InvoiceStatus
  riskLevel: RiskLevel
  confidenceScore: number
  documents: DocumentRecord[]
  createdAt: string
  attestationHash?: string
  txHash?: string
}

export type AppTab =
  | 'overview'
  | 'exporter'
  | 'verifier'
  | 'investor'
  | 'deal-economics'
  | 'solana-proof'
  | 'demo-flow'

export type DemoStage =
  | 'reset'
  | 'buyer-confirmed'
  | 'verifier-review'
  | 'verified'
  | 'funded'
  | 'repaid'
