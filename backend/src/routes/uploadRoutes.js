import express from 'express';
import upload from '../middleware/upload.js';
import { protect } from '../middleware/authMiddleware.js';
import Tesseract from 'tesseract.js';

const router = express.Router();

router.post('/', protect, upload.single('file'), (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }
  res.send(`/${req.file.path.replace(/\\/g, '/')}`);
});

router.post('/scan', protect, upload.single('file'), async (req, res) => {
  if (!req.file) {
    res.status(400);
    return res.json({ success: false, message: 'No image uploaded' });
  }

  try {
    const { data: { text } } = await Tesseract.recognize(req.file.path, 'eng', {
      logger: (m) => console.log(m)
    });

    console.log("OCR Text Extracted:", text);

    // Basic extraction logic
    let amount = 0;
    let date = new Date().toISOString().slice(0, 10);
    let title = "Scanned Receipt";

    // Extract amount: looks for $ or Rs or INR followed by numbers, or just typical receipt totals
    const amountRegex = /(?:total|amount|sum|rs\.?|inr|\$)\s*:?\s*([\d,]+(?:\.\d{2})?)/i;
    const amountMatch = text.match(amountRegex);
    if (amountMatch && amountMatch[1]) {
      amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    } else {
      // fallback: find the largest number with decimials
      const allNumbers = text.match(/\b\d+\.\d{2}\b/g);
      if (allNumbers && allNumbers.length > 0) {
        amount = Math.max(...allNumbers.map(n => parseFloat(n)));
      }
    }

    // Extract date (DD/MM/YYYY or DD-MM-YYYY or YYYY-MM-DD)
    const dateRegex = /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/;
    const dateMatch = text.match(dateRegex);
    if (dateMatch) {
      // this is highly simplified, parsing dates from strings requires a robust parser generally,
      // but we return the raw match or keep today's date
      const dSTR = dateMatch[1].replace(/\//g, "-");
      // attempting basic JS date parse
      const parsedD = new Date(dSTR);
      if(!isNaN(parsedD.getTime())) {
          date = parsedD.toISOString().slice(0, 10);
      }
    }

    // Try to extract merchant (usually first non-empty line)
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 3 && !l.match(/^\d/));
    if (lines.length > 0) {
      title = lines[0].substring(0, 30); // limit to 30 chars
    }

    res.json({
      success: true,
      data: {
        text,
        amount,
        date,
        title,
        notes: "Auto-scanned receipt"
      }
    });

  } catch (error) {
    console.error("OCR Error:", error);
    res.status(500).json({ success: false, message: "Failed to scan receipt" });
  }
});

export default router;
