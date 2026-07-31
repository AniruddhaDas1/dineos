import type { WebsiteTemplate, WebsiteTheme } from "@/services/types";

// Reusable theme presets — shared chunks keep templates compact
const DARK: Pick<WebsiteTheme, "background" | "surface" | "surface2" | "foreground" | "muted" | "border"> = {
  background: "240 6% 4%",
  surface: "240 5% 9%",
  surface2: "240 6% 13%",
  foreground: "39 31% 95%",
  muted: "39 12% 58%",
  border: "240 6% 17%",
};

const LIGHT: Pick<WebsiteTheme, "background" | "surface" | "surface2" | "foreground" | "muted" | "border"> = {
  background: "40 33% 97%",
  surface: "0 0% 100%",
  surface2: "40 20% 92%",
  foreground: "30 10% 12%",
  muted: "30 6% 42%",
  border: "30 15% 84%",
};

const GALLERY = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1559329007-40df8a9345d8?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=800&q=80",
];

function hero(url: string): string {
  return url;
}

const REVIEWS = [
  { name: "Arjun Mehta", date: "2026-06-12", rating: 5, text: "Absolutely love this place. The food, the vibe, the service — all top notch. Will keep coming back!" },
  { name: "Priya Sharma", date: "2026-05-28", rating: 5, text: "Such a wonderful experience. Everything was fresh, flavorful, and beautifully presented." },
  { name: "Rohan Kapoor", date: "2026-06-03", rating: 4, text: "Great spot. Friendly staff and consistently good food. Highly recommend to anyone in the area." },
];

const HOURS = [
  { day: "Monday – Thursday", time: "11:00 AM – 10:00 PM" },
  { day: "Friday – Saturday", time: "11:00 AM – 11:30 PM" },
  { day: "Sunday", time: "12:00 PM – 9:30 PM" },
];

const SOCIAL = [
  { platform: "Instagram", url: "#" },
  { platform: "Facebook", url: "#" },
  { platform: "X", url: "#" },
];

