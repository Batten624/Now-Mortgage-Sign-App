'use client'

import { useState } from 'react'

const NAVY = '#0F1F3D'
const GOLD = '#B8943F'

const SIG_FONTS = [
  { label: 'Classic', font: "'Dancing Script', cursive" },
  { label: 'Formal',  font: "'Georgia', serif", style: 'italic' },
]

export default function SigningClient({ agreement, borrowerNum, token }) {
  const [signed, setSigned]       = useState(false)
  const [sigFont, setSigFont]     = useState(0)
  const [casl, setCasl]           = useState(false)
  const [errors, setErrors]       = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone]           = useState(false)
  const [pdfUrl, setPdfUrl]       = useState(null)

  const today = new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })

  const borrowerName  = borrowerNum === 1 ? agreement.borrower1_name  : agreement.borrower2_name
  const borrowerEmail = borrowerNum === 1 ? agreement.borrower1_email : agreement.borrower2_email
  const borrowerPhone = borrowerNum === 1 ? agreement.borrower1_phone : agreement.borrower2_phone
  const hasCoBorrower = !!agreement.borrower2_name

  async function handleSubmit() {
    const e = {}
    if (!signed) e.sig = 'Please click to adopt your signature'
    if (!casl)   e.casl = 'Please check the consent box to proceed'
    setErrors(e)
    if (Object.keys(e).length) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, borrowerNum, caslConsent: casl }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      setPdfUrl(data.pdfUrl)
      setDone(true)
    } catch (err) {
      alert('Something went wrong. Please try again or contact lending@nowmtg.ca')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: '#F7F5F0' }}>
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e8e3da', padding: '3rem 2.5rem', maxWidth: '480px', width: '100%', textAlign: 'center' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', fontSize: 28, color: '#065f46' }}>✓</div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: 700, color: NAVY, marginBottom: '0.75rem' }}>Agreement signed</div>
          <div style={{ fontSize: '14px', color: '#5a6a7a', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            Thank you, <strong>{borrowerName}</strong>.
            {borrowerNum === 1 && hasCoBorrower
              ? ' Your signature has been received. The co-borrower will now receive their signing link.'
              : ' Your signed agreement has been received by NOW Mortgage.'}
          </div>
          {pdfUrl && (
            <a href={pdfUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-block', padding: '12px 28px', background: NAVY, color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
              Download your copy
            </a>
          )}
          <div style={{ marginTop: '2rem', fontSize: '12px', color: '#b0b8c4' }}>NOW Mortgage · lending@nowmtg.ca · 587-200-6727</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#F7F5F0', minHeight: '100vh', padding: '2rem 1rem 4rem' }}>
      <div style={{ maxWidth: 740, margin: '0 auto', background: 'white' }}>

        <div style={{ background: NAVY, padding: '2rem 2.5rem', textAlign: 'center' }}>
          <div style={{ color: GOLD, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 6, fontFamily: 'DM Mono, monospace' }}>NOW MORTGAGE</div>
          <div style={{ color: 'white', fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 700 }}>Client Agreement</div>
          {hasCoBorrower && (
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 8, fontFamily: 'DM Mono, monospace' }}>
              Signing as: Borrower {borrowerNum} — {borrowerName}
            </div>
          )}
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 6, fontFamily: 'DM Mono, monospace' }}>
            #202 15 Carleton Dr, St. Albert, AB T8N 7K9 · 587-200-6727 · lending@nowmtg.ca
          </div>
        </div>

        <div style={{ padding: '2.5rem' }}>

          <Section num={1} title="Purpose of this Agreement">
            This NOW Mortgage Client Agreement outlines the services that NOW Mortgage, operating under license of Dependable Mortgage Solutions Corp. will provide to you as your licensed mortgage brokerage, and explains your rights, responsibilities, and the nature of our representation. This agreement follows all RECA-required borrower-representation standards.
          </Section>

          <Section num={2} title="Our Role - Representing You, the Borrower">
            NOW Mortgage acts as your representative. Our duty is to protect your interests, seek suitable mortgage options based on the information you provide, and negotiate terms on your behalf. We owe you loyalty, full disclosure, competence, confidentiality, and all regulatory obligations set out by the Real Estate Council of Alberta (RECA). We do not represent the lender. If at any time this application is deemed to be funded by a Lender represented by Dependable Mortgage Solutions Corp., this disclosure agreement becomes null and void and a new disclosure document must be signed and agreed upon by all borrowers.
          </Section>

          <Section num={3} title="Services We Will Provide">
            <ul style={{ paddingLeft: 18, lineHeight: 2, marginTop: 8 }}>
              <li>Reviewing your financial and credit details to determine mortgage options.</li>
              <li>Collecting supporting documents required by lenders.</li>
              <li>Sourcing lenders and negotiating terms based on your stated needs.</li>
              <li>Preparing, submitting, and managing mortgage applications.</li>
              <li>Reviewing commitments with you to ensure you understand key terms.</li>
              <li>Providing ongoing support until funding and completion.</li>
            </ul>
          </Section>

          <Section num={4} title="Your Responsibilities">
            To ensure we can properly represent you, you agree to:
            <ul style={{ paddingLeft: 18, lineHeight: 2, marginTop: 6 }}>
              <li>Provide accurate and complete information.</li>
              <li>Disclose any changes to your financial situation.</li>
              <li>Review documents we provide and ask questions when needed.</li>
              <li>Provide consent for us to collect, use, and share your information with lenders, lawyers, and service partners strictly for mortgage-related purposes.</li>
            </ul>
          </Section>

          <Section num={5} title="Conflicts of Interest">
            We will immediately disclose any actual or potential conflicts. If a conflict arises that affects our ability to act solely in your best interest, we will obtain your informed written consent or withdraw representation in accordance with RECA requirements.
          </Section>

          <Section num={6} title="Compensation Disclosure">
            You are not charged brokerage fees unless otherwise disclosed. In most cases, NOW Mortgage is compensated by the lender. If a lender, private lender, or alternative funder offers compensation, we will disclose the structure in writing before you commit to the mortgage terms.
          </Section>

          <Section num={7} title="Consent to Collect, Use, and Share Information">
            You authorize NOW Mortgage and its agents to collect and verify your personal information, including credit reports, employment data, and financial documents, for mortgage qualification and submission. Your information will only be shared with lenders, appraisers, lawyers, and service partners involved in the mortgage process.
            <div style={{ background: '#f7f5f0', border: '1px solid #e8e3da', borderRadius: 8, padding: '1rem', marginTop: 12, fontSize: 13 }}>
              <strong>I/We provide consent to NOW Mortgage and/or Dependable Mortgage Solutions Corp. to obtain a credit report for:</strong>
              <div style={{ display: 'flex', gap: 32, marginTop: 8, flexWrap: 'wrap' }}>
                <div><span style={{ color: '#8a9ab0' }}>Applicant 1: </span><strong>{agreement.borrower1_name}</strong></div>
                {hasCoBorrower && <div><span style={{ color: '#8a9ab0' }}>Applicant 2: </span><strong>{agreement.borrower2_name}</strong></div>}
              </div>
            </div>
          </Section>

          <Section num={8} title="Electronic Communication & CASL Consent">
            By signing this agreement, you consent to receive electronic communications related to your mortgage application, required disclosures, and ongoing updates. You may withdraw this consent at any time.
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginTop: 12, fontSize: 14 }}>
              <input type="checkbox" checked={casl} onChange={e => setCasl(e.target.checked)} style={{ marginTop: 3, width: 16, height: 16, flexShrink: 0, accentColor: NAVY }} />
              <span>I agree to receive electronic communications from NOW Mortgage and/or Dependable Mortgage Solutions Corp.</span>
            </label>
            {errors.casl && <div style={{ color: '#dc2626', fontSize: 12, marginTop: 6 }}>{errors.casl}</div>}
          </Section>

          <Section num={9} title="Term of Agreement">
            This agreement begins on the date you sign and remains in effect until your mortgage funds, you provide written notice to terminate, or we determine that we cannot continue representation. All regulatory obligations remain in place after termination.
          </Section>

          <Section num={10} title="Acknowledgment">
            By signing below, you confirm that you have read and understand this agreement, consent to NOW Mortgage representing you as the borrower, agree to the collection and use of your information for mortgage purposes, confirm the information provided is accurate to the best of your knowledge, and acknowledge that this agreement meets all RECA Written Service Agreement requirements.
          </Section>

          <div style={{ height: 2, background: GOLD, borderRadius: 2, margin: '8px 0 28px' }} />

          <SignatureBlock
            label={hasCoBorrower ? `Borrower ${borrowerNum}` : 'Borrower'}
            name={borrowerName}
            email={borrowerEmail}
            phone={borrowerPhone}
            today={today}
            signed={signed}
            sigFont={SIG_FONTS[sigFont]}
            fontIndex={sigFont}
            fonts={SIG_FONTS}
            onSign={() => setSigned(true)}
            onUnsign={() => setSigned(false)}
            onFontChange={setSigFont}
            error={errors.sig}
          />

          <button onClick={handleSubmit} disabled={submitting} style={{ width: '100%', padding: '16px', marginTop: 8, background: submitting ? '#8a9ab0' : NAVY, color: 'white', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'Syne, sans-serif', letterSpacing: 0.3 }}>
            {submitting ? 'Submitting...' : 'Submit signed agreement'}
          </button>

          <p style={{ fontSize: 11, color: '#b0b8c4', textAlign: 'center', marginTop: 16 }}>
            NOW Mortgage · Operating under license of Dependable Mortgage Solutions Corp. · RECA Licensed
          </p>
          <p style={{ fontSize: 10, color: '#d0d5dd', textAlign: 'center', marginTop: 8, fontFamily: 'DM Mono, monospace', letterSpacing: 0.5 }}>
            Document ID: {agreement.token}
          </p>
        </div>
      </div>
    </div>
  )
}

