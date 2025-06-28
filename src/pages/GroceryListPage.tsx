import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Plus, 
  Trash2, 
  Check, 
  ChevronLeft,
  Share2,
  Edit,
  Save,
  X
} from 'lucide-react';
import PageContainer from '../components/Layout/PageContainer';
import Card, { CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { communityService, GroceryList, GroceryItem } from '../services/communityService';

const GroceryListPage: React.FC = () => {
  const { listId } = useParams<{ listId: string }>();
  const navigate = useNavigate();
  
  const [list, setList] = useState<GroceryList | null>(null);
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editCategory, setEditCategory] = useState('');

  useEffect(() => {
    if (listId) {
      loadGroceryList();
    }
  }, [listId]);

  const loadGroceryList = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real implementation, you would fetch the list details
      // For now, we'll create a mock list
      setList({
        id: listId || 'mock-id',
        user_id: 'user-id',
        name: 'My Grocery List',
        is_public: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      // Load items
      const listItems = await communityService.getGroceryListItems(listId!);
      setItems(listItems);
    } catch (err: any) {
      console.error('Error loading grocery list:', err);
      setError(err.message || 'Failed to load grocery list');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    
    try {
      const newItem = await communityService.addGroceryItem(listId!, {
        name: newItemName.trim(),
        quantity: newItemQuantity.trim(),
        category: newItemCategory.trim(),
        is_checked: false
      });
      
      setItems([...items, newItem]);
      setNewItemName('');
      setNewItemQuantity('');
      setNewItemCategory('');
    } catch (err) {
      console.error('Error adding item:', err);
    }
  };

  const handleToggleItem = async (itemId: string, isChecked: boolean) => {
    try {
      await communityService.updateGroceryItem(itemId, { is_checked: isChecked });
      setItems(items.map(item => 
        item.id === itemId ? { ...item, is_checked: isChecked } : item
      ));
    } catch (err) {
      console.error('Error toggling item:', err);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await communityService.deleteGroceryItem(itemId);
      setItems(items.filter(item => item.id !== itemId));
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  const startEditItem = (item: GroceryItem) => {
    setEditingItem(item.id);
    setEditName(item.name);
    setEditQuantity(item.quantity || '');
    setEditCategory(item.category || '');
  };

  const cancelEditItem = () => {
    setEditingItem(null);
    setEditName('');
    setEditQuantity('');
    setEditCategory('');
  };

  const saveEditItem = async (itemId: string) => {
    try {
      if (!editName.trim()) return;
      
      const updatedItem = await communityService.updateGroceryItem(itemId, {
        name: editName.trim(),
        quantity: editQuantity.trim(),
        category: editCategory.trim()
      });
      
      setItems(items.map(item => 
        item.id === itemId ? updatedItem : item
      ));
      
      setEditingItem(null);
    } catch (err) {
      console.error('Error updating item:', err);
    }
  };

  // Group items by category
  const groupedItems: Record<string, GroceryItem[]> = {};
  items.forEach(item => {
    const category = item.category || 'Uncategorized';
    if (!groupedItems[category]) {
      groupedItems[category] = [];
    }
    groupedItems[category].push(item);
  });

  // Sort categories
  const sortedCategories = Object.keys(groupedItems).sort();

  if (loading) {
    return (
      <PageContainer>
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-neutral-200 rounded w-3/4"></div>
            <div className="h-12 bg-neutral-200 rounded"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-neutral-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error || !list) {
    return (
      <PageContainer>
        <div className="max-w-4xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">
            {error || 'Grocery list not found'}
          </h2>
          <Button 
            variant="primary"
            onClick={() => navigate('/grocery')}
          >
            Back to Grocery Lists
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ChevronLeft className="h-4 w-4" />}
            onClick={() => navigate('/grocery')}
          >
            Back to Grocery Lists
          </Button>
        </div>

        {/* List Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-neutral-900">
            {list.name}
          </h1>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Share2 className="h-4 w-4" />}
            >
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Edit className="h-4 w-4" />}
            >
              Rename
            </Button>
          </div>
        </div>

        {/* Add Item Form */}
        <Card className="mb-6">
          <CardBody>
            <h2 className="text-lg font-semibold mb-4">Add Item</h2>
            
            <form onSubmit={handleAddItem} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Item name"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div className="sm:w-1/4">
                <input
                  type="text"
                  value={newItemQuantity}
                  onChange={(e) => setNewItemQuantity(e.target.value)}
                  placeholder="Quantity"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="sm:w-1/4">
                <input
                  type="text"
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  placeholder="Category"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <Button
                type="submit"
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Add
              </Button>
            </form>
          </CardBody>
        </Card>

        {/* Items List */}
        <Card>
          <CardBody>
            <h2 className="text-lg font-semibold mb-4">
              Grocery Items ({items.length})
            </h2>
            
            {items.length === 0 ? (
              <div className="text-center py-8 bg-neutral-50 rounded-lg">
                <ShoppingCart className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 mb-2">Your list is empty</h3>
                <p className="text-neutral-600 mb-4">Add items to your grocery list</p>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedCategories.map(category => (
                  <div key={category}>
                    <h3 className="font-medium text-neutral-900 mb-2">{category}</h3>
                    <div className="space-y-2">
                      {groupedItems[category].map(item => (
                        <div 
                          key={item.id} 
                          className={`flex items-center p-3 rounded-lg border ${
                            item.is_checked 
                              ? 'border-neutral-200 bg-neutral-50' 
                              : 'border-neutral-200'
                          }`}
                        >
                          {editingItem === item.id ? (
                            <div className="flex-1 flex flex-col sm:flex-row gap-2">
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="flex-1 px-3 py-1 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="Item name"
                              />
                              <input
                                type="text"
                                value={editQuantity}
                                onChange={(e) => setEditQuantity(e.target.value)}
                                className="sm:w-1/4 px-3 py-1 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="Quantity"
                              />
                              <input
                                type="text"
                                value={editCategory}
                                onChange={(e) => setEditCategory(e.target.value)}
                                className="sm:w-1/4 px-3 py-1 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="Category"
                              />
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => saveEditItem(item.id)}
                                  className="p-1 text-green-600 hover:text-green-700"
                                >
                                  <Save className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={cancelEditItem}
                                  className="p-1 text-red-600 hover:text-red-700"
                                >
                                  <X className="h-5 w-5" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => handleToggleItem(item.id, !item.is_checked)}
                                className={`flex-shrink-0 h-5 w-5 rounded border ${
                                  item.is_checked 
                                    ? 'bg-primary-500 border-primary-500 flex items-center justify-center' 
                                    : 'border-neutral-300'
                                }`}
                              >
                                {item.is_checked && <Check className="h-3 w-3 text-white" />}
                              </button>
                              
                              <div className="flex-1 ml-3">
                                <span className={`font-medium ${item.is_checked ? 'line-through text-neutral-500' : 'text-neutral-900'}`}>
                                  {item.name}
                                </span>
                                {item.quantity && (
                                  <span className={`ml-2 text-sm ${item.is_checked ? 'line-through text-neutral-400' : 'text-neutral-600'}`}>
                                    ({item.quantity})
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => startEditItem(item)}
                                  className="p-1 text-neutral-500 hover:text-primary-600"
                                >
                                  <Edit className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="p-1 text-neutral-500 hover:text-red-600"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </PageContainer>
  );
};

export default GroceryListPage;