import React, { useState, useEffect } from 'react';
import { 
  Share2, 
  X, 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Copy, 
  Check, 
  Loader2,
  Hash
} from 'lucide-react';
import { 
  FacebookShareButton, 
  TwitterShareButton, 
  LinkedinShareButton,
  PinterestShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  PinterestIcon
} from 'react-share';
import { socialSharingService, ShareRequest } from '../../services/socialSharingService';
import { useSocial } from '../../contexts/SocialContext';
import Button from '../ui/Button';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: 'recipe' | 'food_scan' | 'progress' | 'achievement' | 'bloodwork';
  contentId: string;
  contentName: string;
  imageUrl?: string;
  defaultText?: string;
  onShareSuccess?: () => void;
}

const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  contentType,
  contentId,
  contentName,
  imageUrl,
  defaultText,
  onShareSuccess
}) => {
  const { connectedAccounts } = useSocial();
  const [shareText, setShareText] = useState('');
  const [hashtags, setHashtags] = useState<string[]>(['#iamhealthierwithownbite.me']);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [isSharing, setIsSharing] = useState(false);
  const [shareResult, setShareResult] = useState<{success: boolean; message: string} | null>(null);
  const [copied, setCopied] = useState(false);
  const [newHashtag, setNewHashtag] = useState('');

  // Generate share URL
  const shareUrl = `https://ownbite.me/${contentType === 'recipe' ? 'r' : contentType === 'food_scan' ? 's' : contentType === 'progress' ? 'p' : contentType === 'achievement' ? 'a' : 'b'}/${contentId}`;

  useEffect(() => {
    // Generate default share text
    const generatedText = defaultText || socialSharingService.generateShareText(contentType, contentName);
    setShareText(generatedText);
  }, [contentType, contentName, defaultText]);

  const handleAddHashtag = () => {
    if (!newHashtag.trim()) return;
    
    let formattedTag = newHashtag.trim();
    if (!formattedTag.startsWith('#')) {
      formattedTag = `#${formattedTag}`;
    }
    
    // Remove spaces and special characters
    formattedTag = formattedTag.replace(/[^a-zA-Z0-9#]/g, '');
    
    if (formattedTag && !hashtags.includes(formattedTag)) {
      setHashtags([...hashtags, formattedTag]);
      setNewHashtag('');
    }
  };

  const handleRemoveHashtag = (tag: string) => {
    if (tag === '#iamhealthierwithownbite.me') return; // Don't allow removing the main hashtag
    setHashtags(hashtags.filter(t => t !== tag));
  };

  const handleToggleProvider = (provider: string) => {
    setSelectedProviders(prev => 
      prev.includes(provider)
        ? prev.filter(p => p !== provider)
        : [...prev, provider]
    );
  };

  const handleShare = async () => {
    if (selectedProviders.length === 0) return;
    
    try {
      setIsSharing(true);
      setShareResult(null);
      
      const shareRequests: ShareRequest[] = selectedProviders.map(provider => ({
        content_type: contentType,
        content_id: contentId,
        provider: provider as any,
        share_text: shareText,
        share_url: shareUrl,
        share_image_url: imageUrl,
        hashtags
      }));
      
      // Process each share request
      const results = await Promise.all(
        shareRequests.map(request => socialSharingService.shareContent(request))
      );
      
      // Check if all shares were successful
      const allSuccessful = results.every(result => result.success);
      const totalPoints = results.reduce((sum, result) => sum + (result.points_awarded || 0), 0);
      
      setShareResult({
        success: allSuccessful,
        message: allSuccessful 
          ? `Successfully shared to ${results.length} platform${results.length !== 1 ? 's' : ''}! You earned ${totalPoints} points.` 
          : 'Some shares failed. Please try again.'
      });
      
      if (allSuccessful && onShareSuccess) {
        onShareSuccess();
      }
    } catch (error) {
      console.error('Error sharing content:', error);
      setShareResult({
        success: false,
        message: 'Failed to share content. Please try again.'
      });
    } finally {
      setIsSharing(false);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-neutral-900 flex items-center">
              <Share2 className="h-5 w-5 mr-2 text-primary-600" />
              Share {socialSharingService.getContentTypeDisplayName(contentType)}
            </h3>
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {shareResult ? (
            <div className="text-center py-6">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                shareResult.success ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {shareResult.success ? (
                  <Check className={`h-8 w-8 ${shareResult.success ? 'text-green-600' : 'text-red-600'}`} />
                ) : (
                  <X className="h-8 w-8 text-red-600" />
                )}
              </div>
              <h4 className={`text-lg font-semibold ${shareResult.success ? 'text-green-800' : 'text-red-800'} mb-2`}>
                {shareResult.success ? 'Shared Successfully!' : 'Sharing Failed'}
              </h4>
              <p className={shareResult.success ? 'text-green-600' : 'text-red-600'}>
                {shareResult.message}
              </p>
              <Button
                variant="primary"
                className="mt-6"
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          ) : (
            <>
              {/* Share Text */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Share Text
                </label>
                <textarea
                  value={shareText}
                  onChange={(e) => setShareText(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                  placeholder="What would you like to share?"
                />
              </div>

              {/* Hashtags */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Hashtags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {hashtags.map(tag => (
                    <div 
                      key={tag} 
                      className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${
                        tag === '#iamhealthierwithownbite.me' 
                          ? 'bg-primary-100 text-primary-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {tag}
                      {tag !== '#iamhealthierwithownbite.me' && (
                        <button 
                          onClick={() => handleRemoveHashtag(tag)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex">
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Hash className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                      type="text"
                      value={newHashtag}
                      onChange={(e) => setNewHashtag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddHashtag();
                        }
                      }}
                      className="pl-10 w-full px-4 py-2 border border-neutral-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Add a hashtag"
                    />
                  </div>
                  <button
                    onClick={handleAddHashtag}
                    className="px-4 py-2 bg-primary-600 text-white rounded-r-md hover:bg-primary-700"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Connected Accounts */}
              {connectedAccounts.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Share to your connected accounts
                  </label>
                  <div className="space-y-2">
                    {connectedAccounts.map(account => (
                      <div 
                        key={account.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedProviders.includes(account.provider)
                            ? 'bg-primary-100 border-primary-500 text-primary-800'
                            : 'border-neutral-300 hover:bg-neutral-50'
                        }`}
                        onClick={() => handleToggleProvider(account.provider)}
                      >
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${
                            selectedProviders.includes(account.provider) ? 'bg-primary-500' : 'border border-neutral-400'
                          }`}>
                            {selectedProviders.includes(account.provider) && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <div className="flex items-center">
                            {account.provider === 'facebook' && <Facebook className="h-5 w-5 text-blue-600 mr-2" />}
                            {account.provider === 'instagram' && <Instagram className="h-5 w-5 text-pink-600 mr-2" />}
                            {account.provider === 'twitter' && <Twitter className="h-5 w-5 text-blue-400 mr-2" />}
                            {account.provider === 'linkedin' && <Linkedin className="h-5 w-5 text-blue-700 mr-2" />}
                            <span className="capitalize">{account.provider}</span>
                            <span className="ml-2 text-sm text-neutral-500">@{account.username}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Direct Share Buttons */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Or share directly
                </label>
                <div className="flex justify-center space-x-4">
                  <FacebookShareButton url={shareUrl} quote={`${shareText} ${hashtags.join(' ')}`} hashtag={hashtags[0]}>
                    <FacebookIcon size={40} round />
                  </FacebookShareButton>
                  
                  <TwitterShareButton url={shareUrl} title={shareText} hashtags={hashtags.map(tag => tag.replace('#', ''))}>
                    <TwitterIcon size={40} round />
                  </TwitterShareButton>
                  
                  <LinkedinShareButton url={shareUrl} title={contentName} summary={shareText}>
                    <LinkedinIcon size={40} round />
                  </LinkedinShareButton>
                  
                  <PinterestShareButton url={shareUrl} media={imageUrl || ''} description={`${shareText} ${hashtags.join(' ')}`}>
                    <PinterestIcon size={40} round />
                  </PinterestShareButton>
                </div>
              </div>

              {/* Copy Link */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Share Link
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-neutral-300 rounded-l-md bg-neutral-50"
                  />
                  <button
                    onClick={copyShareLink}
                    className={`px-4 py-2 ${copied ? 'bg-green-600' : 'bg-primary-600'} text-white rounded-r-md hover:${copied ? 'bg-green-700' : 'bg-primary-700'} flex items-center`}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleShare}
                  disabled={isSharing || selectedProviders.length === 0}
                  leftIcon={isSharing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
                >
                  {isSharing ? 'Sharing...' : `Share to ${selectedProviders.length} platform${selectedProviders.length !== 1 ? 's' : ''}`}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SocialShareModal;