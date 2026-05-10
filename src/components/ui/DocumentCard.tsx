import { CheckCircle, Clock } from 'lucide-react'
import type { DocumentRecord } from '@/lib/types'

export function DocumentCard({ doc }: { doc: DocumentRecord }) {
  return (
    <div
      className="flex items-center gap-3 p-3 transition-colors"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: `1px solid ${doc.uploaded ? 'rgba(0,196,176,0.15)' : 'rgba(255,255,255,0.05)'}`,
      }}
    >
      <div className="flex-shrink-0">
        {doc.uploaded
          ? <CheckCircle className="w-4 h-4" style={{ color: '#00C4B0' }} />
          : <Clock className="w-4 h-4" style={{ color: '#6B6355' }} />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-xs font-medium truncate"
          style={{ fontFamily: 'var(--font-body)', color: doc.uploaded ? '#F0E8D8' : '#6B6355' }}
        >
          {doc.type}
        </p>
        {doc.uploaded && doc.hash && (
          <p
            className="text-[10px] truncate mt-0.5"
            style={{ fontFamily: 'var(--font-mono)', color: '#C8A96E' }}
          >
            {doc.hash}
          </p>
        )}
      </div>
    </div>
  )
}
