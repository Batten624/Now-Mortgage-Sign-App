export const runtime = 'nodejs'

import { supabaseAdmin } from '../../../lib/supabase'

export async function POST(request) {
  try {
    const { token, caslConsent } = await request.json()

    if (!token || !caslConsent) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data: agreement, error: fetchErr } = await supabaseAdmin
      .from('agreements')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single()

    if (fetchErr || !agreement) {
      return Response.json({ error: 'Agreement not found or already signed' }, { status: 404 })
    }

    const signedAt = new Date().toISOString()
    const signedDate = new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })

    // Generate PDF server-side
    let pdfUrl = null
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageW = 210
      const margin = 20
      const contentW = pageW - margin * 2
      let y = 20

      const addText = (text, size, bold, color) => {
        doc.setFontSize(size)
        doc.setFont('helvetica', bold ? 'bold' : 'normal')
        doc.setTextColor(color || '#000000')
        const lines = doc.splitTextToSize(text, contentW)
        lines.forEach(line => {
          if (y > 270) { doc.addPage(); y = 20 }
          doc.text(line, margin, y)
          y += size * 0.45
        })
        y += 2
      }

      const addSection = (num, title, body) => {
        if (y > 240) { doc.addPage(); y = 20 }
        doc.setFillColor(15, 31, 61)
        doc.rect(margin, y, contentW, 8, 'F')
        doc.setTextColor('#FFFFFF')
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text(`${num}. ${title}`, margin + 3, y + 5.5)
        y += 12
        addText(body, 10, false, '#333333')
        y += 4
      }

      // Header
      addText('NOW MORTGAGE', 18, true, '#0F1F3D')
      addText('Client Agreement', 14, false, '#B8943F')
      addText('#202 15 Carleton Dr, St. Albert, AB T8N 7K9', 9, false, '#666666')
      addText('587-200-6727 | lending@nowmtg.ca', 9, false, '#666666')
      y += 6

      addSection(1, 'Purpose of this Agreement', 'This NOW Mortgage Client Agreement outlines the services that NOW Mortgage, operating under license of Dependable Mortgage Solutions Corp. will provide to you as your licensed mortgage brokerage, and explains your rights, responsibilities, and the nature of our representation. This agreement follows all RECA-required borrower-representation standards.')
      addSection(2, 'Our Role - Representing You, the Borrower', 'NOW Mortgage acts as your representative. Our duty is to protect your interests, seek suitable mortgage options based on the information you provide, and negotiate terms on your behalf. We owe you loyalty, full disclosure, competence, confidentiality, and all regulatory obligations set out by the Real Estate Council of Alberta (RECA). We do not represent the lender. If at any time this application is deemed to be funded by a Lender represented by Dependable Mortgage Solutions Corp., this disclosure agreement becomes null and void and a new disclosure document must be signed.')
      addSection(3, 'Services We Will Provide', 'Reviewing your financial and credit details to determine mortgage options. Collecting supporting documents required by lenders. Sourcing lenders and negotiating terms based on your stated needs. Preparing, submitting, and managing mortgage applications. Reviewing commitments with you to ensure you understand key terms. Providing ongoing support until funding and completion.')
      addSection(4, 'Your Responsibilities', 'Provide accurate and complete information. Disclose any changes to your financial situation. Review documents we provide and ask questions when needed. Provide consent for us to collect, use, and share your information with lenders, lawyers, and service partners strictly for mortgage-related purposes.')
      addSection(5, 'Conflicts of Interest', 'We will immediately disclose any actual or potential conflicts. If a conflict arises that affects our ability to act solely in your best interest, we will obtain your informed written consent or withdraw representation in accordance with RECA requirements.')
      addSection(6, 'Compensation Disclosure', 'You are not charged brokerage fees unless otherwise disclosed. In most cases, NOW Mortgage is compensated by the lender. If a lender, private lender, or alternative funder offers compensation, we will disclose the structure in writing before you commit to the mortgage terms.')
      addSection(7, 'Consent to Collect, Use, and Share Information', 'You authorize NOW Mortgage and its agents to collect and verify your personal information, including credit reports, employment data, and financial documents, for mortgage qualification and submission. Your information will only be shared with lenders, appraisers, lawyers, and service partners involved in the mortgage process.')
      addSection(8, 'Electronic Communication & CASL Consent', 'By signing this agreement, you consent to receive electronic communications related to your mortgage application, required disclosures, and ongoing updates. You may withdraw this consent at any time. CASL Consent: ' + (caslConsent ? 'Yes' : 'No'))
      addSection(9, 'Term of Agreement', 'This agreement begins on the date you sign and remains in effect until your mortgage funds, you provide written notice to terminate, or we determine that we cannot continue representation. All regulatory obligations remain in place after termination.')
      addSection(10, 'Acknowledgment', 'By signing below, you confirm that you have read and understand this agreement, consent to NOW Mortgage representing you as the borrower, agree to the collection and use of your information for mortgage purposes, confirm the information provided is accurate to the best of your knowledge, and acknowledge that this agreement meets all RECA Written Service Agreement requirements.')

      // Signature blocks
      if (y > 220) { doc.addPage(); y = 20 }
      y += 4
      doc.setDrawColor(184, 148, 63)
      doc.setLineWidth(0.5)
      doc.line(margin, y, pageW - margin, y)
      y += 8

      const addSigBlock = (name, email, phone) => {
        if (y > 240) { doc.addPage(); y = 20 }
        doc.setFillColor(247, 245, 240)
        doc.rect(margin, y, contentW, 40, 'F')
        doc.setDrawColor(232, 227, 218)
        doc.rect(margin, y, contentW, 40, 'S')
        y += 8
        addText('Name: ' + name, 10, false, '#0F1F3D')
        addText('Email: ' + email, 10, false, '#0F1F3D')
        addText('Phone: ' + (phone || '-'), 10, false, '#0F1F3D')
        addText('Date: ' + signedDate, 10, false, '#0F1F3D')
        doc.setFont('helvetica', 'bolditalic')
        doc.setFontSize(18)
        doc.setTextColor('#0F1F3D')
        doc.text(name, margin + 4, y)
        y += 12
      }

      addText('Borrower 1 - Signature', 11, true, '#0F1F3D')
      addSigBlock(agreement.borrower1_name, agreement.borrower1_email, agreement.borrower1_phone)

      if (agreement.borrower2_name) {
        y += 6
        addText('Borrower 2 - Signature', 11, true, '#0F1F3D')
        addSigBlock(agreement.borrower2_name, agreement.borrower2_email, agreement.borrower2_phone)
      }

      const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
      const fileName = `${token}.pdf`

      const { error: uploadErr } = await supabaseAdmin.storage
        .from('agreements')
        .upload(fileName, pdfBuffer, { contentType: 'application/pdf', upsert: true })

      if (!uploadErr) {
        const { data: urlData } = supabaseAdmin.storage
          .from('agreements')
          .getPublicUrl(fileName)
        pdfUrl = urlData.publicUrl
      }
    } catch (pdfErr) {
      console.error('PDF generation failed:', pdfErr)
    }

    const { error: updateErr } = await supabaseAdmin
      .from('agreements')
      .update({ status: 'signed', casl_consent: caslConsent, signed_at: signedAt, pdf_url: pdfUrl })
      .eq('token', token)

    if (updateErr) {
      return Response.json({ error: updateErr.message }, { status: 500 })
    }

    fetch(process.env.ZAPIER_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event:        'agreement_signed',
        agreement_id: agreement.id,
        client_id:    agreement.client_id,
        signed_at:    signedAt,
        pdf_url:      pdfUrl,
        casl_consent: caslConsent,
        borrower1: {
          name:  agreement.borrower1_name,
          email: agreement.borrower1_email,
          phone: agreement.borrower1_phone,
        },
        borrower2: agreement.borrower2_name ? {
          name:  agreement.borrower2_name,
          email: agreement.borrower2_email,
          phone: agreement.borrower2_phone,
        } : null,
      }),
    }).catch(err => console.error('Zapier webhook failed:', err))

    return Response.json({ success: true, pdfUrl })

  } catch (err) {
    console.error('Sign error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
