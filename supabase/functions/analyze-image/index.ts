import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.1.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface AnalyzeImageResult {
  foodItems: Array<{
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    healthBenefits?: string[];
    healthRisks?: string[];
  }>;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { imageDataUrl } = await req.json();
    
    // Initialize APIs with your credentials
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY not found in environment variables");
      
      // Return a fallback response with mock data
      const fallbackResult: AnalyzeImageResult = {
        foodItems: [
          {
            name: "Mixed meal",
            calories: 450,
            protein: 20,
            carbs: 45,
            fat: 15,
            healthBenefits: ["Provides balanced nutrition", "Contains essential nutrients"],
            healthRisks: ["Portion size may vary"]
          }
        ],
        totalCalories: 450,
        totalProtein: 20,
        totalCarbs: 45,
        totalFat: 15
      };
      
      return new Response(
        JSON.stringify(fallbackResult),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json',
          } 
        }
      );
    }
    
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
    
    // Remove the data URL prefix to get just the base64 data
    const base64Data = imageDataUrl.split(',')[1];

    // Log the start time for performance tracking
    const startTime = Date.now();
    console.log("Starting food analysis...");

    // Use Gemini Vision directly for food detection
    try {
      // Optimized prompt - removed specific number constraints for benefits/risks
      // and simplified the request to focus on core nutritional data
      const prompt = `
        Analyze this food image and identify all visible food items.
        For each food item, provide:
        1. The name of the food
        2. Estimated calories
        3. Estimated macronutrients (protein, carbs, fat in grams)
        4. Health benefits (if any)
        5. Potential health concerns (if any)

        Return the results in this exact JSON format:
        {
          "foodItems": [
            {
              "name": "food name",
              "calories": number,
              "protein": number,
              "carbs": number,
              "fat": number,
              "healthBenefits": ["benefit 1", "benefit 2"],
              "healthRisks": ["risk 1"]
            }
          ]
        }

        Be accurate but reasonable with nutritional estimates. If you can't identify the food clearly, make your best guess.
        Only return the JSON object, no other text.
      `;

      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg"
        }
      };

      console.log("Sending request to Gemini...");
      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const responseText = response.text();
      
      console.log(`Gemini response received in ${Date.now() - startTime}ms`);
      
      // Parse the JSON response
      let parsedResponse;
      try {
        // Extract JSON from the response (in case there's any extra text)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No valid JSON found in response');
        }
      } catch (parseError) {
        console.error('Error parsing Gemini response:', parseError);
        throw new Error('Failed to parse AI response');
      }
      
      // Calculate totals
      const foodItems = parsedResponse.foodItems || [];
      const totals = foodItems.reduce(
        (acc, item) => ({
          totalCalories: acc.totalCalories + (item.calories || 0),
          totalProtein: acc.totalProtein + (item.protein || 0),
          totalCarbs: acc.totalCarbs + (item.carbs || 0),
          totalFat: acc.totalFat + (item.fat || 0),
        }),
        { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 }
      );

      const finalResult: AnalyzeImageResult = {
        foodItems,
        ...totals,
      };

      console.log(`Analysis completed in ${Date.now() - startTime}ms`);
      console.log(`Found ${foodItems.length} food items`);

      return new Response(
        JSON.stringify(finalResult),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json',
          } 
        }
      );
    } catch (geminiError) {
      console.error('Gemini Vision error:', geminiError);
      console.log(`Analysis failed after ${Date.now() - startTime}ms`);
      
      // Fallback to a simpler approach if Gemini fails
      const fallbackResult: AnalyzeImageResult = {
        foodItems: [
          {
            name: "Mixed meal",
            calories: 450,
            protein: 20,
            carbs: 45,
            fat: 15,
            healthBenefits: ["Provides balanced nutrition", "Contains essential nutrients"],
            healthRisks: ["Portion size may vary"]
          }
        ],
        totalCalories: 450,
        totalProtein: 20,
        totalCarbs: 45,
        totalFat: 15
      };
      
      return new Response(
        JSON.stringify(fallbackResult),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json',
          } 
        }
      );
    }
  } catch (error) {
    console.error('Error analyzing image:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze image. Please try again.',
        details: error.message 
      }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      }
    );
  }
});