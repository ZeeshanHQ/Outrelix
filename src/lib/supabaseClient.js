// Supabase Client Wrapper
import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = 'https://bfoggljxtwoloxthtocy.supabase.co';
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmb2dnbGp4dHdvbG94dGh0b2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MDM2MTYsImV4cCI6MjA2NTQ3OTYxNn0.aNc3yGc5KEVWyTUZzVuCLyALdnZgkFfs83IaI5cctcA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// OpenRouter via Supabase Edge Function (secure server-side key)
export const aiApi = {
  async complete(messages, opts = {}) {
    const url = `${supabaseUrl}/functions/v1/ai_complete`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        messages,
        model: 'meta-llama/llama-3.3-8b-instruct:free',
        ...opts,
      }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error || 'AI request failed');
    return json.content || '';
  }
};

// Analyzer helper functions
export const analyzerApi = {
  // Fetch page content via Edge Function
  async fetchPageContent(url) {
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/fetch_page`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch page: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching page content:', error);
      throw error;
    }
  },

  // Save analyzer result
  async saveResult(result) {
    try {
      const { data, error } = await supabase
        .from('analyzer_results')
        .insert([result])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving analyzer result:', error);
      throw error;
    }
  },

  // Get analyzer results for current user
  async getResults(limit = 50) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('analyzer_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching analyzer results:', error);
      throw error;
    }
  },

  // Delete analyzer result
  async deleteResult(resultId) {
    try {
      const { error } = await supabase
        .from('analyzer_results')
        .delete()
        .eq('id', resultId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting analyzer result:', error);
      throw error;
    }
  },

  // Check daily analysis limit
  async checkDailyLimit() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('check_daily_analysis_limit', {
        p_user_id: user.id,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error checking daily limit:', error);
      throw error;
    }
  },

  // Increment analysis count
  async incrementAnalysisCount() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase.rpc('increment_analysis_count', {
        p_user_id: user.id,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error incrementing analysis count:', error);
      throw error;
    }
  },
};

// SEO Optimizer helper functions
export const seoApi = {
  // Save SEO optimization result
  async saveOptimization(optimization) {
    try {
      const { data, error } = await supabase
        .from('seo_optimizations')
        .insert([optimization])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving SEO optimization:', error);
      throw error;
    }
  },

  // Get SEO optimizations for current user
  async getOptimizations(limit = 50) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('seo_optimizations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching SEO optimizations:', error);
      throw error;
    }
  },

  // Delete SEO optimization
  async deleteOptimization(optimizationId) {
    try {
      const { error } = await supabase
        .from('seo_optimizations')
        .delete()
        .eq('id', optimizationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting SEO optimization:', error);
      throw error;
    }
  },

  // Check daily SEO optimization limit
  async checkDailyLimit() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('check_daily_seo_limit', {
        uid: user.id,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error checking daily SEO limit:', error);
      throw error;
    }
  },

  // Increment SEO optimization count
  async incrementOptimizationCount() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase.rpc('increment_seo_count', {
        uid: user.id,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error incrementing SEO optimization count:', error);
      throw error;
    }
  },
};

export default supabase;
