import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckIcon, XMarkIcon, SparklesIcon, RocketLaunchIcon, TrophyIcon, StarIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

const PricingPage = () => {
  const [isYearly, setIsYearly] = useState(false);
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Starter',
      subtitle: 'Perfect for solo founders',
      price: 99,
      duration: '7 Days per campaign',
      emails: '1,000 emails per month',
      logo: '/logos/starter-premium.png',
      features: [
        { text: '1 active sequence', included: true },
        { text: 'Basic analytics dashboard (limited view)', included: true },
        { text: 'Email verification', included: true },
        { text: '24/7 email support', included: true },
        { text: 'No integrations', included: false },
        { text: 'Limited templates', included: false },
        { text: 'No AI smart reply', included: false },
        { text: 'Limited industry access', included: false },
      ],
      cta: 'Start Free Trial',
      popular: false,
      icon: RocketLaunchIcon,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800'
    },
    {
      name: 'Pro',
      subtitle: 'Ideal for SaaS founders & small teams',
      price: 199,
      duration: '14 Days per campaign',
      emails: '5,000 emails per month',
      logo: '/logos/pro-premium.png',
      features: [
        { text: 'Unlimited sequences', included: true },
        { text: 'Smart AI replies & suggestions', included: true },
        { text: '200+ email templates', included: true },
        { text: 'Basic CRM integration', included: true },
        { text: 'Limited 3rd-party integrations', included: true },
        { text: 'Priority support', included: true },
        { text: 'Custom domain support', included: true },
        { text: 'Limited analytics depth', included: false },
      ],
      cta: 'Upgrade Now',
      popular: true,
      icon: TrophyIcon,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800'
    },
    {
      name: 'Power',
      subtitle: 'Built for agencies & startups',
      price: 399,
      duration: '30 Days per campaign',
      emails: '15,000 emails per month',
      logo: '/logos/power-premium.png',
      features: [
        { text: 'Unlimited everything', included: true },
        { text: 'AI chat assistant for sales', included: true },
        { text: 'Full CRM integration', included: true },
        { text: 'All integrations (Zapier, Slack, HubSpot, etc.)', included: true },
        { text: 'Team access & collaboration', included: true },
        { text: 'Email warm-up service', included: true },
        { text: 'Dedicated account manager', included: true },
        { text: 'API access + custom integrations', included: true },
        { text: 'Full analytics dashboard', included: true },
      ],
      cta: 'Get Power Plan',
      popular: false,
      icon: StarIcon,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800'
    }
  ];

  return (
    <div className="min-h-screen w-full font-poppins relative">
      {/* Fixed full-screen background gradient */}
      <div className="fixed inset-0 w-full h-full z-0 bg-gradient-to-br from-[#f8fafc] via-[#e2e8f0] to-[#f1f5f9] dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#334155]" aria-hidden="true"></div>
      
      {/* Scrollable content */}
      <div className="relative min-h-screen w-full flex flex-col z-10 bg-transparent">
        {/* Header */}
        <div className="flex items-center justify-center py-12 px-4">
          <div className="text-center max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
                <SparklesIcon className="w-4 h-4" />
                Powered by GPT-4: Launch campaigns smarter, faster
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Simple, Transparent
                </span>
                <br />
                <span className="text-gray-900 dark:text-white">Pricing</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Choose the perfect plan for your outreach needs. Scale as you grow.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="flex-1 px-4 pb-12">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-6"
            >
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className={`relative rounded-2xl p-8 ${plan.bgColor} ${plan.borderColor} border-2 transition-all duration-300 ${
                    plan.popular 
                      ? 'ring-2 ring-purple-500 ring-offset-4 ring-offset-white dark:ring-offset-gray-900 shadow-2xl' 
                      : 'shadow-xl hover:shadow-2xl'
                  }`}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                        Most Popular
                      </div>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    {/* Premium Logo */}
                    <div className="flex justify-center mb-4">
                      <div className="relative">
                        <img 
                          src={plan.logo} 
                          alt={`${plan.name} Premium`}
                          className="w-20 h-20 object-contain filter drop-shadow-lg"
                          onError={(e) => {
                            // Fallback to icon if logo fails to load
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        {/* Fallback Icon */}
                        <div 
                          className={`hidden items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${plan.color} text-white`}
                          style={{ display: 'none' }}
                        >
                          <plan.icon className="w-8 h-8" />
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
                      {plan.subtitle}
                    </p>
                    
                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline justify-center">
                        <span className="text-4xl font-bold text-gray-900 dark:text-white">
                          ${plan.price}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 ml-2">/month</span>
                      </div>
                    </div>

                    {/* Key Features */}
                    <div className="space-y-3 mb-8">
                      <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Duration:</span>
                        <span className="ml-2">{plan.duration}</span>
                      </div>
                      <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Emails:</span>
                        <span className="ml-2">{plan.emails}</span>
                      </div>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start">
                        {feature.included ? (
                          <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                        ) : (
                          <XMarkIcon className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${feature.included ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}`}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl'
                        : 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 dark:from-gray-600 dark:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-800'
                    }`}
                  >
                    {plan.cta}
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>

            {/* Bottom CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-center mt-16"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Need a custom plan?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                  We work with enterprise teams and agencies to create custom solutions that fit your specific needs.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/contact')}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Contact Sales
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage; 