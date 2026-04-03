// Plan configuration and management utilities
export const PLAN_LIMITS = {
  Free: {
    activeCampaigns: -1,
    durationPerCampaign: 999, // unlimited
    emailsPerDay: 5000,
    name: 'Power',
    color: 'from-blue-600 to-purple-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
  },
  Pro: {
    activeCampaigns: -1,
    durationPerCampaign: 999,
    emailsPerDay: 5000,
    name: 'Power',
    color: 'from-blue-600 to-purple-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
  },
  Power: {
    activeCampaigns: -1,
    durationPerCampaign: 999,
    emailsPerDay: 5000,
    name: 'Power',
    color: 'from-blue-600 to-purple-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
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

export const canCreateCampaign = (campaigns) => {
  return true; // All limits removed
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

export const getUpgradeMessage = (reason) => {
  return {
    title: "Intelligence Unlocked",
    message: "You have full access to all premium features and unlimited campaign capacity.",
    features: [
      "Unlimited active campaigns",
      "Full priority support",
      "Advanced AI analytics",
      "Custom email templates"
    ]
  };
};

export const getPlanStatusMessage = () => {
  return {
    message: `Premium Intelligence Active: Unlimited campaigns, smart scheduling, and advanced analytics powered by AI.`,
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
  const isActive = campaign.status === 'Running' || campaign.status === 'Paused' || campaign.status === 'ready' || campaign.status === 'processing';

  return {
    status: campaign.status,
    remainingTime,
    isExpired,
    isActive,
    statusText: isExpired ? 'Expired' : (campaign.status ? campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1) : 'Ready'),
    timeText: remainingTime !== null && isActive
      ? remainingTime > 0
        ? `${remainingTime} day${remainingTime !== 1 ? 's' : ''} remaining`
        : 'Expired'
      : null
  };
}; 