const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

let dbType = 'local'; // 'local' or 'mongo'
const dataDir = path.join(__dirname, '../data');

// Ensure local data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const paths = {
  users: path.join(dataDir, 'users.json'),
  products: path.join(dataDir, 'products.json'),
  orders: path.join(dataDir, 'orders.json')
};

// Seed Data
const DEFAULT_PRODUCTS = [
  // --- Optimum Nutrition (ON) ---
  {
    name: 'ON Gold Standard 100% Whey (5 lbs)',
    brand: 'Optimum Nutrition',
    category: 'Whey Protein',
    price: 7499,
    status: 'In Stock',
    image: 'https://images-na.ssl-images-amazon.com/images/P/B000QSNYGI.01._SCLZZZZZZZ_SX500_.jpg',
    description: 'Gold Standard 100% Whey contains 24g of protein blend primarily consisting of whey protein isolate for lean muscle building.'
  },
  {
    name: 'ON Serious Mass Gainer (6 lbs)',
    brand: 'Optimum Nutrition',
    category: 'Mass Gainers',
    price: 3499,
    status: 'In Stock',
    image: 'https://images-na.ssl-images-amazon.com/images/P/B0B3DX8TKW.01._SCLZZZZZZZ_SX500_.jpg',
    description: 'High-calorie mass gainer delivering 1,250 calories and 50g of protein per serving to support serious muscle gains.'
  },
  {
    name: 'ON Micronized Creatine Powder (250g)',
    brand: 'Optimum Nutrition',
    category: 'Creatine',
    price: 1099,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=600',
    description: '100% pure micronized creatine monohydrate. Promotes muscle growth, increases strength, and improves athletic performance.'
  },
  {
    name: 'ON Gold Standard Pre-Workout (30 servings)',
    brand: 'Optimum Nutrition',
    category: 'Pre Workout',
    price: 2499,
    status: 'Limited Stock',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600',
    description: 'Unleashes explosive energy, focus, and supports enhanced endurance to help you crush your next training session.'
  },

  // --- One Science Nutrition (OSN) ---
  {
    name: 'OSN Premium Whey Protein (5 lbs)',
    brand: 'One Science',
    category: 'Whey Protein',
    price: 5499,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=600',
    description: 'Premium grass-fed whey protein formula designed to support muscle growth, repair, and overall strength enhancement.'
  },
  {
    name: 'OSN Micronized Creatine (250g)',
    brand: 'One Science',
    category: 'Creatine',
    price: 999,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=600',
    description: 'Pure micronized creatine to replenish energy stores during high-intensity training, maximizing strength and power.'
  },
  {
    name: 'OSN Ghost Pre-Workout (30 servings)',
    brand: 'One Science',
    category: 'Pre Workout',
    price: 1899,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600',
    description: 'Engineered with focus-enhancing ingredients, Beta-Alanine, and caffeine for explosive energy and muscle pump.'
  },

  // --- Kevin Levrone ---
  {
    name: 'Levro Whey Supreme (2kg)',
    brand: 'Kevin Levrone',
    category: 'Whey Protein',
    price: 4999,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=600',
    description: 'LevroWheySupreme is a delicious protein drink made of high-quality whey protein concentrate, supporting lean muscle mass.'
  },
  {
    name: 'Levro Anabolic Mass Gainer (3kg)',
    brand: 'Kevin Levrone',
    category: 'Mass Gainers',
    price: 3599,
    status: 'Limited Stock',
    image: 'https://images.unsplash.com/photo-1605296867304-46d5465a25f1?q=80&w=600',
    description: 'Anabolic mass gainer formulated by IFBB Pro Kevin Levrone. High in protein, creatine, DAA, and test-boosters for extreme bulk.'
  },
  {
    name: 'Levro Shaaboom Pump Pre-Workout (385g)',
    brand: 'Kevin Levrone',
    category: 'Pre Workout',
    price: 2199,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600',
    description: 'The ultimate pump formula with massive doses of Citrulline, Beta-Alanine, and caffeine for skin-splitting pumps.'
  },

  // --- Ronnie Coleman (RC) ---
  {
    name: 'RC Pro-Antium Whey Protein (5 lbs)',
    brand: 'Ronnie Coleman',
    category: 'Whey Protein',
    price: 5999,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=600',
    description: 'Pro-Antium is a multifaceted protein blend designed by 8x Mr. Olympia Ronnie Coleman. Packed with 30g protein per scoop.'
  },
  {
    name: 'RC King Mass Gainer (6 lbs)',
    brand: 'Ronnie Coleman',
    category: 'Mass Gainers',
    price: 3299,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1605296867304-46d5465a25f1?q=80&w=600',
    description: 'King Mass helps you pack on clean calories with a massive 60g protein matrix and 180g carb blend per serving.'
  },
  {
    name: 'RC Yeah Buddy Pre-Workout (30 servings)',
    brand: 'Ronnie Coleman',
    category: 'Pre Workout',
    price: 1999,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600',
    description: 'Yeah Buddy delivers focus, clean energy, and maximum athletic performance. Features Dynamine and TeaCrine.'
  },
  {
    name: 'RC Creatine XS (250g)',
    brand: 'Ronnie Coleman',
    category: 'Creatine',
    price: 1199,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=600',
    description: 'Pure micronized creatine monohydrate to support ATP production, boosting lean muscle building and recovery.'
  },

  // --- Outlast Labs ---
  {
    name: 'Outlast Apocalypse Whey (4.4 lbs)',
    brand: 'Outlast Labs',
    category: 'Whey Protein',
    price: 4799,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=600',
    description: 'Ultra-filtered whey blend containing 25g protein, glutamine, and BCAAs for enhanced post-workout recovery.'
  },
  {
    name: 'Outlast Trigger Pre-Workout (30 servings)',
    brand: 'Outlast Labs',
    category: 'Pre Workout',
    price: 1699,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600',
    description: 'Provides extreme mental focus, sharp cognitive drive, and explosive muscle pumps. Built for hardcore lifters.'
  },
  {
    name: 'Outlast Micronized Creatine (250g)',
    brand: 'Outlast Labs',
    category: 'Creatine',
    price: 999,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=600',
    description: 'Micronized creatine monohydrate for superior absorption, promoting quick ATP replenishment and strength.'
  }
];

