import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Link, Instagram, Twitter, Facebook, Globe, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { affiliateService } from '../../services/affiliateService';
import Card, { CardBody, CardHeader } from '../ui/Card';
import Button from '../ui/Button';

const AffiliateSignupForm: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [bio, setBio] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [socialLinks, setSocialLinks] = useState({
    instagram: '',
    twitter: '',
    facebook: '',
    website: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName.trim()) {
      setError('Full name is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      await affiliateService.upsertAffiliateProfile({
        full_name: fullName,
        bio,
        referral_code: referralCode || undefined, // Let the service generate one if empty
        social_links: socialLinks
      });
      
      setSuccess('Your affiliate profile has been created successfully!');
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/affiliate/dashboard');
      }, 2000);
      
    } catch (err: any) {
      console.error('Error creating affiliate profile:', err);
      setError(err.message || 'Failed to create affiliate profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold text-neutral-900">Become an Affiliate</h2>
      </CardHeader>
      <CardBody>
        {success ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 mb-4">
            {success}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-neutral-700 mb-1">
                Full Name*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10 w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Your full name"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-neutral-700 mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Tell us about yourself and why you're passionate about nutrition"
                rows={4}
              />
            </div>
            
            <div>
              <label htmlFor="referralCode" className="block text-sm font-medium text-neutral-700 mb-1">
                Custom Referral Code (Optional)
              </label>
              <input
                id="referralCode"
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Leave blank to auto-generate"
              />
              <p className="mt-1 text-xs text-neutral-500">
                If left blank, we'll generate a unique code for you based on your name.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-md font-medium text-neutral-800">Social Media Links</h3>
              
              <div>
                <label htmlFor="instagram" className="block text-sm font-medium text-neutral-700 mb-1">
                  Instagram
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Instagram className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    id="instagram"
                    type="text"
                    value={socialLinks.instagram}
                    onChange={(e) => setSocialLinks({...socialLinks, instagram: e.target.value})}
                    className="pl-10 w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="@yourusername"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="twitter" className="block text-sm font-medium text-neutral-700 mb-1">
                  Twitter
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Twitter className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    id="twitter"
                    type="text"
                    value={socialLinks.twitter}
                    onChange={(e) => setSocialLinks({...socialLinks, twitter: e.target.value})}
                    className="pl-10 w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="@yourusername"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="facebook" className="block text-sm font-medium text-neutral-700 mb-1">
                  Facebook
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Facebook className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    id="facebook"
                    type="text"
                    value={socialLinks.facebook}
                    onChange={(e) => setSocialLinks({...socialLinks, facebook: e.target.value})}
                    className="pl-10 w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="facebook.com/yourpage"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-neutral-700 mb-1">
                  Website
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    id="website"
                    type="text"
                    value={socialLinks.website}
                    onChange={(e) => setSocialLinks({...socialLinks, website: e.target.value})}
                    className="pl-10 w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            </div>
            
            <div className="pt-4">
              <Button
                type="submit"
                isLoading={isSubmitting}
                leftIcon={isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                className="w-full"
              >
                {isSubmitting ? 'Creating Profile...' : 'Create Affiliate Profile'}
              </Button>
            </div>
          </form>
        )}
      </CardBody>
    </Card>
  );
};

export default AffiliateSignupForm;