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
const DEFAULT_PRODUCTS = [];

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
    writeLocal('products', []);
  }

  // Offers seeding removed

  // Seed Users (Default Admin)
  let users = readLocal('users');
  const filteredUsers = users.filter(u => u.email !== 'shivaaynutrition7@gmail.com' || u.role === 'admin');
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
    await User.deleteOne({ email: "shivaaynutrition7@gmail.com" });

    const hasOldProducts = await Product.findOne({
      brand: { $in: ['Shivaay Nutrition', 'Creapure', 'Labrada', 'Cellucor'] }
    });
    if (hasOldProducts) {
      console.log('Purging old legacy products from MongoDB...');
      await Product.deleteMany({});
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
