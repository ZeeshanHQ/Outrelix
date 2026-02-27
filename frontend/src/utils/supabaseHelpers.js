import { supabase, supabaseUrl, supabaseAnonKey } from '../supabase';

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
                model: opts.model || 'meta-llama/llama-3.1-8b-instruct:free',
                ...opts,
            }),
        });
        let json;
        try {
            json = await res.json();
        } catch (e) {
            if (res.status === 404) throw new Error(`AI Function Not Found (404). Please ensure 'ai_complete' is deployed.`);
            throw new Error(`AI Request failed with status ${res.status}: ${res.statusText}`);
        }

        if (!res.ok) {
            const errorMsg = typeof json?.error === 'object' ? JSON.stringify(json.error) : (json?.error || 'AI request failed');
            throw new Error(errorMsg);
        }
        return json.content || '';
    }
};

// Analyzer helper functions
export const analyzerApi = {
    async fetchPageContent(url, mode = 'standard') {
        try {
            const response = await fetch(`${supabaseUrl}/functions/v1/fetch_page`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${supabaseAnonKey}`,
                },
                body: JSON.stringify({ url, mode }),
            });

            if (!response.ok) {
                let errJson = {};
                try {
                    errJson = await response.json();
                } catch (e) {
                    throw new Error(`Edge Function error ${response.status}: ${response.statusText || 'Internal Server Error'}`);
                }
                const msg = errJson.message || errJson.error || response.statusText;
                throw new Error(`Failed to fetch page: ${msg}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching page content:', error);
            throw error;
        }
    },

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
