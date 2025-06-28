import { supabase } from '../lib/supabase';

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  type: 'goal' | 'reminder';
  priority: 'low' | 'medium' | 'high';
  is_completed: boolean;
  created_at: string;
}

export const reminderService = {
  /**
   * Get user's reminders
   */
  async getReminders(filter: 'all' | 'active' | 'completed' = 'all'): Promise<Reminder[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (filter === 'active') {
        query = query.eq('is_completed', false);
      } else if (filter === 'completed') {
        query = query.eq('is_completed', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching reminders:', error);
      throw error;
    }
  },

  /**
   * Add a new reminder
   */
  async addReminder(reminder: Omit<Reminder, 'id' | 'user_id' | 'created_at'>): Promise<Reminder> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('reminders')
        .insert({
          user_id: user.id,
          ...reminder
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding reminder:', error);
      throw error;
    }
  },

  /**
   * Update an existing reminder
   */
  async updateReminder(id: string, updates: Partial<Reminder>): Promise<Reminder> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('reminders')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating reminder:', error);
      throw error;
    }
  },

  /**
   * Delete a reminder
   */
  async deleteReminder(id: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting reminder:', error);
      throw error;
    }
  }
};