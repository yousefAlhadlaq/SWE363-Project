const Groq = require('groq-sdk');

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/**
 * Evaluate real estate property value using Groq AI
 * @param {Object} propertyData - Property information
 * @param {number} propertyData.latitude - Property latitude
 * @param {number} propertyData.longitude - Property longitude
 * @param {string} propertyData.propertyType - Type of property (Land, Apartment, Villa)
 * @param {number} propertyData.area - Property area in square meters
 * @returns {Promise<Object>} Evaluation result with estimated value
 */
exports.evaluateRealEstate = async (propertyData) => {
  try {
    const { latitude, longitude, propertyType, area } = propertyData;

    // Build a simplified prompt for Groq using Moonshot AI model
    const prompt = `You are a real estate valuation expert specializing in Saudi Arabian properties. Provide a realistic market value estimate for the following property:

Location: Latitude ${latitude}, Longitude ${longitude}
Property Type: ${propertyType}
Area: ${area} square meters

Based on current Saudi Arabian real estate market conditions (2025), provide:
1. A realistic estimated market value in SAR (Saudi Riyals)
2. Consider location quality based on coordinates (proximity to city centers, amenities, development)
3. Account for property type (${propertyType}) and size (${area} sqm)
4. Consider regional market trends and property demand

Respond ONLY with a valid JSON object in this exact format (no additional text):
{
  "value": <number>,
  "currency": "SAR",
  "confidence": "<high|medium|low>",
  "reasoning": "<brief explanation>"
}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'moonshotai/kimi-k2-instruct-0905',
      temperature: 0.6,
      max_completion_tokens: 4096,
      top_p: 1,
      stream: false,
      stop: null
    });

    const response = chatCompletion.choices[0]?.message?.content;

    if (!response) {
      throw new Error('No response from Groq API');
    }

    // Parse the JSON response
    let evaluation;
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        evaluation = JSON.parse(jsonMatch[0]);
      } else {
        evaluation = JSON.parse(response);
      }
    } catch (parseError) {
      console.error('Failed to parse Groq response:', response);
      throw new Error('Invalid response format from AI model');
    }

    // Validate the response structure
    if (!evaluation.value || typeof evaluation.value !== 'number') {
      throw new Error('Invalid valuation result from AI model');
    }

    return {
      success: true,
      estimate: {
        value: Math.round(evaluation.value), // Round to nearest SAR
        currency: evaluation.currency || 'SAR',
        confidence: evaluation.confidence || 'medium',
        reasoning: evaluation.reasoning || 'AI-based market analysis',
        evaluatedAt: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('Error in Groq real estate evaluation:', error);
    return {
      success: false,
      error: error.message || 'Failed to evaluate property'
    };
  }
};

/**
 * Get property location description from coordinates
 * @param {number} latitude - Property latitude
 * @param {number} longitude - Property longitude
 * @returns {Promise<Object>} Location description
 */
exports.getLocationDescription = async (latitude, longitude) => {
  try {
    const prompt = `Given the coordinates: Latitude ${latitude}, Longitude ${longitude} in Saudi Arabia, provide:
1. The likely city or region
2. Brief area description (residential, commercial, etc.)
3. Notable nearby landmarks if any

Respond ONLY with valid JSON in this format:
{
  "city": "<city name>",
  "region": "<region/district>",
  "description": "<brief description>",
  "areaType": "<residential|commercial|mixed|industrial>"
}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a geographic information expert specializing in Saudi Arabian locations. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      max_tokens: 300,
    });

    const response = chatCompletion.choices[0]?.message?.content;

    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    const locationInfo = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(response);

    return {
      success: true,
      location: locationInfo
    };

  } catch (error) {
    console.error('Error getting location description:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
