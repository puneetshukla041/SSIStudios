// send-certificate/route.ts

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
    const ccEmailsString = formData.get("ccEmail") as string; // 💡 NEW: Extract CC email string

    if (!pdfFile || !recipientEmail) {
      return NextResponse.json({ success: false, error: "Missing PDF file or recipient email address." }, { status: 400 });
    }

    const arrayBuffer = await pdfFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

    // Define the HTML content (UNCHANGED)
    const htmlContent = `
      <p>Hello ${firstName} ${lastName},</p>
      <p>Congratulations! Here is your training certificate from ${hospitalName}.</p>
      <p>Best regards,<br/>The SSI Innovations Team</p>
      <br>
      <small>This is a system-generated email. Please do not reply.</small>
    `;
    
    // Define the plain text content (UNCHANGED)
    const textContent = `
Hello ${firstName} ${lastName},

Congratulations! Here is your training certificate from ${hospitalName}.

Best regards,
The SSI Innovations Team

---
This is a system-generated email. Please do not reply.
    `.trim();
    
    // 💡 NEW: Process the comma-separated CC string into an array of SendGrid recipients
    const ccRecipients = ccEmailsString.split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0) // Filter out empty strings
        .map(email => ({ email })); 


    // 💡 CONDITIONAL CC SETUP
    // If we have valid recipients, create the CC object using the array format.
    const cc = ccRecipients.length > 0 ? { cc: ccRecipients } : {};


    const msg = {
      to: recipientEmail, 
      from: "puneetshukla041@gmail.com", 
      subject: `Your SSI Certificate for ${firstName} ${lastName}`,
      html: htmlContent, 
      text: textContent, 
      ...cc, // 💡 NEW: Spread the processed CC object here
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