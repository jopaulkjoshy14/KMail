import Email from "../models/Email.js";
import { encrypt, decrypt } from "../utils/encryption.js";

// Send email
export const sendEmail = async (req, res) => {
  let { to, subject, content } = req.body;

  if (!to || !content)
    return res.status(400).json({ message: "Recipients and content required" });

  const recipients = to.split(",").map((r) => r.trim()).filter(Boolean);
  if (recipients.length === 0)
    return res.status(400).json({ message: "Recipients cannot be empty" });

  try {
    const email = await Email.create({
      sender: req.user._id,
      recipients,
      subject: subject || "",
      content: encrypt(content),
    });

    res.status(201).json({ message: "Email sent successfully", emailId: email._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send email" });
  }
};

// Inbox
export const getInbox = async (req, res) => {
  try {
    const emails = await Email.find({ recipients: req.user.email })
      .populate("sender", "name email avatar")
      .sort({ createdAt: -1 });

    const decrypted = emails.map((e) => ({ ...e._doc, content: decrypt(e.content) }));
    res.json(decrypted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch inbox" });
  }
};

// Sent
export const getSent = async (req, res) => {
  try {
    const emails = await Email.find({ sender: req.user._id })
      .populate("sender", "name email avatar")
      .sort({ createdAt: -1 });

    const decrypted = emails.map((e) => ({ ...e._doc, content: decrypt(e.content) }));
    res.json(decrypted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch sent emails" });
  }
};

// Clear user emails
export const clearEmails = async (req, res) => {
  try {
    await Email.deleteMany({
      $or: [{ sender: req.user._id }, { recipients: req.user.email }],
    });

    res.json({ message: "All emails cleared" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to clear emails" });
  }
};
