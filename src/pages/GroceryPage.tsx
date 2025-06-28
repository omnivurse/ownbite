import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, ExternalLink, MapPin, Clock, Star, Truck } from 'lucide-react';
import PageContainer from '../components/Layout/PageContainer';
import Card, { CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { diaryService } from '../services/diaryService';

interface GroceryItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  category: string;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  inStock: boolean;
  rating: number;
  reviews: number;
}

interface DeliveryService {
  id: string;
  name: string;
  logo: string;
  deliveryTime: string;
  deliveryFee: number;
  minimumOrder: number;
  rating: number;
  available: boolean;
  partnerUrl: string;
}

const GroceryPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [deliveryServices, setDeliveryServices] = useState<DeliveryService[]>([]);
  const [selectedService, setSelectedService] = useState<string>('instacart');
  const [recentEntries, setRecentEntries] = useState<any[]>([]);
  const [suggestedItems, setSuggestedItems] = useState<GroceryItem[]>([]);

  const categories = ['All', 'Fruits & Vegetables', 'Meat & Seafood', 'Dairy', 'Pantry', 'Snacks', 'Beverages'];

  useEffect(() => {
    loadGroceryData();
    loadRecentEntries();
  }, []);

  const loadGroceryData = () => {
    // Mock grocery items data
    const mockItems: GroceryItem[] = [
      {
        id: '1',
        name: 'Organic Avocados',
        brand: 'Fresh Market',
        price: 4.99,
        image: 'https://images.pexels.com/photos/557659/pexels-photo-557659.jpeg?auto=compress&cs=tinysrgb&w=300',
        category: 'Fruits & Vegetables',
        nutrition: { calories: 160, protein: 2, carbs: 9, fat: 15 },
        inStock: true,
        rating: 4.5,
        reviews: 234
      },
      {
        id: '2',
        name: 'Wild Salmon Fillet',
        brand: 'Ocean Fresh',
        price: 12.99,
        image: 'https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg?auto=compress&cs=tinysrgb&w=300',
        category: 'Meat & Seafood',
        nutrition: { calories: 206, protein: 22, carbs: 0, fat: 12 },
        inStock: true,
        rating: 4.8,
        reviews: 156
      },
      {
        id: '3',
        name: 'Greek Yogurt',
        brand: 'Organic Valley',
        price: 5.49,
        image: 'https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg?auto=compress&cs=tinysrgb&w=300',
        category: 'Dairy',
        nutrition: { calories: 100, protein: 17, carbs: 6, fat: 0 },
        inStock: true,
        rating: 4.6,
        reviews: 89
      },
      {
        id: '4',
        name: 'Quinoa',
        brand: 'Ancient Harvest',
        price: 7.99,
        image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=300',
        category: 'Pantry',
        nutrition: { calories: 222, protein: 8, carbs: 39, fat: 4 },
        inStock: true,
        rating: 4.4,
        reviews: 67
      },
      {
        id: '5',
        name: 'Blueberries',
        brand: 'Berry Fresh',
        price: 3.99,
        image: 'https://images.pexels.com/photos/2161643/pexels-photo-2161643.jpeg?auto=compress&cs=tinysrgb&w=300',
        category: 'Fruits & Vegetables',
        nutrition: { calories: 84, protein: 1, carbs: 21, fat: 0 },
        inStock: true,
        rating: 4.7,
        reviews: 145
      },
      {
        id: '6',
        name: 'Almond Butter',
        brand: 'Natural Choice',
        price: 8.99,
        image: 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=300',
        category: 'Pantry',
        nutrition: { calories: 190, protein: 7, carbs: 7, fat: 17 },
        inStock: true,
        rating: 4.3,
        reviews: 78
      }
    ];

    const mockServices: DeliveryService[] = [
      {
        id: 'instacart',
        name: 'Instacart',
        logo: '🛒',
        deliveryTime: '1-2 hours',
        deliveryFee: 3.99,
        minimumOrder: 35,
        rating: 4.7,
        available: true,
        partnerUrl: 'https://instacart.com'
      },
      {
        id: 'amazon-fresh',
        name: 'Amazon Fresh',
        logo: '📦',
        deliveryTime: '2-4 hours',
        deliveryFee: 0,
        minimumOrder: 50,
        rating: 4.5,
        available: true,
        partnerUrl: 'https://fresh.amazon.com'
      },
      {
        id: 'walmart-delivery',
        name: 'Walmart Delivery',
        logo: '🏪',
        deliveryTime: '1-3 hours',
        deliveryFee: 7.95,
        minimumOrder: 35,
        rating: 4.2,
        available: true,
        partnerUrl: 'https://walmart.com/grocery'
      },
      {
        id: 'shipt',
        name: 'Shipt',
        logo: '🎯',
        deliveryTime: '1 hour',
        deliveryFee: 0,
        minimumOrder: 35,
        rating: 4.6,
        available: true,
        partnerUrl: 'https://shipt.com'
      }
    ];

    setGroceryItems(mockItems);
    setDeliveryServices(mockServices);
    setSuggestedItems(mockItems.slice(0, 3));
  };

  const loadRecentEntries = async () => {
    try {
      const today = new Date();
      const entries = await diaryService.getFoodEntries(today);
      setRecentEntries(entries.slice(0, 5));
    } catch (error) {
      console.error('Error loading recent entries:', error);
    }
  };

  const filteredItems = groceryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (itemId: string) => {
    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[itemId] > 1) {
        newCart[itemId]--;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
  };

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [itemId, quantity]) => {
      const item = groceryItems.find(i => i.id === itemId);
      return total + (item ? item.price * quantity : 0);
    }, 0);
  };

  const getCartItemCount = () => {
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  };

  const handleCheckout = () => {
    const selectedServiceData = deliveryServices.find(s => s.id === selectedService);
    if (selectedServiceData) {
      // In a real app, this would integrate with the delivery service's API
      window.open(selectedServiceData.partnerUrl, '_blank');
    }
  };

  const generateShoppingListFromDiary = () => {
    // Generate shopping list based on recent diary entries
    const ingredients = recentEntries.map(entry => entry.name).join(', ');
    setSearchQuery(ingredients);
  };

  return (
    <PageContainer title="Grocery Delivery">
      <div className="space-y-6">
        {/* Header with Search and Service Selection */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for groceries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-12 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <ShoppingCart className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={generateShoppingListFromDiary}
              className="whitespace-nowrap"
            >
              📝 From Diary
            </Button>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {deliveryServices.map(service => (
                <option key={service.id} value={service.id}>
                  {service.logo} {service.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Delivery Services */}
        <Card>
          <CardBody>
            <h3 className="text-lg font-semibold mb-4">🚚 Available Delivery Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {deliveryServices.map(service => (
                <div
                  key={service.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedService === service.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                  onClick={() => setSelectedService(service.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{service.logo}</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-sm">{service.rating}</span>
                    </div>
                  </div>
                  <h4 className="font-medium">{service.name}</h4>
                  <div className="text-sm text-neutral-600 mt-1">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {service.deliveryTime}
                    </div>
                    <div className="flex items-center mt-1">
                      <Truck className="h-3 w-3 mr-1" />
                      ${service.deliveryFee} delivery
                    </div>
                    <div className="flex items-center mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      ${service.minimumOrder} minimum
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Suggested Items Based on Diet */}
        {suggestedItems.length > 0 && (
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold mb-4">💡 Suggested for You</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {suggestedItems.map(item => (
                  <GroceryItemCard
                    key={item.id}
                    item={item}
                    quantity={cart[item.id] || 0}
                    onAdd={() => addToCart(item.id)}
                    onRemove={() => removeFromCart(item.id)}
                  />
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Grocery Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <GroceryItemCard
              key={item.id}
              item={item}
              quantity={cart[item.id] || 0}
              onAdd={() => addToCart(item.id)}
              onRemove={() => removeFromCart(item.id)}
            />
          ))}
        </div>

        {/* Shopping Cart Summary */}
        {getCartItemCount() > 0 && (
          <div className="fixed bottom-6 right-6 z-50">
            <Card className="shadow-lg">
              <CardBody>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">🛒 Cart ({getCartItemCount()} items)</h3>
                  <span className="text-lg font-bold">${getCartTotal().toFixed(2)}</span>
                </div>
                
                <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
                  {Object.entries(cart).map(([itemId, quantity]) => {
                    const item = groceryItems.find(i => i.id === itemId);
                    if (!item) return null;
                    return (
                      <div key={itemId} className="flex justify-between text-sm">
                        <span>{item.name} x{quantity}</span>
                        <span>${(item.price * quantity).toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>

                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleCheckout}
                  leftIcon={<ExternalLink className="h-4 w-4" />}
                >
                  Checkout with {deliveryServices.find(s => s.id === selectedService)?.name}
                </Button>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

interface GroceryItemCardProps {
  item: GroceryItem;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}

const GroceryItemCard: React.FC<GroceryItemCardProps> = ({ item, quantity, onAdd, onRemove }) => {
  return (
    <Card hoverable className="h-full">
      <div className="relative">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        {!item.inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-t-lg">
            <span className="text-white font-medium">Out of Stock</span>
          </div>
        )}
      </div>
      
      <CardBody>
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-medium text-neutral-900 line-clamp-1">{item.name}</h4>
            <p className="text-sm text-neutral-500">{item.brand}</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-primary-600">${item.price}</div>
            <div className="flex items-center text-xs text-neutral-500">
              <Star className="h-3 w-3 text-yellow-500 mr-1" />
              {item.rating} ({item.reviews})
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1 text-xs text-neutral-600 mb-3">
          <div className="text-center">
            <div className="font-medium">{item.nutrition.calories}</div>
            <div>cal</div>
          </div>
          <div className="text-center">
            <div className="font-medium">{item.nutrition.protein}g</div>
            <div>protein</div>
          </div>
          <div className="text-center">
            <div className="font-medium">{item.nutrition.carbs}g</div>
            <div>carbs</div>
          </div>
          <div className="text-center">
            <div className="font-medium">{item.nutrition.fat}g</div>
            <div>fat</div>
          </div>
        </div>

        {quantity > 0 ? (
          <div className="flex items-center justify-between">
            <button
              onClick={onRemove}
              className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center hover:bg-neutral-300"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="font-medium">{quantity}</span>
            <button
              onClick={onAdd}
              className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onAdd}
            disabled={!item.inStock}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Add to Cart
          </Button>
        )}
      </CardBody>
    </Card>
  );
};

export default GroceryPage;