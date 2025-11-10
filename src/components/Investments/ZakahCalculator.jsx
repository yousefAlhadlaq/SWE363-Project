import React, { useState } from 'react';
import InputField from '../Shared/InputField';
import Button from '../Shared/Button';

function ZakahCalculator() {
  const [assets, setAssets] = useState({
    cash: 0,
    savings: 0,
    gold: 0,
    silver: 0,
    investments: 0,
    businessAssets: 0
  });

  const [zakahAmount, setZakahAmount] = useState(null);

  const handleChange = (e) => {
    setAssets({
      ...assets,
      [e.target.name]: parseFloat(e.target.value) || 0
    });
  };

  const calculateZakah = () => {
    const totalAssets = Object.values(assets).reduce((sum, val) => sum + val, 0);
    const zakah = totalAssets * 0.025; // 2.5% for Zakah
    setZakahAmount(zakah);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Zakah Calculator</h2>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-600 mb-4">
          Enter your assets to calculate the Zakah due (2.5% of total wealth).
        </p>

        <InputField
          label="Cash"
          type="number"
          name="cash"
          value={assets.cash}
          onChange={handleChange}
          placeholder="0"
        />
        <InputField
          label="Savings"
          type="number"
          name="savings"
          value={assets.savings}
          onChange={handleChange}
          placeholder="0"
        />
        <InputField
          label="Gold Value"
          type="number"
          name="gold"
          value={assets.gold}
          onChange={handleChange}
          placeholder="0"
        />
        <InputField
          label="Silver Value"
          type="number"
          name="silver"
          value={assets.silver}
          onChange={handleChange}
          placeholder="0"
        />
        <InputField
          label="Investments"
          type="number"
          name="investments"
          value={assets.investments}
          onChange={handleChange}
          placeholder="0"
        />
        <InputField
          label="Business Assets"
          type="number"
          name="businessAssets"
          value={assets.businessAssets}
          onChange={handleChange}
          placeholder="0"
        />

        <Button onClick={calculateZakah} variant="primary">
          Calculate Zakah
        </Button>

        {zakahAmount !== null && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
            <h3 className="text-lg font-semibold text-green-800">
              Zakah Due: ${zakahAmount.toFixed(2)}
            </h3>
            <p className="text-sm text-green-600">
              Based on total assets of ${Object.values(assets).reduce((sum, val) => sum + val, 0).toFixed(2)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ZakahCalculator;
