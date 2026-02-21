import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  QuestionMarkCircleIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  UserGroupIcon,
  CogIcon,
  ChartBarIcon,
  ClockIcon,
  SparklesIcon,
  EnvelopeIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const FAQItem = ({ question, answer, isOpen, onToggle }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300"
  >
    <button
      onClick={onToggle}
      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
    >
      <span className="text-lg font-semibold text-gray-900 dark:text-white font-poppins pr-4">
        {question}
      </span>
      {isOpen ? (
        <ChevronUpIcon className="w-6 h-6 text-gray-500 dark:text-gray-400 flex-shrink-0" />
      ) : (
        <ChevronDownIcon className="w-6 h-6 text-gray-500 dark:text-gray-400 flex-shrink-0" />
      )}
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="px-6 pb-4 text-gray-600 dark:text-gray-300 font-poppins leading-relaxed">
            {answer}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

const FAQSection = ({ title, icon: Icon, faqs, delay = 0 }) => {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (index) => {
    setOpenItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-poppins">
          {title}
        </h2>
      </div>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <FAQItem
            key={index}
            question={faq.question}
            answer={faq.answer}
            isOpen={openItems[index]}
            onToggle={() => toggleItem(index)}
          />
        ))}
      </div>
    </motion.div>
  );
};

const ContactForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    // Navigate to contact page or show success message
    router.push('/contact');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-950 rounded-2xl p-8 border border-green-200 dark:border-green-800"
    >
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 font-poppins">
          Still Have Questions?
        </h3>
        <p className="text-lg text-gray-600 dark:text-gray-300 font-poppins">
          Can't find what you're looking for? Our team is here to help!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Methods */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <EnvelopeIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white font-poppins">Email Support</h4>
              <p className="text-gray-600 dark:text-gray-400 font-poppins">support@outrelix.com</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white font-poppins">Live Chat</h4>
              <p className="text-gray-600 dark:text-gray-400 font-poppins">Available 24/7</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <PhoneIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white font-poppins">Phone Support</h4>
              <p className="text-gray-600 dark:text-gray-400 font-poppins">+1 (555) 123-4567</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-poppins"
              required
            />
          </div>
          <div>
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-poppins"
              required
            />
          </div>
          <div>
            <input
              type="text"
              name="subject"
              placeholder="Subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-poppins"
              required
            />
          </div>
          <div>
            <textarea
              name="message"
              placeholder="Your Message"
              value={formData.message}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-poppins resize-none"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity font-poppins"
          >
            Send Message
          </button>
        </form>
      </div>
    </motion.div>
  );
};

