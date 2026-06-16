const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Mount routers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/projects', require('./routes/projects'));

// Test route
app.get('/', (req, res) => {
  res.send('Premium Right Tech IT & CCTV API is running...');
});

// Seed Database Function
const seedDatabase = async () => {
  try {
    // 1. Seed Default Users
    const adminExists = await User.findOne({ email: 'admin@righttech.com' });
    if (!adminExists) {
      await User.create({
        name: 'RightTech Admin',
        email: 'admin@righttech.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('Seed: Default Admin user created (admin@righttech.com / admin123)');
    }

    const customerExists = await User.findOne({ email: 'customer@righttech.com' });
    if (!customerExists) {
      await User.create({
        name: 'John Doe',
        email: 'customer@righttech.com',
        password: 'customer123',
        role: 'user'
      });
      console.log('Seed: Default Customer user created (customer@righttech.com / customer123)');
    }

    // Clear old products & orders to prevent mismatch
    await Product.deleteMany({});
    await Order.deleteMany({});
    console.log('Seed: Cleared old product and order logs.');

    // 2. Seed Default Products
    const mockProducts = [
      {
        name: 'ThinkPad X1 Carbon Gen 11',
        category: 'Laptops',
        price: 425000,
        images: [
          'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=600&auto=format&fit=crop'
        ],
        description: 'Ultralight premium business laptop. Equipped with Intel Core i7 13th Gen, 16GB LPDDR5 RAM, 512GB PCIe Gen4 SSD, and a stunning 14-inch IPS display. Built with carbon fiber for ultimate durability and portability.',
        stock: 8,
        allowKoko: true,
        selections: [
          {
            name: 'Specifications',
            values: [
              { value: '16GB RAM / 512GB SSD', priceModifier: 0 },
              { value: '32GB RAM / 1TB SSD', priceModifier: 65000 }
            ]
          }
        ]
      },
      {
        name: 'HP LaserJet Pro MFP M428fdw',
        category: 'Printers',
        price: 98000,
        images: [
          'https://images.unsplash.com/photo-1612815154858-60aa4c59edd6?q=80&w=600&auto=format&fit=crop'
        ],
        description: 'Wireless monochrome all-in-one laser printer designed for busy small-to-medium offices. Delivers fast printing, high-speed scanning, copying, and faxing. Features automatic double-sided printing and robust security features.',
        stock: 12,
        allowKoko: true,
        selections: [
          {
            name: 'Support Plan',
            values: [
              { value: '1-Year Local Warranty', priceModifier: 0 },
              { value: '3-Year Premium Care Pack', priceModifier: 18000 }
            ]
          }
        ]
      },
      {
        name: 'Hikvision 8MP 4K CCTV Security System',
        category: 'CCTV & Security',
        price: 145000,
        images: [
          'https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1524492449929-c42ab9f4c27a?q=80&w=600&auto=format&fit=crop'
        ],
        description: 'Professional-grade 4K security camera setup. Package includes 8-Channel PoE NVR, 4 outdoor bullet cameras, 4 indoor dome cameras, a 2TB surveillance-class hard drive, and mobile App connection for 24/7 live view monitoring.',
        stock: 5,
        allowKoko: true,
        selections: [
          {
            name: 'Storage Option',
            values: [
              { value: '2TB Seagate SkyHawk Drive', priceModifier: 0 },
              { value: '4TB Seagate SkyHawk Drive', priceModifier: 15000 }
            ]
          }
        ]
      },
      {
        name: 'Logitech MX Master 3S Wireless Mouse',
        category: 'Gadgets',
        price: 38000,
        images: [
          'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=600&auto=format&fit=crop'
        ],
        description: 'Ergonomic performance wireless mouse featuring 8K DPI tracking on any surface, quiet clicks, and the MagSpeed electromagnetic scroll wheel for high productivity. Perfect for creators, developers, and tech enthusiasts.',
        stock: 25,
        allowKoko: true,
        selections: [
          {
            name: 'Color Theme',
            values: [
              { value: 'Graphite Black', priceModifier: 0 },
              { value: 'Pale Gray', priceModifier: 0 }
            ]
          }
        ]
      },
      {
        name: 'Professional Laptop Thermal Cleaning & Repasting',
        category: 'IT Services',
        price: 4500,
        images: [
          'https://images.unsplash.com/photo-1597872200919-a51197616c56?q=80&w=600&auto=format&fit=crop'
        ],
        description: 'Complete internal hardware servicing including dust removal, fans lubrication, and premium Noctua thermal paste application. Resolves laptop overheating, thermal throttling, and high fan noises.',
        stock: 100,
        allowKoko: false,
        selections: [
          {
            name: 'Priority Service',
            values: [
              { value: 'Standard Repair Center Drop-off', priceModifier: 0 },
              { value: 'Express 1-Hour Repair Service', priceModifier: 1500 }
            ]
          }
        ]
      },
      {
        name: 'Professional CCTV Site Survey & Installation Plan',
        category: 'IT Services',
        price: 3000,
        images: [
          'https://images.unsplash.com/photo-1524492449929-c42ab9f4c27a?q=80&w=600&auto=format&fit=crop'
        ],
        description: 'On-site technical evaluation by certified security engineers. We plan camera angles, calculate wiring routing distances, evaluate DVR/NVR placement options, and compile a detailed project quotation.',
        stock: 100,
        allowKoko: false,
        selections: [
          {
            name: 'Location Range',
            values: [
              { value: 'Colombo & Suburbs', priceModifier: 0 },
              { value: 'Outstation (Western Province)', priceModifier: 2500 }
            ]
          }
        ]
      }
    ];

    await Product.insertMany(mockProducts);
    console.log('Seed: Mock IT & CCTV catalog successfully seeded!');
  } catch (error) {
    console.error('Seed error:', error);
  }
};

// Call seeder
seedDatabase();

// Handle Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in production mode on port ${PORT}`);
});
