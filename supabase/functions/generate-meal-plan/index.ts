import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.1.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface MealPlanRequest {
  user_id: string;
  bloodwork_data?: any;
  nutrient_deficiencies: string[];
  preferences: {
    dietary_restrictions: string[];
    allergies: string[];
    cuisine_preferences: string[];
  };
}

interface MealPlan {
  title: string;
  description: string;
  target_nutrients: string[];
  plan_data: {
    days: Array<{
      day: string;
      meals: Array<{
        type: string;
        name: string;
        ingredients: string[];
        nutrition: {
          calories: number;
          protein: number;
          carbs: number;
          fat: number;
        };
        benefits: string[];
      }>;
      daily_totals: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
      };
    }>;
    shopping_list: string[];
    tips: string[];
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validate request
    if (!req.headers.get('Authorization')) {
      return new Response(
        JSON.stringify({ error: 'Authorization header is required' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    const requestData = await req.json();
    
    // Validate request body
    if (!requestData || !requestData.user_id || !requestData.nutrient_deficiencies) {
      return new Response(
        JSON.stringify({ error: 'Invalid request body. user_id and nutrient_deficiencies are required.' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    const { 
      user_id, 
      bloodwork_data, 
      nutrient_deficiencies, 
      preferences = { dietary_restrictions: [], allergies: [], cuisine_preferences: [] }
    }: MealPlanRequest = requestData;

    // Initialize Gemini AI
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY not found in environment variables");
      // Return mock meal plan data
      const mockMealPlan = generateMockMealPlan(nutrient_deficiencies);
      return new Response(
        JSON.stringify(mockMealPlan),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json',
          } 
        }
      );
    }
    
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Create a comprehensive prompt for meal plan generation
    const prompt = `
      Create a personalized 7-day meal plan based on the following information:

      NUTRIENT DEFICIENCIES TO ADDRESS:
      ${nutrient_deficiencies.join(', ')}

      DIETARY PREFERENCES:
      - Restrictions: ${preferences.dietary_restrictions.join(', ') || 'None'}
      - Allergies: ${preferences.allergies.join(', ') || 'None'}
      - Cuisine Preferences: ${preferences.cuisine_preferences.join(', ') || 'Varied'}

      REQUIREMENTS:
      1. Focus on foods rich in the deficient nutrients
      2. Include 3 meals per day (breakfast, lunch, dinner)
      3. Provide specific ingredient lists for each meal
      4. Calculate approximate nutrition values for each meal
      5. Include health benefits for each meal
      6. Generate a comprehensive shopping list
      7. Provide practical cooking tips

      Return the response in this exact JSON format:
      {
        "title": "Personalized 7-Day Nutrition Plan",
        "description": "A meal plan designed to address your specific nutrient deficiencies",
        "target_nutrients": ["list of nutrients being targeted"],
        "plan_data": {
          "days": [
            {
              "day": "Monday",
              "meals": [
                {
                  "type": "Breakfast",
                  "name": "Meal name",
                  "ingredients": ["ingredient1", "ingredient2"],
                  "nutrition": {
                    "calories": 400,
                    "protein": 20,
                    "carbs": 45,
                    "fat": 15
                  },
                  "benefits": ["benefit1", "benefit2"]
                }
              ],
              "daily_totals": {
                "calories": 1800,
                "protein": 120,
                "carbs": 200,
                "fat": 60
              }
            }
          ],
          "shopping_list": ["item1", "item2"],
          "tips": ["tip1", "tip2"]
        }
      }

      Make sure all meals are practical, delicious, and specifically chosen to address the nutrient deficiencies.
      Focus on whole foods and provide variety throughout the week.
    `;

    // Set a timeout for the Gemini API call
    const timeoutMs = 25000; // 25 seconds
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Gemini API request timed out')), timeoutMs);
    });
    
    // Race between the API call and the timeout
    const result = await Promise.race([
      model.generateContent(prompt),
      timeoutPromise
    ]);
    
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    let mealPlan: MealPlan;
    try {
      // Clean the response text to extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      mealPlan = JSON.parse(jsonMatch[0]);
      
      // Validate the meal plan structure
      if (!mealPlan.title || !mealPlan.plan_data || !mealPlan.plan_data.days) {
        throw new Error('Invalid meal plan structure');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      
      // Fallback meal plan if parsing fails
      mealPlan = generateMockMealPlan(nutrient_deficiencies);
    }

    return new Response(
      JSON.stringify(mealPlan),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate'
        } 
      }
    );

  } catch (error) {
    console.error('Error generating meal plan:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate meal plan. Please try again.',
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

function generateMockMealPlan(deficiencies: string[]): MealPlan {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  return {
    title: `Personalized Nutrition Plan for ${deficiencies.join(', ')}`,
    description: "A meal plan designed to address your specific nutrient deficiencies",
    target_nutrients: deficiencies,
    plan_data: {
      days: days.map(day => ({
        day,
        meals: [
          {
            type: "Breakfast",
            name: "Nutrient-Rich Smoothie Bowl",
            ingredients: ["spinach", "banana", "berries", "almonds", "chia seeds"],
            nutrition: { calories: 350, protein: 15, carbs: 45, fat: 12 },
            benefits: ["High in vitamins", "Antioxidant rich"]
          },
          {
            type: "Lunch",
            name: "Quinoa Power Salad",
            ingredients: ["quinoa", "kale", "chickpeas", "avocado", "pumpkin seeds"],
            nutrition: { calories: 450, protein: 18, carbs: 55, fat: 16 },
            benefits: ["Complete protein", "Fiber rich"]
          },
          {
            type: "Dinner",
            name: "Salmon with Sweet Potato",
            ingredients: ["salmon fillet", "sweet potato", "broccoli", "olive oil"],
            nutrition: { calories: 500, protein: 35, carbs: 40, fat: 20 },
            benefits: ["Omega-3 fatty acids", "Beta carotene"]
          }
        ],
        daily_totals: { calories: 1300, protein: 68, carbs: 140, fat: 48 }
      })),
      shopping_list: generateShoppingList(deficiencies),
      tips: [
        "Focus on whole, unprocessed foods",
        "Include a variety of colorful vegetables",
        "Stay hydrated throughout the day",
        "Consider meal prep for busy days"
      ]
    }
  };
}

function generateShoppingList(deficiencies: string[]): string[] {
  const baseItems = [
    "Spinach", "Kale", "Broccoli", "Sweet potatoes", "Avocados",
    "Salmon", "Chicken breast", "Eggs", "Greek yogurt",
    "Quinoa", "Brown rice", "Oats", "Almonds", "Walnuts",
    "Blueberries", "Bananas", "Oranges", "Chia seeds", "Olive oil"
  ];

  // Add specific items based on deficiencies
  const deficiencyMap: { [key: string]: string[] } = {
    "Vitamin D": ["Fatty fish", "Egg yolks", "Fortified milk"],
    "Iron": ["Lean red meat", "Lentils", "Dark chocolate"],
    "B12": ["Beef liver", "Nutritional yeast", "Clams"],
    "Magnesium": ["Dark chocolate", "Pumpkin seeds", "Cashews"],
    "Zinc": ["Oysters", "Beef", "Pumpkin seeds"]
  };

  let additionalItems: string[] = [];
  deficiencies.forEach(deficiency => {
    if (deficiencyMap[deficiency]) {
      additionalItems = [...additionalItems, ...deficiencyMap[deficiency]];
    }
  });

  return [...baseItems, ...additionalItems].slice(0, 25);
}