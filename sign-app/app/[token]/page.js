export const dynamic = 'force-dynamic'

import { supabaseAdmin } from '../../lib/supabase'
import SigningClient from './SigningClient'

export default async function SignPage({ params }) {
  const { token } = params

  // Check if token matches borrower1 or borrower2
  let agreement = null
  let borrowerNum = 1

  const { data: b1Agreement } = await supabaseAdmin
    .from('agreements')
    .select('*')
    .eq('token', token)
    .single()

  if (b1Agreement) {
    agreement = b1Agreement
    borrowerNum = 1
  } else {
    const { data: b2Agreement } = await supabaseAdmin
      .from('agreements')
      .select('*')
      .eq('borrower2_token', token)
      .single()

    if (b2Agreement) {
      agreement = b2Agreement
      borrowerNum = 2
    }
  }

  if (!agreement) {
    return <StatusPage icon="✗" title="Link not found" message="This signing link is invalid. Please contact NOW Mortgage for a new link." />
  }

  // Check if this borrower has already signed
  const alreadySigned = borrowerNum === 1
    ? !!agreement.borrower1_signed_at
    : !!agreement.borrower2_signed_at

  if (alreadySigned) {
    return (
      <StatusPage icon="✓" title="Already signed" message={`This agreement was already signed. Thank you!`}>
        {agreement.pdf_url && (
          <a href={agreement.pdf_url} target="_blank" rel="noreferrer" style={btnStyle}>
            Download your copy
          </a>
        )}
      </StatusPage>
    )
  }

  // Borrower 2 can't sign until borrower 1 has signed
  if (borrowerNum === 2 && !agreement.borrower1_signed_at) {
    return <StatusPage icon="⏳" title="Waiting on borrower 1" message="The primary borrower needs to sign first. You'll receive an email with your link once they've completed their signature." />
  }

  if (new Date(agreement.expires_at) < new Date()) {
    return <StatusPage icon="⏱" title="Link expired" message="This signing link has expired. Please contact NOW Mortgage for a new one." />
  }

  return <SigningClient agreement={agreement} borrowerNum={borrowerNum} token={token} />
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
  display: 'inline-block', padding: '12px 28px', background: '#0F1F3D',
  color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 600,
}
