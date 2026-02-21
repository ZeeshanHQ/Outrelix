import { createClient } from '@supabase/supabase-js';
import { getSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bfoggljxtwoloxthtocy.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helper functions (bridged to NextAuth)
export const auth = {
  signUp: async (email, password, metadata = {}) => {
    console.warn("Supabase Email Signup is legacy. Use Google Login.");
    return { data: null, error: new Error("Signup is restricted to Google Social Login") };
  },

  signIn: async (email, password) => {
    console.warn("Supabase Email Signin is legacy. Use Google Login.");
    return { data: null, error: new Error("Signin is restricted to Google Social Login") };
  },

  signInWithGoogle: async () => {
    return nextAuthSignIn('google', { callbackUrl: '/dashboard' });
  },

  signOut: async () => {
    return nextAuthSignOut({ callbackUrl: '/' });
  },

  getCurrentUser: async () => {
    const session = await getSession();
    return { user: session?.user, error: null };
  },

  getSession: async () => {
    const session = await getSession();
    return { session, error: null };
  },

  onAuthStateChange: (callback) => {
    // Bridging Supabase's event listener to NextAuth's session-based flow
    // NextAuth handles this via SessionProvider, but we provide a dummy for compatibility
    return { data: { subscription: { unsubscribe: () => { } } } };
  }
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