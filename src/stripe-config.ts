// Stripe product configuration
export const stripeProducts = [
  {
    id: 'prod_SWCcgNn7GMC01b',
    name: "I'm Needing",
    description: "OwnBite Premium I'm Needing",
    priceId: 'price_1RbACxGCB0haRFSNDxRcTQF5',
    price: 12.99,
    mode: 'subscription'
  },
  {
    id: 'prod_SWCbKrit3bRbkm',
    name: "I'm Craving",
    description: "OwnBite Craving Subscription",
    price: 5.99,
    priceId: 'price_1RbACCGCB0haRFSN5B25dgth',
    mode: 'subscription'
  },
  {
    id: 'prod_premium_plus',
    name: "Ultimate Wellbeing",
    description: "Complete health tracking and lifestyle analytics",
    price: 19.99,
    priceId: 'price_premium_plus',
    mode: 'subscription'
  }
];

// Get product by price ID
export const getProductByPriceId = (priceId: string) => {
  return stripeProducts.find(product => product.priceId === priceId);
};

// Get product by ID
export const getProductById = (id: string) => {
  return stripeProducts.find(product => product.id === id);
};