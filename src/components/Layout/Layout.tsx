import React, { ReactNode, useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

/**
 * Main layout component that wraps all pages
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  
  // Close sidebar by default for non-authenticated users
  useEffect(() => {
    if (!user) {
      setSidebarOpen(false);
    }
  }, [user]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="flex flex-1">
        {/* Only show mobile menu button for authenticated users */}
        {user && (
          <button
            className="fixed bottom-4 left-4 z-30 lg:hidden bg-primary-600 text-white p-3 rounded-full shadow-lg"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        )}
        
        {/* Only render sidebar for authenticated users */}
        {user && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}
        
        {/* Main content - adjust margin only for authenticated users */}
        <div className={`flex-1 ${user ? 'lg:ml-64' : ''} transition-all duration-300`}>
          {children}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Layout;