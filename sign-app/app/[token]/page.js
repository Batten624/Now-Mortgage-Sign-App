export const dynamic = 'force-dynamic'

import { supabaseAdmin } from '@/lib/supabase'
import SigningClient from './SigningClient'

export default async function SignPage({ params }) {
  const { token } = params

  const { data: agreement } = await supabaseAdmin
    .from('agreements')
    .select('*')
    .eq('token', token)
    .single()

  if (!agreement) {
    return <StatusPage icon="✗" title="Link not found" message="This signing link is invalid. Please contact NOW Mortgage for a new link." />
  }

  if (agreement.status === 'signed') {
    return (
      <StatusPage icon="✓" title="Already signed" message={`This agreement was signed on ${new Date(agreement.signed_at).toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' })}.`}>
        {agreement.pdf_url && (
          <a href={agreement.pdf_url} target="_blank" rel="noreferrer" style={btnStyle}>
            Download your copy
          </a>
        )}
      </StatusPage>
    )
  }

  if (new Date(agreement.expires_at) < new Date()) {
    return <StatusPage icon="⏱" title="Link expired" message="This signing link has expired. Please contact NOW Mortgage for a new one." />
  }

  return <SigningClient agreement={agreement} />
}

function StatusPage({ icon, title, message, children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e8e3da', padding: '3rem 2.5rem', maxWidth: '480px', width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '1rem' }}>{icon}</div>
        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: 700, color: '#0F1F3D', marginBottom: '0.75rem' }}>{title}</div>
        <div style={{ fontSize: '14px', color: '#5a6a7a', lineHeight: 1.7, marginBottom: children ? '1.5rem' : 0 }}>{message}</div>
        {children}
        <div style={{ marginTop: '2rem', fontSize: '12px', color: '#b0b8c4' }}>
          NOW Mortgage · lending@nowmtg.ca · 587-200-6727
        </div>
      </div>
    </div>
  )
}

const btnStyle = {
  display: 'inline-block',
  padding: '12px 28px',
  background: '#0F1F3D',
  color: '#fff',
  borderRadius: '8px',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: 600,
}
