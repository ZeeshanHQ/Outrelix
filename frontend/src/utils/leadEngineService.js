/**
 * Lead Engine Service - Frontend client for Lead Engine API
 */
import BACKEND_URL from '../config/backend';
import { supabase } from '../supabase';

class LeadEngineService {
  constructor() {
    this.baseUrl = BACKEND_URL;
  }

  /**
   * Get Supabase access token for authentication
   */
  async getAuthToken() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        return session.access_token;
      }
      throw new Error('No active session');
    } catch (error) {
      console.error('Failed to get auth token:', error);
      throw error;
    }
  }

  /**
   * Get headers with authentication
   */
  async getHeaders() {
    try {
      const token = await this.getAuthToken();
      const { data: { user } } = await supabase.auth.getUser();
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-User-Id': user?.id || '',
      };
    } catch (error) {
      console.warn('Silent auth failure in getHeaders:', error);
      return {
        'Content-Type': 'application/json',
      };
    }
  }

  /**
   * Check if Lead Engine service is healthy
   */
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/api/lead-engine/health`, {
        method: 'GET',
      });
      return await response.json();
    } catch (error) {
      console.error('Lead Engine health check failed:', error);
      throw error;
    }
  }

  /**
   * Start a new lead generation run
   */
  async startRun(params) {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${this.baseUrl}/api/lead-engine/runs`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to start lead generation');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to start lead run:', error);
      throw error;
    }
  }

  /**
   * Get status of a lead generation run
   */
  async getRunStatus(runId) {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${this.baseUrl}/api/lead-engine/runs/${runId}`, {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get run status');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get run status:', error);
      throw error;
    }
  }

  /**
   * Get summary/statistics for a completed run
   */
  async getRunSummary(runId) {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${this.baseUrl}/api/lead-engine/runs/${runId}/summary`, {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get run summary');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get run summary:', error);
      throw error;
    }
  }

  /**
   * Get leads for a completed run
   */
  async getLeads(runId) {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${this.baseUrl}/api/lead-engine/runs/${runId}/leads`, {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get leads');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get leads:', error);
      throw error;
    }
  }

  /**
   * Delete a lead generation run
   */
  async deleteRun(runId) {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${this.baseUrl}/api/lead-engine/runs/${runId}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete run');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to delete run:', error);
      throw error;
    }
  }

  /**
   * Get usage statistics
   */
  async getUsageStats() {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${this.baseUrl}/api/lead-engine/usage/stats`, {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get usage stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get usage stats:', error);
      throw error;
    }
  }

  /**
   * List all runs
   */
  async listRuns() {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${this.baseUrl}/api/lead-engine/runs`, {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to list runs');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to list runs:', error);
      throw error;
    }
  }

  /**
   * Poll run status until completion
   */
  async pollUntilComplete(runId, onProgress, intervalMs = 2000) {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const status = await this.getRunStatus(runId);

          if (onProgress) {
            onProgress(status);
          }

          if (status.status === 'completed') {
            resolve(status);
          } else if (status.status === 'failed') {
            reject(new Error(status.message || 'Run failed'));
          } else {
            // Continue polling
            setTimeout(poll, intervalMs);
          }
        } catch (error) {
          reject(error);
        }
      };

      poll();
    });
  }
}

export default new LeadEngineService();

