import { createClient } from '@supabase/supabase-js';

// Supabase configuration
export const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://bfoggljxtwoloxthtocy.supabase.co';
export const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Create Supabase client with auth options to avoid lock manager issues in local/multi-tab dev
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Disable the lock manager if it's causing timeout issues on some browsers
    flowType: 'pkce'
  }
});

// Auth helper functions
export const auth = {
  signUp: (email, password, metadata = {}) =>
    supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    }),

  signIn: (email, password) =>
    supabase.auth.signInWithPassword({
      email,
      password,
    }),

  signInWithGoogle: () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard',
      },
    }),

  signOut: () => supabase.auth.signOut(),

  getCurrentUser: () => supabase.auth.getUser(),

  getSession: () => supabase.auth.getSession(),

  onAuthStateChange: (callback) =>
    supabase.auth.onAuthStateChange(callback),
};

// Database helper functions
export const db = {
  // Get user profile
  getProfile: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  // Update user profile
  updateProfile: async (userId, updates) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    return { data, error };
  },

  // Create user profile
  createProfile: async (profile) => {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profile)
      .select()
      .single();
    return { data, error };
  },

  // Get campaigns
  getCampaigns: async (userId) => {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Get leads
  getLeads: async (userId) => {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  }
};

// Storage helper functions
export const storage = {
  uploadAvatar: async (userId, file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) return { error: uploadError };

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return { url: publicUrl, error: null };
  }
};

// MFA helper functions
export const mfa = {
  enroll: async () => {
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp'
    });
    return { data, error };
  },
  challenge: async (factorId) => {
    const { data, error } = await supabase.auth.mfa.challenge({ factorId });
    return { data, error };
  },
  verify: async (factorId, challengeId, code) => {
    const { data, error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code
    });
    return { data, error };
  },
  listFactors: async () => {
    const { data, error } = await supabase.auth.mfa.listFactors();
    return { data, error };
  },
  unenroll: async (factorId) => {
    const { data, error } = await supabase.auth.mfa.unenroll({ factorId });
    return { data, error };
  }
};

export default supabase; 