// Default offers removed

// Helper functions for reading/writing local JSON files
const readLocal = (fileKey) => {
  const filePath = paths[fileKey];
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading local db file ${fileKey}:`, err);
    return [];
  }
};

const writeLocal = (fileKey, data) => {
  const filePath = paths[fileKey];
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error writing local db file ${fileKey}:`, err);
  }
};

// Seed Local JSON DB
const seedLocalDB = async () => {
  // Seed Products
  let products = readLocal('products');
  const hasOldProducts = products.some(p => p.brand === 'Shivaay Nutrition' || p.brand === 'Creapure' || p.brand === 'Labrada' || p.brand === 'Cellucor');
  if (hasOldProducts) {
    console.log('Purging old legacy products from local JSON DB...');
    products = [];
  }
  if (products.length === 0) {
    const seeded = DEFAULT_PRODUCTS.map((p, idx) => ({ ...p, id: `seed-prod-${idx + 1}` }));
    writeLocal('products', seeded);
    console.log('Seeded local products JSON database with genuine brands.');
  }

  // Offers seeding removed

  // Seed Users (Default Admin)
  let users = readLocal('users');
  const filteredUsers = users.filter(u => u.email !== 'shivaaynutrition190@gmail.com' || u.role === 'admin');
  if (filteredUsers.length !== users.length) {
    writeLocal('users', filteredUsers);
    users = filteredUsers;
  }
  if (users.length === 0) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('', salt);
    const defaultAdmin = {
      id: 'admin-user-id',
      name: 'Shivaay Admin',
      email: 'admin@shivaay.com',
      phone: process.env.OWNER_PHONE || '8295056962',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date().toISOString()
    };
    writeLocal('users', [defaultAdmin]);
    console.log('Seeded default admin user in local JSON database (admin@shivaay.com / ).');
  }
};

