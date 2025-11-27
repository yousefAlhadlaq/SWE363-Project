require('dotenv').config();
const mongoose = require('mongoose');
const SaudiCity = require('../src/models/saudiCity');
const ExternalBankAccount = require('../src/models/externalBankAccount');
const ExternalStock = require('../src/models/externalStock');
const ExternalCrypto = require('../src/models/externalCrypto');

// Admin user ID (update this with actual admin user ID)
const ADMIN_USER_ID = '692608c30e0887d701de59d7';

// Saudi Cities with real data
const saudiCities = [
  // Tier 1 - Major Cities (High price multiplier)
  {
    nameEn: 'Riyadh',
    nameAr: 'الرياض',
    region: 'Riyadh',
    priceMultiplier: 3.5,
    basePricePerSqm: 4500,
    marketStatus: 'Hot',
    description: 'Capital and largest city, major business hub'
  },
  {
    nameEn: 'Jeddah',
    nameAr: 'جدة',
    region: 'Makkah',
    priceMultiplier: 3.2,
    basePricePerSqm: 4200,
    marketStatus: 'Hot',
    description: 'Commercial capital, Red Sea port city'
  },
  {
    nameEn: 'Mecca',
    nameAr: 'مكة المكرمة',
    region: 'Makkah',
    priceMultiplier: 4.0,
    basePricePerSqm: 5000,
    marketStatus: 'Hot',
    description: 'Holy city, highest property demand'
  },
  {
    nameEn: 'Medina',
    nameAr: 'المدينة المنورة',
    region: 'Madinah',
    priceMultiplier: 3.8,
    basePricePerSqm: 4800,
    marketStatus: 'Hot',
    description: 'Holy city, high religious tourism'
  },
  {
    nameEn: 'Khobar',
    nameAr: 'الخبر',
    region: 'Eastern Province',
    priceMultiplier: 2.8,
    basePricePerSqm: 3800,
    marketStatus: 'Hot',
    description: 'Eastern Province, oil industry hub'
  },
  {
    nameEn: 'Dammam',
    nameAr: 'الدمام',
    region: 'Eastern Province',
    priceMultiplier: 2.6,
    basePricePerSqm: 3600,
    marketStatus: 'Hot',
    description: 'Eastern Province capital, industrial center'
  },

  // Tier 2 - Large Cities (Medium-high price multiplier)
  {
    nameEn: 'Dhahran',
    nameAr: 'الظهران',
    region: 'Eastern Province',
    priceMultiplier: 2.7,
    basePricePerSqm: 3700,
    marketStatus: 'Hot',
    description: 'Aramco headquarters, expat community'
  },
  {
    nameEn: 'Taif',
    nameAr: 'الطائف',
    region: 'Makkah',
    priceMultiplier: 2.3,
    basePricePerSqm: 3300,
    marketStatus: 'Moderate',
    description: 'Summer capital, mountain resort city'
  },
  {
    nameEn: 'Tabuk',
    nameAr: 'تبوك',
    region: 'Tabuk',
    priceMultiplier: 1.8,
    basePricePerSqm: 2800,
    marketStatus: 'Moderate',
    description: 'Northern region, growing tourism'
  },
  {
    nameEn: 'Abha',
    nameAr: 'أبها',
    region: 'Asir',
    priceMultiplier: 2.0,
    basePricePerSqm: 3000,
    marketStatus: 'Moderate',
    description: 'Southern highlands, tourism destination'
  },
  {
    nameEn: 'Buraidah',
    nameAr: 'بريدة',
    region: 'Qassim',
    priceMultiplier: 1.7,
    basePricePerSqm: 2700,
    marketStatus: 'Moderate',
    description: 'Agricultural hub, central region'
  },
  {
    nameEn: 'Khamis Mushait',
    nameAr: 'خميس مشيط',
    region: 'Asir',
    priceMultiplier: 1.9,
    basePricePerSqm: 2900,
    marketStatus: 'Moderate',
    description: 'Military city, southern region'
  },
  {
    nameEn: 'Hofuf',
    nameAr: 'الهفوف',
    region: 'Eastern Province',
    priceMultiplier: 1.8,
    basePricePerSqm: 2800,
    marketStatus: 'Moderate',
    description: 'Al-Ahsa oasis, agricultural center'
  },
  {
    nameEn: 'Jubail',
    nameAr: 'الجبيل',
    region: 'Eastern Province',
    priceMultiplier: 2.4,
    basePricePerSqm: 3400,
    marketStatus: 'Hot',
    description: 'Industrial city, petrochemical hub'
  },
  {
    nameEn: 'Najran',
    nameAr: 'نجران',
    region: 'Najran',
    priceMultiplier: 1.6,
    basePricePerSqm: 2600,
    marketStatus: 'Moderate',
    description: 'Southern border city'
  },
  {
    nameEn: 'Yanbu',
    nameAr: 'ينبع',
    region: 'Madinah',
    priceMultiplier: 2.1,
    basePricePerSqm: 3100,
    marketStatus: 'Moderate',
    description: 'Red Sea port, industrial zone'
  },

  // Tier 3 - Medium Cities (Lower price multiplier)
  {
    nameEn: 'Hail',
    nameAr: 'حائل',
    region: 'Hail',
    priceMultiplier: 1.5,
    basePricePerSqm: 2500,
    marketStatus: 'Cool',
    description: 'Northern city, agricultural area'
  },
  {
    nameEn: 'Jizan',
    nameAr: 'جازان',
    region: 'Jizan',
    priceMultiplier: 1.6,
    basePricePerSqm: 2600,
    marketStatus: 'Moderate',
    description: 'Southern coastal city'
  },
  {
    nameEn: 'Al-Qatif',
    nameAr: 'القطيف',
    region: 'Eastern Province',
    priceMultiplier: 2.2,
    basePricePerSqm: 3200,
    marketStatus: 'Moderate',
    description: 'Eastern Province, coastal city'
  },
  {
    nameEn: 'Arar',
    nameAr: 'عرعر',
    region: 'Northern Borders',
    priceMultiplier: 1.4,
    basePricePerSqm: 2400,
    marketStatus: 'Cool',
    description: 'Northern border region'
  },
  {
    nameEn: 'Sakaka',
    nameAr: 'سكاكا',
    region: 'Al-Jawf',
    priceMultiplier: 1.4,
    basePricePerSqm: 2400,
    marketStatus: 'Cool',
    description: 'Northwestern region'
  }
];

