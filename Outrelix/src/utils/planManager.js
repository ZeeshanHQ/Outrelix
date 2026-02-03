// Plan configuration and management utilities
export const PLAN_LIMITS = {
  Free: {
    activeCampaigns: 2,
    durationPerCampaign: 3, // days
    emailsPerDay: 50,
    name: 'Free',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
  },
  Pro: {
    activeCampaigns: 5,
    durationPerCampaign: 14, // days
    emailsPerDay: 200,
    name: 'Pro',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
  },
  Power: {
    activeCampaigns: -1, // unlimited
    durationPerCampaign: 30, // days
    emailsPerDay: 500,
    name: 'Power',
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
  }
};

// Get user's current plan (default to Free)
export const getUserPlan = () => {
  return localStorage.getItem('userPlan') || 'Free';
};

// Get current plan limits
export const getCurrentPlanLimits = () => {
  const userPlan = getUserPlan();
  return PLAN_LIMITS[userPlan];
};

// Check if user can create a new campaign
export const canCreateCampaign = (campaigns) => {
  const limits = getCurrentPlanLimits();
  const activeCampaigns = campaigns.filter(campaign => 
    campaign.status === 'Running' || campaign.status === 'Paused'
  );
  
  if (limits.activeCampaigns === -1) return true; // Unlimited
  return activeCampaigns.length < limits.activeCampaigns;
};

// Get remaining time for a campaign
export const getCampaignRemainingTime = (campaign) => {
  if (!campaign.start_time) return null;
  
  const limits = getCurrentPlanLimits();
  const startTime = new Date(campaign.start_time);
  const duration = limits.durationPerCampaign;
  const endTime = new Date(startTime.getTime() + (duration * 24 * 60 * 60 * 1000));
  const now = new Date();
  
  if (now >= endTime) return 0; // Expired
  
  const remainingMs = endTime.getTime() - now.getTime();
  const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
  return remainingDays;
};

// Update campaign status based on expiration
export const updateCampaignStatus = (campaigns) => {
  return campaigns.map(campaign => {
    const remainingTime = getCampaignRemainingTime(campaign);
    
    if (remainingTime === 0 && campaign.status === 'Running') {
      return { ...campaign, status: 'Expired' };
    }
    
    return campaign;
  });
};

// Get upgrade message based on reason
export const getUpgradeMessage = (reason) => {
  switch (reason) {
    case 'campaign_limit':
      return {
        title: "Campaign Limit Reached",
        message: `You've reached your campaign limit on the ${getUserPlan()} Plan. Upgrade to run more campaigns and unlock premium features.`,
        features: [
          `Up to ${PLAN_LIMITS.Pro.activeCampaigns} active campaigns`,
          `${PLAN_LIMITS.Pro.durationPerCampaign} days per campaign`,
          `${PLAN_LIMITS.Pro.emailsPerDay} emails per day`,
          "Smart AI replies & suggestions",
          "200+ email templates"
        ]
      };
    case 'campaign_expired':
      return {
        title: "Campaign Expired",
        message: "Your free campaign has ended. Upgrade to unlock more campaigns, longer duration, and smart follow-ups.",
        features: [
          "Unlimited campaign duration",
          "Advanced targeting options",
          "Automated follow-ups",
          "Priority support"
        ]
      };
    case 'template_edit':
      return {
        title: "Template Editor Locked",
        message: "Edit and customize your email templates with our advanced template editor. Upgrade to Pro to unlock this powerful feature.",
        features: [
          "Advanced template editor",
          "Custom email templates",
          "Template library (200+ templates)",
          "A/B testing for templates",
          "Template performance analytics"
        ]
      };
    default:
      return {
        title: "Upgrade Your Plan",
        message: "Unlock premium features and higher limits to scale your outreach.",
        features: [
          "More active campaigns",
          "Longer campaign duration",
          "Higher email limits",
          "Advanced analytics"
        ]
      };
  }
};

// Get plan status message for UI
export const getPlanStatusMessage = () => {
  const plan = getUserPlan();
  const limits = getCurrentPlanLimits();
  
  if (plan === 'Free') {
    return {
      message: `⏳ Free Plan Active: You can run up to ${limits.activeCampaigns} campaigns, each active for ${limits.durationPerCampaign} days, and send ${limits.emailsPerDay} emails/day. Upgrade anytime to unlock unlimited campaigns, longer duration, and smart scheduling.`,
      showUpgradeButton: true
    };
  }
  
  return {
    message: `${plan} Plan Active: ${limits.activeCampaigns === -1 ? 'Unlimited' : `Up to ${limits.activeCampaigns}`} campaigns, ${limits.durationPerCampaign} days each, ${limits.emailsPerDay} emails/day`,
    showUpgradeButton: false
  };
};

// Check if campaign is expired
export const isCampaignExpired = (campaign) => {
  const remainingTime = getCampaignRemainingTime(campaign);
  return remainingTime === 0;
};

// Get campaign status with expiration info
export const getCampaignStatusInfo = (campaign) => {
  const remainingTime = getCampaignRemainingTime(campaign);
  const isExpired = remainingTime === 0;
  const isActive = campaign.status === 'Running' || campaign.status === 'Paused';
  
  return {
    status: campaign.status,
    remainingTime,
    isExpired,
    isActive,
    statusText: isExpired ? 'Expired' : campaign.status,
    timeText: remainingTime !== null && isActive 
      ? remainingTime > 0 
        ? `${remainingTime} day${remainingTime !== 1 ? 's' : ''} remaining`
        : 'Expired'
      : null
  };
}; 