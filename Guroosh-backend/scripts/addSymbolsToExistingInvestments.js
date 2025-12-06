/**
 * Migration Script: Add symbols to existing crypto/stock investments
 *
 * This script analyzes existing investments and tries to extract symbols from their names.
 * For example: "Bitcoin (BTC-USD)" -> symbol: "BTC-USD"
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Investment = require('../src/models/Investment');

const extractSymbolFromName = (name) => {
  // Try to extract symbol from patterns like "Bitcoin (BTC-USD)" or "Apple Inc. (AAPL)"
  // This also handles Saudi stocks like "Elm Co (7203.SR)"
  const match = name.match(/\(([A-Z0-9.-]+)\)/i);
  if (match) {
    return match[1].toUpperCase();
  }

  // Try to extract from patterns like "BTC-USD" or "AAPL"
  const symbolMatch = name.match(/^([A-Z0-9-]+)$/i);
  if (symbolMatch) {
    return symbolMatch[1].toUpperCase();
  }

  return null;
};

async function addSymbolsToExistingInvestments() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quroosh');
    console.log('✅ Connected to MongoDB');

    // Find all stock and crypto investments without symbols
    const investmentsToUpdate = await Investment.find({
      category: { $in: ['Stock', 'Crypto'] },
      $or: [
        { symbol: { $exists: false } },
        { symbol: null },
        { symbol: '' }
      ]
    });

    console.log(`\n📊 Found ${investmentsToUpdate.length} investments without symbols\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const investment of investmentsToUpdate) {
      const extractedSymbol = extractSymbolFromName(investment.name);

      if (extractedSymbol) {
        console.log(`✅ ${investment.category}: "${investment.name}" -> symbol: "${extractedSymbol}"`);
        investment.symbol = extractedSymbol;
        await investment.save();
        updatedCount++;
      } else {
        console.log(`⚠️  ${investment.category}: "${investment.name}" -> Could not extract symbol`);
        skippedCount++;
      }
    }

    console.log(`\n📈 Summary:`);
    console.log(`   Updated: ${updatedCount}`);
    console.log(`   Skipped: ${skippedCount}`);
    console.log(`   Total: ${investmentsToUpdate.length}`);

    if (skippedCount > 0) {
      console.log(`\n⚠️  ${skippedCount} investment(s) need manual update.`);
      console.log('   Please delete and re-add them with proper symbol format.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the migration
addSymbolsToExistingInvestments();
