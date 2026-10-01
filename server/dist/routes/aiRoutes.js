"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const KNOWLEDGE_BASE = [
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
router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ message: 'Message is required.' });
        }
        const lowerMsg = message.toLowerCase();
        let matchedResponse = '';
        for (const item of KNOWLEDGE_BASE) {
            if (item.keywords.some(keyword => lowerMsg.includes(keyword))) {
                matchedResponse = item.response;
                break;
            }
        }
        if (!matchedResponse) {
            matchedResponse = `Welcome to **SuiDhaga AI Fashion Advisor**! 🧵
I can help you with:
- Fabric recommendations (Lehengas, Sherwanis, Suits)
- Stitching & measurement guides
- Neck and sleeve pattern ideas
- Price ranges and estimation queries

Could you specify what attire or service you are interested in today?`;
        }
        return res.status(200).json({
            reply: matchedResponse,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('AI chat error:', error);
        return res.status(500).json({ message: 'Failed to process AI request.' });
    }
});
exports.default = router;
