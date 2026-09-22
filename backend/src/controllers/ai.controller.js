const Groq = require('groq-sdk');

const Medicine = require('../models/medicine.model');
const Document = require('../models/document.model');
const Policy = require('../models/policy.model');
const Bill = require('../models/bill.model');
const PantryItem = require('../models/pantryItem.model');
const Appliance = require('../models/appliance.model');
const FamilyEvent = require('../models/familyEvent.model');
const FamilyTask = require('../models/familyTask.model');
const Birthday = require('../models/birthday.model');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Builds a compact text summary of the user's real data across every module,
// so the AI answers from what's actually in their account — not hallucinated data.
async function buildContext(userId) {
  const [medicines, documents, policies, bills, pantryItems, appliances, events, tasks, birthdays] = await Promise.all([
    Medicine.find({ userId }),
    Document.find({ userId }),
    Policy.find({ userId }),
    Bill.find({ userId }),
    PantryItem.find({ userId }),
    Appliance.find({ userId }),
    FamilyEvent.find({ userId }),
    FamilyTask.find({ userId, done: false }),
    Birthday.find({ userId })
  ]);

  const today = new Date();
  const daysBetween = (d) => Math.ceil((new Date(d).getTime() - today.getTime()) / 86400000);

  const lines = [];

  lines.push('=== MEDICINES (MediTrack) ===');
  if (medicines.length === 0) lines.push('None added yet.');
  medicines.forEach(m => lines.push(`- ${m.name} for ${m.memberName}: ${m.remaining}/${m.total} left, expires ${new Date(m.expiry).toDateString()} (${daysBetween(m.expiry)} days away)`));

  lines.push('\n=== DOCUMENTS (DocuVault) ===');
  if (documents.length === 0) lines.push('None added yet.');
  documents.forEach(d => lines.push(`- ${d.name} (${d.category}) for ${d.memberName}${d.expiry ? `, expires ${new Date(d.expiry).toDateString()} (${daysBetween(d.expiry)} days away)` : ', no expiry'}`));

  lines.push('\n=== INSURANCE POLICIES (PolicyWatch) ===');
  if (policies.length === 0) lines.push('None added yet.');
  policies.forEach(p => lines.push(`- ${p.name} (${p.type}) for ${p.memberName}: premium ₹${p.premium}/yr, renews ${new Date(p.renewalDate).toDateString()} (${daysBetween(p.renewalDate)} days away)`));

  lines.push('\n=== BILLS (UtilityDesk) ===');
  if (bills.length === 0) lines.push('None added yet.');
  bills.forEach(b => lines.push(`- ${b.name} (${b.category}): ₹${b.amount}, due ${new Date(b.dueDate).toDateString()}, ${b.paid ? 'PAID' : 'UNPAID'}`));

  lines.push('\n=== PANTRY / GROCERIES (PantryIQ) ===');
  if (pantryItems.length === 0) lines.push('None added yet.');
  pantryItems.forEach(i => lines.push(`- ${i.name} (${i.category}): ${i.quantity}/${i.maxQty} ${i.unit}, expires ${new Date(i.expiry).toDateString()}`));

  lines.push('\n=== APPLIANCES (HomeCare) ===');
  if (appliances.length === 0) lines.push('None added yet.');
  appliances.forEach(a => lines.push(`- ${a.name} (${a.category}): warranty until ${new Date(a.warrantyExpiry).toDateString()}${a.nextService ? `, next service ${new Date(a.nextService).toDateString()}` : ''}`));

  lines.push('\n=== UPCOMING FAMILY EVENTS (FamilyPulse) ===');
  if (events.length === 0) lines.push('None added yet.');
  events.forEach(e => lines.push(`- ${e.title} on ${new Date(e.date).toDateString()}${e.memberName ? ` (${e.memberName})` : ''}`));

  lines.push('\n=== PENDING TASKS (FamilyPulse) ===');
  if (tasks.length === 0) lines.push('None pending.');
  tasks.forEach(t => lines.push(`- ${t.text}, due ${new Date(t.due).toDateString()}, priority: ${t.priority}${t.memberName ? `, assigned to ${t.memberName}` : ''}`));

  lines.push('\n=== BIRTHDAYS (FamilyPulse) ===');
  if (birthdays.length === 0) lines.push('None added yet.');
  birthdays.forEach(b => lines.push(`- ${b.name}${b.relation ? ` (${b.relation})` : ''}: ${new Date(b.date).toDateString()}`));

  return lines.join('\n');
}

const chat = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'A message is required.' });
    }

    const context = await buildContext(req.userId);

    const systemPrompt = `You are the ExpiryIQ AI Assistant — a helpful family life assistant for an Indian household. You answer questions using ONLY the real data below, which comes from the user's actual ExpiryIQ account. Today's date is ${new Date().toDateString()}.

If asked something the data doesn't cover, say so honestly rather than making something up. Keep answers concise, practical, and warm — like a helpful family member, not a generic chatbot. Use bullet points for lists. You can use simple markdown (**bold**) for emphasis.

${context}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(Array.isArray(history) ? history.slice(-6) : []), // last few turns for conversational context, capped to keep prompt small
      { role: 'user', content: message }
    ];

    const response = await groq.chat.completions.create({
      model: 'openai/gpt-oss-20b',
      messages,
      temperature: 0.4
    });

    const reply = response.choices[0].message.content;

    return res.json({ reply });

  } catch (error) {
    console.error('AI chat error:', error);
    return res.status(500).json({ message: 'The AI assistant is having trouble responding right now. Please try again.' });
  }
};

module.exports = { chat };