// Seed MongoDB if empty
const seedMongo = async () => {
  try {
    // Clear duplicate admin user if registered as customer previously
    await User.deleteOne({ email: "shivaaynutrition190@gmail.com" });

    const hasOldProducts = await Product.findOne({
      brand: { $in: ['Shivaay Nutrition', 'Creapure', 'Labrada', 'Cellucor'] }
    });
    if (hasOldProducts) {
      console.log('Purging old legacy products from MongoDB...');
      await Product.deleteMany({});
    }

    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      await Product.insertMany(DEFAULT_PRODUCTS);
      console.log('Seeded MongoDB products collection with genuine brands.');
    }
    // Offers seeding removed
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('', salt);
      const defaultAdmin = new User({
        name: 'Shivaay Admin',
        email: 'admin@shivaay.com',
        phone: process.env.OWNER_PHONE || '8295056962',
        password: hashedPassword,
        role: 'admin'
      });
      await defaultAdmin.save();
      console.log('Seeded default admin user in MongoDB.');
    }
  } catch (err) {
    console.error('Error seeding MongoDB:', err);
  }
};

// Initialize DB
const initDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri);
      dbType = 'mongo';
      console.log('Successfully connected to MongoDB.');
      await seedMongo();
    } catch (err) {
      console.error('Failed to connect to MongoDB, falling back to local JSON files:', err.message);
      dbType = 'local';
      await seedLocalDB();
    }
  } else {
    console.log('No MONGO_URI env variable set. Operating on local JSON databases.');
    dbType = 'local';
    await seedLocalDB();
  }
};

