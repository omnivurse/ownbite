import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ShareRequest {
  content_type: 'recipe' | 'food_scan' | 'progress' | 'achievement' | 'bloodwork';
  content_id: string;
  provider: 'facebook' | 'instagram' | 'tiktok' | 'twitter' | 'pinterest' | 'linkedin';
  share_text: string;
  share_url?: string;
  share_image_url?: string;
  hashtags?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: 'Missing Supabase environment variables' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get the user from the token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse the request body
    const requestData = await req.json();
    
    // Validate request body
    if (!requestData || !requestData.content_type || !requestData.content_id || !requestData.provider || !requestData.share_text) {
      return new Response(
        JSON.stringify({ error: 'Invalid request body. content_type, content_id, provider, and share_text are required.' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    const { 
      content_type, 
      content_id, 
      provider, 
      share_text, 
      share_url, 
      share_image_url, 
      hashtags = [] 
    }: ShareRequest = requestData;

    // Get the connected account for the specified provider
    const { data: connectedAccount, error: accountError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', provider)
      .eq('is_connected', true)
      .single();

    if (accountError) {
      return new Response(
        JSON.stringify({ error: `No connected ${provider} account found` }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate the share URL if not provided
    const baseUrl = 'https://ownbite.me';
    let finalShareUrl = share_url;
    
    if (!finalShareUrl) {
      switch (content_type) {
        case 'recipe':
          finalShareUrl = `${baseUrl}/r/${content_id}`;
          break;
        case 'food_scan':
          finalShareUrl = `${baseUrl}/s/${content_id}`;
          break;
        case 'progress':
          finalShareUrl = `${baseUrl}/p/${content_id}`;
          break;
        case 'achievement':
          finalShareUrl = `${baseUrl}/a/${content_id}`;
          break;
        case 'bloodwork':
          finalShareUrl = `${baseUrl}/b/${content_id}`;
          break;
        default:
          finalShareUrl = baseUrl;
      }
    }

    // Ensure the main hashtag is included
    const finalHashtags = [...hashtags];
    if (!finalHashtags.includes('#iamhealthierwithownbite.me')) {
      finalHashtags.push('#iamhealthierwithownbite.me');
    }

    // In a real implementation, you would make API calls to each social media platform
    // For this demo, we'll simulate the sharing process by creating a share record
    
    // Create a share record
    const { data: share, error: shareError } = await supabase
      .from('social_shares')
      .insert({
        user_id: user.id,
        content_type,
        content_id,
        provider,
        share_url: finalShareUrl,
        share_image_url,
        share_text,
        share_status: 'success', // In a real implementation, this would be 'pending' until confirmed
        hashtags: finalHashtags
      })
      .select()
      .single();

    if (shareError) {
      console.error(`Error creating share record for ${provider}:`, shareError);
      return new Response(
        JSON.stringify({ error: 'Failed to create share record' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Award points for sharing
    try {
      await supabase.rpc('award_points', {
        p_event_type: 'share_progress',
        p_points: 15,
        p_context: { 
          content_type, 
          provider 
        }
      });
    } catch (pointsError) {
      console.error('Error awarding points:', pointsError);
      // Continue even if points award fails
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        share,
        points_awarded: 15
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate'
        } 
      }
    );
  } catch (error) {
    console.error('Error sharing to social media:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to share content. Please try again.',
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