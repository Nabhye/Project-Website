const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();
const db = admin.firestore();

/* Gmail Transport */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "YOUR_GMAIL@gmail.com",          // 🔴 replace
    pass: "YOUR_GMAIL_APP_PASSWORD"        // 🔴 replace
  }
});

/* Trigger when payment is added */
exports.sendPaymentReceipt = functions.firestore
  .document("payments/{paymentId}")
  .onCreate(async (snap) => {

    const data = snap.data();

    if (!data.email) return null;

    const mailOptions = {
      from: `"AdvocatBisht" <YOUR_GMAIL@gmail.com>`,
      to: data.email,
      subject: "Payment Received – Consultation Booking",
      html: `
        <h2>Payment Submitted</h2>
        <p>Dear ${data.name},</p>

        <p>We have received your payment details.</p>

        <ul>
          <li><b>Lawyer:</b> ${data.lawyerName}</li>
          <li><b>Amount:</b> ₹${data.amount}</li>
          <li><b>UTR:</b> ${data.utr}</li>
          <li><b>Status:</b> Pending Verification</li>
        </ul>

        <p>Your appointment will be confirmed after verification.</p>

        <br>
        <p>Regards,<br>AdvocatBisht Team</p>
      `
    };

    await transporter.sendMail(mailOptions);
    return null;
  });
  