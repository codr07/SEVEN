// @ts-nocheck — This file runs in Supabase Deno Edge, not Node. Ignore TS/Node module errors.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import nodemailer from "npm:nodemailer@6.9.10"
import { PDFDocument, rgb, StandardFonts } from "npm:pdf-lib@1.17.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  type: 'purchase_confirmation' | 'course_completion';
  email: string;
  name: string;
  course_name?: string;
  purpose?: string;
  amount?: string;
  transaction_id?: string;
  certificate_url?: string;
  has_certificate?: boolean;
  origin?: string;
}

// Helper function to generate a beautifully styled PDF invoice using pdf-lib
async function generateInvoicePdf(payload: any, name: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([600, 800])
  const { width, height } = page.getSize()

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  // Header Banner
  page.drawRectangle({
    x: 0,
    y: height - 120,
    width: width,
    height: 120,
    color: rgb(0.043, 0.051, 0.086) // Dark branding background
  })

  page.drawText("5EVEN INSTITUTION", {
    x: 40,
    y: height - 60,
    size: 22,
    font: fontBold,
    color: rgb(1, 1, 1)
  })

  page.drawText("OFFICIAL INVOICE & ACADEMIC RECEIPT", {
    x: 40,
    y: height - 85,
    size: 10,
    font: fontRegular,
    color: rgb(0.54, 0.36, 0.96) // Accent purple
  })

  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  // Date and Receipt ID Details
  page.drawText("DATE ISSUED:", { x: 420, y: height - 55, size: 8, font: fontBold, color: rgb(0.5, 0.55, 0.65) })
  page.drawText(dateStr, { x: 420, y: height - 68, size: 9, font: fontRegular, color: rgb(1, 1, 1) })

  page.drawText("RECEIPT ID:", { x: 420, y: height - 88, size: 8, font: fontBold, color: rgb(0.5, 0.55, 0.65) })
  page.drawText(payload.transaction_id || "N/A", { x: 420, y: height - 101, size: 9, font: fontRegular, color: rgb(1, 1, 1) })

  // Billing Details
  page.drawText("BILLED TO:", { x: 40, y: height - 180, size: 9, font: fontBold, color: rgb(0.4, 0.45, 0.55) })
  page.drawText(name, { x: 40, y: height - 200, size: 14, font: fontBold, color: rgb(0.043, 0.051, 0.086) })
  page.drawText(payload.email || "N/A", { x: 40, y: height - 215, size: 9, font: fontRegular, color: rgb(0.4, 0.45, 0.55) })

  // Divider
  page.drawLine({
    start: { x: 40, y: height - 250 },
    end: { x: width - 40, y: height - 250 },
    thickness: 1,
    color: rgb(0.9, 0.9, 0.9)
  })

  // Table Headers
  page.drawText("ITEM DESCRIPTION", { x: 40, y: height - 280, size: 9, font: fontBold, color: rgb(0.4, 0.45, 0.55) })
  page.drawText("TOTAL AMOUNT PAID", { x: 430, y: height - 280, size: 9, font: fontBold, color: rgb(0.4, 0.45, 0.55) })

  // Divider
  page.drawLine({
    start: { x: 40, y: height - 295 },
    end: { x: width - 40, y: height - 295 },
    thickness: 1,
    color: rgb(0.9, 0.9, 0.9)
  })

  // Item Details
  page.drawText(payload.purpose || "React Course Admission", { x: 40, y: height - 325, size: 11, font: fontBold, color: rgb(0.04, 0.05, 0.08) })
  page.drawText("Verified Academic Course Admission & Materials", { x: 40, y: height - 340, size: 8, font: fontRegular, color: rgb(0.4, 0.45, 0.55) })

  // Standardize the currency string to prevent encoding glitches in native PDF viewers
  const cleanPdfAmount = (payload.amount || "INR 499").replace(/₹/g, "INR ")
  page.drawText(cleanPdfAmount, { x: 430, y: height - 325, size: 11, font: fontBold, color: rgb(0.04, 0.05, 0.08) })

  // Divider
  page.drawLine({
    start: { x: 40, y: height - 375 },
    end: { x: width - 40, y: height - 375 },
    thickness: 1,
    color: rgb(0.9, 0.9, 0.9)
  })

  // Grand Total Summary Box
  page.drawText("TOTAL AMOUNT PAID:", { x: 280, y: height - 410, size: 10, font: fontBold, color: rgb(0.4, 0.45, 0.55) })
  page.drawText(cleanPdfAmount, { x: 430, y: height - 410, size: 13, font: fontBold, color: rgb(0.54, 0.36, 0.96) })

  // Paid Verified Stamp
  page.drawRectangle({
    x: 40,
    y: height - 440,
    width: 110,
    height: 30,
    color: rgb(0.9, 0.97, 0.92),
    borderColor: rgb(0.18, 0.55, 0.28),
    borderWidth: 1
  })
  page.drawText("PAID & VERIFIED", { x: 50, y: height - 429, size: 8, font: fontBold, color: rgb(0.18, 0.55, 0.28) })

  // Footer Disclaimers
  page.drawText("Thank you for choosing 5EVEN. Advance your reality.", {
    x: 40,
    y: 80,
    size: 9,
    font: fontRegular,
    color: rgb(0.4, 0.45, 0.55)
  })

  page.drawText("This receipt has been cryptographically signed and stored on the 5EVEN Ledger.", {
    x: 40,
    y: 65,
    size: 7,
    font: fontRegular,
    color: rgb(0.6, 0.65, 0.75)
  })

  return await pdfDoc.save()
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload: EmailRequest = await req.json()
    const { type, email, name } = payload

    if (payload.amount) {
      payload.amount = payload.amount.replace(/₹/g, "&#8377;");
    }

    const siteUrl = payload.origin || "https://5even.netlify.app"
    const senderEmail = "institution5even@gmail.com"
    const ccEmail = "ritamroy.espoz@gmail.com"
    const bccEmail = "sahasankha.espoz@gmail.com"

    let subject = ""
    let htmlContent = ""

    // Sleek premium styling variables
    const primaryColor = "#A855F7" // Vibrant purple
    const accentColor = "#EC4899"  // Pink accent
    const backgroundColor = "#050505"
    const cardColor = "#0f0f11"
    const borderColor = "rgba(255,255,255,0.08)"
    const textPrimary = "#ffffff"
    const textSecondary = "#a0a0a5"

    // Dynamic HTML Builder using fully inlined styles for flawless email rendering and high deliverability
    const buildEmailHtml = ({
      subtitle,
      title,
      bodyHtml,
      buttonsHtml
    }: {
      subtitle: string;
      title: string;
      bodyHtml: string;
      buttonsHtml: string;
    }) => {
      return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #030408; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #f8fafc;">
    <div style="background-color: #030408; background-image: linear-gradient(145deg, #05070f 0%, #010204 100%); padding: 40px 20px; min-height: 100vh;">
        <div style="max-width: 600px; margin: 0 auto;">
            <!-- Liquid Glass Container -->
            <div style="background-color: #0b0d16; border: 1px solid #3c1e78; border-radius: 20px; padding: 48px 40px; text-align: center; box-shadow: 0 0 40px rgba(139, 92, 246, 0.1), inset 0 0 20px rgba(248, 250, 252, 0.02);">
                
                <!-- Logo -->
                <div style="font-size: 28px; font-weight: 900; font-style: italic; letter-spacing: -1.5px; margin-bottom: 30px; color: #f8fafc;">
                    <span style="color: #8b5cf6;">5</span>EVEN Institution
                </div>

                <!-- Content -->
                <span style="font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 4px; color: #8b5cf6; margin-bottom: 24px; display: block;">
                  ${subtitle}
                </span>
                <h1 style="font-size: 32px; font-weight: 900; letter-spacing: -1px; margin: 0 0 16px 0; color: #f8fafc; line-height: 1.2;">
                  ${title}
                </h1>
                
                <p style="font-size: 15px; line-height: 1.6; color: #94a3b8; margin: 0 0 32px 0; font-weight: 500;">
                  ${bodyHtml}
                </p>

                <!-- Action -->
                <div style="text-align: center; margin-top: 32px;">
                  ${buttonsHtml}
                </div>
                
            </div>

            <!-- Footer -->
            <div style="margin-top: 40px; text-align: center;">
                <p style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 3px; color: #64748b; margin: 0;">
                  &copy; ${new Date().getFullYear()} 5EVEN Institution<br/><br/>Advance Your Reality
                </p>
            </div>
        </div>
    </div>
</body>
</html>`;
    }

    let textContent = ""
    let attachments: any[] | undefined = undefined

    if (type === 'purchase_confirmation') {
      subject = `[Verified] 5EVEN Purchase Confirmation - ${payload.purpose || 'Product'}`
      
      const bodyHtml = `Congratulations, <span style="color: #f8fafc; font-weight: 700;">${name}</span>!<br><br>Your payment for <span style="color: #f8fafc; font-weight: 700;">${payload.purpose || 'your course'}</span> was processed successfully. We are excited to have you join our academy.<br><br>
        <div style="background-color: #06070d; border: 1px solid #1e2030; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: left; font-size: 13px; line-height: 1.6;">
          <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #8b5cf6; margin-bottom: 12px; letter-spacing: 1px;">Transaction Record</div>
          <div style="color: #94a3b8; margin-bottom: 6px;"><strong>Course/Track:</strong> <span style="color: #f8fafc;">${payload.purpose}</span></div>
          <div style="color: #94a3b8; margin-bottom: 6px;"><strong>Amount Paid:</strong> <span style="color: #8b5cf6; font-weight: 700;">${payload.amount}</span></div>
          <div style="color: #94a3b8;"><strong>Transaction ID:</strong> <code style="font-family: monospace; font-size: 12px; color: #a78bfa;">${payload.transaction_id}</code></div>
        </div>`

      const buttonsHtml = `<a href="${siteUrl}/student-zone" style="display: inline-block; background-color: #8b5cf6; color: #f8fafc; text-decoration: none; padding: 16px 36px; border-radius: 20px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; border: 1px solid rgba(139, 92, 246, 0.8); box-shadow: 0 10px 25px -5px rgba(139, 92, 246, 0.4);">Dashboard</a>`
      
      htmlContent = buildEmailHtml({
        subtitle: "Milestone Unlocked",
        title: "Purchase Successful",
        bodyHtml,
        buttonsHtml
      })

      textContent = `Hello ${name}, your transaction has been successfully processed!\n\nCourse/Track: ${payload.purpose}\nAmount Paid: ${payload.amount}\nTransaction ID: ${payload.transaction_id}\n\nPlease access your student dashboard at: ${siteUrl}/student-zone`

      try {
        console.log("Generating dynamic invoice PDF...")
        const pdfBytes = await generateInvoicePdf(payload, name)
        attachments = [
          {
            filename: `Invoice-5EVEN-${payload.transaction_id || 'receipt'}.pdf`,
            content: pdfBytes,
            contentType: 'application/pdf'
          }
        ]
        console.log("Invoice PDF successfully generated and attached.")
      } catch (pdfErr) {
        console.error("Error generating PDF invoice:", pdfErr)
      }

    } else if (type === 'course_completion') {
      const isCertified = payload.has_certificate === true || !!payload.certificate_url
      subject = isCertified 
        ? `🎓 Congratulations on Completing ${payload.course_name}! (Verified Track)`
        : `🎉 Congratulations on Completing ${payload.course_name}!`

      const bodyBase = `Congratulations, <span style="color: #f8fafc; font-weight: 700;">${name}</span>!<br><br>You have successfully reached the end of <span style="color: #f8fafc; font-weight: 700;">${payload.course_name}</span>. Your dedication to advancing your reality has paid off. We are incredibly proud to have you in the institution.<br><br>`

      if (isCertified) {
        const bodyHtml = bodyBase + `Your official, verified certificate of completion has been issued on the ledger and is fully available to view and download.`
        
        const buttonsHtml = `
          <div style="display: inline-block; margin: 0 auto; text-align: center;">
            <a href="${siteUrl}/student-zone" style="display: inline-block; background-color: #8b5cf6; color: #f8fafc; text-decoration: none; padding: 16px 36px; border-radius: 20px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; border: 1px solid rgba(139, 92, 246, 0.8); box-shadow: 0 10px 25px -5px rgba(139, 92, 246, 0.4); margin-right: 12px; margin-bottom: 12px; vertical-align: middle;">Dashboard</a>
            <a href="${payload.certificate_url}" style="display: inline-block; background-color: transparent; color: #8b5cf6; text-decoration: none; padding: 16px 36px; border-radius: 20px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; border: 1px solid #3c1e78; vertical-align: middle; margin-bottom: 12px;">View Certificate</a>
          </div>
        `

        htmlContent = buildEmailHtml({
          subtitle: "Milestone Achieved",
          title: "Course Completed",
          bodyHtml,
          buttonsHtml
        })

        textContent = `Hello ${name}, congratulations on completing "${payload.course_name}"!\n\nYour certificate is available at: ${payload.certificate_url}\n\nAccess your classroom dashboard at: ${siteUrl}/student-zone`

      } else {
        const bodyHtml = bodyBase + `
          <div style="background-color: rgba(139, 92, 246, 0.05); border: 1px solid rgba(139, 92, 246, 0.15); border-radius: 16px; padding: 24px; margin: 24px 0; text-align: center; font-size: 13px; line-height: 1.6;">
            <h3 style="font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #8b5cf6; margin-top: 0; margin-bottom: 8px;">Claim Your Official Certificate</h3>
            <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin: 0 0 16px 0;">Upgrade your track to unlock the final examination, verified certificate generator, and shareable ledger records for LinkedIn and portfolios.</p>
            <a href="${siteUrl}/payment?amount=499&purpose=${encodeURIComponent(`[Course] [Cert] ${payload.course_name}`)}" style="display: inline-block; padding: 10px 20px; background-color: #8b5cf6; border-radius: 10px; color: white; text-decoration: none; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">Upgrade Enrollment (&#8377;499)</a>
          </div>`

        const buttonsHtml = `<a href="${siteUrl}/student-zone" style="display: inline-block; background-color: #8b5cf6; color: #f8fafc; text-decoration: none; padding: 16px 36px; border-radius: 20px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; border: 1px solid rgba(139, 92, 246, 0.8); box-shadow: 0 10px 25px -5px rgba(139, 92, 246, 0.4);">Dashboard</a>`

        htmlContent = buildEmailHtml({
          subtitle: "Milestone Achieved",
          title: "Course Completed",
          bodyHtml,
          buttonsHtml
        })

      }
    }

    const smtpPassword = Deno.env.get("SMTP_PASSWORD")
    const resendApiKey = Deno.env.get("RESEND_API_KEY")

    if (smtpPassword) {
      console.log("Sending email via Gmail SMTP using Nodemailer...")
      const host = Deno.env.get("SMTP_HOST") || "smtp.gmail.com"
      const portStr = Deno.env.get("SMTP_PORT") || "465"
      const username = Deno.env.get("SMTP_USERNAME") || senderEmail

      // @ts-ignore: Nodemailer types inside Deno environment
      const transporter = nodemailer.createTransport({
        host: host,
        port: parseInt(portStr),
        secure: parseInt(portStr) === 465, // true for 465, false for 587
        auth: {
          user: username,
          pass: smtpPassword,
        },
      });

      // @ts-ignore: Nodemailer types inside Deno environment
      await transporter.sendMail({
        from: `"5EVEN Institution" <${username}>`,
        to: email,
        cc: ccEmail,
        bcc: bccEmail,
        subject: subject,
        text: textContent,
        html: htmlContent,
        attachments: attachments,
      });

      console.log("Email sent successfully via Gmail SMTP!");
      
      return new Response(
        JSON.stringify({ success: true, message: "Email sent successfully via SMTP!" }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    } else if (resendApiKey) {
      console.log("Sending email via Resend...")
      
      let fromEmail = senderEmail
      const isSandbox = senderEmail.endsWith('@gmail.com') || senderEmail.includes('resend.dev')
      
      if (isSandbox) {
        console.log("Using Resend sandbox fallback (onboarding@resend.dev) to enable free local testing.")
        fromEmail = "onboarding@resend.dev"
      }

      const payloadBody: any = {
        from: `5EVEN Institution <${fromEmail}>`,
        to: [email],
        subject,
        html: htmlContent
      }

      // In Resend free sandbox, CC and BCC are blocked unless they are verified.
      // We only include CC/BCC if we are using a verified custom domain.
      if (!isSandbox) {
        payloadBody.cc = [ccEmail]
        payloadBody.bcc = [bccEmail]
      } else {
        console.log("Omiting CC/BCC for sandbox compatibility.")
      }

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payloadBody)
      })

      const resData = await res.json()

      if (!res.ok) {
        throw new Error(`Resend delivery error: ${resData.message || JSON.stringify(resData)}`)
      }

      return new Response(
        JSON.stringify({ success: true, message: "Email sent successfully via Resend!", data: resData }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    } else {
      console.warn("Neither SMTP_PASSWORD nor RESEND_API_KEY environment variable is set. Simulating email dispatch.")
      return new Response(
        JSON.stringify({ 
          success: true, 
          simulated: true, 
          message: "Email simulated successfully because no email secrets are configured.",
          payload: {
            from: senderEmail,
            to: email,
            cc: ccEmail,
            bcc: bccEmail,
            subject
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

  } catch (err: any) {
    console.error("Function error:", err)
    return new Response(
      JSON.stringify({ success: false, error: err.message || "An internal error occurred" }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
