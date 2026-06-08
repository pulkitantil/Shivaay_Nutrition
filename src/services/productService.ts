export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  status: 'In Stock' | 'Limited Stock' | 'Out of Stock';
  image: string;
  description: string;
}

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Shivaay Whey Gold Isolate',
    brand: 'Shivaay Nutrition',
    category: 'Whey Protein',
    price: 7499,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=600&auto=format&fit=crop',
    description: '100% Premium Whey Isolate. 25g Protein, 0g Sugar, 5.5g BCAAs per serving. Rapid absorption formula for maximum muscle recovery.'
  },
  {
    id: '2',
    name: 'Optimum Nutrition (ON) Gold Standard',
    brand: 'Optimum Nutrition',
    category: 'Whey Protein',
    price: 6899,
    status: 'Limited Stock',
    image: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=600&auto=format&fit=crop',
    description: 'The world\'s best-selling Whey Protein powder. Packed with 24g of high-quality whey isolate & concentrate blend.'
  },
  {
    id: '3',
    name: 'Shivaay Hyper Mass Gainer',
    brand: 'Shivaay Nutrition',
    category: 'Mass Gainers',
    price: 3999,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1605296867304-46d5465a25f1?q=80&w=600&auto=format&fit=crop',
    description: 'Elite calorie-dense mass gainer. 50g Premium Protein blend and 250g energy-sustaining carbohydrates. Formulated for hardgainers.'
  },
  {
    id: '4',
    name: 'Labrada Muscle Mass Gainer',
    brand: 'Labrada',
    category: 'Mass Gainers',
    price: 4999,
    status: 'Out of Stock',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop',
    description: 'High-quality gainer for rapid muscle growth. All-in-one dietary shake packed with amino acids, creatine, and glutamine.'
  },
  {
    id: '5',
    name: 'Shivaay Micronized Creatine',
    brand: 'Shivaay Nutrition',
    category: 'Creatine',
    price: 1199,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop',
    description: '100% Pure Micronized Creatine Monohydrate. Improves explosive power, muscular strength, and cell hydration. Neutral flavor.'
  },
  {
    id: '6',
    name: 'Creapure Creatine Premium',
    brand: 'Creapure',
    category: 'Creatine',
    price: 1699,
    status: 'Limited Stock',
    image: 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=600&auto=format&fit=crop',
    description: 'Made with German Creapure, the gold standard of creatine. Maximum purity and bioavailability for top athletic performance.'
  },
  {
    id: '7',
    name: 'Shivaay Beast Mode Pre-Workout',
    brand: 'Shivaay Nutrition',
    category: 'Pre Workout',
    price: 2299,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1605296867304-46d5465a25f1?q=80&w=600&auto=format&fit=crop',
    description: 'Extreme energy, razor-sharp focus, and massive muscle pumps. Contains Citrulline Malate, Beta-Alanine, and Caffeine.'
  },
  {
    id: '8',
    name: 'Cellucor C4 Original',
    brand: 'Cellucor',
    category: 'Pre Workout',
    price: 2799,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=600&auto=format&fit=crop',
    description: 'America\'s legendary pre-workout. Classic explosive energy formula for beginners and seasoned fitness enthusiasts alike.'
  },
  {
    id: '9',
    name: 'Shivaay Shred-X Thermogenic',
    brand: 'Shivaay Nutrition',
    category: 'Fat Burners',
    price: 1999,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600&auto=format&fit=crop',
    description: 'Advanced thermogenic fat burner. Boosts metabolism, enhances fat oxidation, and supports clean jitter-free energy levels.'
  },
  {
    id: '10',
    name: 'Shivaay Vita-Max Multivitamin',
    brand: 'Shivaay Nutrition',
    category: 'Multivitamins',
    price: 799,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?q=80&w=600&auto=format&fit=crop',
    description: 'Comprehensive daily multivitamin with minerals, antioxidants, and joint support complexes. Enhances immunity and vitality.'
  }
];

const STORAGE_KEY = 'shivaay_products';

export const getProducts = (): Product[] => {
  if (typeof window === 'undefined') {
    return DEFAULT_PRODUCTS;
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS));
    return DEFAULT_PRODUCTS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to parse stored products', e);
    return DEFAULT_PRODUCTS;
  }
};

export const saveProducts = (products: Product[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
};

export const addProduct = (product: Omit<Product, 'id'>): Product => {
  const products = getProducts();
  const newProduct: Product = {
    ...product,
    id: Math.random().toString(36).substring(2, 9)
  };
  products.push(newProduct);
  saveProducts(products);
  return newProduct;
};

export const updateProduct = (updatedProduct: Product): void => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === updatedProduct.id);
  if (index !== -1) {
    products[index] = updatedProduct;
    saveProducts(products);
  }
};

export const deleteProduct = (id: string): void => {
  const products = getProducts();
  const filtered = products.filter(p => p.id !== id);
  saveProducts(filtered);
};

export const getCategories = (): string[] => {
  return [
    'Whey Protein',
    'Mass Gainers',
    'Creatine',
    'Pre Workout',
    'Fat Burners',
    'Multivitamins'
  ];
};
