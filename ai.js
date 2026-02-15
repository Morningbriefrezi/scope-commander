import OpenAI from 'openai';
import { SHOP, CATEGORIES, pickRandom, shuffleArray } from './config.js';

let _openai;
function ai() {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _openai;
}

async function ask(system, prompt, temp = 0.95, maxTokens = 3500) {
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

// ═══════════════════════════════════════
// SYSTEM PROMPT BASE (Georgian)
// ═══════════════════════════════════════

const BASE_SYSTEM = `შენ ხარ ${SHOP.name}-ის (Astromani) სოციალური მედიის მენეჯერი და მარკეტინგის ექსპერტი.
მაღაზია ყიდის: ${SHOP.niche}.
პლატფორმები: ${SHOP.platforms.join(', ')}.
სამიზნე აუდიტორია: ${SHOP.targetAudience.join(', ')}.

მნიშვნელოვანი წესები:
- ყველაფერი დაწერე ქართულად (Georgian language)
- იყავი კრეატიული, ორიგინალური და თანამედროვე
- ყოველ ჯერზე სხვადასხვა მიდგომა გამოიყენე
- არ გაიმეორო წინა პასუხები
- გამოიყენე ემოჯიები ბუნებრივად
- ტექსტი უნდა იყოს მზად კოპი-ფეისტისთვის`;

// ═══════════════════════════════════════
// CONTENT GENERATION (Posts)
// ═══════════════════════════════════════

export async function generatePost(categoryKey) {
  const cat = CATEGORIES[categoryKey];
  if (!cat) return 'კატეგორია ვერ მოიძებნა';

  const angle = pickRandom(cat.angles);
  const platform = pickRandom(SHOP.platforms);
  const randomSeed = Math.random().toString(36).slice(2, 8);

  const prompt = `შექმენი 1 მზა სოციალური მედიის პოსტი ${SHOP.name}-სთვის.

კატეგორია: ${cat.name}
მიდგომა/კუთხე: ${angle}
პლატფორმა: ${platform}
უნიკალური სიდი: ${randomSeed}

სტრუქტურა:
📌 HOOK (პირველი წინადადება რომელიც ყურადღებას იპყრობს)
📝 ძირითადი ტექსტი (მზა კოპი-ფეისტისთვის, 150-300 სიტყვა)
🎨 ვიზუალის აღწერა (რა ფოტო/ვიდეო უნდა გადაიღო)
#️⃣ ჰეშთეგები (15-25 შესაბამისი, ქართული + ინგლისური მიქსი)
⏰ საუკეთესო დრო გამოსაქვეყნებლად
💬 CTA (კითხვა ან მოწოდება რომელიც ჩართულობას ზრდის)

მნიშვნელოვანი:
- ტონი: თანამედროვე, მეგობრული, ენთუზიასტური
- არ იყოს ზედმეტად სარეკლამო
- ფოკუსირდი ემოციაზე და გამოცდილებაზე
- გამოიყენე საკვანძო სიტყვები: ${cat.keywords.join(', ')}
- ყოველი პოსტი უნდა იყოს უნიკალური და განსხვავებული`;

  return ask(BASE_SYSTEM, prompt);
}

// ═══════════════════════════════════════
// DAILY MARKETING CAMPAIGN
// ═══════════════════════════════════════

export async function dailyCampaign(focus = '') {
  const randomSeed = Math.random().toString(36).slice(2, 8);
  const dayOfWeek = ['კვირა', 'ორშაბათი', 'სამშაბათი', 'ოთხშაბათი', 'ხუთშაბათი', 'პარასკევი', 'შაბათი'][new Date().getDay()];

  const prompt = `შექმენი დღევანდელი მარკეტინგული კამპანიის გეგმა ${SHOP.name}-სთვის.

დღეს არის: ${dayOfWeek}, ${new Date().toISOString().split('T')[0]}
${focus ? `ფოკუსი: ${focus}` : 'ზოგადი — შემოთავაზე საუკეთესო სტრატეგია დღისთვის'}
უნიკალური სიდი: ${randomSeed}

გეგმა უნდა მოიცავდეს:

🌅 დილის პოსტი (9:00-11:00)
- პლატფორმა + ფორმატი
- მზა ტექსტი (კოპი-ფეისტი)
- ვიზუალის იდეა

🌞 შუადღის აქტივობა (13:00-15:00)
- Stories/Reels იდეა
- მზა ტექსტი
- ინტერაქციის ტაქტიკა

🌙 საღამოს პოსტი (19:00-21:00)
- პლატფორმა + ფორმატი
- მზა ტექსტი
- CTA

📢 დღის სპეციალური აქცია:
- რა შეთავაზება გავაკეთოთ
- როგორ ჩამოვაყალიბოთ
- ურგენტულობის ტაქტიკა

📊 დღის მეტრიკები:
- რა უნდა გავზომოთ
- რა არის კარგი შედეგი

ყველაფერი ქართულად, მზა შესასრულებლად.`;

  return ask(BASE_SYSTEM, prompt);
}

// ═══════════════════════════════════════
// WEEKLY MARKETING CAMPAIGN
// ═══════════════════════════════════════

export async function weeklyCampaign(focus = '') {
  const randomSeed = Math.random().toString(36).slice(2, 8);

  const prompt = `შექმენი 7-დღიანი მარკეტინგული კამპანია ${SHOP.name}-სთვის.

${focus ? `კამპანიის თემა: ${focus}` : 'შემოთავაზე საუკეთესო თემა ამ კვირისთვის'}
უნიკალური სიდი: ${randomSeed}

თითოეული დღისთვის მიუთითე:

📅 ორშაბათი - კვირა:
- 🎯 დღის თემა
- 📱 Instagram პოსტი (მზა ტექსტი + ჰეშთეგები)
- 🎬 TikTok/Reels სკრიპტი (მზა ტექსტი)
- 📘 Facebook პოსტი (მზა ტექსტი)
- 📸 ვიზუალის აღწერა
- ⏰ გამოქვეყნების დრო

ასევე:
💰 კვირის აქცია/შეთავაზება:
- რა პროდუქტი დავაფასდათ
- ფასდაკლების სტრუქტურა
- ურგენტულობის ელემენტი

📧 SMS/WhatsApp შეტყობინება (1 ცალი კვირისთვის)
🤝 თანამშრომლობის იდეა (ვისთან ერთად)
📊 KPI და წარმატების მეტრიკები

ყველაფერი ქართულად, კონკრეტული და შესრულებადი.`;

  return ask(BASE_SYSTEM, prompt, 0.9, 4000);
}

// ═══════════════════════════════════════
// IMAGE GENERATION
// ═══════════════════════════════════════

export async function generateImage(description) {
  const useNano = process.env.NANOBANANA_API_KEY && description.includes('nano:');
  const cleanDesc = description.replace('nano:', '').trim();

  if (useNano) {
    return generateImageNano(cleanDesc);
  }
  return generateImageDalle(cleanDesc);
}

async function generateImageDalle(description) {
  const prompt = `Professional product photography for Astromani (ასტრომანი), a telescope and lamp store. 
${description}. 
Style: modern, clean, high-end commercial photography, dramatic lighting, Instagram-worthy, 4K quality.
No text, no watermarks.`;

  const response = await ai().images.generate({
    model: 'dall-e-3',
    prompt: prompt,
    n: 1,
    size: '1024x1024',
    quality: 'standard'
  });

  return {
    url: response.data[0].url,
    revisedPrompt: response.data[0].revised_prompt,
    source: 'DALL-E 3'
  };
}

async function generateImageNano(description) {
  const axios = (await import('axios')).default;
  const response = await axios.post('https://api.nanobanana.com/v1/generate', {
    prompt: description,
    style: 'commercial_photo'
  }, {
    headers: {
      'Authorization': `Bearer ${process.env.NANOBANANA_API_KEY}`,
      'Content-Type': 'application/json'
    },
    timeout: 60000
  });

  return {
    url: response.data.url || response.data.image_url,
    revisedPrompt: description,
    source: 'Nanobanana'
  };
}

// ═══════════════════════════════════════
// VIRAL PRODUCTS (Georgian Market)
// ═══════════════════════════════════════

export async function findViralProducts() {
  const randomSeed = Math.random().toString(36).slice(2, 8);

  const prompt = `შენ ხარ ქართული ბაზრის ანალიტიკოსი და პროდუქტების მკვლევარი.

გააანალიზე ქართული ონლაინ მაღაზიები (Mymarket.ge, Extra.ge, Zoommer.ge, Vendoo.ge) და მოძებნე 8-10 ვირუსული/ტრენდული პროდუქტი რომელიც ${SHOP.name}-ს კატალოგში კარგად მოერგება.

უნიკალური სიდი: ${randomSeed}

კატეგორიები: ტელესკოპები, ლამპები, ლევიტაციური ლამპები, საბავშვო სათამაშოები, გაჯეტები, LED განათება, კოსმოსური თემატიკა, STEM სათამაშოები.

თითოეული პროდუქტისთვის მიუთითე:

1. 📦 პროდუქტის სახელი (ქართულად)
2. 💰 სავარაუდო ფასი ქართულ ბაზარზე (ლარში)
3. 📊 მოთხოვნის დონე (მაღალი/საშუალო/დაბალი)
4. 🏪 სად იყიდება ახლა (რომელ საიტზე)
5. 💡 რატომ არის ტრენდული
6. 🎯 მარკეტინგის კუთხე (როგორ გავყიდოთ)
7. 💵 სავარაუდო მარჟა
8. 🔗 AliExpress ძიების ტერმინი (იაფად შესაძენად)

ასევე მიუთითე:
⭐ ტოპ 3 საუკეთესო შესაძლებლობა (რატომ ეს 3?)
⚠️ რისკები (რას უნდა მივაქციოთ ყურადღება?)
📈 ტრენდის პროგნოზი (რა იქნება პოპულარული მომდევნო თვეში?)

იყავი კონკრეტული, რეალისტური და აქტუალური.`;

  return ask(
    'შენ ხარ ქართული ე-კომერციის ექსპერტი. იცნობ ადგილობრივ ბაზარს, ფასებს და ტრენდებს. პასუხობ მხოლოდ ქართულად.',
    prompt,
    0.85,
    4000
  );
}

// ═══════════════════════════════════════
// COMPETITOR ANALYSIS (Georgian Market)
// ═══════════════════════════════════════

export async function georgianCompetitorAnalysis() {
  const randomSeed = Math.random().toString(36).slice(2, 8);

  const prompt = `გააანალიზე ქართული ბაზარი ტელესკოპების, ლამპებისა და საბავშვო სათამაშოების სეგმენტში.

უნიკალური სიდი: ${randomSeed}

მოამზადე ანალიზი:

🏪 კონკურენტები საქართველოში:
- ვინ ყიდის მსგავს პროდუქტებს?
- რა ფასები აქვთ?
- სად რეკლამირდებიან?
- რა აკეთებენ კარგად/ცუდად?

📊 ბაზრის გაპები:
- რა პროდუქტები არ არის ბაზარზე?
- რა სერვისი აკლია მომხმარებელს?
- რომელი აუდიტორია ვერ პოულობს სასურველს?

🎯 ${SHOP.name}-ს შესაძლებლობები:
- 5 კონკრეტული ნაბიჯი კონკურენტული უპირატესობისთვის
- უნიკალური პოზიციონირების სტრატეგია
- ფასწარმოქმნის რეკომენდაცია

⚡ სწრაფი მოქმედებები (ამ კვირისთვის):
- 3 რამ რაც დღეს შეგიძლია გააკეთო

ყველაფერი ქართულად, კონკრეტულად და აქტუალურად.`;

  return ask(
    'შენ ხარ ქართული ბაზრის ანალიტიკოსი. იცნობ ადგილობრივ ბიზნეს გარემოს. პასუხობ მხოლოდ ქართულად.',
    prompt,
    0.7,
    4000
  );
}

// ═══════════════════════════════════════
// BUSINESS IDEAS (Georgian)
// ═══════════════════════════════════════

export async function businessIdeas(focus = '') {
  const randomSeed = Math.random().toString(36).slice(2, 8);

  const prompt = `შემოთავაზე 7 ინოვაციური ბიზნეს იდეა ${SHOP.name}-სთვის.

${focus ? `ფოკუსი: ${focus}` : ''}
უნიკალური სიდი: ${randomSeed}

თითოეული იდეისთვის:
💡 იდეის სახელი
📝 აღწერა (2-3 წინადადება)
🎯 რატომ იმუშავებს საქართველოში
⚡ სირთულის დონე (დაბალი/საშუალო/მაღალი)
💰 საჭირო ბიუჯეტი
📈 მოსალოდნელი შედეგი
🔧 პირველი ნაბიჯი (30 წუთში გასაკეთებელი)

იდეები უნდა მოიცავდეს:
- ახალი შემოსავლის წყაროები
- ვირუსული მარკეტინგი
- საზოგადოების შექმნა
- პარტნიორობა
- სეზონური შესაძლებლობები
- ონლაინ/ოფლაინ ინტეგრაცია

იყავი კრეატიული! არ შემოთავაზო ბანალური რჩევები. ფიქრე ქართული კონტექსტით.`;

  return ask(BASE_SYSTEM, prompt, 0.95, 4000);
}
