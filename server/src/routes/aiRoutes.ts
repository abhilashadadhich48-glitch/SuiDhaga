import express from 'express';

const router = express.Router();

interface QuestionResponse {
  keywords: string[];
  response: string;
}

const KNOWLEDGE_BASE: QuestionResponse[] = [
  {
    keywords: ['lehenga', 'wedding', 'bridal'],
    response: `For a Bridal Lehenga, the choice of fabric and embroidery defines the fall and look:
1. **Raw Silk & Velvet:** Ideal for heavy embroidery (Zardozi, Dabka) and provides a structured, royal flare.
2. **Georgette & Net:** Best for lightweight, modern cascading layers and high volume.
3. **Styling Suggestion:** Combine a heavy velvet/silk skirt with a translucent sheer georgette dupatta to balance the weight.`
  },
  {
    keywords: ['blouse', 'neck', 'saree'],
    response: `Here are popular designer neck patterns trending this season:
1. **Queen Anne Neckline:** A vintage sweetheart shape that rises at the back of the neck.
2. **Reverse Sweetheart & Corset style:** Perfect for padded contemporary blouses.
3. **Keyhole Back with Tassels:** Adds an elegant focal point for heavy silk sarees.`
  },
  {
    keywords: ['measure', 'size', 'chest', 'sleeve', 'waist'],
    response: `To take accurate measurements:
1. **Chest:** Measure around the fullest part of your chest, keeping the tape horizontal.
2. **Sleeve Length:** Start from the shoulder tip down to the wrist bone (or desired length).
3. **Waist:** Measure around your natural waistline (just above the navel).
*Pro-Tip:* Keep one finger inside the tape measure to allow breathing/movement comfort.`
  },
  {
    keywords: ['sherwani', 'kurta', 'suit', 'men'],
    response: `For Men's Sherwanis & kurtas:
1. **Fabric:** Banarasi Silk or Khadi Cotton for traditional drape, Velvet/Suede for evening winter receptions.
2. **Fit:** Ensure the shoulder pads end exactly at your natural shoulder bone.
3. **Length:** A classic Sherwani should fall just below the knee, paired with slim-fit churidars.`
  },
  {
    keywords: ['price', 'cost', 'rate'],
    response: `Custom tailoring prices vary by design complexity:
- **Casual Kurtas/Blouses:** ₹800 - ₹2,500
- **Designer Suits/Blazers:** ₹5,000 - ₹12,000
- **Bridal wear/Lehengas:** ₹15,000 - ₹50,000+
You can view active rates under each tailor's profile page.`
  }
];

const callGeminiAPI = async (userPrompt: string, apiKey: string): Promise<string | null> => {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const systemInstruction = "You are SuiDhaga AI Stylist & Fashion Advisor. Provide helpful, stylish, elegant advice on Indian bespoke attire, fabrics, necklines, tailoring measurements, and outfit customization. Keep responses polite, concise, and structured with bold highlights.";
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemInstruction}\n\nUser Query: ${userPrompt}` }]
          }
        ]
      })
    });

    if (!response.ok) {
      console.warn('Gemini API request non-200 status:', response.status);
      return null;
    }

    const data: any = await response.json();
    const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return replyText || null;
  } catch (err) {
    console.warn('Failed to contact Gemini API:', err);
    return null;
  }
};

const callOpenAIAPI = async (userPrompt: string, apiKey: string): Promise<string | null> => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are SuiDhaga AI Stylist & Fashion Advisor for bespoke tailoring.' },
          { role: 'user', content: userPrompt }
        ]
      })
    });

    if (!response.ok) return null;
    const data: any = await response.json();
    return data?.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.warn('Failed to contact OpenAI API:', err);
    return null;
  }
};

router.post('/chat', async (req, res) => {
  try {
    const message = req.body.message || req.body.prompt || req.body.text;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ message: 'Message is required.' });
    }

    const trimmedMsg = message.trim();
    let reply: string | null = null;

    // Check environment variables for Gemini or OpenAI keys
    const geminiKey = process.env.GEMINI_API_KEY;
    const openAIKey = process.env.OPENAI_API_KEY;

    if (geminiKey) {
      reply = await callGeminiAPI(trimmedMsg, geminiKey);
    } else if (openAIKey) {
      reply = await callOpenAIAPI(trimmedMsg, openAIKey);
    }

    // Fallback to Knowledge Base matching if no API key or external call fails
    if (!reply) {
      const lowerMsg = trimmedMsg.toLowerCase();
      for (const item of KNOWLEDGE_BASE) {
        if (item.keywords.some(keyword => lowerMsg.includes(keyword))) {
          reply = item.response;
          break;
        }
      }
    }

    if (!reply) {
      reply = `Welcome to **SuiDhaga AI Fashion Advisor**! 🧵
I can help you with:
- Fabric recommendations (Lehengas, Sherwanis, Suits)
- Stitching & measurement guides
- Neck and sleeve pattern ideas
- Price ranges and estimation queries

Could you specify what attire or service you are interested in today?`;
    }

    return res.status(200).json({
      reply,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('AI chat error:', error);
    return res.status(500).json({ message: 'Failed to process AI request.' });
  }
});

export default router;
