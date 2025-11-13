import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

// Define a type interface for the expected error structure from SendGrid
interface SendGridError {
  response?: {
    body?: string | object;
  };
}

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    const pdfFile = formData.get("pdfFile") as File;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const hospitalName = formData.get("hospitalName") as string;
    const recipientEmail = formData.get("recipientEmail") as string; 

    if (!pdfFile || !recipientEmail) {
      return NextResponse.json({ success: false, error: "Missing PDF file or recipient email address." }, { status: 400 });
    }

    const arrayBuffer = await pdfFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

    // Define the HTML content
    const htmlContent = `
      <p>Hello ${firstName} ${lastName},</p>
      <p>Congratulations! Here is your training certificate from ${hospitalName}.</p>
      <p>Best regards,<br/>The SSI Innovations Team</p>
      <br>
      <small>This is a system-generated email. Please do not reply.</small>
    `;
    
    // Define the plain text content (clean of HTML tags)
    const textContent = `
Hello ${firstName} ${lastName},

Congratulations! Here is your training certificate from ${hospitalName}.

Best regards,
The SSI Innovations Team

---
This is a system-generated email. Please do not reply.
    `.trim();

    const msg = {
      to: recipientEmail, 
      from: "puneetshukla041@gmail.com", // ⚠️ Highly recommend replacing this with a verified domain email (e.g., 'certs@ssinnovations.org')
      subject: `Your SSI Certificate for ${firstName} ${lastName}`,
      html: htmlContent, // HTML version
      text: textContent, // ✅ Plain text version (IMPROVES DELIVERABILITY)
      attachments: [
        {
          content: buffer.toString("base64"),
          filename: "certificate.pdf",
          type: "application/pdf",
          disposition: "attachment",
        },
      ],
    };

    await sgMail.send(msg);

    return NextResponse.json({ success: true, message: `Email sent successfully to ${recipientEmail}!` });
  } catch (error) { 
    const sgError = error as SendGridError;
    
    const errorMessage = 
      sgError.response && sgError.response.body 
        ? sgError.response.body 
        : (error instanceof Error ? error.message : "Failed to send email");

    console.error("Error sending email:", sgError.response?.body || error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: `Server failed to send email. Details: ${JSON.stringify(errorMessage)}`
      },
      { status: 500 }
    );
  }
}
