export interface CarListing {
  id: string;
  isPromo: boolean;
  colorVariant: string[];
  priorityLevel: 1 | 2 | 3 | 4 | 5;
  name: string;
  image: string;
  price: string;
  category: string;
  passengers: string;
  bags: string;
  transmission: string;
  features: string[];
  createdDate: Date;
  updatedDate: Date;
}

// Sample car listings data
export const carListingsData: CarListing[] = [
  {
    id: '1',
    isPromo: true,
    colorVariant: ['#FF0000', '#0000FF', '#FFFFFF'],
    priorityLevel: 5,
    name: 'Toyota Camry 2024',
    image: '/images/all-img/slider-1.jpg',
    price: '₱2,500/day',
    category: 'Sedan',
    passengers: '5',
    bags: '4',
    transmission: 'Automatic',
    features: ['GPS Navigation', 'Backup Camera', 'Bluetooth', 'Air Conditioning'],
    createdDate: new Date('2024-01-15'),
    updatedDate: new Date('2024-01-20'),
  },
  {
    id: '2',
    isPromo: false,
    colorVariant: ['#000000', '#C0C0C0'],
    priorityLevel: 4,
    name: 'Honda CR-V 2024',
    image: '/images/all-img/rd-1.jpg',
    price: '₱3,200/day',
    category: 'SUV',
    passengers: '7',
    bags: '6',
    transmission: 'Automatic',
    features: ['4WD', 'Lane Assist', 'Adaptive Cruise Control', 'Sunroof'],
    createdDate: new Date('2024-01-10'),
    updatedDate: new Date('2024-01-15'),
  },
  {
    id: '3',
    isPromo: true,
    colorVariant: ['#FFFFFF', '#808080'],
    priorityLevel: 3,
    name: 'Nissan Altima 2024',
    image: '/images/all-img/cover-2.jpg',
    price: '₱2,200/day',
    category: 'Sedan',
    passengers: '5',
    bags: '3',
    transmission: 'CVT',
    features: ['ProPILOT Assist', 'Remote Start', 'Apple CarPlay', 'Android Auto'],
    createdDate: new Date('2024-01-08'),
    updatedDate: new Date('2024-01-12'),
  },
  {
    id: '4',
    isPromo: false,
    colorVariant: ['#0000FF', '#008000', '#FF0000'],
    priorityLevel: 2,
    name: 'Ford Explorer 2024',
    image: '/images/all-img/blog-1.jpg',
    price: '₱3,800/day',
    category: 'SUV',
    passengers: '8',
    bags: '8',
    transmission: 'Automatic',
    features: ['Terrain Management', 'Wireless Charging', '360-degree Camera', 'Towing Package'],
    createdDate: new Date('2024-01-05'),
    updatedDate: new Date('2024-01-10'),
  },
  {
    id: '5',
    isPromo: true,
    colorVariant: ['#C0C0C0', '#000000'],
    priorityLevel: 4,
    name: 'Hyundai Elantra 2024',
    image: '/images/all-img/blog-2.jpg',
    price: '₱2,000/day',
    category: 'Sedan',
    passengers: '5',
    bags: '3',
    transmission: 'Manual',
    features: ['SmartSense Safety', 'Wireless Android Auto', 'Digital Key', 'Bose Audio'],
    createdDate: new Date('2024-01-03'),
    updatedDate: new Date('2024-01-08'),
  },
  {
    id: '6',
    isPromo: false,
    colorVariant: ['#FFFFFF', '#8B4513'],
    priorityLevel: 5,
    name: 'Chevrolet Tahoe 2024',
    image: '/images/all-img/blog-3.jpg',
    price: '₱4,500/day',
    category: 'SUV',
    passengers: '9',
    bags: '10',
    transmission: 'Automatic',
    features: [
      'Max Trailering Package',
      'Magnetic Ride Control',
      'Super Cruise',
      'Rear Entertainment',
    ],
    createdDate: new Date('2024-01-01'),
    updatedDate: new Date('2024-01-05'),
  },
];

export const carCategories = ['All', 'Hatchback', 'Sedan', 'SUV', 'MPV', 'Pickup', 'Van'];
