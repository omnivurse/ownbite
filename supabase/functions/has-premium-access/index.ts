import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

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
        JSON.stringify({ error: 'Missing Supabase environment variables', hasPremiumAccess: false }),
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
        JSON.stringify({ error: 'No authorization header', hasPremiumAccess: false }),
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
        JSON.stringify({ error: 'Invalid token', hasPremiumAccess: false }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Special case for demo user
    if (user.email === 'vrt@qloudnet.com') {
      console.log('Demo user detected, granting premium access');
      
      // Update profile to ensure premium status
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'premium',
          subscription_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
        })
        .eq('user_id', user.id);
        
      if (updateError) {
        console.error('Error updating demo user profile:', updateError);
      }
      
      return new Response(
        JSON.stringify({ hasPremiumAccess: true }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if the user has premium access through their profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_end_date')
      .eq('user_id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError);
    }

    // Check if the user has premium access through their profile
    const hasPremiumFromProfile = profile?.subscription_status === 'premium' && 
      (!profile.subscription_end_date || new Date(profile.subscription_end_date) > new Date());

    // Check if the user has a subscription in Stripe
    let hasActiveStripeSubscription = false;

    const { data: customerData, error: customerError } = await supabase
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .maybeSingle();

    if (customerError) {
      console.error('Error getting customer data:', customerError);
    }

    if (customerData?.customer_id) {
      const { data: subscription, error: subscriptionError } = await supabase
        .from('stripe_subscriptions')
        .select('status, price_id')
        .eq('customer_id', customerData.customer_id)
        .maybeSingle();

      if (subscriptionError) {
        console.error('Error getting subscription data:', subscriptionError);
      }

      hasActiveStripeSubscription = subscription?.status === 'active';
    }

    // Determine if the user has premium access
    const hasPremiumAccess = hasPremiumFromProfile || hasActiveStripeSubscription;

    return new Response(
      JSON.stringify({ hasPremiumAccess }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate'
        }
      }
    );
  } catch (error) {
    console.error('Error checking premium access:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', hasPremiumAccess: false }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});