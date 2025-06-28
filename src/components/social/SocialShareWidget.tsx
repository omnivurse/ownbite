import React, { useState } from 'react';
import { Share2, Award, TrendingUp, Camera, FileText, Heart } from 'lucide-react';
import SocialShareModal from './SocialShareModal';
import Card, { CardBody, CardHeader } from '../ui/Card';
import Button from '../ui/Button';

interface SocialShareWidgetProps {
  className?: string;
  onShareSuccess?: () => void;
}

const SocialShareWidget: React.FC<SocialShareWidgetProps> = ({ 
  className = '',
  onShareSuccess
}) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareType, setShareType] = useState<{
    type: 'recipe' | 'food_scan' | 'progress' | 'achievement' | 'bloodwork';
    name: string;
    id: string;
    imageUrl?: string;
    defaultText?: string;
  } | null>(null);

  const handleShareClick = (type: 'recipe' | 'food_scan' | 'progress' | 'achievement' | 'bloodwork', name: string) => {
    setShareType({
      type,
      name,
      id: 'latest', // In a real app, this would be a real ID
      imageUrl: type === 'progress' 
        ? 'https://images.pexels.com/photos/4098365/pexels-photo-4098365.jpeg?auto=compress&cs=tinysrgb&w=600'
        : undefined,
      defaultText: getDefaultText(type, name)
    });
    setShowShareModal(true);
  };

  const getDefaultText = (type: string, name: string) => {
    switch (type) {
      case 'progress':
        return "I'm making great progress on my health journey with OwnBite! #iamhealthierwithownbite.me";
      case 'achievement':
        return `I just earned the ${name} achievement on OwnBite! #iamhealthierwithownbite.me`;
      default:
        return undefined;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <h3 className="text-lg font-semibold flex items-center">
          <Share2 className="h-5 w-5 mr-2 text-primary-600" />
          Share Your Journey
        </h3>
      </CardHeader>
      <CardBody>
        <p className="text-neutral-600 mb-4">
          Share your health journey with friends and family. Use the hashtag #iamhealthierwithownbite.me to join the community!
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <Button
            variant="outline"
            className="flex items-center justify-center"
            leftIcon={<TrendingUp className="h-5 w-5 text-green-600" />}
            onClick={() => handleShareClick('progress', 'Health Progress')}
          >
            Share Progress
          </Button>
          
          <Button
            variant="outline"
            className="flex items-center justify-center"
            leftIcon={<Award className="h-5 w-5 text-yellow-600" />}
            onClick={() => handleShareClick('achievement', 'Health Milestone')}
          >
            Share Achievement
          </Button>
          
          <Button
            variant="outline"
            className="flex items-center justify-center"
            leftIcon={<Camera className="h-5 w-5 text-blue-600" />}
            onClick={() => handleShareClick('food_scan', 'Food Scan')}
          >
            Share Food Scan
          </Button>
          
          <Button
            variant="outline"
            className="flex items-center justify-center"
            leftIcon={<FileText className="h-5 w-5 text-purple-600" />}
            onClick={() => handleShareClick('bloodwork', 'Bloodwork Results')}
          >
            Share Health Data
          </Button>
        </div>
        
        <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg">
          <div className="flex items-start">
            <Heart className="h-5 w-5 text-primary-600 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-sm text-primary-700">
              Sharing your journey helps inspire others and earns you reward points! Use our official hashtag <span className="font-medium">#iamhealthierwithownbite.me</span> to be featured.
            </p>
          </div>
        </div>
        
        {shareType && (
          <SocialShareModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            contentType={shareType.type}
            contentId={shareType.id}
            contentName={shareType.name}
            imageUrl={shareType.imageUrl}
            defaultText={shareType.defaultText}
            onShareSuccess={onShareSuccess}
          />
        )}
      </CardBody>
    </Card>
  );
};

export default SocialShareWidget;