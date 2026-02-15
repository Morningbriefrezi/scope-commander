import OpenAI from 'openai';
import { SHOP, HUNT_CATEGORIES, CONTENT_TYPES, FILTERS } from './config.js';

let _openai;
function ai() {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _openai;
}

async function ask(system, prompt, temp = 0.8, maxTokens = 3000) {
  const res = await ai().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: prompt }
    ],
    temperature: temp,
    max_tokens: maxTokens
  });
  return res.choices[0].message.content.trim();
}

async function askJSON(system, prompt, temp = 0.7) {
  const raw = await ask(system, prompt, temp, 4000);
  const cleaned = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  return JSON.parse(cleaned);
}

export async function huntProducts(subNiche = '') {
  const categories = subNiche
    ? [subNiche]
    : HUNT_CATEGORIES.sort(() => Math.random() - 0.5).slice(0, 5);

  const prompt = `You are an expert product sourcer for a telescope and astronomy equipment store.

Find 8 REAL trending products on AliExpress related to: ${categories.join(', ')}

Context: The store (${SHOP.name}) sells ${SHOP.niche}. They want to expand their catalog with viral, high-margin products.

REQUIREMENTS:
- Products must ACTUALLY exist on AliExpress
- Orders > ${FILTERS.MIN_ORDERS}, Rating >= ${FILTERS.MIN_RATING}, Price < $${FILTERS.MAX_PRICE}
- Focus on products with HIGH MARGIN potential (at least 3x markup possible)
- Include both core astronomy products AND creative adjacent products
- Think about what goes viral on TikTok in the astronomy/space niche

CRITICAL: prices as decimals (25.99), ratings as decimals (4.7), orders as integers (5200)

Return JSON array:
[{
  "name": "Product name as on AliExpress",
  "price": 25.99,
  "orders": 5200,
  "rating": 4.7,
  "suggestedRetail": 79.99,
  "margin": "3.1x",
  "category": "category",
  "whyViral": "Why this product is trending",
  "marketingAngle": "How to sell this to telescope shop customers",
  "searchQuery": "2-4 word AliExpress search term"
}]`;

  const products = await askJSON(
    'Product sourcing expert for astronomy retail. Return only valid JSON arrays.',
    prompt
  );

  return products.map(p => {
    let price = parseFloat(p.price) || 0;
    let rating = parseFloat(p.rating) || 0;
    if (price > 500) price = price / 100;
    if (rating > 5) rating = rating / 10;

    return {
      ...p,
      price,
      rating,
      orders: parseInt(p.orders) || 0,
      suggestedRetail: parseFloat(p.suggestedRetail) || price * 3,
      link: `https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(p.searchQuery || p.name)}`
    };
  });
}

export async function generateContent(platform = '', topic = '') {
  const plat = platform.toLowerCase();
  const platConfig = CONTENT_TYPES[plat] || CONTENT_TYPES.instagram;
  const platName = plat || 'instagram';

  const prompt = `You are a viral social media content creator for ${SHOP.name}, a telescope and astronomy store.

Create 3 ready-to-post ${platName.toUpperCase()} content pieces${topic ? ` about: ${topic}` : ' for this week'}.

Target audience: ${SHOP.targetAudience.join(', ')}
Content formats to use: ${platConfig.formats.join(', ')}
Style: ${platConfig.style}

For each piece provide:
1. HOOK (first line / first 2 seconds that stops the scroll)
2. FULL CAPTION/SCRIPT (ready to copy-paste)
3. HASHTAGS (${platName === 'tiktok' ? '5-8' : platName === 'instagram' ? '20-30' : '5-10'} relevant hashtags)
4. VISUAL DIRECTION (what image/video to create)
5. BEST TIME TO POST
6. ENGAGEMENT CTA (question or call to action)

Make content that gets shared. Think: educational, surprising, emotional, or entertaining.
Tie everything back to telescopes and astronomy WITHOUT being salesy.`;

  return ask(
    `Viral ${platName} content creator for astronomy brand. Write ready-to-use content.`,
    prompt,
    0.9,
    4000
  );
}

export async function getAstroEvents() {
  const prompt = `You are an astronomy events expert and retail marketing strategist for a telescope shop.

List the next 10 significant astronomy events coming up (from today forward for the next 3 months).

For each event provide:
1. EVENT NAME and exact DATE
2. VISIBILITY (where best visible, what equipment needed)
3. EXCITEMENT LEVEL (fire emoji 1 to 5)
4. SALES OPPORTUNITY: which products to promote and why
5. CONTENT IDEA: one viral social media post concept tied to this event
6. TIMING: when to start marketing (how many days before)

Focus on events that DRIVE TELESCOPE SALES:
- Meteor showers, eclipses, planetary conjunctions
- Supermoons, blood moons, comets
- ISS visible passes, satellite launches
- Seasonal stargazing highlights

End with a "THIS WEEK'S #1 PRIORITY" — the most urgent event to prepare for.`;

  return ask(
    'Astronomy events expert and telescope retail strategist. Be specific with dates and actionable advice.',
    prompt,
    0.5,
    4000
  );
}

