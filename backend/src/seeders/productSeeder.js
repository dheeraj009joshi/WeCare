const { getModels } = require('../models');

const sampleProducts = [
  {
    name: "Ashwagandha",
    price: 299.00,
    stock: 50,
    category: "Stress Relief",
    prescription: false,
    image: "/uploads/ayurvedic/ashwagandha.jpg",
    dosha: "Vata-Kapha",
    benefits: "Reduces stress, improves sleep, boosts immunity",
    description: "Ashwagandha is an ancient medicinal herb that has been used for thousands of years in Ayurveda. It's classified as an adaptogen, meaning it can help your body manage stress.",
    manufacturer: "Ayurvedic Herbs Co.",
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    isActive: true
  },
  {
    name: "Triphala",
    price: 199.00,
    stock: 75,
    category: "Digestion",
    prescription: false,
    image: "/uploads/ayurvedic/triphala.jpg",
    dosha: "All Doshas",
    benefits: "Improves digestion, detoxifies body, supports gut health",
    description: "Triphala is a traditional Ayurvedic herbal formulation consisting of three fruits: Amalaki, Bibhitaki, and Haritaki. It's known for its gentle cleansing and digestive support properties.",
    manufacturer: "Ayurvedic Herbs Co.",
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    isActive: true
  },
  {
    name: "Brahmi",
    price: 249.00,
    stock: 40,
    category: "Brain Health",
    prescription: false,
    image: "/uploads/ayurvedic/brahmi.jpg",
    dosha: "Vata-Pitta",
    benefits: "Enhances memory, improves concentration, reduces anxiety",
    description: "Brahmi is a traditional Ayurvedic herb known for its cognitive-enhancing properties. It's often used to improve memory, concentration, and overall brain function.",
    manufacturer: "Ayurvedic Herbs Co.",
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    isActive: true
  },
  {
    name: "Giloy",
    price: 179.00,
    stock: 60,
    category: "Immunity",
    prescription: false,
    image: "/uploads/ayurvedic/giloy.jpg",
    dosha: "All Doshas",
    benefits: "Boosts immunity, fights infections, reduces fever",
    description: "Giloy, also known as Guduchi, is a powerful immunomodulator in Ayurveda. It's used to boost the body's natural defense mechanisms and fight various infections.",
    manufacturer: "Ayurvedic Herbs Co.",
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    isActive: true
  },
  {
    name: "Neem",
    price: 159.00,
    stock: 80,
    category: "Skin Health",
    prescription: false,
    image: "/uploads/ayurvedic/neem.jpg",
    dosha: "Pitta-Kapha",
    benefits: "Purifies blood, treats skin conditions, antibacterial",
    description: "Neem is a versatile herb known for its purifying properties. It's used to cleanse the blood, treat skin conditions, and fight bacterial infections.",
    manufacturer: "Ayurvedic Herbs Co.",
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    isActive: true
  },
  {
    name: "Turmeric",
    price: 129.00,
    stock: 100,
    category: "Anti-inflammatory",
    prescription: false,
    image: "/uploads/ayurvedic/turmeric.jpg",
    dosha: "All Doshas",
    benefits: "Reduces inflammation, antioxidant, supports joint health",
    description: "Turmeric is a golden spice with powerful anti-inflammatory and antioxidant properties. It's used to reduce inflammation, support joint health, and boost overall immunity.",
    manufacturer: "Ayurvedic Herbs Co.",
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    isActive: true
  },
  {
    name: "Shilajit",
    price: 399.00,
    stock: 30,
    category: "Energy & Vitality",
    prescription: false,
    image: "/uploads/ayurvedic/shilajit.jpg",
    dosha: "Vata",
    benefits: "Boosts energy, enhances stamina, anti-aging",
    description: "Shilajit is a natural substance found in the Himalayas, known for its rejuvenating properties. It's used to boost energy, enhance stamina, and support overall vitality.",
    manufacturer: "Ayurvedic Herbs Co.",
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    isActive: true
  },
  {
    name: "Guggul",
    price: 229.00,
    stock: 45,
    category: "Cholesterol Management",
    prescription: false,
    image: "/uploads/ayurvedic/guggul.jpg",
    dosha: "Kapha",
    benefits: "Lowers cholesterol, supports weight loss, anti-inflammatory",
    description: "Guggul is a traditional Ayurvedic herb used for managing cholesterol levels and supporting healthy weight management. It has potent anti-inflammatory properties.",
    manufacturer: "Ayurvedic Herbs Co.",
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    isActive: true
  },
  {
    name: "Amla",
    price: 189.00,
    stock: 70,
    category: "Immunity",
    prescription: false,
    image: "/uploads/ayurvedic/amla.jpg",
    dosha: "Vata-Pitta",
    benefits: "Rich in Vitamin C, boosts immunity, antioxidant",
    description: "Amla, also known as Indian Gooseberry, is one of the richest natural sources of Vitamin C. It's used to boost immunity and provide powerful antioxidant support.",
    manufacturer: "Ayurvedic Herbs Co.",
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    isActive: true
  },
  {
    name: "Tulsi",
    price: 149.00,
    stock: 90,
    category: "Respiratory Health",
    prescription: false,
    image: "/uploads/ayurvedic/tulsi.jpg",
    dosha: "Kapha",
    benefits: "Supports respiratory health, reduces stress, antibacterial",
    description: "Tulsi, also known as Holy Basil, is a sacred herb in Ayurveda. It's used to support respiratory health, reduce stress, and fight bacterial infections.",
    manufacturer: "Ayurvedic Herbs Co.",
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    isActive: true
  }
];

const seedProducts = async () => {
  try {
    const { Product } = getModels();
    // Check if products already exist
    const existingProducts = await Product.count();
    
    if (existingProducts === 0) {
      await Product.bulkCreate(sampleProducts);
      console.log('✅ Sample products seeded successfully!');
    } else {
      console.log('ℹ️ Products already exist, skipping seeding.');
    }
  } catch (error) {
    console.error('❌ Error seeding products:', error);
  }
};

module.exports = { seedProducts };
