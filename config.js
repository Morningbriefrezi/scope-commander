export const SHOP = {
  name: process.env.SHOP_NAME || 'My Telescope Shop',
  website: process.env.SHOP_URL || '',
  niche: 'telescopes, binoculars, astronomy equipment, outdoor optics, stargazing accessories',
  platforms: ['Instagram', 'TikTok', 'Facebook'],
  channels: ['Physical store', 'Online store', 'Social media'],
  targetAudience: [
    'Beginner stargazers (25-45)',
    'Amateur astronomers',
    'Parents buying for kids',
    'Nature/birdwatching enthusiasts',
    'Photography hobbyists',
    'Gift buyers (holidays, birthdays)'
  ],
  priceRange: '$30 - $2000',
  adjacentNiches: [
    'astrophotography cameras and mounts',
    'smart telescopes',
    'night vision devices',
    'laser pointers for astronomy',
    'star maps and planispheres',
    'camping and outdoor gear',
    'drone cameras',
    'weather stations',
    'microscopes',
    'binoculars'
  ]
};

export const HUNT_CATEGORIES = [
  'smart telescope WiFi',
  'telescope phone adapter',
  'astrophotography camera',
  'star tracker mount',
  'astronomy laser pointer',
  'telescope eyepiece set',
  'night vision monocular',
  'telescope lens filter',
  'portable telescope tripod',
  'telescope carrying case',
  'binoculars stargazing',
  'telescope for kids',
  'moon lamp 3D print',
  'star projector galaxy',
  'solar telescope filter',
  'telescope focuser upgrade',
  'astronomy books guides',
  'planisphere star chart',
  'telescope collimator laser',
  'red flashlight astronomy'
];

export const CONTENT_TYPES = {
  instagram: {
    formats: ['carousel post', 'single image post', 'Reel script', 'Story sequence'],
    style: 'visual, inspiring, educational, use emojis, 20-30 hashtags'
  },
  tiktok: {
    formats: ['hook + reveal video', 'POV video', 'educational explainer', 'product showcase', 'trending sound concept'],
    style: 'casual, hook in first 2 seconds, trendy, relatable, viral potential'
  },
  facebook: {
    formats: ['engagement post', 'product highlight', 'community question', 'event announcement', 'educational article'],
    style: 'conversational, community-focused, shareable, longer form OK'
  }
};

export const FILTERS = {
  MIN_ORDERS: 300,
  MIN_RATING: 4.2,
  MAX_PRICE: 150
};
