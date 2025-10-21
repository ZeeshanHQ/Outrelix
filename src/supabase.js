import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bfoggljxtwoloxthtocy.supabase.co'; // TODO: Replace with your Supabase project URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmb2dnbGp4dHdvbG94dGh0b2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MDM2MTYsImV4cCI6MjA2NTQ3OTYxNn0.aNc3yGc5KEVWyTUZzVuCLyALdnZgkFfs83IaI5cctcA'; // TODO: Replace with your Supabase anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 