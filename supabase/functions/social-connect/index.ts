import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface SocialConnectRequest {
  provider: 'facebook' | 'instagram' | 'tiktok' | 'twitter' | 'pinterest';
  code: string;
  redirectUri: string;
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
    if (!requestData || !requestData.provider || !requestData.code || !requestData.redirectUri) {
      return new Response(
        JSON.stringify({ error: 'Invalid request body. provider, code, and redirectUri are required.' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    const { provider, code, redirectUri }: SocialConnectRequest = requestData;

    // Get the appropriate API credentials based on the provider
    let clientId, clientSecret, tokenUrl, profileUrl;
    
    switch (provider) {
      case 'facebook':
        clientId = Deno.env.get("FACEBOOK_APP_ID");
        clientSecret = Deno.env.get("FACEBOOK_APP_SECRET");
        tokenUrl = 'https://graph.facebook.com/v18.0/oauth/access_token';
        profileUrl = 'https://graph.facebook.com/v18.0/me?fields=id,name,email,picture';
        break;
      case 'instagram':
        clientId = Deno.env.get("INSTAGRAM_APP_ID");
        clientSecret = Deno.env.get("INSTAGRAM_APP_SECRET");
        tokenUrl = 'https://api.instagram.com/oauth/access_token';
        profileUrl = 'https://graph.instagram.com/me?fields=id,username';
        break;
      case 'twitter':
        clientId = Deno.env.get("TWITTER_CLIENT_ID");
        clientSecret = Deno.env.get("TWITTER_CLIENT_SECRET");
        tokenUrl = 'https://api.twitter.com/2/oauth2/token';
        profileUrl = 'https://api.twitter.com/2/users/me';
        break;
      case 'tiktok':
        clientId = Deno.env.get("TIKTOK_CLIENT_KEY");
        clientSecret = Deno.env.get("TIKTOK_CLIENT_SECRET");
        tokenUrl = 'https://open-api.tiktok.com/oauth/access_token/';
        profileUrl = 'https://open-api.tiktok.com/user/info/';
        break;
      case 'pinterest':
        clientId = Deno.env.get("PINTEREST_APP_ID");
        clientSecret = Deno.env.get("PINTEREST_APP_SECRET");
        tokenUrl = 'https://api.pinterest.com/v5/oauth/token';
        profileUrl = 'https://api.pinterest.com/v5/user_account';
        break;
      default:
        return new Response(
          JSON.stringify({ error: 'Unsupported provider' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
    }

    if (!clientId || !clientSecret) {
      return new Response(
        JSON.stringify({ error: `${provider} API credentials not configured` }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Set a timeout for the token exchange
    const timeoutMs = 10000; // 10 seconds
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Token exchange timed out')), timeoutMs);
    });
    
    // Exchange the authorization code for an access token
    const tokenRequestPromise = fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      }).toString()
    });
    
    // Race between the token request and the timeout
    const tokenResponse = await Promise.race([
      tokenRequestPromise,
      timeoutPromise
    ]);

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}));
      console.error('Token exchange error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to exchange authorization code', details: errorData }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const expiresIn = tokenData.expires_in;

    // Set a timeout for the profile fetch
    const profileTimeoutMs = 10000; // 10 seconds
    const profileTimeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Profile fetch timed out')), profileTimeoutMs);
    });
    
    // Get the user profile from the provider
    const profileRequestPromise = fetch(profileUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    // Race between the profile request and the timeout
    const profileResponse = await Promise.race([
      profileRequestPromise,
      profileTimeoutPromise
    ]);

    if (!profileResponse.ok) {
      console.error('Profile fetch error:', await profileResponse.text());
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user profile' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const profileData = await profileResponse.json();
    
    // Extract the relevant profile information based on the provider
    let providerUserId, username, profileImageUrl;
    
    switch (provider) {
      case 'facebook':
        providerUserId = profileData.id;
        username = profileData.name;
        profileImageUrl = profileData.picture?.data?.url;
        break;
      case 'instagram':
        providerUserId = profileData.id;
        username = profileData.username;
        profileImageUrl = null; // Instagram API doesn't return profile image in basic scope
        break;
      case 'twitter':
        providerUserId = profileData.data.id;
        username = profileData.data.username;
        profileImageUrl = profileData.data.profile_image_url;
        break;
      case 'tiktok':
        providerUserId = profileData.data.user.open_id;
        username = profileData.data.user.display_name;
        profileImageUrl = profileData.data.user.avatar_url;
        break;
      case 'pinterest':
        providerUserId = profileData.id;
        username = profileData.username;
        profileImageUrl = profileData.profile_image;
        break;
      default:
        providerUserId = '';
        username = '';
        profileImageUrl = null;
    }

    // Calculate token expiration date
    const tokenExpiresAt = expiresIn 
      ? new Date(Date.now() + expiresIn * 1000).toISOString()
      : null;

    // Check if the account already exists
    const { data: existingAccount, error: existingAccountError } = await supabase
      .from('social_accounts')
      .select('id')
      .eq('user_id', user.id)
      .eq('provider', provider)
      .single();

    let account;
    
    if (existingAccount) {
      // Update the existing account
      const { data, error } = await supabase
        .from('social_accounts')
        .update({
          access_token: accessToken,
          refresh_token: refreshToken,
          token_expires_at: tokenExpiresAt,
          username,
          profile_image_url: profileImageUrl,
          is_connected: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingAccount.id)
        .select()
        .single();

      if (error) throw error;
      account = data;
    } else {
      // Create a new account
      const { data, error } = await supabase
        .from('social_accounts')
        .insert({
          user_id: user.id,
          provider,
          provider_user_id: providerUserId,
          username,
          access_token: accessToken,
          refresh_token: refreshToken,
          token_expires_at: tokenExpiresAt,
          profile_image_url: profileImageUrl,
          is_connected: true
        })
        .select()
        .single();

      if (error) throw error;
      account = data;
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        account
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
    console.error('Error connecting social account:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to connect social account. Please try again.',
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