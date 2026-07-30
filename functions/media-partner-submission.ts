export default async function(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { firstName, lastName, email, partnerTypes } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !partnerTypes || partnerTypes.length === 0) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get platform token from headers
    const platformToken = req.headers.get('x-platform-token');
    if (!platformToken) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Prepare email content
    const emailSubject = `New Media Partner Application: ${firstName} ${lastName}`;
    const emailContent = `
Media Partner Application Details:

Name: ${firstName} ${lastName}
Email: ${email}
Partner Type(s): ${partnerTypes.join(', ')}

Application Date: ${new Date().toISOString()}
`;

    // Send email using platform email API
    const emailResponse = await fetch('https://api.kliv.dev/v1/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${platformToken}`
      },
      body: JSON.stringify({
        to: 'info@unionmusicgroup.co.uk',
        subject: emailSubject,
        text: emailContent,
        fromName: 'Union Music Group',
        fromEmail: 'noreply@unionmusicgroup.co.uk'
      })
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error('Email send failed:', errorData);
      throw new Error('Failed to send email');
    }

    return Response.json({ 
      success: true, 
      message: 'Application submitted successfully' 
    }, { status: 200 });

  } catch (error) {
    console.error('Media partner submission error:', error);
    return Response.json({ 
      error: 'Failed to process application',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
