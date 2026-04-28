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
      addSection(7, 'Consent to Collect, Use, and Share Information', 'You authorize NOW Mortgage and its agents to collect and verify your personal information