export async function createCampaign(product = '') {
  const prompt = `You are a senior marketing strategist for ${SHOP.name}, a telescope and astronomy store selling via physical store, online store, and social media.

Create a FULL 7-DAY MARKETING CAMPAIGN for: ${product || 'their best-selling beginner telescope'}

Include:

DAY-BY-DAY PLAN:
- What to post on Instagram, TikTok, and Facebook each day
- Exact captions and hooks (ready to copy)
- When to post (time)

SALES STRATEGY:
- Pricing psychology (anchor price, discount structure)
- Urgency/scarcity tactics
- Bundle suggestions (what to pair with)
- Upsell and cross-sell recommendations

AD STRATEGY:
- Target audience segments for paid ads
- Ad copy (3 variations)
- Budget allocation suggestion (small budget: $10-50/day)

OUTREACH:
- Email subject lines (3 options)
- In-store signage text
- WhatsApp/SMS broadcast message

SUCCESS METRICS:
- What to track
- Expected engagement benchmarks

Make it specific, actionable, and ready to execute TODAY.`;

  return ask(
    'Senior marketing strategist for astronomy retail. Create detailed, immediately executable campaigns.',
    prompt,
    0.8,
    4000
  );
}

export async function getBusinessIdeas(focus = '') {
  const prompt = `You are a creative business strategist for ${SHOP.name}, a telescope and astronomy equipment retailer with physical store, online store (Shopify), and social media presence (Instagram, TikTok, Facebook).

${focus ? `Focus area: ${focus}` : 'Generate a mix of ideas across all areas.'}

Their #1 challenge: GETTING NEW CUSTOMERS.

Provide 7 ACTIONABLE ideas:

For each idea:
- IDEA NAME (catchy, memorable)
- DESCRIPTION (2-3 sentences max)
- WHY IT WORKS (the psychology behind it)
- EFFORT LEVEL (low/medium/high)
- COST (free / under $50 / under $200 / custom)
- EXPECTED IMPACT (customer reach estimate)
- FIRST STEP (what to do in the next 30 minutes)

Mix of ideas across:
- Customer acquisition channels
- Viral content strategies
- Community building
- Partnership opportunities
- Seasonal/event-based promotions
- Customer retention and referral
- Revenue diversification

Be CREATIVE. Think outside the box. No generic advice.
Include at least one idea that could go VIRAL.`;

  return ask(
    'Creative business strategist for niche retail. Deliver specific, innovative, actionable ideas.',
    prompt,
    0.95,
    4000
  );
}

export async function analyzeCompetitors() {
  const prompt = `You are a competitive intelligence analyst for a telescope and astronomy equipment store.

Analyze the current competitive landscape for telescope retailers. Cover:

TOP ONLINE COMPETITORS:
- List 5-7 major telescope retailers (online) with what they do well
- Their pricing strategies
- Their social media strengths/weaknesses

MARKET GAPS:
- What are customers complaining about in this niche?
- What products/services are MISSING from the market?
- Underserved customer segments

WHAT'S WORKING NOW:
- Top performing content types in the astronomy niche
- Trending marketing tactics competitors are using
- New product categories gaining traction

OPPORTUNITIES TO EXPLOIT:
- 5 specific things competitors are NOT doing that you should
- Positioning strategies to differentiate
- Price/value gaps to fill

QUICK WINS:
- 3 things you can implement THIS WEEK to gain an edge

Be specific with real competitors and real observations.`;

  return ask(
    'Competitive intelligence analyst for astronomy retail market. Be specific, name real companies.',
    prompt,
    0.6,
    4000
  );
}

export async function weeklyBriefing() {
  const prompt = `You are the AI chief strategy officer for ${SHOP.name}, a telescope and astronomy store.

Deliver a WEEKLY BUSINESS INTELLIGENCE BRIEFING covering:

INDUSTRY NEWS:
- What happened this week in astronomy/space that affects telescope sales
- New product launches or announcements in the optics industry

TRENDING NOW:
- What's trending on TikTok/Instagram in the astronomy space
- Viral content opportunities to jump on THIS WEEK

UPCOMING EVENTS (next 2 weeks):
- Astronomy events to prepare content/marketing for
- Retail events (sale opportunities)

RECOMMENDED ACTIONS (prioritized):
1. URGENT (do today)
2. THIS WEEK (by Sunday)
3. PLAN AHEAD (next 2 weeks)

WILD CARD IDEA:
- One unexpected strategy that could be a game changer this week

CONTENT CALENDAR:
- Mon through Sun: one post idea per day with platform + format + hook

Keep it under 500 words. Punchy. Actionable. No fluff.`;

  return ask(
    'AI chief strategy officer for astronomy retail. Deliver concise, actionable weekly briefing.',
    prompt,
    0.8,
    4000
  );
}
