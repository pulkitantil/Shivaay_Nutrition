const express = require('express');
const router = express.Router();
const db = require('../services/dbService');

// Check for OpenAI API
let openaiClient = null;
if (process.env.OPENAI_API_KEY) {
  try {
    const { OpenAI } = require('openai');
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    console.log('OpenAI API client loaded successfully.');
  } catch (err) {
    console.log('Could not load openai package. Local AI matching engine active.');
  }
}

// Store details for AI Context
const STORE_METADATA = {
  name: 'Shivaay Nutrition',
  address: '1st floor, Omaxe plaza, Omaxe City, Sonipat, Haryana 131027',
  phone: process.env.OWNER_PHONE || '+91 99999 88888',
  whatsapp: process.env.OWNER_WHATSAPP || '919999988888',
  timings: 'Monday - Saturday: 10:00 AM - 9:00 PM | Sunday: Closed',
  delivery: 'Free delivery inside Sonipat above ₹4,000. Express shipping across Haryana and India.',
  authenticity: '100% genuine products sourced directly from authorized brand importers. Every tub features scratch-sticker codes for verification.'
};

// Helper to search DuckDuckGo Lite (Free Web Search)
async function searchWeb(query) {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
      }
    });
    if (!response.ok) return [];

    const html = await response.text();
    const regex = /<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
    let match;
    const snippets = [];
    while ((match = regex.exec(html)) !== null && snippets.length < 4) {
      const text = match[1]
        .replace(/<[^>]*>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
      snippets.push(text);
    }
    return snippets;
  } catch (err) {
    console.error('Web Search Error:', err);
    return [];
  }
}

