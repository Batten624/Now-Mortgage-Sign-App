async function handleSubmit() {
    const e = {}
    if (!signed1)                   e.sig1 = 'Please click to adopt your signature'
    if (hasBorrower2 && !signed2)   e.sig2 = 'Please click to adopt your signature'
    if (!casl)                      e.casl = 'Please check the consent box to proceed'
    setErrors(e)
    if (Object.keys(e).length) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token:       agreement.token,
          caslConsent: casl,
        }),
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
