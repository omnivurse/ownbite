import React, { useState, useEffect } from 'react';
import { 
  AlarmClock, 
  Calendar, 
  Bell, 
  Target, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  CheckCircle,
  Clock,
  Filter
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { reminderService, Reminder } from '../services/reminderService';
import PageContainer from '../components/Layout/PageContainer';
import Card, { CardBody, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';

const RemindersPage: React.FC = () => {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [reminderType, setReminderType] = useState<'goal' | 'reminder'>('reminder');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  useEffect(() => {
    if (user) {
      loadReminders();
    }
  }, [user, filter]);

  const loadReminders = async () => {
    try {
      setLoading(true);
      const data = await reminderService.getReminders(filter);
      setReminders(data);
    } catch (err: any) {
      console.error('Error loading reminders:', err);
      setError(err.message || 'Failed to load reminders');
    } finally {
      setLoading(false);
    }
  };

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const newReminder: Omit<Reminder, 'id' | 'user_id' | 'created_at'> = {
        title,
        description,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        type: reminderType,
        priority,
        is_completed: false
      };
      
      await reminderService.addReminder(newReminder);
      
      // Reset form
      setTitle('');
      setDescription('');
      setDueDate('');
      setReminderType('reminder');
      setPriority('medium');
      setShowAddForm(false);
      
      // Reload reminders
      await loadReminders();
    } catch (err: any) {
      console.error('Error adding reminder:', err);
      setError(err.message || 'Failed to add reminder');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !editingId) {
      setError('Title is required');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const updatedReminder: Partial<Reminder> = {
        title,
        description,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        type: reminderType,
        priority
      };
      
      await reminderService.updateReminder(editingId, updatedReminder);
      
      // Reset form
      setTitle('');
      setDescription('');
      setDueDate('');
      setReminderType('reminder');
      setPriority('medium');
      setEditingId(null);
      
      // Reload reminders
      await loadReminders();
    } catch (err: any) {
      console.error('Error updating reminder:', err);
      setError(err.message || 'Failed to update reminder');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (id: string, isCompleted: boolean) => {
    try {
      await reminderService.updateReminder(id, { is_completed: !isCompleted });
      await loadReminders();
    } catch (err: any) {
      console.error('Error toggling reminder completion:', err);
      setError(err.message || 'Failed to update reminder');
    }
  };

  const handleDeleteReminder = async (id: string) => {
    try {
      await reminderService.deleteReminder(id);
      await loadReminders();
    } catch (err: any) {
      console.error('Error deleting reminder:', err);
      setError(err.message || 'Failed to delete reminder');
    }
  };

  const startEdit = (reminder: Reminder) => {
    setTitle(reminder.title);
    setDescription(reminder.description || '');
    setDueDate(reminder.due_date ? new Date(reminder.due_date).toISOString().split('T')[0] : '');
    setReminderType(reminder.type);
    setPriority(reminder.priority);
    setEditingId(reminder.id);
  };

  const cancelEdit = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setReminderType('reminder');
    setPriority('medium');
    setEditingId(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-neutral-600 bg-neutral-50 border-neutral-200';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'goal' ? <Target className="h-5 w-5" /> : <Bell className="h-5 w-5" />;
  };

  const getTypeColor = (type: string) => {
    return type === 'goal' 
      ? 'text-purple-600 bg-purple-50 border-purple-200' 
      : 'text-blue-600 bg-blue-50 border-blue-200';
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <PageContainer title="Reminders & Goals">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Reminders & Goals</h1>
            <p className="text-neutral-600 mt-1">
              Track your health goals and set reminders for healthy habits
            </p>
          </div>
          
          <div className="flex gap-3">
            <div className="inline-flex rounded-md shadow-sm">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                  filter === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-neutral-700 hover:bg-neutral-50'
                } border border-neutral-300`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 text-sm font-medium ${
                  filter === 'active'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-neutral-700 hover:bg-neutral-50'
                } border-t border-b border-neutral-300`}
              >
                Active
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                  filter === 'completed'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-neutral-700 hover:bg-neutral-50'
                } border border-neutral-300`}
              >
                Completed
              </button>
            </div>
            
            <Button
              variant="primary"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setShowAddForm(true)}
            >
              Add New
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Add/Edit Form */}
        {(showAddForm || editingId) && (
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-xl font-semibold text-neutral-900">
                {editingId ? 'Edit Reminder/Goal' : 'Add New Reminder/Goal'}
              </h2>
            </CardHeader>
            <CardBody>
              <form onSubmit={editingId ? handleUpdateReminder : handleAddReminder}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-1">
                      Title*
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter title"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter description"
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="dueDate" className="block text-sm font-medium text-neutral-700 mb-1">
                        Due Date
                      </label>
                      <input
                        id="dueDate"
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-neutral-700 mb-1">
                        Type
                      </label>
                      <select
                        id="type"
                        value={reminderType}
                        onChange={(e) => setReminderType(e.target.value as 'goal' | 'reminder')}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="reminder">Reminder</option>
                        <option value="goal">Goal</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="priority" className="block text-sm font-medium text-neutral-700 mb-1">
                        Priority
                      </label>
                      <select
                        id="priority"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (editingId) {
                          cancelEdit();
                        } else {
                          setShowAddForm(false);
                        }
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      leftIcon={<Save className="h-4 w-4" />}
                    >
                      {editingId ? 'Update' : 'Save'}
                    </Button>
                  </div>
                </div>
              </form>
            </CardBody>
          </Card>
        )}

        {/* Reminders List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-neutral-600">Loading reminders...</p>
          </div>
        ) : reminders.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <AlarmClock className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-neutral-900 mb-2">No reminders found</h3>
              <p className="text-neutral-600 mb-6">
                {filter === 'all' 
                  ? 'You haven\'t created any reminders or goals yet.' 
                  : filter === 'active' 
                    ? 'You don\'t have any active reminders or goals.' 
                    : 'You don\'t have any completed reminders or goals.'}
              </p>
              {!showAddForm && (
                <Button
                  variant="primary"
                  leftIcon={<Plus className="h-4 w-4" />}
                  onClick={() => setShowAddForm(true)}
                >
                  Create Your First Reminder
                </Button>
              )}
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-4">
            {reminders.map(reminder => (
              <Card key={reminder.id} className={reminder.is_completed ? 'bg-neutral-50' : ''}>
                <CardBody>
                  <div className="flex items-start">
                    <div className="mr-3 mt-1">
                      <button
                        onClick={() => handleToggleComplete(reminder.id, reminder.is_completed)}
                        className={`h-6 w-6 rounded-full flex items-center justify-center border ${
                          reminder.is_completed 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'border-neutral-300 hover:border-primary-500'
                        }`}
                      >
                        {reminder.is_completed && <CheckCircle className="h-5 w-5" />}
                      </button>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                        <h3 className={`font-semibold text-lg ${reminder.is_completed ? 'line-through text-neutral-500' : 'text-neutral-900'}`}>
                          {reminder.title}
                        </h3>
                        
                        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(reminder.type)}`}>
                            <span className="flex items-center">
                              {getTypeIcon(reminder.type)}
                              <span className="ml-1 capitalize">{reminder.type}</span>
                            </span>
                          </span>
                          
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(reminder.priority)}`}>
                            <span className="capitalize">{reminder.priority}</span>
                          </span>
                        </div>
                      </div>
                      
                      {reminder.description && (
                        <p className={`mb-3 ${reminder.is_completed ? 'text-neutral-500' : 'text-neutral-600'}`}>
                          {reminder.description}
                        </p>
                      )}
                      
                      {reminder.due_date && (
                        <div className={`flex items-center text-sm mb-3 ${
                          isOverdue(reminder.due_date) && !reminder.is_completed 
                            ? 'text-red-600' 
                            : reminder.is_completed 
                              ? 'text-neutral-500' 
                              : 'text-neutral-600'
                        }`}>
                          <Clock className="h-4 w-4 mr-1" />
                          <span>
                            Due: {new Date(reminder.due_date).toLocaleDateString()}
                            {isOverdue(reminder.due_date) && !reminder.is_completed && ' (Overdue)'}
                          </span>
                        </div>
                      )}
                      
                      {!editingId && (
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<Edit className="h-4 w-4" />}
                            onClick={() => startEdit(reminder)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<Trash2 className="h-4 w-4" />}
                            onClick={() => handleDeleteReminder(reminder.id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default RemindersPage;