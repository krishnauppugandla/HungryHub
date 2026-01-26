const nodemailer = require("nodemailer");

// Create transporter — falls back to console logging if no SMTP config
const createTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return null;
};

const sendEmail = async (options) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.log("=== [EMAIL SERVICE] No SMTP config — email not sent ===");
    console.log("To:", options.to);
    console.log("Subject:", options.subject);
    console.log("Body:", options.text || options.html);
    console.log("=======================================================");
    return;
  }

  const mailOptions = {
    from: `HungryHub <${process.env.EMAIL_FROM || "noreply@hungryhub.com"}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

const sendPasswordResetEmail = async (to, token, name) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

  const subject = "Reset your HungryHub password";
  const text = `Hi ${name},\n\nYou requested a password reset. Click the link below to reset your password:\n\n${resetUrl}\n\nThis link expires in 10 minutes.\n\nIf you didn't request this, please ignore this email.\n\nThe HungryHub Team`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e53e3e;">HungryHub Password Reset</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>You requested a password reset. Click the button below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; background-color: #e53e3e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">
        Reset Password
      </a>
      <p>Or copy this link: <a href="${resetUrl}">${resetUrl}</a></p>
      <p><strong>This link expires in 10 minutes.</strong></p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>The HungryHub Team</p>
    </div>
  `;

  try {
    await sendEmail({ to, subject, text, html });
  } catch (err) {
    console.error("Failed to send password reset email:", err.message);
    // Don't crash the app — log and continue
  }
};

const sendOrderConfirmation = async (to, order) => {
  const subject = `Order Confirmed — HungryHub #${order._id}`;
  const itemsList = order.items
    .map((item) => `${item.name} x${item.quantity} — $${item.price.toFixed(2)}`)
    .join("\n");

  const text = `
Your order has been confirmed!

Order ID: ${order._id}
Status: ${order.status}

Items:
${itemsList}

Subtotal: $${order.subtotal.toFixed(2)}
Delivery Fee: $${order.deliveryFee.toFixed(2)}
${order.discount > 0 ? `Discount: -$${order.discount.toFixed(2)}\n` : ""}Total: $${order.totalAmount.toFixed(2)}

Estimated delivery: ${order.estimatedDeliveryTime} minutes

Thank you for ordering with HungryHub!
  `.trim();

  try {
    await sendEmail({ to, subject, text });
  } catch (err) {
    console.error("Failed to send order confirmation email:", err.message);
  }
};

module.exports = { sendPasswordResetEmail, sendOrderConfirmation };
