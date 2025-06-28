import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Button from '../ui/Button';
import { stripeService } from '../../services/stripeService';

interface CheckoutButtonProps {
  priceId: string;
  mode?: 'payment' | 'subscription';
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const CheckoutButton: React.FC<CheckoutButtonProps> = ({
  priceId,
  mode = 'subscription',
  children,
  className = '',
  variant = 'primary',
  size = 'md'
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      const { url } = await stripeService.createCheckoutSession(priceId, mode);
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCheckout}
      disabled={isLoading}
      className={className}
      leftIcon={isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
    >
      {isLoading ? 'Redirecting...' : children}
    </Button>
  );
};

export default CheckoutButton;