function SignatureBlock({ label, name, email, phone, today, signed, sigFont, fontIndex, fonts, onSign, onUnsign, onFontChange, error }) {
  return (
    <div style={{ border: '1px solid #e8e3da', borderRadius: 12, padding: '1.25rem 1.5rem', marginBottom: 16, background: '#fafaf8' }}>
      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#0F1F3D', marginBottom: 12, fontSize: 14 }}>{label}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', fontSize: 13, marginBottom: 16 }}>
        <InfoItem label="Name"  value={name} />
        <InfoItem label="Email" value={email} />
        <InfoItem label="Phone" value={phone || '-'} />
        <InfoItem label="Date"  value={today} />
      </div>
      {!signed ? (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {fonts.map((f, i) => (
              <button key={i} onClick={() => onFontChange(i)} style={{ padding: '4px 14px', borderRadius: 6, border: '1px solid', borderColor: fontIndex === i ? '#0F1F3D' : '#e8e3da', background: fontIndex === i ? '#0F1F3D' : 'white', color: fontIndex === i ? 'white' : '#5a6a7a', fontSize: 12, cursor: 'pointer', fontFamily: f.font, fontStyle: f.style || 'normal' }}>
                {name}
              </button>
            ))}
          </div>
          <div onClick={onSign} style={{ border: '1px dashed #b0b8c4', borderRadius: 8, padding: '18px 16px', cursor: 'pointer', background: 'white', textAlign: 'center' }}>
            <div style={{ fontFamily: sigFont.font, fontStyle: sigFont.style || 'normal', fontSize: 32, color: '#0F1F3D', marginBottom: 6 }}>{name}</div>
            <div style={{ fontSize: 11, color: '#8a9ab0', fontFamily: 'DM Mono, monospace' }}>Click to adopt this as your signature</div>
          </div>
          {error && <div style={{ color: '#dc2626', fontSize: 12, marginTop: 6 }}>{error}</div>}
        </div>
      ) : (
        <div>
          <div style={{ border: '1px solid #e8e3da', borderRadius: 8, padding: '16px', background: 'white', position: 'relative' }}>
            <div style={{ fontSize: 10, color: '#8a9ab0', fontFamily: 'DM Mono, monospace', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Signed by</div>
            <div style={{ fontFamily: sigFont.font, fontStyle: sigFont.style || 'normal', fontSize: 30, color: '#0F1F3D' }}>{name}</div>
            <div style={{ height: 1, background: '#0F1F3D', marginTop: 4, marginBottom: 6, opacity: 0.3 }} />
            <div style={{ fontSize: 11, color: '#8a9ab0', fontFamily: 'DM Mono, monospace' }}>{today}</div>
            <button onClick={onUnsign} style={{ position: 'absolute', top: 10, right: 12, background: 'none', border: 'none', fontSize: 11, color: '#8a9ab0', cursor: 'pointer', fontFamily: 'DM Mono, monospace' }}>Change</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#065f46', flexShrink: 0 }}>✓</div>
            <span style={{ fontSize: 12, color: '#065f46' }}>Signature adopted</span>
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ num, title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ background: '#0F1F3D', color: 'white', padding: '8px 16px', borderRadius: 7, marginBottom: 10, fontWeight: 600, fontSize: 14, fontFamily: 'Syne, sans-serif' }}>
        {num}. {title}
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.85, color: '#2a3a50', paddingLeft: 4 }}>{children}</div>
    </div>
  )
}

function InfoItem({ label, value }) {
  return (
    <div>
      <span style={{ color: '#8a9ab0', fontFamily: 'DM Mono, monospace', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}: </span>
      <strong style={{ fontSize: 13 }}>{value}</strong>
    </div>
  )
}
