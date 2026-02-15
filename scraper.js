import axios from 'axios';
import * as cheerio from 'cheerio';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'ka,en;q=0.9',
  'Accept': 'text/html,application/xhtml+xml'
};

// ═══════════════════════════════════════
// MYMARKET.GE Scraper
// ═══════════════════════════════════════

async function scrapeMymarket(query) {
  try {
    const url = `https://www.mymarket.ge/ka/search?q=${encodeURIComponent(query)}&page=1`;
    console.log(`🔍 Mymarket: "${query}"`);
    const { data } = await axios.get(url, { headers: HEADERS, timeout: 15000 });
    const $ = cheerio.load(data);
    const products = [];

    $('[class*="product"], [class*="item"], [class*="card"]').each((i, el) => {
      if (i >= 5) return false;
      const name = $(el).find('[class*="title"], [class*="name"], h3, h4').first().text().trim();
      const priceText = $(el).find('[class*="price"]').first().text().trim();
      const link = $(el).find('a').first().attr('href') || '';
      const price = priceText.match(/[\d,.]+/)?.[0] || '';

      if (name && name.length > 3) {
        products.push({
          name: name.slice(0, 100),
          price: price ? `${price} ₾` : 'ფასი არ არის',
          link: link.startsWith('http') ? link : `https://www.mymarket.ge${link}`,
          source: 'Mymarket.ge'
        });
      }
    });

    console.log(`  ✅ Mymarket: ${products.length} products`);
    return products;
  } catch (err) {
    console.log(`  ❌ Mymarket error: ${err.message}`);
    return [];
  }
}

// ═══════════════════════════════════════
// EXTRA.GE Scraper
// ═══════════════════════════════════════

async function scrapeExtra(query) {
  try {
    const url = `https://extra.ge/find?q=${encodeURIComponent(query)}`;
    console.log(`🔍 Extra.ge: "${query}"`);
    const { data } = await axios.get(url, { headers: HEADERS, timeout: 15000 });
    const $ = cheerio.load(data);
    const products = [];

    $('[class*="product"], [class*="item"], [class*="card"], .products-list > div, .search-result-item').each((i, el) => {
      if (i >= 5) return false;
      const name = $(el).find('[class*="title"], [class*="name"], h3, h4, .product-name').first().text().trim();
      const priceText = $(el).find('[class*="price"]').first().text().trim();
      const link = $(el).find('a').first().attr('href') || '';
      const price = priceText.match(/[\d,.]+/)?.[0] || '';

      if (name && name.length > 3) {
        products.push({
          name: name.slice(0, 100),
          price: price ? `${price} ₾` : 'ფასი არ არის',
          link: link.startsWith('http') ? link : `https://extra.ge${link}`,
          source: 'Extra.ge'
        });
      }
    });

    console.log(`  ✅ Extra.ge: ${products.length} products`);
    return products;
  } catch (err) {
    console.log(`  ❌ Extra.ge error: ${err.message}`);
    return [];
  }
}

// ═══════════════════════════════════════
// ZOOMMER.GE Scraper
// ═══════════════════════════════════════

async function scrapeZoommer(query) {
  try {
    const url = `https://zoommer.ge/search?q=${encodeURIComponent(query)}`;
    console.log(`🔍 Zoommer: "${query}"`);
    const { data } = await axios.get(url, { headers: HEADERS, timeout: 15000 });
    const $ = cheerio.load(data);
    const products = [];

    $('[class*="product"], [class*="item"], [class*="card"]').each((i, el) => {
      if (i >= 5) return false;
      const name = $(el).find('[class*="title"], [class*="name"], h3, h4').first().text().trim();
      const priceText = $(el).find('[class*="price"]').first().text().trim();
      const link = $(el).find('a').first().attr('href') || '';
      const price = priceText.match(/[\d,.]+/)?.[0] || '';

      if (name && name.length > 3) {
        products.push({
          name: name.slice(0, 100),
          price: price ? `${price} ₾` : 'ფასი არ არის',
          link: link.startsWith('http') ? link : `https://zoommer.ge${link}`,
          source: 'Zoommer.ge'
        });
      }
    });

    console.log(`  ✅ Zoommer: ${products.length} products`);
    return products;
  } catch (err) {
    console.log(`  ❌ Zoommer error: ${err.message}`);
    return [];
  }
}

// ═══════════════════════════════════════
// MAIN: Search all shops
// ═══════════════════════════════════════

export async function scrapeGeorgianShops() {
  const searchTerms = [
    'ტელესკოპი',
    'telescope',
    'ლამპა LED',
    'lamp projector',
    'სათამაშო',
    'gadget',
    'პროექტორი',
    'star projector'
  ];

  console.log('\n🇬🇪 Scraping Georgian shops...');
  const allProducts = [];

  for (const term of searchTerms) {
    const [my, ex, zo] = await Promise.allSettled([
      scrapeMymarket(term),
      scrapeExtra(term),
      scrapeZoommer(term)
    ]);

    if (my.status === 'fulfilled') allProducts.push(...my.value);
    if (ex.status === 'fulfilled') allProducts.push(...ex.value);
    if (zo.status === 'fulfilled') allProducts.push(...zo.value);

    // Small delay between search terms
    await new Promise(r => setTimeout(r, 1000));
  }

  // Deduplicate by name similarity
  const unique = [];
  for (const p of allProducts) {
    const isDuplicate = unique.some(u =>
      u.name.toLowerCase().includes(p.name.toLowerCase().slice(0, 15)) ||
      p.name.toLowerCase().includes(u.name.toLowerCase().slice(0, 15))
    );
    if (!isDuplicate) unique.push(p);
  }

  console.log(`\n📊 Total unique products found: ${unique.length}`);
  return unique;
}
