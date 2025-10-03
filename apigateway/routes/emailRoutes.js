// routes/emailRoutes.js
import express from "express";
import nodemailer from "nodemailer";
import fetch from "node-fetch";

const router = express.Router();

router.post("/send-receipt-email", async (req, res) => {
  const { saleId, customerEmail } = req.body;

  try {
    // Fetch receipt from the external service
    const receiptUrl = `http://localhost:3000/saleService/sales/${saleId}/receipt`;
    const receiptResponse = await fetch(receiptUrl);

    if (!receiptResponse.ok) {
      return res.status(404).json({ message: "Receipt not found from sale service" });
    }

    const receiptBuffer = await receiptResponse.buffer();

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: '"Your Store" <no-reply@yourstore.com>',
      to: customerEmail,
      subject: "Your Purchase Receipt",
      text: "Thank you for your purchase! Please find your receipt attached.",
      attachments: [{ filename: `${saleId}.pdf`, content: receiptBuffer }],
    });

    res.json({ message: "Receipt sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send receipt" });
  }
});

export default router;
