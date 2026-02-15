export const SHOP = {
  name: 'ასტრომანი',
  nameEn: 'Astromani',
  niche: 'ტელესკოპები, ლამპები, ლევიტაციური ლამპები, საბავშვო სათამაშოები, ასტრონომიული აქსესუარები',
  platforms: ['Instagram', 'TikTok', 'Facebook'],
  targetAudience: [
    'დამწყები ასტრონომები (25-45 წ.)',
    'მშობლები რომლებიც ყიდულობენ ბავშვებისთვის',
    'ინტერიერის მოყვარულები',
    'საჩუქრის მაძიებლები',
    'ტექნოლოგიის მოყვარულები'
  ]
};

// Product categories for content generation
export const CATEGORIES = {
  telescope: {
    name: 'ტელესკოპები',
    keywords: ['ტელესკოპი', 'ასტრონომია', 'ვარსკვლავები', 'მთვარე', 'პლანეტები', 'სტარგეიზინგი'],
    angles: [
      'დამწყებთათვის გზამკვლევი',
      'პროდუქტის მიმოხილვა',
      'ასტრონომიული მოვლენა',
      'ოჯახური გამოცდილება',
      'ფოტოგრაფია ტელესკოპით',
      'საჩუქრის იდეა',
      'მითები vs რეალობა',
      'ტოპ 5 სია',
      'მომხმარებლის ისტორია',
      'შედარება და ანალიზი'
    ]
  },
  lamps: {
    name: 'ლამპები',
    keywords: ['ლამპა', 'განათება', 'ინტერიერი', 'დეკორი', 'მთვარის ლამპა', 'გალაქტიკის პროექტორი'],
    angles: [
      'ინტერიერის ტრანსფორმაცია',
      'რომანტიული ატმოსფერო',
      'საბავშვო ოთახის დიზაინი',
      'საჩუქრის გზამკვლევი',
      'ფოტო/ვიდეო ტიპსი',
      'სეზონური კოლექცია',
      'უნბოქსინგი',
      'მომხმარებლის რეაქცია',
      'შედარება',
      'DIY იდეები'
    ]
  },
  levitating: {
    name: 'ლევიტაციური ლამპები',
    keywords: ['ლევიტაცია', 'მაგნიტური', 'მფრინავი ლამპა', 'ფუტურისტული', 'WOW ეფექტი'],
    angles: [
      'WOW ეფექტის ვიდეო',
      'როგორ მუშაობს მეცნიერება',
      'საოფისე დეკორი',
      'საჩუქარი რომელიც არ დაივიწყება',
      'უნბოქსინგ რეაქცია',
      'ინტერიერში ინტეგრაცია',
      'ტოპ გაყიდვადი პროდუქტი',
      'მომხმარებლის მიმოხილვა',
      'შედარება ჩვეულებრივთან',
      'ტექნოლოგია ყოველდღიურობაში'
    ]
  },
  toys: {
    name: 'საბავშვო სათამაშოები',
    keywords: ['სათამაშო', 'ბავშვი', 'განათლება', 'STEM', 'კოსმოსი', 'მეცნიერება'],
    angles: [
      'საგანმანათლებლო ღირებულება',
      'ასაკის მიხედვით გზამკვლევი',
      'დაბადების დღის საჩუქარი',
      'მშობლის მიმოხილვა',
      'ბავშვის რეაქცია ვიდეო',
      'STEM სწავლა თამაშით',
      'სეზონური სპეციალური',
      'ოჯახური აქტივობა',
      'ტოპ 5 არჩევანი',
      'ახალი კოლექცია'
    ]
  }
};

// Georgian e-commerce sites to scrape
export const GEORGIAN_SHOPS = [
  {
    name: 'Mymarket.ge',
    baseUrl: 'https://www.mymarket.ge',
    searchUrl: 'https://www.mymarket.ge/ka/search?q=',
    categories: ['ტელესკოპი', 'ლამპა', 'სათამაშო', 'გაჯეტი', 'LED']
  },
  {
    name: 'Extra.ge',
    baseUrl: 'https://extra.ge',
    searchUrl: 'https://extra.ge/search?q=',
    categories: ['telescope', 'lamp', 'toys', 'gadget', 'projector']
  },
  {
    name: 'Zoommer.ge',
    baseUrl: 'https://zoommer.ge',
    searchUrl: 'https://zoommer.ge/search?q=',
    categories: ['telescope', 'lamp', 'projector', 'gadget']
  }
];

// Randomization helpers
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
