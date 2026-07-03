export type ToyotaModelKnowledge = {
  slug: string;
  name: string;
  category: string;
  startingPriceRange: string;
  fuelTypes: string[];
  transmissionOptions: string[];
  seatingCapacity: string;
  idealFor: string[];
  keyHighlights: string[];
  commonCustomerQuestions: string[];
  recommendationTags: string[];
};

export const toyotaKnowledge: ToyotaModelKnowledge[] = [
  {
    slug: "glanza",
    name: "Glanza",
    category: "Premium hatchback",
    startingPriceRange: "Approx. ₹6.9 lakh onwards, verify current ex-showroom price with dealership",
    fuelTypes: ["Petrol"],
    transmissionOptions: ["Manual", "AMT"],
    seatingCapacity: "5",
    idealFor: ["City commuting", "First-time buyers", "Fuel-efficient daily use"],
    keyHighlights: [
      "Compact and easy to drive in urban traffic",
      "Good fuel efficiency for daily use",
      "Feature-rich cabin for the segment",
    ],
    commonCustomerQuestions: [
      "Is the Glanza good for city driving?",
      "Does the Glanza have automatic transmission?",
      "What is the mileage of the Glanza?",
    ],
    recommendationTags: ["city-car", "first-time-buyer", "fuel-efficient", "compact"],
  },
  {
    slug: "urban-cruiser-taisor",
    name: "Urban Cruiser Taisor",
    category: "Compact SUV",
    startingPriceRange: "Approx. ₹7.7 lakh onwards, verify current ex-showroom price with dealership",
    fuelTypes: ["Petrol", "Turbo-petrol"],
    transmissionOptions: ["Manual", "AMT", "Automatic"],
    seatingCapacity: "5",
    idealFor: ["Urban families", "SUV styling", "Daily commuting"],
    keyHighlights: [
      "SUV-like stance in a compact size",
      "Easy to park and maneuver",
      "Suitable for buyers wanting style and practicality",
    ],
    commonCustomerQuestions: [
      "Is the Taisor a proper SUV?",
      "What mileage does the Urban Cruiser Taisor offer?",
      "Does it have automatic transmission?",
    ],
    recommendationTags: ["compact-suv", "city-use", "style-focused", "automatic-friendly"],
  },
  {
    slug: "rumion",
    name: "Rumion",
    category: "MPV",
    startingPriceRange: "Approx. ₹10.4 lakh onwards, verify current ex-showroom price with dealership",
    fuelTypes: ["Petrol", "CNG"],
    transmissionOptions: ["Manual", "Automatic"],
    seatingCapacity: "7",
    idealFor: ["Large families", "Cabin space", "Practical people mover"],
    keyHighlights: [
      "Flexible 7-seater layout",
      "Family-friendly cabin space",
      "Available with efficient fuel options",
    ],
    commonCustomerQuestions: [
      "Is Rumion a 7-seater?",
      "Does Rumion have CNG?",
      "Is Rumion good for family travel?",
    ],
    recommendationTags: ["family-car", "7-seater", "practical", "value"],
  },
  {
    slug: "urban-cruiser-hyryder",
    name: "Urban Cruiser Hyryder",
    category: "Compact SUV",
    startingPriceRange: "Approx. ₹11.7 lakh onwards, verify current ex-showroom price with dealership",
    fuelTypes: ["Petrol", "Strong hybrid", "CNG"],
    transmissionOptions: ["Manual", "Automatic", "e-CVT"],
    seatingCapacity: "5",
    idealFor: ["Mileage-conscious buyers", "Modern city SUV buyers", "Hybrid interest"],
    keyHighlights: [
      "Hybrid options for better efficiency",
      "Balanced SUV design and comfort",
      "Good fit for daily city use and weekend trips",
    ],
    commonCustomerQuestions: [
      "Is Hyryder available in hybrid?",
      "What is the mileage of the Hyryder?",
      "Which Hyryder variant is best for family use?",
    ],
    recommendationTags: ["hybrid", "fuel-efficient", "modern-suv", "city-and-highway"],
  },
  {
    slug: "innova-crysta",
    name: "Innova Crysta",
    category: "Premium MPV",
    startingPriceRange: "Approx. ₹19.9 lakh onwards, verify current ex-showroom price with dealership",
    fuelTypes: ["Diesel"],
    transmissionOptions: ["Manual", "Automatic"],
    seatingCapacity: "7 or 8",
    idealFor: ["Long-distance travel", "Large families", "Comfort-focused buyers"],
    keyHighlights: [
      "Known for comfort and reliability",
      "Popular for intercity travel and family use",
      "Spacious cabin and strong road presence",
    ],
    commonCustomerQuestions: [
      "Is the Innova Crysta good for long trips?",
      "Does the Crysta come in automatic?",
      "How many seats does the Crysta have?",
    ],
    recommendationTags: ["premium-mpv", "family-travel", "comfort", "reliable"],
  },
  {
    slug: "innova-hycross",
    name: "Innova Hycross",
    category: "Premium MPV",
    startingPriceRange: "Approx. ₹19.9 lakh onwards, verify current ex-showroom price with dealership",
    fuelTypes: ["Petrol", "Strong hybrid"],
    transmissionOptions: ["Automatic", "e-CVT"],
    seatingCapacity: "7 or 8",
    idealFor: ["Hybrid buyers", "Premium family use", "Comfort and efficiency balance"],
    keyHighlights: [
      "Hybrid option for improved fuel efficiency",
      "Modern design and premium interior feel",
      "Great for families wanting comfort and technology",
    ],
    commonCustomerQuestions: [
      "Is the Innova Hycross a hybrid?",
      "What is the seating capacity of Hycross?",
      "Is Hycross better than Crysta?",
    ],
    recommendationTags: ["hybrid-mpv", "premium-family", "comfortable", "efficient"],
  },
  {
    slug: "fortuner",
    name: "Fortuner",
    category: "Full-size SUV",
    startingPriceRange: "Approx. ₹33.4 lakh onwards, verify current ex-showroom price with dealership",
    fuelTypes: ["Petrol", "Diesel"],
    transmissionOptions: ["Manual", "Automatic"],
    seatingCapacity: "7",
    idealFor: ["Powerful SUV buyers", "Highway travel", "Premium SUV seekers"],
    keyHighlights: [
      "Strong road presence and brand value",
      "Suitable for rough roads and long highway drives",
      "Popular choice in the premium SUV segment",
    ],
    commonCustomerQuestions: [
      "Is the Fortuner available in diesel?",
      "What is the mileage of Fortuner?",
      "Is Fortuner good for long drives?",
    ],
    recommendationTags: ["premium-suv", "powerful", "road-presence", "highway"],
  },
  {
    slug: "legender",
    name: "Legender",
    category: "Premium SUV",
    startingPriceRange: "Approx. ₹43.7 lakh onwards, verify current ex-showroom price with dealership",
    fuelTypes: ["Diesel"],
    transmissionOptions: ["Automatic"],
    seatingCapacity: "7",
    idealFor: ["Style-focused SUV buyers", "Premium comfort", "Feature-rich Fortuner alternative"],
    keyHighlights: [
      "Premium and sporty design",
      "Comfort-oriented with strong road presence",
      "Positioned as a more distinctive Fortuner variant",
    ],
    commonCustomerQuestions: [
      "How is Legender different from Fortuner?",
      "Does Legender come only in automatic?",
      "Is Legender worth the premium?",
    ],
    recommendationTags: ["premium-suv", "stylish", "automatic", "flagship"],
  },
  {
    slug: "hilux",
    name: "Hilux",
    category: "Lifestyle pickup",
    startingPriceRange: "Approx. ₹30.4 lakh onwards, verify current ex-showroom price with dealership",
    fuelTypes: ["Diesel"],
    transmissionOptions: ["Manual", "Automatic"],
    seatingCapacity: "5",
    idealFor: ["Adventure buyers", "Utility and lifestyle use", "Rough-road conditions"],
    keyHighlights: [
      "Pickup-style practicality with rugged capability",
      "Suitable for adventure and utility needs",
      "Strong off-road oriented image",
    ],
    commonCustomerQuestions: [
      "Is Hilux good for off-roading?",
      "Can Hilux be used as a family vehicle?",
      "What kind of buyers choose Hilux?",
    ],
    recommendationTags: ["lifestyle-pickup", "rugged", "adventure", "utility"],
  },
  {
    slug: "camry",
    name: "Camry",
    category: "Premium sedan",
    startingPriceRange: "Approx. ₹46.2 lakh onwards, verify current ex-showroom price with dealership",
    fuelTypes: ["Strong hybrid"],
    transmissionOptions: ["Automatic"],
    seatingCapacity: "5",
    idealFor: ["Executive buyers", "Comfort-first sedan buyers", "Hybrid preference"],
    keyHighlights: [
      "Smooth and premium sedan experience",
      "Hybrid powertrain for efficiency",
      "Comfortable for chauffeur-driven or self-driven use",
    ],
    commonCustomerQuestions: [
      "Is Camry only hybrid?",
      "Is Camry comfortable for long drives?",
      "Why choose Camry over SUVs?",
    ],
    recommendationTags: ["premium-sedan", "hybrid", "executive", "comfort"],
  },
  {
    slug: "vellfire",
    name: "Vellfire",
    category: "Luxury MPV",
    startingPriceRange: "Approx. ₹1.22 crore onwards, verify current ex-showroom price with dealership",
    fuelTypes: ["Hybrid"],
    transmissionOptions: ["Automatic"],
    seatingCapacity: "7",
    idealFor: ["Luxury buyers", "Chauffeur-driven comfort", "Top-end family travel"],
    keyHighlights: [
      "Luxury-first cabin experience",
      "Excellent comfort for passengers",
      "Premium flagship MPV in Toyota lineup",
    ],
    commonCustomerQuestions: [
      "Is Vellfire a luxury car?",
      "How many seats does Vellfire have?",
      "Is Vellfire suitable for chauffeur use?",
    ],
    recommendationTags: ["luxury-mpv", "premium", "chauffeur", "flagship"],
  },
];
