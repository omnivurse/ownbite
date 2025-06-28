export interface SocialAccount {
  id: string;
  user_id: string;
  provider: 'facebook' | 'instagram' | 'tiktok' | 'twitter' | 'pinterest';
  provider_user_id: string;
  username: string;
  access_token: string;
  refresh_token?: string;
  token_expires_at?: string;
  profile_image_url?: string;
  is_connected: boolean;
  created_at: string;
  updated_at: string;
}

export interface SocialShare {
  id: string;
  user_id: string;
  content_type: 'recipe' | 'food_scan' | 'progress' | 'achievement';
  content_id: string;
  provider: 'facebook' | 'instagram' | 'tiktok' | 'twitter' | 'pinterest' | 'linkedin';
  share_url?: string;
  share_image_url?: string;
  share_text: string;
  share_status: 'pending' | 'success' | 'failed';
  created_at: string;
}

export interface SocialShareRequest {
  contentType: 'recipe' | 'food_scan' | 'progress' | 'achievement';
  contentId: string;
  providers: ('facebook' | 'instagram' | 'tiktok' | 'twitter' | 'pinterest')[];
  text?: string;
  imageUrl?: string;
}

export interface SocialConnectRequest {
  provider: 'facebook' | 'instagram' | 'tiktok' | 'twitter' | 'pinterest';
  code: string;
  redirectUri: string;
}