// Unified LLM Requester (supports Gemini and OpenAI)
async function askLLM(userPrompt, systemPrompt) {
  // 1. Try Gemini first if GEMINI_API_KEY is configured
  if (process.env.GEMINI_API_KEY) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\nUser Question: ${userPrompt}`
            }]
          }]
        })
      });
      if (response.ok) {
        const json = await response.json();
        if (json.candidates && json.candidates[0] && json.candidates[0].content && json.candidates[0].content.parts[0]) {
          return json.candidates[0].content.parts[0].text;
        }
      } else {
        console.error('Gemini API Error Status:', response.status);
      }
    } catch (err) {
      console.error('Gemini API Invocation Error:', err);
    }
  }

  // 2. Try OpenAI if OPENAI_API_KEY is configured
  if (openaiClient) {
    try {
      const response = await openaiClient.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 250,
        temperature: 0.7
      });
      return response.choices[0].message.content;
    } catch (err) {
      console.error('OpenAI API Invocation Error:', err);
    }
  }

  return null;
}

// ----------------------------------------------------
// LOCAL BILINGUAL MATCHING ENGINE (Fallback)
// ----------------------------------------------------
const handleLocalAIMatch = async (queryText) => {
  const query = queryText.toLowerCase().trim();
  const products = await db.products.find();

  // Helper: check search queries
  const includesAny = (words) => words.some(w => query.includes(w));

  // 1. Order status query
  if (includesAny(['order', 'status', 'track', 'ord-', 'delivery'])) {
    const orderIdMatch = query.match(/(ord-[a-z0-9]+)/i);
    if (orderIdMatch) {
      const orderId = orderIdMatch[1];
      const order = await db.orders.findById(orderId);
      if (order) {
        return `Order status found! Here are details for Order ID *${orderId}*:\n` +
          `• **Customer:** ${order.customerDetails.name}\n` +
          `• **Status:** ${order.status} 🚚\n` +
          `• **Total Amount:** ₹${order.amount}\n` +
          `• **Products:** ${order.products.map(p => `${p.name} (Qty ${p.quantity})`).join(', ')}\n` +
          `• **Address:** ${order.deliveryAddress || 'Showroom Pickup'}`;
      } else {
        return `Hmm, I couldn't find any order with ID *${orderId}*. Please check the order ID again.`;
      }
    } else {
      return `Sure, I can track your order status for you! Please provide your Order ID in the format \`ord-xxxxxxx\`.`;
    }
  }

  // 2. Specific product search / pricing / availability
  for (let product of products) {
    const prodNameWords = product.name.toLowerCase().split(' ');
    const brandName = product.brand.toLowerCase();
    
    // Check if user is asking about a specific item
    if (query.includes(brandName) || includesAny(prodNameWords.slice(0, 3))) {
      if (includesAny(['price', 'rate', 'rupay', 'kitna', 'cost', 'daam', 'price kya'])) {
        return `Yes, the price of **${product.name}** is **₹${product.price}**. Discount offer might apply! Let me know if you want to place a WhatsApp order for rapid delivery.`;
      }
      if (includesAny(['stock', 'available', 'hai kya', 'milga', 'millega', 'out of stock'])) {
        return `**${product.name}** is currently **${product.status}**. Price: ₹${product.price}. We can dispatch it today!`;
      }
    }
  }

  // 3. Category search (Whey, Gainers, Creatine, Preworkout)
  if (includesAny(['whey', 'protein', 'isolate', 'bcaa'])) {
    const wheyProds = products.filter(p => p.category.toLowerCase().includes('protein'));
    const prodList = wheyProds.map(p => `• **${p.name}** (₹${p.price}) - *${p.status}*`).join('\n');
    return `Here are some of our top Whey & Isolate Proteins in stock:\n\n${prodList}\n\nAll of our proteins are 100% authentic with scratch codes. Weight loss ke liye Isolate best hai, muscle building ke liye Whey Gold. Kya main aapke liye order initiate karoon?`;
  }

  if (includesAny(['creatine', 'monohydrate'])) {
    const creatineProds = products.filter(p => p.category.toLowerCase().includes('creatine'));
    const prodList = creatineProds.map(p => `• **${p.name}** (₹${p.price}) - *${p.status}*`).join('\n');
    return `Creatine monohydrate is excellent for explosive strength & muscle hydration! Here is our current list:\n\n${prodList}\n\nBest seller: Shivaay Micronized Creatine (₹1,199). Aapko kaunsa product order karna hai?`;
  }

  if (includesAny(['gainer', 'mass gainer', 'weight gain', 'mota', 'weight increase'])) {
    const gainers = products.filter(p => p.category.toLowerCase().includes('gainer'));
    const prodList = gainers.map(p => `• **${p.name}** (₹${p.price}) - *${p.status}*`).join('\n');
    return `Weight gain ke liye, high calorie Mass Gainers are perfect! Here is what we sell:\n\n${prodList}\n\nShivaay Hyper Mass Gainer (₹3,999) has 50g protein and 250g carbs per serving, making weight gain clean and fast.`;
  }

  if (includesAny(['pre-workout', 'preworkout', 'energy', 'pump', 'beast mode'])) {
    const preWorkouts = products.filter(p => p.category.toLowerCase().includes('workout'));
    const prodList = preWorkouts.map(p => `• **${p.name}** (₹${p.price}) - *${p.status}*`).join('\n');
    return `Pre-workouts give you crazy energy and massive muscle pump! Here is what we have:\n\n${prodList}\n\nOur Shivaay Beast Mode (₹2,299) is highly recommended for focus and stamina.`;
  }

  // 4. Price limits (under, cheap, cheap whey, under 2500)
  if (includesAny(['under', 'below', 'kam price', 'sasta', 'budget'])) {
    const priceLimitMatch = query.match(/(?:under|below|sasta|₹)\s*(\d+)/i) || query.match(/(\d+)\s*(?:se kam|under)/i);
    const limit = priceLimitMatch ? parseInt(priceLimitMatch[1]) : 3000;
    
    const cheapProds = products.filter(p => p.price <= limit);
    if (cheapProds.length > 0) {
      const prodList = cheapProds.slice(0, 5).map(p => `• **${p.name}** (₹${p.price}) [${p.category}]`).join('\n');
      return `Here are some excellent options under ₹${limit}:\n\n${prodList}\n\nAap isme se kya try karna chahenge? Just click WhatsApp to order.`;
    } else {
      return `We don't have whey proteins under ₹${limit} currently, but our Shivaay Micronized Creatine is ₹1,199, and daily Multivitamins are just ₹799! Let me know what fitness goal you have.`;
    }
  }

  // 5. General Fitness Guidance
  if (includesAny(['fat loss', 'weight loss', 'patla', 'lean'])) {
    return `Lean muscle and fat loss goals ke liye:
1. **Isolate Whey Protein** try karein (like Shivaay Whey Gold Isolate) which has 0g sugar and pure protein.
2. Fat burner use karein (Shivaay Shred-X Thermogenic at ₹1,999) to boost metabolism.
3. Showroom aakar Certified Coach se full diet chart free consult karein. 
Aap dynamic pre-order details click kar sakte hain!`;
  }

  if (includesAny(['beginner', 'first time', 'gym starting', 'starting'])) {
    return `If you are starting gym for the first time:
• Basic stack recommendation: **Shivaay Micronized Creatine** (for strength) + **Shivaay Whey Gold** (for muscle recovery).
• Healthy daily vitamins: **Shivaay Vita-Max Multivitamin** (₹799) for recovery.
Do not start with high calorie gainers unless you are very skinny (hardgainer). What is your current weight and height?`;
  }

  // 6. Store timings and location
  if (includesAny(['timing', 'hour', 'open', 'close', 'kab tak', 'sunday'])) {
    return `Shivaay Nutrition showroom timings:
• **Monday - Saturday:** 10:00 AM to 9:00 PM
• **Sunday:** Closed
Visit us in Omaxe City Sonipat for free tasting and trainer consultation! 🏋️`;
  }

  if (includesAny(['address', 'location', 'kahan', 'where', 'map', 'showroom'])) {
    return `Our showroom is located at:
**1st floor, Omaxe plaza, Omaxe City, Sonipat, Haryana 131027**
📍 Nearby Landmark: Located directly inside Omaxe Plaza Mall.
Aap map section use karke directions check kar sakte hain.`;
  }

  if (includesAny(['contact', 'phone', 'number', 'whatsapp', 'call'])) {
    return `You can reach our showroom dispatch desk at:
• **Phone:** ${STORE_METADATA.phone}
• **WhatsApp:** +${STORE_METADATA.whatsapp}
All WhatsApp orders placed before 5 PM are dispatched same-day inside Delhi/NCR! 🚀`;
  }

  if (includesAny(['authentic', 'genuine', 'original', 'nakli', 'fake'])) {
    return `Shivaay Nutrition strictly sells **100% Authentic Products**. 
• Every protein tub contains an authorized importer hologram sticker.
• Scratch verification codes are present on all containers.
• We offer a **200% Refund Guarantee** if you find any product to be unauthentic. We buy directly from brand partners.`;
  }

  // 7. Brand comparison / Brand Queries (like Muscleblaze vs Fuel One)
  if (includesAny(['vs', 'compare', 'difference', 'better', 'muscleblaze', 'fuelone', 'fuel one', 'mb ', 'gnc', 'nutrabay', 'muscle blaze'])) {
    return `At Shivaay Nutrition showroom, we specialize in premium certified imported brands (like Optimum Nutrition, Creapure, Labrada, Cellucor) and our own ultra-pure Shivaay range. 
While brands like MuscleBlaze and Fuel One are decent entry-level options, premium imports offer higher protein purity, superior amino profiles, and zero added fillers. 
We recommend **Optimum Nutrition Gold Standard** or **Shivaay Whey Gold Isolate** for maximum muscle recovery. What is your current target goal?`;
  }

  // 8. General Recommendation & "Which is good" queries
  if (includesAny(['good', 'best', 'recommend', 'suggest', 'take', 'buy', 'choose', 'supplement', 'kya khaun', 'kya khayein'])) {
    return `To recommend the best supplements for you, what is your fitness goal?
• **For Muscle Gain / Gym Recovery:** Shivaay Whey Gold Isolate (₹7,499) or ON Gold Standard (₹6,899).
• **For Explosive Power & Muscle Hydration:** Shivaay Micronized Creatine (₹1,199) or Creapure (₹1,699).
• **For Gaining Weight / Bulking:** Shivaay Hyper Mass Gainer (₹3,999).
• **For Fat Loss / Getting Lean:** Shivaay Shred-X Thermogenic (₹1,999).
Let me know what goal you are working on, and I'll customize a stack for you!`;
  }

  // 9. Greeting / Test check (if query is just a greeting, give standard intro)
  if (includesAny(['hii', 'hello', 'hey', 'namaste', 'test']) || query === 'hi' || query === 'yo') {
    return `Hello! Welcome to **Shivaay Nutrition Chat Desk**! 💪
I can help you with:
• Supplement Recommendations (Whey vs Gainer, Fat Loss stack)
• Checking live catalog pricing (e.g. "ON Whey Standard pricing")
• Store Timings & Address ("Omaxe City showroom location")
• Live Order Tracking (e.g., "track order ord-xxxx")

Please ask me a question in English, Hindi, or Hinglish (e.g., "Creatine available hai?").`;
  }

  // 10. Smart Catch-All Conversational Fallback
  return `I see! I'm here at Shivaay Nutrition to help you with supplement recommendations, catalog pricing, showroom timings, or order status. 
I didn't quite catch that. Are you looking to buy Whey Protein, Creatine, Pre-workout, or a Mass Gainer? Or do you need tracking for a current order?`;
};

