export const runtime = 'nodejs'

import { supabaseAdmin } from '../../../lib/supabase'

export async function POST(request) {
  try {
    const { token, caslConsent, pdfBase64 } = await request.json()

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

    let pdfUrl = null
    if (pdfBase64) {
      const base64Data = pdfBase64.split(',')[1]
      const pdfBuffer  = Buffer.from(base64Data, 'base64')

      const { error: uploadErr } = await supabaseAdmin.storage
        .from('agreements')
        .upload(`${token}.pdf`, pdfBuffer, {
          contentType: 'application/pdf',
          upsert: true,
        })

      if (!uploadErr) {
        const { data: urlData } = supabaseAdmin.storage
          .from('agreements')
          .getPublicUrl(`${token}.pdf`)
        pdfUrl = urlData.publicUrl
      }
    }

    const signedAt = new Date().toISOString()
    const { error: updateErr } = await supabaseAdmin
      .from('agreements')
      .update({ status: 'signed', casl_consent: caslConsent, signed_at: signedAt, pdf_url: pdfUrl })
      .eq('token', token)

    if (updateErr) {
      return Response.json({ error: updateErr.message }, { status: 500 })
    }

    const payload = {
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
    }

    fetch(process.env.ZAPIER_WEBHOOK_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    }).catch(err => console.error('Zapier webhook failed:', err))

    return Response.json({ success: true, pdfUrl })

  } catch (err) {
    console.error('Sign error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
