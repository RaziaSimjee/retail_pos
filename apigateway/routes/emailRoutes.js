// routes/emailRoutes.js
import express from "express";
import nodemailer from "nodemailer";
import axios from "axios";
import fs from "fs";
import path from "path";

const router = express.Router();

router.post("/send-receipt-email", async (req, res) => {
  const { saleId, customerEmail } = req.body;

  if (!saleId || !customerEmail) {
    return res.status(400).json({ message: "saleId and customerEmail are required." });
  }

  try {
    // 1️⃣ Fetch receipt from sale service
    const receiptResponse = await axios.get(`http://localhost:3000/saleService/sales/${saleId}/receipt`, {
      responseType: "arraybuffer", // important to get binary PDF
    });

    // 2️⃣ Write PDF temporarily
    const tempPath = path.join(__dirname, "../temp", `${saleId}.pdf`);
    fs.mkdirSync(path.dirname(tempPath), { recursive: true }); // ensure folder exists
    fs.writeFileSync(tempPath, Buffer.from(receiptResponse.data), "binary");

    // 3️⃣ Configure Nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // 4️⃣ Send email
    await transporter.sendMail({
      from: '"Your Store" <no-reply@yourstore.com>',
      to: customerEmail,
      subject: "Your Purchase Receipt",
      text: "Thank you for your purchase! Please find your receipt attached.",
      attachments: [
        {
          filename: `${saleId}.pdf`,
          path: tempPath,
        },
      ],
    });

    // 5️⃣ Delete temp PDF after sending
    fs.unlinkSync(tempPath);

    res.json({ message: "Receipt sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send receipt", error: err.message });
  }
});

export default router;
