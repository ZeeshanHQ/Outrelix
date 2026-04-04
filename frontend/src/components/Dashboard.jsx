import { BACKEND_URL } from '../config/backend';

const loadIndustries = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/industries`);

      // Check if the response status is OK (status in the range 200-299)
      if (!response.ok) {
        const errorText = await response.text(); // Read response as text for better error info
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const data = await response.json();
      setIndustries(data);
    } catch (error) {
      console.error('Error loading industries:', error);
      setError('Failed to load industries: ' + error.message); // Include error message
    }
  }; 