export const websiteTemplates: WebsiteTemplate[] = [
  // 1. Fine Dining Restaurant
  {
    id: "tpl-restaurant",
    name: "Fine Dining Restaurant",
    category: "restaurant",
    description: "Elegant, moody fine-dining landing with gold accents.",
    preview: "#C9A24B",
    theme: { ...DARK, accent: "41 55% 54%", accentForeground: "240 6% 4%" },
    content: {
      name: "Saffron & Smoke",
      tagline: "Modern Indian Fine Dining",
      description: "Where heritage recipes meet contemporary plating in an intimate, candlelit setting.",
      heroImage: hero("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80"),
      storyImage: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80",
      story: "Born from a belief that Indian cuisine deserves a stage as refined as the food itself. Our kitchen draws from generations of family recipes — from smoky tandoors to aromatic biryani pots — and plates them with patience and purpose.",
      menuItems: [
        { name: "Butter Chicken", description: "Slow-cooked in tomato & fenugreek", price: 560, image: GALLERY[1], badge: "Chef's Pick" },
        { name: "Paneer Tikka", description: "Charred in the tandoor, smoky & soft", price: 420, image: GALLERY[2], badge: "Veg" },
        { name: "Hyderabadi Biryani", description: "Basmati, saffron, slow-dum", price: 440, image: GALLERY[5], badge: "Signature" },
        { name: "Gulab Jamun", description: "Warm, syrupy, with pistachio", price: 220, image: GALLERY[3], badge: "Sweet" },
        { name: "Tandoori Chicken", description: "Yogurt-marinated, coal-roasted", price: 520, image: GALLERY[0], badge: "Popular" },
        { name: "Dal Makhani", description: "24-hour simmered black lentils", price: 380, image: GALLERY[4], badge: "Veg" },
      ],
      gallery: GALLERY.map((url, i) => ({ url, alt: `Dining moment ${i + 1}` })),
      reviews: REVIEWS,
      contact: { address: "42 Art District, Jubilee Hills, Hyderabad 500033", phone: "+91 98765 43210", email: "hello@saffronandsmoke.in" },
      hours: HOURS,
      social: SOCIAL,
    },
  },

  // 2. Street Food Cart
  {
    id: "tpl-foodcart",
    name: "Street Food Cart",
    category: "food-cart",
    description: "Punchy, vibrant street-food stall landing with orange energy.",
    preview: "#FF5722",
    theme: { background: "20 25% 6%", surface: "20 22% 11%", surface2: "20 22% 16%", foreground: "30 35% 95%", muted: "25 15% 62%", border: "20 20% 20%", accent: "17 100% 57%", accentForeground: "20 25% 6%" },
    content: {
      name: "The Chaat Corner",
      tagline: "Street Food, Soulful Flavor",
      description: "Bold, spicy, and unapologetically messy. The best street bites in town, served hot off the cart.",
      heroImage: hero("https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1600&q=80"),
      storyImage: GALLERY[5],
      story: "Started as a single cart on a busy street corner, we've been serving the neighborhood its daily dose of chaat, samosas, and chutneys for over a decade. No frills — just flavor.",
      menuItems: [
        { name: "Pani Puri", description: "Crisp shells, tangy water", price: 80, image: GALLERY[0], badge: "Bestseller" },
        { name: "Vada Pav", description: "Spicy potato, pav, chutney", price: 60, image: GALLERY[1], badge: "Classic" },
        { name: "Masala Dosa", description: "Crispy, with coconut chutney", price: 120, image: GALLERY[2], badge: "Veg" },
        { name: "Samosa Chaat", description: "Crushed samosa, chickpeas, yogurt", price: 90, image: GALLERY[3], badge: "Fan Fav" },
        { name: "Bhel Puri", description: "Puffed rice, sev, tamarind", price: 70, image: GALLERY[4], badge: "Light" },
        { name: "Kathi Roll", description: "Flaky wrap, spicy filling", price: 110, image: GALLERY[5], badge: "On the go" },
      ],
      gallery: GALLERY.map((url, i) => ({ url, alt: `Street food ${i + 1}` })),
      reviews: REVIEWS,
      contact: { address: "Corner of 5th & Main, Street Food Lane", phone: "+91 91234 56780", email: "hi@chaatcorner.in" },
      hours: HOURS,
      social: SOCIAL,
    },
  },

  // 3. Gourmet Restaurant
  {
    id: "tpl-gourmet",
    name: "Gourmet Restaurant",
    category: "gourmet",
    description: "Refined, green-accented gourmet experience.",
    preview: "#2ECC71",
    theme: { background: "160 20% 5%", surface: "160 18% 10%", surface2: "160 18% 15%", foreground: "150 20% 95%", muted: "150 10% 60%", border: "160 15% 18%", accent: "145 63% 49%", accentForeground: "160 20% 5%" },
    content: {
      name: "Verdant",
      tagline: "Conscious Gourmet Dining",
      description: "A seasonal, produce-forward menu crafted with precision and respect for the ingredient.",
      heroImage: hero("https://images.unsplash.com/photo-1466637574441-749b8f19452f?auto=format&fit=crop&w=1600&q=80"),
      storyImage: GALLERY[2],
      story: "Verdant is a love letter to the land. We work with local farmers, forage responsibly, and let the season write our menu. Fine dining that happens to be good for the planet.",
      menuItems: [
        { name: "Heirloom Tomato Tart", description: "Puff pastry, basil, olive", price: 480, image: GALLERY[0], badge: "Seasonal" },
        { name: "Charred Leek Velouté", description: "Silky, with truffle oil", price: 420, image: GALLERY[1], badge: "Vegan" },
        { name: "Cedar Plank Salmon", description: "Wild-caught, herb crust", price: 720, image: GALLERY[3], badge: "Signature" },
        { name: "Wild Mushroom Risotto", description: "Carnaroli, parmesan, thyme", price: 540, image: GALLERY[4], badge: "Vegetarian" },
        { name: "Matcha Crème Brûlée", description: "Bitter-sweet, torched sugar", price: 320, image: GALLERY[5], badge: "Dessert" },
        { name: "Beetroot Carpaccio", description: "Whipped feta, walnut", price: 460, image: GALLERY[2], badge: "Plant-based" },
      ],
      gallery: GALLERY.map((url, i) => ({ url, alt: `Gourmet plate ${i + 1}` })),
      reviews: REVIEWS,
      contact: { address: "88 Garden Road, Green Park, Bengaluru 560001", phone: "+91 99887 66550", email: "reserve@verdant.dining" },
      hours: HOURS,
      social: SOCIAL,
    },
  },

  // 4. Café Landing (light)
  {
    id: "tpl-cafe",
    name: "Café Landing",
    category: "cafe",
    description: "Warm, light café page with brown coffee tones.",
    preview: "#A47551",
    theme: { ...LIGHT, accent: "25 38% 45%", accentForeground: "40 33% 97%" },
    content: {
      name: "The Daily Grind",
      tagline: "Coffee · Comfort · Community",
      description: "A cozy neighborhood café for slow mornings, good coffee, and better conversations.",
      heroImage: hero("https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1600&q=80"),
      storyImage: GALLERY[3],
      story: "We roast our beans in small batches and brew with care. The Daily Grind is your living room away from home — plug in, wind down, or meet a friend over a flat white.",
      menuItems: [
        { name: "Flat White", description: "Double ristretto, silky milk", price: 240, image: GALLERY[0], badge: "Popular" },
        { name: "Butter Croissant", description: "Laminated, flaky, golden", price: 160, image: GALLERY[1], badge: "Bakery" },
        { name: "Avocado Toast", description: "Sourdough, chili flakes, lime", price: 320, image: GALLERY[2], badge: "Brunch" },
        { name: "Cold Brew", description: "18-hour steep, smooth", price: 220, image: GALLERY[4], badge: "Refreshing" },
        { name: "Cinnamon Roll", description: "Gooey, with cream cheese", price: 280, image: GALLERY[5], badge: "Sweet" },
        { name: "Espresso Tonic", description: "Shot over tonic & ice", price: 260, image: GALLERY[3], badge: "Summer" },
      ],
      gallery: GALLERY.map((url, i) => ({ url, alt: `Café moment ${i + 1}` })),
      reviews: REVIEWS,
      contact: { address: "12 Coffee Lane, Indiranagar, Bengaluru 560038", phone: "+91 90909 11223", email: "hello@dailygrind.cafe" },
      hours: HOURS,
      social: SOCIAL,
    },
  },

  // 5. Pizzeria (light)
  {
    id: "tpl-pizzeria",
    name: "Pizzeria",
    category: "pizzeria",
    description: "Classic red-and-cream Italian pizzeria landing.",
    preview: "#E53935",
    theme: { ...LIGHT, accent: "4 85% 58%", accentForeground: "0 0% 100%" },
    content: {
      name: "Forno Vivo",
      tagline: "Wood-Fired Italian",
      description: "Neapolitan pizzas blistered in a 450°C wood-fired oven. Simple, honest, delicious.",
      heroImage: hero("https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1600&q=80"),
      storyImage: GALLERY[2],
      story: "Forno Vivo is built around one thing: the perfect dough. Long fermentation, San Marzano tomatoes, fior di latte, and a blazing oven. That's it. That's the magic.",
      menuItems: [
        { name: "Margherita", description: "Tomato, mozzarella, basil", price: 390, image: GALLERY[0], badge: "Classic" },
        { name: "Diavola", description: "Spicy salami, chili, mozzarella", price: 520, image: GALLERY[1], badge: "Hot" },
        { name: "Quattro Formaggi", description: "Four cheeses, creamy", price: 560, image: GALLERY[3], badge: "Cheesy" },
        { name: "Funghi", description: "Wild mushrooms, thyme", price: 480, image: GALLERY[4], badge: "Veg" },
        { name: "Capricciosa", description: "Ham, artichoke, olive", price: 540, image: GALLERY[5], badge: "Loaded" },
        { name: "Nutella Pizza", description: "Sweet, with hazelnut", price: 360, image: GALLERY[2], badge: "Dessert" },
      ],
      gallery: GALLERY.map((url, i) => ({ url, alt: `Pizza ${i + 1}` })),
      reviews: REVIEWS,
      contact: { address: "7 Oven Street, Bandra West, Mumbai 400050", phone: "+91 90000 77665", email: "ciao@fornovivo.it" },
      hours: HOURS,
      social: SOCIAL,
    },
  },

  // 6. Artisan Bakery (light)
  {
    id: "tpl-bakery",
    name: "Artisan Bakery",
    category: "bakery",
    description: "Soft pink-and-cream bakery landing for sweet treats.",
    preview: "#EC6F9E",
    theme: { ...LIGHT, accent: "338 72% 65%", accentForeground: "340 30% 12%" },
    content: {
      name: "Flour & Bloom",
      tagline: "Baked Fresh Daily",
      description: "Sourdough, pastries, and celebration cakes made by hand, from scratch, every single morning.",
      heroImage: hero("https://images.unsplash.com/photo-1486427944299-d1955d23e34e?auto=format&fit=crop&w=1600&q=80"),
      storyImage: GALLERY[4],
      story: "Flour & Bloom started in a home kitchen with a single sourdough starter named 'Bertha'. Today we bake for the whole neighborhood — but the recipe (and the love) hasn't changed.",
      menuItems: [
        { name: "Sourdough Loaf", description: "48-hr ferment, crusty", price: 280, image: GALLERY[0], badge: "Daily" },
        { name: "Pain au Chocolat", description: "Buttery, dark chocolate", price: 180, image: GALLERY[1], badge: "Viennoiserie" },
        { name: "Red Velvet Cake", description: "Cream cheese frosting", price: 420, image: GALLERY[3], badge: "Celebration" },
        { name: "Cinnamon Swirl", description: "Soft bun, glazed", price: 160, image: GALLERY[5], badge: "Cozy" },
        { name: "Macarons (6)", description: "Assorted flavors", price: 360, image: GALLERY[2], badge: "French" },
        { name: "Banana Bread", description: "Walnuts, honey", price: 220, image: GALLERY[4], badge: "Classic" },
      ],
      gallery: GALLERY.map((url, i) => ({ url, alt: `Baked good ${i + 1}` })),
      reviews: REVIEWS,
      contact: { address: "23 Butter Lane, Koramangala, Bengaluru 560034", phone: "+91 87766 55443", email: "hello@flourandbloom.co" },
      hours: HOURS,
      social: SOCIAL,
    },
  },

  // 7. Bar & Grill
  {
    id: "tpl-bar",
    name: "Bar & Grill",
    category: "bar-grill",
    description: "Dark, amber-lit steakhouse and cocktail bar landing.",
    preview: "#FFB300",
    theme: { background: "30 12% 6%", surface: "30 12% 11%", surface2: "30 12% 16%", foreground: "35 30% 95%", muted: "35 12% 60%", border: "30 12% 20%", accent: "43 100% 50%", accentForeground: "30 12% 6%" },
    content: {
      name: "Ember & Oak",
      tagline: "Smoke · Sear · Sip",
      description: "Prime cuts over open flame, craft cocktails, and a room that hums after dark.",
      heroImage: hero("https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=1600&q=80"),
      storyImage: GALLERY[3],
      story: "Ember & Oak is where the grill is the hero. We age our beef in-house, char over oak, and pair every bite with a drink built by hand. Come hungry, leave happy.",
      menuItems: [
        { name: "Tomahawk Ribeye", description: "600g, bone-in, flamed", price: 2400, image: GALLERY[0], badge: "Showstopper" },
        { name: "Smoked Old Fashioned", description: "Bourbon, bitters, oak", price: 680, image: GALLERY[1], badge: "Signature" },
        { name: "Grilled Prawns", description: "Garlic butter, char", price: 880, image: GALLERY[4], badge: "Seafood" },
        { name: "Brisket Burger", description: "12-hr brisket, cheddar", price: 560, image: GALLERY[2], badge: "Crowd fav" },
        { name: "Burnt Basque Cheesecake", description: "Caramelized, creamy", price: 380, image: GALLERY[5], badge: "Dessert" },
        { name: "Spicy Margarita", description: "Tequila, lime, chili salt", price: 620, image: GALLERY[3], badge: "Cocktail" },
      ],
      gallery: GALLERY.map((url, i) => ({ url, alt: `Bar & grill ${i + 1}` })),
      reviews: REVIEWS,
      contact: { address: "55 Neon Avenue, Lower Parel, Mumbai 400013", phone: "+91 88000 12345", email: "reserve@emberandoak.bar" },
      hours: [
        { day: "Tuesday – Thursday", time: "5:00 PM – 12:00 AM" },
        { day: "Friday – Saturday", time: "5:00 PM – 1:30 AM" },
        { day: "Sunday", time: "12:00 PM – 11:00 PM" },
      ],
      social: SOCIAL,
    },
  },

  // 8. Sushi Bar (light)
  {
    id: "tpl-sushi",
    name: "Sushi Bar",
    category: "sushi",
    description: "Clean, indigo-accented Japanese sushi landing.",
    preview: "#5C6BC0",
    theme: { ...LIGHT, accent: "231 48% 56%", accentForeground: "0 0% 100%" },
    content: {
      name: "Tsuki",
      tagline: "江戸前 寿司 · Edomae Sushi",
      description: "Traditional nigiri and maki prepared with the precision of an art form.",
      heroImage: hero("https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=1600&q=80"),
      storyImage: GALLERY[2],
      story: "At Tsuki, every grain of rice is seasoned by hand and every slice tells a story of the sea. We honor the Edomae tradition while welcoming the curious and the curious-minded.",
      menuItems: [
        { name: "Salmon Nigiri (2 pc)", description: "Ora king, hand-pressed", price: 480, image: GALLERY[0], badge: "Classic" },
        { name: "Dragon Roll", description: "Eel, avocado, cucumber", price: 680, image: GALLERY[1], badge: "Signature" },
        { name: "Spicy Tuna Roll", description: "Tuna, mayo, chili", price: 520, image: GALLERY[3], badge: "Spicy" },
        { name: "Tempura Udon", description: "Dashi broth, prawns", price: 560, image: GALLERY[4], badge: "Warm" },
        { name: "Miso Black Cod", description: "48-hr marinated, grilled", price: 920, image: GALLERY[5], badge: "Chef" },
        { name: "Edamame", description: "Sea salt, steamed", price: 220, image: GALLERY[2], badge: "Starter" },
      ],
      gallery: GALLERY.map((url, i) => ({ url, alt: `Sushi ${i + 1}` })),
      reviews: REVIEWS,
      contact: { address: "9 Sakura Street, Defence Colony, Delhi 110024", phone: "+91 81122 33445", email: "namaste@tsuki.jp" },
      hours: HOURS,
      social: SOCIAL,
    },
  },

  // 9. Food Truck
  {
    id: "tpl-foodtruck",
    name: "Food Truck",
    category: "food-truck",
    description: "Bold lime-green roaming food-truck landing.",
    preview: "#C0CA33",
    theme: { background: "80 15% 6%", surface: "80 14% 11%", surface2: "80 14% 16%", foreground: "80 25% 95%", muted: "80 12% 62%", border: "80 12% 20%", accent: "68 55% 50%", accentForeground: "80 15% 6%" },
    content: {
      name: "Nomad Eats",
      tagline: "Tracked Flavor, Anywhere",
      description: "We roll through the city serving bold bites you can't get sitting still. Find us, follow us, eat well.",
      heroImage: hero("https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=1600&q=80"),
      storyImage: GALLERY[5],
      story: "Nomad Eats is a kitchen on wheels. One truck, one chef, and a rotating menu of street-inspired eats that change with our mood and the market. Catch us on the gram for today's spot.",
      menuItems: [
        { name: "Loaded Fries", description: "Cheese, jalapeño, bacon", price: 220, image: GALLERY[0], badge: "Bestseller" },
        { name: "BBQ Pulled Jackfruit", description: "Sliders, slaw, bun", price: 260, image: GALLERY[1], badge: "Veg" },
        { name: "Korean Fried Chicken", description: "Double-fried, gochujang", price: 320, image: GALLERY[2], badge: "Crunchy" },
        { name: "Smash Burger", description: "Two patties, secret sauce", price: 300, image: GALLERY[3], badge: "Classic" },
        { name: "Elote Cup", description: "Grilled corn, lime, cotija", price: 180, image: GALLERY[4], badge: "Side" },
        { name: "Churro Bites", description: "Cinnamon sugar, dip", price: 160, image: GALLERY[5], badge: "Sweet" },
      ],
      gallery: GALLERY.map((url, i) => ({ url, alt: `Truck food ${i + 1}` })),
      reviews: REVIEWS,
      contact: { address: "Roaming — check @nomadeats for today's location", phone: "+91 70000 99887", email: "yo@nomadeats.truck" },
      hours: [
        { day: "Mon – Fri", time: "11:00 AM – 9:00 PM" },
        { day: "Saturday", time: "10:00 AM – 11:00 PM" },
        { day: "Sunday", time: "12:00 PM – 8:00 PM" },
      ],
      social: SOCIAL,
    },
  },

  // 10. Vegan Kitchen (light)
  {
    id: "tpl-vegan",
    name: "Vegan Kitchen",
    category: "vegan",
    description: "Fresh green plant-based kitchen landing.",
    preview: "#43A047",
    theme: { ...LIGHT, accent: "122 45% 42%", accentForeground: "0 0% 100%" },
    content: {
      name: "Root & Leaf",
      tagline: "Plants, Perfectly Done",
      description: "100% plant-based comfort food that's good for you and the planet — no compromise on taste.",
      heroImage: hero("https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1600&q=80"),
      storyImage: GALLERY[4],
      story: "Root & Leaf proves plants can be the star of the plate. We ferment, smoke, and char vegetables into dishes that surprise even the most devoted carnivore. Wholesome never meant boring.",
      menuItems: [
        { name: "Jackfruit Tacos", description: "Pulled, spiced, corn tortilla", price: 320, image: GALLERY[0], badge: "Bestseller" },
        { name: "Cashew Mac & Cheese", description: "Creamy, baked crumb", price: 380, image: GALLERY[1], badge: "Comfort" },
        { name: "Buddha Bowl", description: "Quinoa, roast veg, tahini", price: 420, image: GALLERY[2], badge: "Healthy" },
        { name: "Mushroom Steak", description: "Portobello, chimichurri", price: 480, image: GALLERY[3], badge: "Savoury" },
        { name: "Coconut Panna Cotta", description: "Mango, toasted coconut", price: 260, image: GALLERY[5], badge: "Dessert" },
        { name: "Smoky Tempeh Burger", description: "House patty, pickles", price: 360, image: GALLERY[4], badge: "Grill" },
      ],
      gallery: GALLERY.map((url, i) => ({ url, alt: `Plant plate ${i + 1}` })),
      reviews: REVIEWS,
      contact: { address: "14 Greenway, HSR Layout, Bengaluru 560102", phone: "+91 80808 70707", email: "eat@rootandleaf.veg" },
      hours: HOURS,
      social: SOCIAL,
    },
  },
] as const;
