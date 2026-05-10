'use client'

import { useState } from 'react'
import AppHeader from '@/components/app/AppHeader'
import Overview from '@/components/app/tabs/Overview'
import Exporter from '@/components/app/tabs/Exporter'
import Verifier from '@/components/app/tabs/Verifier'
import Investor from '@/components/app/tabs/Investor'
import DealEconomics from '@/components/app/tabs/DealEconomics'
import SolanaProof from '@/components/app/tabs/SolanaProof'
import DemoFlow from '@/components/app/tabs/DemoFlow'
import CreateInvoiceModal from '@/components/app/modals/CreateInvoiceModal'
import type { AppTab, InvoiceRequest } from '@/lib/types'
import { MOCK_INVOICES } from '@/lib/mockData'

export default function AppPage() {
  const [activeTab, setActiveTab] = useState<AppTab>('overview')
  const [invoices, setInvoices] = useState<InvoiceRequest[]>(MOCK_INVOICES)
  const [showCreate, setShowCreate] = useState(false)

  function updateInvoice(id: string, updates: Partial<InvoiceRequest>) {
    setInvoices((prev) => prev.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv)))
  }

  function addInvoice(invoice: InvoiceRequest) {
    setInvoices((prev) => [invoice, ...prev])
  }

  return (
    <div className="min-h-screen" style={{ background: '#06060A' }}>
      <AppHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCreateInvoice={() => setShowCreate(true)}
      />

      <main className="overflow-hidden">
        {activeTab === 'overview' && <Overview />}
        {activeTab === 'exporter' && (
          <Exporter invoices={invoices} onCreateInvoice={() => setShowCreate(true)} />
        )}
        {activeTab === 'verifier' && (
          <Verifier invoices={invoices} onUpdateInvoice={updateInvoice} />
        )}
        {activeTab === 'investor' && (
          <Investor invoices={invoices} onUpdateInvoice={updateInvoice} />
        )}
        {activeTab === 'deal-economics' && <DealEconomics />}
        {activeTab === 'solana-proof' && <SolanaProof />}
        {activeTab === 'demo-flow' && <DemoFlow />}
      </main>

      {showCreate && (
        <CreateInvoiceModal
          onClose={() => setShowCreate(false)}
          onSubmit={(inv) => {
            addInvoice(inv)
            setActiveTab('exporter')
          }}
        />
      )}
    </div>
  )
}
