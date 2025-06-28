import React from 'react';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">OwnBite</h3>
            <p className="text-neutral-300 text-sm">
              AI-powered food scanning and nutrition tracking to help you make healthier choices.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/scan" className="text-neutral-300 hover:text-white transition-colors">Scan Food</a></li>
              <li><a href="/recipes" className="text-neutral-300 hover:text-white transition-colors">Recipes</a></li>
              <li><a href="/coach" className="text-neutral-300 hover:text-white transition-colors">Nutrition Coach</a></li>
              <li><a href="/about" className="text-neutral-300 hover:text-white transition-colors">About Us</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <p className="text-neutral-300 text-sm mb-2">
              Have questions or feedback? Reach out to our team.
            </p>
            <a 
              href="mailto:support@ownbite.app" 
              className="inline-block text-primary-400 hover:text-primary-300 transition-colors"
            >
              support@ownbite.app
            </a>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-neutral-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-neutral-400 text-sm">
            &copy; {new Date().getFullYear()} OwnBite. All rights reserved.
          </p>
          <p className="text-neutral-400 text-sm flex items-center mt-2 md:mt-0">
            Made with <Heart className="h-4 w-4 text-secondary-500 mx-1" /> for healthier living
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;