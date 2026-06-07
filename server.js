const path = require("path");
const express = require("express");
const { Resend } = require("resend");

const app = express();
const port = process.env.PORT || 3000;

const resendApiKey = process.env.RESEND_API_KEY;
const contactFrom = process.env.CONTACT_FROM || "Paolo Tozzo <contact@paolotozzo.dev>";
const contactTo = process.env.CONTACT_TO || "info@paolotozzo.dev";

const resend = resendApiKey ? new Resend(resendApiKey) : null;

app.use(express.json({ limit: "16kb" }));

const blockedPaths = new Set(["/server.js", "/package.json", "/package-lock.json"]);
app.use((req, res, next) => {
  if (blockedPaths.has(req.path)) return res.status(404).end();
  next();
});

app.use(express.static(path.join(__dirname), { extensions: ["html"] }));

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const clamp = (value, max) => String(value || "").trim().slice(0, max);

app.post("/api/contact", async (req, res) => {
  const { name, email, message, company } = req.body || {};

  if (company) {
    return res.status(200).json({ ok: true });
  }

  const cleanName = clamp(name, 120);
  const cleanEmail = clamp(email, 200);
  const cleanMessage = clamp(message, 5000);

  if (!cleanName || !isEmail(cleanEmail) || !cleanMessage) {
    return res.status(400).json({ ok: false, error: "Please provide a name, a valid email, and a message." });
  }

  if (!resend) {
    return res.status(500).json({ ok: false, error: "Email service is not configured." });
  }

  try {
    const { error } = await resend.emails.send({
      from: contactFrom,
      to: contactTo,
      replyTo: cleanEmail,
      subject: `New message from ${cleanName} via paolotozzo.dev`,
      text: `Name: ${cleanName}\nEmail: ${cleanEmail}\n\n${cleanMessage}`,
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(502).json({ ok: false, error: "Message could not be sent. Please email directly." });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Contact endpoint error:", err);
    return res.status(500).json({ ok: false, error: "Something went wrong. Please email directly." });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
