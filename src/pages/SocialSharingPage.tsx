import React from 'react';
import { Share2, Award, TrendingUp, Users, Hash, Heart } from 'lucide-react';
import PageContainer from '../components/Layout/PageContainer';
import SocialShareWidget from '../components/social/SocialShareWidget';
import SocialShareHistory from '../components/social/SocialShareHistory';
import SocialConnectPanel from '../components/social/SocialConnectPanel';
import Card, { CardBody } from '../components/ui/Card';

const SocialSharingPage: React.FC = () => {
  return (
    <PageContainer title="Social Sharing">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Share Your Health Journey
          </h1>
          <p className="text-neutral-600">
            Connect with friends, inspire others, and track your social sharing activity
          </p>
        </div>

        {/* Hashtag Banner */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="p-3 bg-white bg-opacity-20 rounded-full mr-4">
                <Hash className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">#iamhealthierwithownbite.me</h2>
                <p className="opacity-90">
                  Join our community by using our official hashtag in your posts
                </p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="font-medium mb-1">
                Earn points with every share!
              </p>
              <div className="flex items-center justify-center md:justify-end space-x-2">
                <Award className="h-5 w-5" />
                <span>+15-30 points per share</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SocialShareWidget className="mb-6" />
            <SocialShareHistory />
          </div>
          <div>
            <SocialConnectPanel className="mb-6" />
            
            {/* Community Highlights */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold flex items-center mb-4">
                  <Users className="h-5 w-5 mr-2 text-primary-600" />
                  Community Highlights
                </h3>
                
                <div className="space-y-4">
                  <div className="p-4 border border-neutral-200 rounded-lg">
                    <div className="flex items-start">
                      <img 
                        src="https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg?auto=compress&cs=tinysrgb&w=600" 
                        alt="User" 
                        className="h-10 w-10 rounded-full object-cover mr-3"
                      />
                      <div>
                        <p className="font-medium text-neutral-900">Sarah M.</p>
                        <p className="text-sm text-neutral-600 mt-1">
                          "Down 15 pounds and feeling amazing! OwnBite has changed how I think about food. #iamhealthierwithownbite.me"
                        </p>
                        <div className="flex items-center mt-2">
                          <Heart className="h-4 w-4 text-red-500 mr-1" />
                          <span className="text-xs text-neutral-500">124 likes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-neutral-200 rounded-lg">
                    <div className="flex items-start">
                      <img 
                        src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600" 
                        alt="User" 
                        className="h-10 w-10 rounded-full object-cover mr-3"
                      />
                      <div>
                        <p className="font-medium text-neutral-900">Mike J.</p>
                        <p className="text-sm text-neutral-600 mt-1">
                          "My bloodwork results improved dramatically after 3 months with OwnBite's nutrition recommendations! #iamhealthierwithownbite.me"
                        </p>
                        <div className="flex items-center mt-2">
                          <Heart className="h-4 w-4 text-red-500 mr-1" />
                          <span className="text-xs text-neutral-500">89 likes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-neutral-200 rounded-lg">
                    <div className="flex items-start">
                      <img 
                        src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=600" 
                        alt="User" 
                        className="h-10 w-10 rounded-full object-cover mr-3"
                      />
                      <div>
                        <p className="font-medium text-neutral-900">Emma L.</p>
                        <p className="text-sm text-neutral-600 mt-1">
                          "Just hit my 30-day streak! The habit tracking in OwnBite keeps me accountable. #iamhealthierwithownbite.me"
                        </p>
                        <div className="flex items-center mt-2">
                          <Heart className="h-4 w-4 text-red-500 mr-1" />
                          <span className="text-xs text-neutral-500">156 likes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Benefits of Sharing */}
        <Card>
          <CardBody>
            <h3 className="text-xl font-semibold mb-4">Benefits of Sharing Your Journey</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="p-3 bg-primary-100 rounded-full inline-flex mb-3">
                  <Award className="h-6 w-6 text-primary-600" />
                </div>
                <h4 className="font-medium text-neutral-900 mb-2">Earn Reward Points</h4>
                <p className="text-neutral-600 text-sm">
                  Every time you share your progress or achievements, you earn points that can be redeemed for exclusive rewards.
                </p>
              </div>
              
              <div className="text-center">
                <div className="p-3 bg-blue-100 rounded-full inline-flex mb-3">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-medium text-neutral-900 mb-2">Stay Accountable</h4>
                <p className="text-neutral-600 text-sm">
                  Sharing your journey publicly helps you stay committed to your health goals and celebrate your progress.
                </p>
              </div>
              
              <div className="text-center">
                <div className="p-3 bg-green-100 rounded-full inline-flex mb-3">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-medium text-neutral-900 mb-2">Inspire Others</h4>
                <p className="text-neutral-600 text-sm">
                  Your health journey can motivate and inspire others who are just starting their own path to better health.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </PageContainer>
  );
};

export default SocialSharingPage;