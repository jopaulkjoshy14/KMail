import Email from "../models/Email.js";
import { encrypt, decrypt } from "../utils/encryption.js";

// @desc    Send a new email
// @route   POST /api/emails/send
// @access  Private
export const sendEmail = async (req, res) => {
  const { recipients, subject, content } = req.body;

  if (!recipients || !content) {
    return res.status(400).json({ message: "Recipients and content required" });
  }

  try {
    const email = await Email.create({
      sender: req.user._id,
      recipients,
      subject: subject || "",
      content: encrypt(content),
    });

    res.status(201).json({ message: "Email sent successfully", emailId: email._id });
  } catch (error) {
    res.status(500).json({ message: "Failed to send email" });
  }
};

// @desc    Get inbox emails
// @route   GET /api/emails/inbox
// @access  Private
export const getInbox = async (req, res) => {
  try {
    const emails = await Email.find({ recipients: req.user.email })
      .populate("sender", "name email avatar")
      .sort({ createdAt: -1 });

    const decryptedEmails = emails.map((email) => ({
      ...email._doc,
      content: decrypt(email.content),
    }));

    res.json(decryptedEmails);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch inbox" });
  }
};

// @desc    Get sent emails
// @route   GET /api/emails/sent
// @access  Private
export const getSent = async (req, res) => {
  try {
    const emails = await Email.find({ sender: req.user._id })
      .populate("sender", "name email avatar")
      .sort({ createdAt: -1 });

    const decryptedEmails = emails.map((email) => ({
      ...email._doc,
      content: decrypt(email.content),
    }));

    res.json(decryptedEmails);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch sent emails" });
  }
};

// @desc    Clear all emails for the user
// @route   DELETE /api/emails/clear
// @access  Private
export const clearEmails = async (req, res) => {
  try {
    await Email.deleteMany({
      $or: [{ sender: req.user._id }, { recipients: req.user.email }],
    });

    res.json({ message: "All emails cleared" });
  } catch (error) {
    res.status(500).json({ message: "Failed to clear emails" });
  }
};
