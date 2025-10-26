// Backend health check and wake-up system
import BACKEND_URL from '../config/backend';

class BackendManager {
  constructor() {
    this.isBackendSleeping = false;
    this.wakeUpAttempts = 0;
    this.maxWakeUpAttempts = 5;
    this.wakeUpDelay = 2000; // 2 seconds between attempts
  }

  // Check if backend is sleeping (returns HTML instead of JSON)
  isBackendSleeping(response) {
    const contentType = response.headers.get('content-type');
    return contentType && contentType.includes('text/html');
  }

  // Wake up the backend by making a simple request
  async wakeUpBackend() {
    console.log('🔄 Backend is sleeping, attempting to wake up...');
    
    for (let attempt = 1; attempt <= this.maxWakeUpAttempts; attempt++) {
      try {
        console.log(`⏰ Wake-up attempt ${attempt}/${this.maxWakeUpAttempts}`);
        
        // Make a simple request to wake up the backend
        const response = await fetch(`${BACKEND_URL}/health`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        });

        // Check if backend is awake (returns JSON)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          console.log('✅ Backend is now awake!');
          this.isBackendSleeping = false;
          this.wakeUpAttempts = 0;
          return true;
        }
      } catch (error) {
        console.log(`❌ Wake-up attempt ${attempt} failed:`, error.message);
      }

      // Wait before next attempt
      if (attempt < this.maxWakeUpAttempts) {
        await new Promise(resolve => setTimeout(resolve, this.wakeUpDelay));
      }
    }

    console.error('💀 Failed to wake up backend after all attempts');
    this.isBackendSleeping = true;
    return false;
  }

  // Enhanced fetch with automatic backend wake-up
  async fetchWithWakeUp(url, options = {}) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Accept': 'application/json',
          ...options.headers
        }
      });

      // Check if backend is sleeping
      if (this.isBackendSleeping(response)) {
        console.log('😴 Backend is sleeping, waking up...');
        const wokeUp = await this.wakeUpBackend();
        
        if (wokeUp) {
          // Retry the original request
          return await fetch(url, {
            ...options,
            headers: {
              'Accept': 'application/json',
              ...options.headers
            }
          });
        } else {
          throw new Error('Backend is sleeping and could not be woken up');
        }
      }

      return response;
    } catch (error) {
      // If it's a network error, try to wake up backend
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        console.log('🌐 Network error, attempting to wake up backend...');
        const wokeUp = await this.wakeUpBackend();
        
        if (wokeUp) {
          // Retry the original request
          return await fetch(url, {
            ...options,
            headers: {
              'Accept': 'application/json',
              ...options.headers
            }
          });
        }
      }
      
      throw error;
    }
  }

  // Get backend status
  async getBackendStatus() {
    try {
      const response = await fetch(`${BACKEND_URL}/health`);
      return {
        isOnline: response.ok,
        isSleeping: this.isBackendSleeping(response)
      };
    } catch (error) {
      return {
        isOnline: false,
        isSleeping: true
      };
    }
  }
}

// Create singleton instance
const backendManager = new BackendManager();

export default backendManager;