// EXPOSED DB API INTERFACE (Transparently handles Local vs MongoDB)
module.exports = {
  initDB,
  getDbType: () => dbType,

  // Users
  users: {
    find: async () => {
      if (dbType === 'mongo') {
        return await User.find({}).select('-password');
      }
      return readLocal('users').map(({ password, ...u }) => u);
    },
    findOne: async (query) => {
      if (dbType === 'mongo') {
        return await User.findOne(query);
      }
      const users = readLocal('users');
      return users.find(u => {
        for (let key in query) {
          if (u[key] !== query[key]) return false;
        }
        return true;
      }) || null;
    },
    findById: async (id) => {
      if (dbType === 'mongo') {
        return await User.findById(id).select('-password');
      }
      const users = readLocal('users');
      const found = users.find(u => u.id === id);
      if (!found) return null;
      const { password, ...userWithoutPassword } = found;
      return userWithoutPassword;
    },
    create: async (userData) => {
      if (dbType === 'mongo') {
        const newUser = new User(userData);
        return await newUser.save();
      }
      const users = readLocal('users');
      const newUser = {
        ...userData,
        id: 'user-' + Math.random().toString(36).substring(2, 9),
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      writeLocal('users', users);
      return newUser;
    },
    findByIdAndUpdate: async (id, updateData) => {
      if (dbType === 'mongo') {
        return await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
      }
      const users = readLocal('users');
      const idx = users.findIndex(u => u.id === id);
      if (idx === -1) return null;
      users[idx] = { ...users[idx], ...updateData };
      writeLocal('users', users);
      return users[idx];
    }
  },

  // Products
  products: {
    find: async () => {
      if (dbType === 'mongo') {
        return await Product.find({});
      }
      return readLocal('products');
    },
    findById: async (id) => {
      if (dbType === 'mongo') {
        return await Product.findById(id);
      }
      const products = readLocal('products');
      return products.find(p => p.id === id) || null;
    },
    create: async (productData) => {
      if (dbType === 'mongo') {
        const newProduct = new Product(productData);
        return await newProduct.save();
      }
      const products = readLocal('products');
      const newProduct = {
        ...productData,
        id: 'prod-' + Math.random().toString(36).substring(2, 9),
        createdAt: new Date().toISOString()
      };
      products.push(newProduct);
      writeLocal('products', products);
      return newProduct;
    },
    findByIdAndUpdate: async (id, updateData) => {
      if (dbType === 'mongo') {
        return await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
      }
      const products = readLocal('products');
      const idx = products.findIndex(p => p.id === id);
      if (idx === -1) return null;
      products[idx] = { ...products[idx], ...updateData };
      writeLocal('products', products);
      return products[idx];
    },
    findByIdAndDelete: async (id) => {
      if (dbType === 'mongo') {
        return await Product.findByIdAndDelete(id);
      }
      const products = readLocal('products');
      const filtered = products.filter(p => p.id !== id);
      const isDeleted = filtered.length !== products.length;
      writeLocal('products', filtered);
      return isDeleted ? { id } : null;
    },
    deductStock: async (id, quantity) => {
      if (dbType === 'mongo') {
        const updated = await Product.findOneAndUpdate(
          { _id: id, stock: { $gte: quantity } },
          { $inc: { stock: -quantity } },
          { new: true, runValidators: true }
        );
        if (!updated) {
          throw new Error('Product not found or insufficient stock');
        }
        let newStatus = updated.status;
        if (updated.stock === 0) {
          newStatus = 'Out of Stock';
        } else if (updated.stock <= 3) {
          newStatus = 'Limited Stock';
        } else {
          newStatus = 'In Stock';
        }
        if (updated.status !== newStatus) {
          updated.status = newStatus;
          await updated.save();
        }
        return updated;
      } else {
        const products = readLocal('products');
        const idx = products.findIndex(p => p.id === id);
        if (idx === -1) throw new Error('Product not found');
        if (products[idx].stock < quantity) throw new Error('Insufficient stock');
        products[idx].stock -= quantity;
        if (products[idx].stock === 0) {
          products[idx].status = 'Out of Stock';
        } else if (products[idx].stock <= 3) {
          products[idx].status = 'Limited Stock';
        } else {
          products[idx].status = 'In Stock';
        }
        writeLocal('products', products);
        return products[idx];
      }
    }
  },

  // Orders
  orders: {
    find: async () => {
      if (dbType === 'mongo') {
        return await Order.find({}).sort({ createdAt: -1 });
      }
      return readLocal('orders').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    findByUser: async (userId) => {
      if (dbType === 'mongo') {
        return await Order.find({ userId }).sort({ createdAt: -1 });
      }
      const orders = readLocal('orders');
      return orders.filter(o => o.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    findById: async (id) => {
      if (dbType === 'mongo') {
        return await Order.findById(id);
      }
      const orders = readLocal('orders');
      return orders.find(o => o.id === id) || null;
    },
    create: async (orderData) => {
      if (dbType === 'mongo') {
        const newOrder = new Order(orderData);
        return await newOrder.save();
      }
      const orders = readLocal('orders');
      const newOrder = {
        ...orderData,
        id: 'ord-' + Math.random().toString(36).substring(2, 9),
        createdAt: new Date().toISOString()
      };
      orders.push(newOrder);
      writeLocal('orders', orders);
      return newOrder;
    },
    findByIdAndUpdateStatus: async (id, status) => {
      if (dbType === 'mongo') {
        return await Order.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
      }
      const orders = readLocal('orders');
      const idx = orders.findIndex(o => o.id === id);
      if (idx === -1) return null;
      orders[idx].status = status;
      writeLocal('orders', orders);
      return orders[idx];
    },
    findByIdAndDelete: async (id) => {
      if (dbType === 'mongo') {
        return await Order.findByIdAndDelete(id);
      }
      const orders = readLocal('orders');
      const filtered = orders.filter(o => o.id !== id && o._id !== id);
      const isDeleted = filtered.length !== orders.length;
      writeLocal('orders', filtered);
      return isDeleted ? { id } : null;
    }
  },

  // Offers API removed
};
