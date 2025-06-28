import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface SocialShareRequest {
  contentType: 'recipe' | 'food_scan' | 'progress' | 'achievement';
  contentId: string;
  providers: ('facebook' | 'instagram' | 'tiktok' | 'twitter' | 'pinterest')[];
  text?: string;
  imageUrl?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get the user from the token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Parse the request body
    const { contentType, contentId, providers, text, imageUrl }: SocialShareRequest = await req.json();

    // Validate the request
    if (!contentType || !contentId || !providers || providers.length === 0) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get the connected accounts for the specified providers
    const { data: connectedAccounts, error: accountsError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_connected', true)
      .in('provider', providers);

    if (accountsError) {
      return new Response(JSON.stringify({ error: 'Failed to fetch connected accounts' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!connectedAccounts || connectedAccounts.length === 0) {
      return new Response(JSON.stringify({ error: 'No connected accounts found for the specified providers' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Generate the share URL
    const baseUrl = 'https://ownbite.me';
    let shareUrl;
    
    switch (contentType) {
      case 'recipe':
        shareUrl = `${baseUrl}/r/${contentId}`;
        break;
      case 'food_scan':
        shareUrl = `${baseUrl}/s/${contentId}`;
        break;
      case 'progress':
        shareUrl = `${baseUrl}/p/${contentId}`;
        break;
      case 'achievement':
        shareUrl = `${baseUrl}/a/${contentId}`;
        break;
      default:
        shareUrl = baseUrl;
    }

    // Generate default share text if not provided
    const shareText = text || `Check out my ${contentType.replace('_', ' ')} on OwnBite.me! #OwnBite`;

    // Create share records for each provider
    const sharePromises = connectedAccounts.map(async (account) => {
      // In a real implementation, you would make API calls to each social media platform
      // For this demo, we'll simulate the sharing process
      
      // Create a share record
      const { data: share, error: shareError } = await supabase
        .from('social_shares')
        .insert({
          user_id: user.id,
          content_type: contentType,
          content_id: contentId,
          provider: account.provider,
          share_url: shareUrl,
          share_image_url: imageUrl,
          share_text: shareText,
          share_status: 'success' // In a real implementation, this would be 'pending' until confirmed
        })
        .select()
        .single();

      if (shareError) {
        console.error(`Error creating share record for ${account.provider}:`, shareError);
        return null;
      }

      return share;
    });

    const shares = await Promise.all(sharePromises);
    const validShares = shares.filter(share => share !== null);

    return new Response(
      JSON.stringify({ 
        success: true,
        shares: validShares
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
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