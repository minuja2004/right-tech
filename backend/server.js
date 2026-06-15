const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');

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

// Test route
app.get('/', (req, res) => {
  res.send('Premium Supplement Store API is running...');
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

    // 2. Seed Default Products if empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const mockProducts = [
        {
          name: 'NITRO-CORE ISOLATE WHEY',
          category: 'Protein',
          price: 7500,
          images: [
            'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=600&auto=format&fit=crop'
          ],
          description: 'Ultra-pure whey isolate engineered for rapid absorption and maximum muscle recovery. Packed with 25g of protein, 5.5g of BCAAs, and zero sugar. The gold standard for clean muscle building.',
          stock: 12,
          allowKoko: true,
          selections: [
            {
              name: 'Size',
              values: [
                { value: '1kg (33 Servings)', priceModifier: 0 },
                { value: '2.5kg (83 Servings)', priceModifier: 8000 }
              ]
            },
            {
              name: 'Flavor',
              values: [
                { value: 'Double Rich Chocolate', priceModifier: 0 },
                { value: 'Vanilla Ice Cream', priceModifier: 0 },
                { value: 'Strawberry Blast', priceModifier: 250 }
              ]
            }
          ]
        },
        {
          name: 'IGNITE V8 PRE-WORKOUT',
          category: 'Pre-workout',
          price: 6800,
          images: [
            'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=600&auto=format&fit=crop'
          ],
          description: 'Explosive energy, razor-sharp focus, and massive nitric oxide pumps. Formulated with L-Citrulline, Beta-Alanine, and 300mg of caffeine to power you through your most intense training sessions.',
          stock: 18,
          allowKoko: true,
          selections: [
            {
              name: 'Flavor',
              values: [
                { value: 'Sour Apple', priceModifier: 0 },
                { value: 'Blue Raspberry', priceModifier: 0 },
                { value: 'Watermelon Rush', priceModifier: 150 }
              ]
            }
          ]
        },
        {
          name: 'CREA-MAX MICRONIZED CREATINE',
          category: 'Creatine',
          price: 3800,
          images: [
            'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=600&auto=format&fit=crop'
          ],
          description: '100% pure micronized creatine monohydrate to increase strength, explosive power, and muscular endurance. Odorless and tasteless for easy mixing with your protein or pre-workout.',
          stock: 25,
          allowKoko: true,
          selections: [
            {
              name: 'Size',
              values: [
                { value: '300g', priceModifier: 0 },
                { value: '600g', priceModifier: 3200 }
              ]
            }
          ]
        },
        {
          name: 'BCAA REFUEL 2:1:1',
          category: 'Recovery',
          price: 5200,
          images: [
            'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=600&auto=format&fit=crop'
          ],
          description: 'Premium intra-workout hydration and recovery catalyst. Features a clinically backed 2:1:1 ratio of BCAAs along with key electrolytes to support muscle preservation and reduce soreness.',
          stock: 8,
          allowKoko: true,
          selections: [
            {
              name: 'Flavor',
              values: [
                { value: 'Peach Mango', priceModifier: 0 },
                { value: 'Lemon Lime', priceModifier: 0 },
                { value: 'Pineapple Punch', priceModifier: 100 }
              ]
            }
          ]
        },
        {
          name: 'VITA-ACTIVE SPORT MULTIVITAMIN',
          category: 'Vitamins',
          price: 2900,
          images: [
            'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?q=80&w=600&auto=format&fit=crop'
          ],
          description: 'Daily essential micronutrients, powerful antioxidants, and key minerals tailored specifically for the metabolic demands of active athletes and fitness enthusiasts. Supports immunity and energy levels.',
          stock: 30,
          allowKoko: true,
          selections: [
            {
              name: 'Size',
              values: [
                { value: '60 Capsules', priceModifier: 0 },
                { value: '120 Capsules', priceModifier: 2200 }
              ]
            }
          ]
        },
        {
          name: 'HYPER-PUMP NITRO BOOSTER',
          category: 'Pre-workout',
          price: 7200,
          images: [
            'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop'
          ],
          description: 'Non-stimulant pre-workout pump formula. Enhances nitric oxide levels, vascularity, and muscular endurance. Perfect for late-night training sessions without affecting sleep patterns.',
          stock: 0, // Mock Out of Stock product
          allowKoko: true,
          selections: [
            {
              name: 'Flavor',
              values: [
                { value: 'Orange Crush', priceModifier: 0 },
                { value: 'Fruit Punch', priceModifier: 0 }
              ]
            }
          ]
        }
      ];

      await Product.insertMany(mockProducts);
      console.log('Seed: Mock products successfully seeded in database!');
    }
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