// Sample bank accounts for admin
const bankAccounts = [
  {
    userId: ADMIN_USER_ID,
    bank: 'Al Rajhi Bank',
    accountNumber: 'AR-123456789',
    accountType: 'Checking',
    balance: 150000,
    currency: 'SAR'
  },
  {
    userId: ADMIN_USER_ID,
    bank: 'Saudi National Bank',
    accountNumber: 'SNB-987654321',
    accountType: 'Savings',
    balance: 450000,
    currency: 'SAR'
  },
  {
    userId: ADMIN_USER_ID,
    bank: 'Riyad Bank',
    accountNumber: 'RB-456789123',
    accountType: 'Investment',
    balance: 280000,
    currency: 'SAR'
  }
];

// Sample stocks for admin (Saudi stocks: Tadawul)
const stocks = [
  {
    userId: ADMIN_USER_ID,
    bank: 'Al Rajhi Bank',
    brokerage: 'Al Rajhi Capital',
    symbol: '1120.SR',
    name: 'Al Rajhi Bank',
    shares: 100,
    purchasePrice: 85,
    currentPrice: 92.5,
    purchaseDate: new Date('2024-01-15')
  },
  {
    userId: ADMIN_USER_ID,
    bank: 'Al Rajhi Bank',
    brokerage: 'Al Rajhi Capital',
    symbol: '2222.SR',
    name: 'Saudi Aramco',
    shares: 50,
    purchasePrice: 32,
    currentPrice: 29.8,
    purchaseDate: new Date('2024-02-20')
  },
  {
    userId: ADMIN_USER_ID,
    bank: 'Saudi National Bank',
    brokerage: 'SNB Capital',
    symbol: '1010.SR',
    name: 'Saudi Basic Industries (SABIC)',
    shares: 75,
    purchasePrice: 88,
    currentPrice: 95.2,
    purchaseDate: new Date('2024-03-10')
  },
  {
    userId: ADMIN_USER_ID,
    bank: 'Saudi National Bank',
    brokerage: 'SNB Capital',
    symbol: '4030.SR',
    name: 'Saudi Telecom Company (STC)',
    shares: 120,
    purchasePrice: 42,
    currentPrice: 45.8,
    purchaseDate: new Date('2024-01-25')
  }
];

// Sample crypto holdings
const cryptoHoldings = [
  {
    userId: ADMIN_USER_ID,
    exchange: 'Binance',
    symbol: 'BTC',
    name: 'Bitcoin',
    amount: 0.5,
    purchasePrice: 42000,
    currentPrice: 67500,
    purchaseDate: new Date('2024-01-10')
  },
  {
    userId: ADMIN_USER_ID,
    exchange: 'Binance',
    symbol: 'ETH',
    name: 'Ethereum',
    amount: 3.2,
    purchasePrice: 2200,
    currentPrice: 3450,
    purchaseDate: new Date('2024-02-15')
  },
  {
    userId: ADMIN_USER_ID,
    exchange: 'Binance',
    symbol: 'BNB',
    name: 'Binance Coin',
    amount: 10,
    purchasePrice: 380,
    currentPrice: 520,
    purchaseDate: new Date('2024-03-01')
  },
  {
    userId: ADMIN_USER_ID,
    exchange: 'Coinbase',
    symbol: 'SOL',
    name: 'Solana',
    amount: 25,
    purchasePrice: 95,
    currentPrice: 145,
    purchaseDate: new Date('2024-03-01')
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await SaudiCity.deleteMany({});
    await ExternalBankAccount.deleteMany({});
    await ExternalStock.deleteMany({});
    await ExternalCrypto.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Seed Saudi cities
    console.log('🏙️  Seeding Saudi cities...');
    await SaudiCity.insertMany(saudiCities);
    console.log(`✅ Added ${saudiCities.length} Saudi cities\n`);

    // Seed bank accounts
    console.log('🏦 Seeding bank accounts...');
    await ExternalBankAccount.insertMany(bankAccounts);
    console.log(`✅ Added ${bankAccounts.length} bank accounts\n`);

    // Seed stocks
    console.log('📊 Seeding stock portfolio...');
    await ExternalStock.insertMany(stocks);
    console.log(`✅ Added ${stocks.length} stocks\n`);

    // Seed crypto
    console.log('₿ Seeding crypto portfolio...');
    await ExternalCrypto.insertMany(cryptoHoldings);
    console.log(`✅ Added ${cryptoHoldings.length} crypto holdings\n`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${saudiCities.length} Saudi cities`);
    console.log(`   - ${bankAccounts.length} bank accounts`);
    console.log(`   - ${stocks.length} stocks (Tadawul)`);
    console.log(`   - ${cryptoHoldings.length} crypto holdings`);
    console.log(`\n💰 Total seeded value:`);
    console.log(`   - Cash: ${bankAccounts.reduce((sum, acc) => sum + acc.balance, 0).toLocaleString()} SAR`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed script
seedDatabase();
