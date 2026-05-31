export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { firstName, lastName, email, subject, message } = req.body;

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error('RESEND_API_KEY is not set');
    return res.status(500).json({ error: 'Email service not configured' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify({
        from: 'OnCue Gifts <hello@oncuegifts.com>',
        to: ['contact@oncuegifts.com'],
        reply_to: email,
        subject: 'New Contact Form - ' + (subject || 'General'),
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${firstName} ${lastName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
          <hr>
          <p style="color:#999;font-size:12px">Submitted via oncuegifts.com/contact</p>
        `
      })
    });

    const responseText = await response.text();
    console.log('Resend status:', response.status);
    console.log('Resend response:', responseText);

    if (!response.ok) {
      return res.status(500).json({ error: responseText });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Fetch error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