// @route   POST api/ai/chat
// @desc    Process chatbot prompt (Text/Voice)
router.post('/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ msg: 'Please provide a chat message input prompt' });
  }

  try {
    const hasLLM = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;

    // 1. If LLM is active, run Search + RAG
    if (hasLLM) {
      const query = message.toLowerCase().trim();
      const includesAny = (words) => words.some(w => query.includes(w));
      
      // Let fast database targets intercept locally for exact precision
      if (query.match(/(ord-[a-z0-9]+)/i) || includesAny(['track', 'order status', 'location', 'address', 'timing', 'showroom hours', 'timings'])) {
        const localReply = await handleLocalAIMatch(message);
        return res.json({ reply: localReply });
      }

      // Fetch search snippets dynamically from Google/DuckDuckGo Lite
      console.log(`Performing dynamic web search grounding for: "${message}"`);
      const searchSnippets = await searchWeb(message);
      const searchContext = searchSnippets.length > 0 
        ? `Web Search Results (Google) for context:\n${searchSnippets.map((s, idx) => `[${idx+1}] ${s}`).join('\n')}`
        : 'No web search results available.';

      const products = await db.products.find();
      const catalogData = products.map(p => 
        `- Name: ${p.name}, Brand: ${p.brand}, Category: ${p.category}, Price: ₹${p.price}, Status: ${p.status}`
      ).join('\n');

      const systemPrompt = `You are Shivaay AI Assistant, the official chatbot representative for Shivaay Nutrition, a premium supplement store in Omaxe City, Sonipat.
You speak fluently in English, Hindi, and Hinglish (a friendly mix of Hindi and English written in Latin script, which gym-goers in India use).

Primary Role:
- Answer any user question accurately and naturally.
- Use web search context when needed.
- Answer general knowledge questions normally.

For supplement, fitness, nutrition, gym, health, product, store, pricing, order, timing, and availability related queries:
- Provide detailed assistance.
- Recommend relevant products from the catalog below when appropriate.

For unrelated topics (e.g. general knowledge, history, science, math, cooking, programming):
- Simply answer the question.
- Do NOT force product recommendations.
- Do NOT redirect the conversation to supplements or fitness unless the user explicitly asks.

Store Information:
- Name: ${STORE_METADATA.name}
- Timings: ${STORE_METADATA.timings}
- Address: ${STORE_METADATA.address}
- Phone/WhatsApp: ${STORE_METADATA.phone}
- Authenticity Policy: ${STORE_METADATA.authenticity}
- Delivery Details: ${STORE_METADATA.delivery}

Current Inventory Catalog:
${catalogData}

WEB SEARCH GROUNDING CONTEXT:
${searchContext}

Guidelines:
- Keep your answers highly encouraging, professional, and action-oriented. 
- Use the web search context above to answer general fitness, brand comparisons, supplement science, side effects, or nutritional questions accurately.
- Answer in the same language code the user uses (e.g., if they ask in Hinglish like "Bhai weight loss ke liye kuch batao", reply in conversational Hinglish).
- Provide accurate pricing and stock status from the catalog above.
- If they ask about orders or order tracking, mention they need to supply their Order ID starting with "ord-".
- Keep responses concise (3-5 sentences maximum) so they are easy to read in a mobile widget or read out loud via Text-to-Speech.`;

      const reply = await askLLM(message, systemPrompt);
      if (reply) {
        return res.json({ reply });
      }
    }

    // 2. Fallback to Local Matching Engine
    const reply = await handleLocalAIMatch(message);
    let responseText = reply;
    
    // Append a tip to remind the developer to configure keys for full GPT/Gemini search grounding
    const lowerMsg = message.toLowerCase();
    const needsLLMHelp = lowerMsg.includes('vs') || lowerMsg.includes('compare') || lowerMsg.includes('effect') || lowerMsg.includes('why') || lowerMsg.includes('what is') || lowerMsg.includes('how to');
    if (!hasLLM && needsLLMHelp) {
      responseText += `\n\n*(Tip: To enable full GPT/Gemini search RAG to answer any supplement science question, add GEMINI_API_KEY or OPENAI_API_KEY in your backend .env file).*`;
    }
    
    res.json({ reply: responseText });

  } catch (err) {
    console.error('AI Chat Error:', err);
    try {
      const reply = await handleLocalAIMatch(message);
      res.json({ reply });
    } catch (localErr) {
      res.status(500).json({ reply: 'Sorry, I am facing an internal server error. Please try again.' });
    }
  }
});

module.exports = router;