const FAQ = () => {
  const pathname = typeof window !== 'undefined' ? window.location.hash : '';
  const generalFAQs = [
    {
      question: "What is Outrelix and how does it work?",
      answer: "Outrelix is an AI-powered email automation platform that helps businesses scale their outreach efforts. Our platform uses advanced AI to find ideal prospects, personalize email content, and automate follow-up sequences. Simply select your industry, choose a template, and let our AI handle the rest - from writing personalized emails to managing responses and scheduling follow-ups."
    },
    {
      question: "How accurate is the AI personalization?",
      answer: "Our AI personalization is highly accurate, achieving 85-95% personalization rates. The AI analyzes each prospect's profile, company information, and online presence to create relevant, personalized messages. We use advanced NLP (Natural Language Processing) and machine learning algorithms that continuously improve based on response patterns and user feedback."
    },
    {
      question: "What industries do you support?",
      answer: "We support 20+ industries including Real Estate, Healthcare, Technology, Finance, Education, Manufacturing, Retail, Consulting, Legal Services, Marketing, E-commerce, SaaS, Non-profit, Construction, Hospitality, Automotive, Insurance, Media, Energy, and Transportation. Each industry has specialized templates and targeting criteria."
    },
    {
      question: "Can I integrate with my existing CRM?",
      answer: "Yes! We offer integrations with popular CRMs including Salesforce, HubSpot, Pipedrive, and more. Pro and Power plans include full CRM integration, while Starter plans offer basic integration. Our API also allows for custom integrations with any CRM or business tool."
    },
    {
      question: "How quickly can I see results?",
      answer: "Most users see results within the first week of using Outrelix. Our AI starts learning from your campaign performance immediately, and you'll typically see improved open rates and response rates within 7-14 days. The platform provides real-time analytics so you can track progress from day one."
    }
  ];

  const pricingFAQs = [
    {
      question: "What's included in the 14-day free trial?",
      answer: "The 14-day free trial includes full access to the Starter plan features: 1,000 emails per month, 1 active sequence, basic analytics dashboard, email verification, and 24/7 email support. You can test all core features and see how the platform works for your business before committing."
    },
    {
      question: "Why do you require a credit card for the free trial?",
      answer: "We require a credit card to protect our platform quality and ensure serious users. This helps us maintain high deliverability rates and prevents abuse. Your card won't be charged until the trial ends, and you can cancel anytime during the trial period."
    },
    {
      question: "Can I upgrade or downgrade my plan anytime?",
      answer: "Yes, you can upgrade your plan at any time and the new features will be available immediately. For downgrades, changes take effect at the next billing cycle. Pro and Power plans can be upgraded instantly, while downgrades are processed at the end of your current billing period."
    },
    {
      question: "What happens if I exceed my monthly email limit?",
      answer: "If you exceed your monthly email limit, you'll receive a notification and can either upgrade your plan or wait until the next billing cycle. We don't charge overage fees - instead, we encourage upgrading to a plan that better fits your needs."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied with our service within the first 30 days, we'll provide a full refund. After 30 days, we handle refunds on a case-by-case basis depending on the circumstances."
    }
  ];

  const technicalFAQs = [
    {
      question: "How do you ensure email deliverability?",
      answer: "We maintain high deliverability through multiple strategies: email warmup services, SPF/DKIM authentication, dedicated IP addresses for Power plan users, real-time bounce handling, and compliance with email best practices. Our platform also includes built-in spam score checking and automatic list cleaning."
    },
    {
      question: "What email templates are available?",
      answer: "We offer 200+ professionally designed email templates across all industries. Templates include cold outreach, follow-up sequences, event invitations, product launches, and more. All templates are optimized for high open rates and can be fully customized to match your brand voice."
    },
    {
      question: "How does the AI reply handling work?",
      answer: "Our AI analyzes incoming responses and categorizes them as positive, negative, or neutral. For positive responses, it can automatically schedule meetings, send additional information, or notify you for personal follow-up. The AI learns from your preferences and improves over time."
    },
    {
      question: "Can I use my own domain for sending emails?",
      answer: "Yes! Pro and Power plans include custom domain support. You can set up your own domain for sending emails, which improves deliverability and maintains your brand consistency. Our team helps you with the domain setup and verification process."
    },
    {
      question: "What analytics and reporting do you provide?",
      answer: "We provide comprehensive analytics including open rates, click rates, reply rates, bounce rates, and conversion tracking. Real-time dashboards show campaign performance, and detailed reports help you optimize your outreach strategy. Power plan users get advanced analytics and custom reporting."
    }
  ];

  const securityFAQs = [
    {
      question: "How do you protect my data and contacts?",
      answer: "We never store your prospect data permanently. All data is encrypted in transit and at rest using industry-standard AES-256 encryption. We comply with GDPR, CCPA, and other privacy regulations. Your contact lists are processed securely and deleted after campaign completion."
    },
    {
      question: "Are you SOC2 and GDPR compliant?",
      answer: "Yes, we are SOC2 Type II certified and fully GDPR compliant. We undergo regular security audits and maintain strict data protection protocols. Our platform is designed with privacy-by-design principles, ensuring your data and your prospects' data are always protected."
    },
    {
      question: "What security measures do you have in place?",
      answer: "We implement multiple security layers: end-to-end encryption, two-factor authentication, regular security audits, secure API endpoints, and strict access controls. Our infrastructure is hosted on AWS with enterprise-grade security, and we maintain comprehensive backup and disaster recovery procedures."
    },
    {
      question: "Can I export my data anytime?",
      answer: "Absolutely! You can export your campaign data, analytics, and contact lists at any time. We provide data portability in multiple formats (CSV, JSON) and ensure you maintain full control over your data. There are no restrictions on data export."
    }
  ];

  // Handle anchor links when page loads
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const element = document.querySelector(window.location.hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }, 500);
      }
    }
  }, []);

  return (
    <>
      <style>{`
        body, .poppins, .font-poppins {
          font-family: 'Poppins', Arial, sans-serif !important;
        }
        
        /* Smooth scrolling */
        html { scroll-behavior: smooth; }
        
        /* Enhanced animations */
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        .floating { animation: float 6s ease-in-out infinite; }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950">
        {/* Hero Section */}
        <section className="pt-20 pb-16 w-full relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 dark:from-blue-950 dark:via-purple-950 dark:to-green-950 animate-pulse opacity-30"></div>
          </div>

          <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 px-4 py-2 rounded-full text-sm font-medium text-green-700 dark:text-green-300 mb-6">
                <QuestionMarkCircleIcon className="w-4 h-4" />
                Frequently Asked Questions
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 font-poppins leading-tight">
                Everything You Need to Know
              </h1>

              <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 font-poppins leading-relaxed max-w-3xl mx-auto">
                Find answers to common questions about Outrelix, our features, pricing, and how to get started with AI-powered email automation.
              </p>
            </motion.div>
          </div>
        </section>

        {/* FAQ Sections */}
        <section className="py-16 w-full">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-16">
              <div id="general">
                <FAQSection
                  title="General Questions"
                  icon={RocketLaunchIcon}
                  faqs={generalFAQs}
                  delay={0.1}
                />
              </div>

              <div id="pricing">
                <FAQSection
                  title="Pricing & Billing"
                  icon={CreditCardIcon}
                  faqs={pricingFAQs}
                  delay={0.2}
                />
              </div>

              <div id="technical">
                <FAQSection
                  title="Technical & Features"
                  icon={CogIcon}
                  faqs={technicalFAQs}
                  delay={0.3}
                />
              </div>

              <div id="security">
                <FAQSection
                  title="Security & Privacy"
                  icon={ShieldCheckIcon}
                  faqs={securityFAQs}
                  delay={0.4}
                />
              </div>

              {/* Contact Form Section */}
              <ContactForm />
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default FAQ; 