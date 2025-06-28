import { GoogleGenerativeAI } from 'npm:@google/generative-ai@0.1.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface NutritionData {
  dailySummary: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  recentEntries?: Array<{
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    timestamp: string;
  }>;
  query?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      // Return mock advice if no API key is available
      return new Response(
        JSON.stringify({ 
          advice: "Based on your nutrition data, your macronutrient distribution looks balanced. Your protein intake is good, which helps with muscle maintenance and satiety. Consider adding more fiber-rich vegetables to your meals for better digestive health. Try to space your meals evenly throughout the day to maintain steady energy levels. Stay hydrated and consider tracking your water intake alongside your food." 
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }
    
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const { dailySummary, recentEntries, query } = await req.json() as NutritionData;

    const prompt = `
      As a friendly and knowledgeable nutrition coach, analyze this daily nutrition data:
      
      Today's Nutrition Summary:
      - Total Calories: ${dailySummary.calories}
      - Protein: ${dailySummary.protein}g
      - Carbohydrates: ${dailySummary.carbs}g
      - Fat: ${dailySummary.fat}g
      
      ${recentEntries?.length ? `
      Recent Meals:
      ${recentEntries.map(entry => `
        - ${entry.name}
          • Calories: ${entry.calories}
          • Protein: ${entry.protein}g
          • Carbs: ${entry.carbs}g
          • Fat: ${entry.fat}g
          • Time: ${new Date(entry.timestamp).toLocaleTimeString()}
      `).join('\n')}
      ` : ''}
      
      ${query ? `User Question: ${query}` : ''}
      
      Please provide personalized nutrition advice covering:
      1. Analysis of macro distribution and overall calorie intake
      2. Specific, actionable recommendations for improvement
      3. Meal timing suggestions based on the eating pattern
      4. Potential nutrient gaps to watch for
      5. Positive reinforcement for good choices
      
      Keep the response friendly, encouraging, and focused on actionable advice.
      Format the response with clear sections and bullet points for readability.
      Limit the response to 3-4 short paragraphs.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return new Response(
      JSON.stringify({ advice: text }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error generating nutrition advice:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate nutrition advice. Please try again.',
        advice: "I'm having trouble analyzing your nutrition data right now. In general, aim for a balanced diet with plenty of whole foods, adequate protein, and a variety of fruits and vegetables. Stay hydrated and try to maintain regular meal times. If you have specific nutrition questions, please try again later."
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});