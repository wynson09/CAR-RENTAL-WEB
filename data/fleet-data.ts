import { Car } from "@/components/fleet";

export const fleetData: Car[] = [
  {
    id: 1,
    name: "Group F - AUV (7 seater) A/T",
    image: "/images/card/card1.jpg", // Using existing images from your project
    price: "₱ 3,350",
    category: "SUV",
    passengers: 7,
    bags: 4,
    doors: 5,
    transmission: "A",
    features: [
      "ABS", "Audio System", "Driver's Airbag", "Passenger Air Bag",
      "Electric windows", "USB port", "Electric door lock", "Fuel Type - Diesel"
    ]
  },
  {
    id: 2,
    name: "Group E - Sedan (5 seater) A/T",
    image: "/images/card/card2.jpg",
    price: "₱ 2,800",
    category: "Sedan",
    passengers: 5,
    bags: 3,
    doors: 4,
    transmission: "A",
    features: [
      "ABS", "Audio System", "Driver's Airbag", "Passenger Air Bag",
      "Electric windows", "USB port", "Air Conditioning", "Power Steering"
    ]
  },
  {
    id: 3,
    name: "Group D - Hatchback (5 seater) M/T",
    image: "/images/card/card3.jpg",
    price: "₱ 2,200",
    category: "Hatchback",
    passengers: 5,
    bags: 2,
    doors: 5,
    transmission: "M",
    features: [
      "ABS", "Audio System", "Driver's Airbag",
      "Electric windows", "USB port", "Air Conditioning", "Fuel Type - Gasoline"
    ]
  },
  {
    id: 4,
    name: "Group A - Van (15 seater) A/T",
    image: "/images/card/card4.jpg",
    price: "₱ 4,500",
    category: "Van",
    passengers: 15,
    bags: 8,
    doors: 4,
    transmission: "A",
    features: [
      "ABS", "Audio System", "Driver's Airbag", "Passenger Air Bag",
      "Electric windows", "USB port", "Air Conditioning", "Fuel Type - Diesel"
    ]
  },
  {
    id: 5,
    name: "Group C - Pickup (5 seater) M/T",
    image: "/images/card/card5.jpg",
    price: "₱ 3,000",
    category: "Pickup",
    passengers: 5,
    bags: 5,
    doors: 4,
    transmission: "M",
    features: [
      "ABS", "Audio System", "Driver's Airbag",
      "Electric windows", "USB port", "4WD", "Fuel Type - Diesel"
    ]
  },
  {
    id: 6,
    name: "Group B - MPV (8 seater) A/T",
    image: "/images/card/card6.jpg",
    price: "₱ 2,950",
    category: "MPV",
    passengers: 8,
    bags: 4,
    doors: 5,
    transmission: "A",
    features: [
      "ABS", "Audio System", "Driver's Airbag", "Passenger Air Bag",
      "Electric windows", "USB port", "Air Conditioning", "Fuel Type - Gasoline"
    ]
  },
  // Add more sample cars for better filtering demonstration
  {
    id: 7,
    name: "Compact Sedan - City (5 seater) A/T",
    image: "/images/card/card7.jpg",
    price: "₱ 2,500",
    category: "Sedan",
    passengers: 5,
    bags: 3,
    doors: 4,
    transmission: "A",
    features: [
      "ABS", "Audio System", "Driver's Airbag", "Passenger Air Bag",
      "Electric windows", "USB port", "Air Conditioning", "Eco Mode"
    ]
  },
  {
    id: 8,
    name: "Luxury SUV - Fortuner (7 seater) A/T",
    image: "/images/card/card8.jpg",
    price: "₱ 4,200",
    category: "SUV",
    passengers: 7,
    bags: 5,
    doors: 5,
    transmission: "A",
    features: [
      "ABS", "Audio System", "Driver's Airbag", "Passenger Air Bag",
      "Electric windows", "USB port", "4WD", "Leather Seats"
    ]
  },
  {
    id: 9,
    name: "Family MPV - Xpander (7 seater) A/T",
    image: "/images/card/card9.jpg",
    price: "₱ 3,200",
    category: "MPV",
    passengers: 7,
    bags: 4,
    doors: 5,
    transmission: "A",
    features: [
      "ABS", "Audio System", "Driver's Airbag", "Passenger Air Bag",
      "Electric windows", "USB port", "Air Conditioning", "Touchscreen"
    ]
  }
];