const express = require('express');
const router = express.Router();
require('dotenv').config();

// POST /api/ai/analyze - Analyze complaint text using Gemini AI with smart heuristic fallback
router.post('/analyze', async (req, res) => {
  const { title, description } = req.body;

  if (!description || !description.trim()) {
    return res.status(400).json({ success: false, message: 'Description text is required for AI analysis.' });
  }

  const textToAnalyze = `${title ? title + '. ' : ''}${description}`;
  const apiKey = process.env.GEMINI_API_KEY;

  // Try calling Google Gemini API if API key is provided and not a placeholder
  if (apiKey && apiKey !== 'your_gemini_api_key_here' && apiKey.trim() !== '') {
    try {
      const promptText = `You are an AI assistant for a College Complaint Management System.
Analyze the following student complaint text:
"${textToAnalyze}"

Respond STRICTLY with a raw JSON object (no markdown formatting, no code blocks) containing:
{
  "category": "Classroom" | "Laboratory" | "Hostel" | "Wi-Fi / Internet" | "Infrastructure" | "Transportation" | "Cleanliness" | "Electricity" | "Water Supply" | "Library" | "Security" | "Other",
  "priority": "Low" | "Medium" | "High" | "Critical",
  "summary": "Concise 1-sentence summary of the issue"
}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const cleanJsonStr = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
          const parsed = JSON.parse(cleanJsonStr);
          return res.json({
            success: true,
            source: 'Gemini AI 2.5 Flash',
            category: parsed.category || 'Other',
            priority: parsed.priority || 'Medium',
            summary: parsed.summary || 'Summary unavailable.'
          });
        } catch (e) {
          // Parse fallback
        }
      }
    } catch (err) {
      console.warn('Gemini API request failed, switching to NLP heuristic fallback:', err.message);
    }
  }

  // Heuristic Smart Fallback if Gemini key is missing or API call fails
  const lower = textToAnalyze.toLowerCase();
  let category = 'Other';
  let priority = 'Medium';

  if (lower.includes('wifi') || lower.includes('wi-fi') || lower.includes('internet') || lower.includes('router') || lower.includes('network') || lower.includes('signal')) {
    category = 'Wi-Fi / Internet';
    priority = lower.includes('exam') || lower.includes('lab') ? 'High' : 'Medium';
  } else if (lower.includes('lab') || lower.includes('computer') || lower.includes('microscope') || lower.includes('experiment')) {
    category = 'Laboratory';
    priority = 'High';
  } else if (lower.includes('hostel') || lower.includes('room') || lower.includes('mess') || lower.includes('bed')) {
    category = 'Hostel';
  } else if (lower.includes('water') || lower.includes('leak') || lower.includes('pipe') || lower.includes('tap') || lower.includes('flush')) {
    category = 'Water Supply';
    priority = lower.includes('flood') || lower.includes('leak') ? 'Critical' : 'High';
  } else if (lower.includes('fan') || lower.includes('light') || lower.includes('ac') || lower.includes('switch') || lower.includes('power') || lower.includes('electricity') || lower.includes('wire')) {
    category = 'Electricity';
    priority = lower.includes('spark') || lower.includes('shock') ? 'Critical' : 'Medium';
  } else if (lower.includes('trash') || lower.includes('garbage') || lower.includes('clean') || lower.includes('smell') || lower.includes('bin') || lower.includes('dirty')) {
    category = 'Cleanliness';
    priority = 'Low';
  } else if (lower.includes('bus') || lower.includes('transport') || lower.includes('driver') || lower.includes('parking')) {
    category = 'Transportation';
  } else if (lower.includes('class') || lower.includes('bench') || lower.includes('board') || lower.includes('projector') || lower.includes('chair')) {
    category = 'Classroom';
  } else if (lower.includes('library') || lower.includes('book')) {
    category = 'Library';
  } else if (lower.includes('gate') || lower.includes('guard') || lower.includes('security') || lower.includes('theft') || lower.includes('lost')) {
    category = 'Security';
    priority = 'High';
  }

  // Generate 1-sentence summary
  const words = description.split(' ');
  const summary = words.length > 15 ? words.slice(0, 15).join(' ') + '...' : description;

  return res.json({
    success: true,
    source: 'Smart Heuristic Analyzer',
    category,
    priority,
    summary: `${title ? title + ': ' : ''}${summary}`
  });
});

module.exports = router;
