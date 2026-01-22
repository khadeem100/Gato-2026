import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;

    // Verify Turnstile token
    const turnstileResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: data.turnstileToken,
      }),
    });

    const turnstileResult = await turnstileResponse.json();
    
    if (!turnstileResult.success) {
      return res.status(400).json({ error: 'Turnstile verification failed' });
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html lang="nl">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #1a1a1a; background-color: #f5f5f5; padding: 20px; }
            .email-wrapper { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #f5b21a 0%, #d99b15 100%); padding: 40px 30px; text-align: center; }
            .logo { width: 60px; height: 60px; margin: 0 auto 20px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: bold; color: #f5b21a; }
            .header h1 { color: white; font-size: 28px; font-weight: 600; margin-bottom: 8px; }
            .header p { color: rgba(255, 255, 255, 0.9); font-size: 16px; }
            .content { padding: 40px 30px; }
            .section { margin-bottom: 32px; background: #fafafa; border-radius: 12px; padding: 24px; border-left: 4px solid #f5b21a; }
            .section-title { font-size: 18px; font-weight: 600; color: #1a1a1a; margin-bottom: 16px; }
            .info-row { display: flex; margin-bottom: 12px; }
            .label { font-weight: 600; color: #666; width: 140px; }
            .value { color: #1a1a1a; }
            .footer { background: #1a1a1a; color: #999; text-align: center; padding: 30px; font-size: 13px; }
            .footer-logo { color: #f5b21a; font-size: 14px; font-weight: 600; margin-bottom: 12px; }
            .footer a { color: #f5b21a; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="header">
              <div class="logo">G</div>
              <h1>Nieuwe Offerte Aanvraag</h1>
              <p>Gato-International B.V.</p>
            </div>
            <div class="content">
              <div class="section">
                <div class="section-title">👤 Bedrijfsgegevens</div>
                <div class="info-row"><span class="label">Bedrijfsnaam</span><span class="value">${data.bedrijfsnaam}</span></div>
                <div class="info-row"><span class="label">Contactpersoon</span><span class="value">${data.contactpersoon}</span></div>
                <div class="info-row"><span class="label">E-mailadres</span><span class="value"><a href="mailto:${data.email}" style="color: #f5b21a;">${data.email}</a></span></div>
                <div class="info-row"><span class="label">Telefoonnummer</span><span class="value"><a href="tel:${data.telefoon}" style="color: #f5b21a;">${data.telefoon}</a></span></div>
              </div>
              <div class="section">
                <div class="section-title">📦 Productinformatie</div>
                <div class="info-row"><span class="label">Producten</span><span class="value">${data.producten}</span></div>
                <div class="info-row"><span class="label">Aantal stuks</span><span class="value">${data.aantal}</span></div>
                <div class="info-row"><span class="label">Druktechniek</span><span class="value"><strong style="color: #f5b21a;">${data.druktechniek}</strong></span></div>
              </div>
              <div class="section">
                <div class="section-title">🎨 Logo & Design</div>
                <div class="info-row"><span class="label">Logo beschikbaar</span><span class="value">${data.hasLogo === 'ja' ? '✅ Ja' : '❌ Nee, hulp nodig'}</span></div>
              </div>
              <div class="section">
                <div class="section-title">📅 Planning & Budget</div>
                <div class="info-row"><span class="label">Gewenste levertijd</span><span class="value">${data.levertijd}</span></div>
                <div class="info-row"><span class="label">Budget</span><span class="value"><strong>${data.budget}</strong></span></div>
                ${data.opmerkingen ? `<div class="info-row"><span class="label">Opmerkingen</span><span class="value">${data.opmerkingen}</span></div>` : ''}
              </div>
            </div>
            <div class="footer">
              <div class="footer-logo">GATO-INTERNATIONAL B.V.</div>
              <p>Deze offerte aanvraag is verzonden via <a href="https://gato-international.com">gato-international.com</a></p>
              <p style="margin-top: 16px;">© ${new Date().getFullYear()} Gato-International B.V.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const { data: emailData, error } = await resend.emails.send({
      from: 'Gato-International <noreply@return.gato-international.com>',
      to: ['it@gatosports.com'],
      replyTo: data.email,
      subject: `🎯 Nieuwe Offerte Aanvraag - ${data.bedrijfsnaam}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({ success: true, id: emailData?.id });
  } catch (error) {
    console.error('Error processing offerte request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
