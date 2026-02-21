import React from 'react';
import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Platform',
      links: [
        { label: 'AI Lead Scraper', href: '/leads' },
        { label: 'Outreach Writer', href: '/writer' },
        { label: 'Brand Intelligence', href: '/brand-generator' },
        { label: 'SEO Analytics', href: '/seo-optimizer' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Success Stories', href: '/blog' },
        { label: 'Sales Playbooks', href: '/blog' },
        { label: 'Documentation', href: '/faq' },
        { label: 'API Reference', href: '/faq' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'Contact Sales', href: '/contact' },
        { label: 'Privacy Center', href: '/privacy' },
        { label: 'Security', href: '/terms' },
      ],
    },
  ];

  return (
    <footer className="bg-white border-t border-gray-100 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-20">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black tracking-tighter text-gray-900 uppercase">
                Outrelix<span className="text-blue-600">.</span>
              </span>
            </div>
            <p className="text-gray-500 max-w-sm leading-relaxed font-medium">
              The world's most powerful AI-driven outreach platform. We help elite sales teams find, verify, and close leads at scale with neural intelligence.
            </p>
            <div className="flex gap-4">
              {['Twitter', 'LinkedIn', 'YouTube'].map((social) => (
                <a
                  key={social}
                  href={`#${social}`}
                  className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-100 transition-all font-sans"
                >
                  <span className="sr-only">{social}</span>
                  <div className="w-4 h-4 bg-current rounded-sm" />
                </a>
              ))}
            </div>
          </div>
          {footerLinks.map((group) => (
            <div key={group.title} className="space-y-6 font-sans">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-900">
                {group.title}
              </h4>
              <ul className="space-y-4">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-gray-500 hover:text-blue-600 transition-colors text-sm font-medium"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-12 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6 font-sans">
          <p className="text-gray-400 text-xs font-medium">
            © {currentYear} Outrelix Intelligence. All rights reserved.
          </p>
          <div className="flex gap-8">
            <Link href="/privacy" className="text-gray-400 hover:text-gray-600 text-xs font-medium">Privacy Policy</Link>
            <Link href="/terms" className="text-gray-400 hover:text-gray-600 text-xs font-medium">Terms of Service</Link>
            <Link href="/cookies" className="text-gray-400 hover:text-gray-600 text-xs font-medium">Cookie Settings</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
