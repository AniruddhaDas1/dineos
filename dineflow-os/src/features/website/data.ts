export const galleryImages = [
  {
    id: "g1",
    src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    alt: "Restaurant interior with warm ambient lighting",
  },
  {
    id: "g2",
    src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
    alt: "Plated fine-dining dish with artistic presentation",
  },
  {
    id: "g3",
    src: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80",
    alt: "Chef preparing dishes in an open kitchen",
  },
  {
    id: "g4",
    src: "https://images.unsplash.com/photo-1550966871-3ed3cdb51f3a?auto=format&fit=crop&w=800&q=80",
    alt: "Bar area with crafted cocktails",
  },
  {
    id: "g5",
    src: "https://images.unsplash.com/photo-1594232383460-4e5a05b68b07?auto=format&fit=crop&w=800&q=80",
    alt: "Intimate candlelit dining table setup",
  },
  {
    id: "g6",
    src: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=800&q=80",
    alt: "Spices and fresh ingredients artfully arranged",
  },
];

export interface Review {
  id: string;
  name: string;
  date: string;
  rating: number;
  text: string;
}

export const reviews: Review[] = [
  {
    id: "r1",
    name: "Arjun Mehta",
    date: "2026-06-12",
    rating: 5,
    text: "An extraordinary dining experience. The Butter Chicken was the best I've had outside of Delhi, and the service was impeccable. Saffron & Smoke has become our go-to for special occasions.",
  },
  {
    id: "r2",
    name: "Priya Sharma",
    date: "2026-05-28",
    rating: 5,
    text: "The ambiance is absolutely stunning — dark, moody, and intimate. The Paneer Tikka was smoky perfection. Loved the QR ordering system, very modern and seamless.",
  },
  {
    id: "r3",
    name: "Rohan Kapoor",
    date: "2026-06-03",
    rating: 4,
    text: "Great food, great vibe. The Hyderabadi Biryani was aromatic and authentic. Only wish they had more parking. The Gulab Jamun was a perfect finish to the meal.",
  },
];

export const contactInfo = {
  address: "42 Art District, Jubilee Hills, Hyderabad 500033",
  phone: "+91 98765 43210",
  email: "hello@saffronandsmoke.in",
};

export const hours = [
  { day: "Monday – Thursday", time: "12:00 PM – 11:00 PM" },
  { day: "Friday – Saturday", time: "12:00 PM – 12:00 AM" },
  { day: "Sunday", time: "12:00 PM – 10:30 PM" },
];

export const socialLinks = [
  { platform: "Instagram", url: "#" },
  { platform: "Facebook", url: "#" },
  { platform: "X", url: "#" },
];
