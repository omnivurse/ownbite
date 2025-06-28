import React, { useState } from 'react';
import { Share2 } from 'lucide-react';
import Button from '../ui/Button';
import SocialShareModal from './SocialShareModal';

interface SocialShareButtonProps {
  contentType: 'recipe' | 'food_scan' | 'progress' | 'achievement' | 'bloodwork';
  contentId: string;
  contentName: string;
  imageUrl?: string;
  defaultText?: string;
  className?: string;
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onShareSuccess?: () => void;
}

const SocialShareButton: React.FC<SocialShareButtonProps> = ({
  contentType,
  contentId,
  contentName,
  imageUrl,
  defaultText,
  className = '',
  variant = 'outline',
  size = 'md',
  onShareSuccess
}) => {
  const [showShareModal, setShowShareModal] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        leftIcon={<Share2 className="h-4 w-4" />}
        onClick={() => setShowShareModal(true)}
      >
        Share
      </Button>
      
      <SocialShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        contentType={contentType}
        contentId={contentId}
        contentName={contentName}
        imageUrl={imageUrl}
        defaultText={defaultText}
        onShareSuccess={onShareSuccess}
      />
    </>
  );
};

export default SocialShareButton;