import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Linkedin, Youtube, Instagram, Github } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Platform',
      links: [
        { label: 'AI Lead Scraper', to: '/platform/ai-lead-scraper' },
        { label: 'Outreach Writer', to: '/platform/outreach-writer' },
        { label: 'Brand Intelligence', to: '/platform/brand-intelligence' },
        { label: 'SEO Analytics', to: '/platform/seo-analytics' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Success Stories', to: '/resources/success-stories' },
        { label: 'Sales Playbooks', to: '/resources/sales-playbooks' },
        { label: 'Documentation', to: '/resources/documentation' },
        { label: 'API Reference', to: '/resources/api-reference' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', to: '/about' },
        { label: 'Contact Sales', to: '/contact' },
        { label: 'Privacy Center', to: '/privacy' },
        { label: 'Security', to: '/terms' },
      ],
    },
  ];

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter', color: 'hover:text-sky-400 hover:border-sky-400/30' },
    { icon: Linkedin, href: '#', label: 'LinkedIn', color: 'hover:text-blue-600 hover:border-blue-600/30' },
    { icon: Youtube, href: '#', label: 'YouTube', color: 'hover:text-red-500 hover:border-red-500/30' },
    { icon: Instagram, href: '#', label: 'Instagram', color: 'hover:text-pink-500 hover:border-pink-500/30' },
    { icon: Github, href: '#', label: 'GitHub', color: 'hover:text-slate-900 hover:border-slate-900/30' },
  ];

  return (
    <footer className="bg-white border-t border-gray-100 pt-24 pb-12 relative overflow-hidden">
      {/* Background Decorative Blur */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-20">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-3 group">
                <img src="/outrelix.png" alt="Outrelix Logo" className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
                <span className="text-3xl font-black tracking-tighter text-gray-900 uppercase group-hover:text-blue-600 transition-colors">
                  Outrelix<span className="text-blue-600">.</span>
                </span>
              </Link>
            </div>
            <p className="text-gray-500 max-w-sm leading-relaxed font-normal">
              The world's most powerful AI-driven outreach platform. We help elite sales teams find, verify, and close leads at scale with neural intelligence.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className={`w-10 h-10 rounded-xl border border-gray-100 flex items-center justify-center text-gray-400 transition-all duration-300 bg-white shadow-sm ${social.color}`}
                >
                  <span className="sr-only">{social.label}</span>
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
          {footerLinks.map((group) => (
            <div key={group.title} className="space-y-6">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-900">
                {group.title}
              </h4>
              <ul className="space-y-4">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-gray-500 hover:text-blue-600 transition-colors text-sm font-medium inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-12 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-400 text-xs font-medium">
            © {currentYear} Outrelix Intelligence. All rights reserved.
          </p>
          <div className="flex gap-8">
            <Link to="/privacy" className="text-gray-400 hover:text-gray-600 text-xs font-medium">Privacy Policy</Link>
            <Link to="/terms" className="text-gray-400 hover:text-gray-600 text-xs font-medium">Terms of Service</Link>
            <Link to="/cookies" className="text-gray-400 hover:text-gray-600 text-xs font-medium">Cookie Settings</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
