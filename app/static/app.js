// Fetch and display industries
async function loadIndustries() {
    try {
        const response = await fetch('/industries');
        const industries = await response.json();
        
        const industrySelect = document.getElementById('industry-select');
        if (!industrySelect) return;
        
        // Clear existing options
        industrySelect.innerHTML = '';
        
        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select an industry';
        industrySelect.appendChild(defaultOption);
        
        // Add industry options
        Object.entries(industries).forEach(([key, industry]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = industry.name;
            if (!industry.scrapable) {
                option.disabled = true;
                option.textContent += ' 🔒';
            }
            industrySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading industries:', error);
    }
}

// Handle campaign start
async function startCampaign() {
    const industrySelect = document.getElementById('industry-select');
    const startButton = document.getElementById('start-campaign-btn');
    const loadingMessage = document.getElementById('loading-message');
    
    if (!industrySelect || !startButton) return;
    
    const selectedIndustry = industrySelect.value;
    if (!selectedIndustry) {
        alert('Please select an industry');
        return;
    }
    
    try {
        // Show loading state
        startButton.disabled = true;
        if (loadingMessage) loadingMessage.style.display = 'inline';
        
        // Start scraping
        const response = await fetch('/scrape', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                industry: selectedIndustry,
                max_companies: 100,
                format: 'csv'
            })
        });
        
        const data = await response.json();
        
        if (data.redirect_url) {
            window.location.href = data.redirect_url;
        } else {
            throw new Error('No redirect URL received');
        }
    } catch (error) {
        console.error('Error starting campaign:', error);
        alert('Failed to start campaign. Please try again.');
        
        // Reset button state
        startButton.disabled = false;
        if (loadingMessage) loadingMessage.style.display = 'none';
    }
}

// Initialize dashboard
function initDashboard() {
    // Load industries when page loads
    document.addEventListener('DOMContentLoaded', () => {
        loadIndustries();
        
        // Add event listener to start campaign button
        const startButton = document.getElementById('start-campaign-btn');
        if (startButton) {
            startButton.addEventListener('click', startCampaign);
        }
    });
}

// Call initialization
initDashboard(); 