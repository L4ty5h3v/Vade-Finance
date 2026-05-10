import Header from '@/components/landing/Header'
import Hero from '@/components/landing/Hero'
import FlowSection from '@/components/landing/FlowSection'
import DealExample from '@/components/landing/DealExample'
import ProofLayer from '@/components/landing/ProofLayer'
import FinalCTA from '@/components/landing/FinalCTA'

export default function LandingPage() {
  return (
    <main style={{ background: '#06060A', minHeight: '100vh' }}>
      <Header />
      <Hero />
      <FlowSection />
      <DealExample />
      <ProofLayer />
      <FinalCTA />
      <footer
        className="py-8 px-8 text-center text-[10px] tracking-widest uppercase"
        style={{
          borderTop: '1px solid rgba(200,169,110,0.08)',
          fontFamily: 'var(--font-mono)',
          color: 'rgba(107,99,85,0.4)',
        }}
      >
        ExportFlow TR · Frontend MVP · Mock data only · No real financial product
      </footer>
    </main>
  )
}
