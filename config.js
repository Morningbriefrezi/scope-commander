export const SHOP = {
  name: 'ასტრომანი',
  nameEn: 'Astromani',
  niche: 'ტელესკოპები, დეკორატიული სანათები, მაგნიტური ლევიტაციური სანათები, ასტრონომიული აქსესუარები',
  platforms: ['Instagram', 'TikTok', 'Facebook'],
  targetAudience: [
    'დამწყები ასტრონომები (25-45 წ.)',
    'მშობლები რომლებიც ბავშვებისთვის ეძებენ საგანმანათლებლო პროდუქტებს',
    'ინტერიერის მოყვარულები',
    'საჩუქრის მაძიებლები',
    'ტექნოლოგიის ენთუზიასტები'
  ]
};

export const CATEGORIES = {

  telescope: {
    name: 'ტელესკოპი',
    type: 'sales',
    keywords: ['ტელესკოპი', 'ასტრონომია', 'ვარსკვლავები', 'მთვარე', 'პლანეტები', 'კოსმოსი'],
    angles: [
      'პირველი ტელესკოპის არჩევა',
      'რას ხედავ რეალურად 90მმ ტელესკოპით',
      'ოჯახური დაკვირვების გამოცდილება',
      'საჩუქარი რომელიც შთაბეჭდილებას ტოვებს',
      'მთვარის დეტალები ახლოდან',
      'ასტრონომია ბავშვებისთვის'
    ]
  },

  lamps: {
    name: 'სანათები',
    type: 'sales',
    keywords: ['ლამპა', 'განათება', 'ინტერიერი', 'დეკორი', 'მთვარის ლამპა'],
    angles: [
      'საძინებლის ატმოსფეროს ტრანსფორმაცია',
      'რომანტიკული განათება',
      'საბავშვო ოთახის განათება',
      'საჩუქრის იდეა',
      'მინიმალისტური ინტერიერი',
      'ღამის სიმშვიდე'
    ]
  },

  levitating: {
    name: 'მაგნიტური სანათი',
    type: 'sales',
    keywords: ['ლევიტაცია', 'მაგნიტური', 'მფრინავი ლამპა', 'ფუტურისტული', 'ტექნოლოგია'],
    angles: [
      'WOW ეფექტი სახლში',
      'როგორ მუშაობს ლევიტაცია',
      'საოფისე დეკორი',
      'საჩუქარი რომელიც არ ავიწყდებათ',
      'ტექნოლოგია ყოველდღიურ ცხოვრებაში'
    ]
  },

  info: {
    name: 'ინფო პოსტი',
    type: 'educational',
    keywords: ['კოსმოსი', 'სამყარო', 'დედამიწა', 'ვარსკვლავები', 'მზის სისტემა', 'ასტრონომია'],
    angles: [
      'კოსმოსის საინტერესო ფაქტი',
      'დედამიწის უცნობი ისტორია',
      'მომავალი ციური მოვლენა',
      'ციური კალენდარი',
      'მზის სისტემის საოცრება',
      'შავი ხვრელის ფაქტი',
      'მეტეორული წვიმა',
      'საოცარი ასტრონომიული აღმოჩენა'
    ]
  }

};

export const GEORGIAN_SHOPS = [
  { name: 'Mymarket.ge', searchUrl: 'https://www.mymarket.ge/ka/search?q=' },
  { name: 'Extra.ge', searchUrl: 'https://extra.ge/search?q=' },
  { name: 'Zoommer.ge', searchUrl: 'https://zoommer.ge/search?q=' }
];

export function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
