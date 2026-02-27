'use client';
import React, { useState } from 'react';

const cardLogos = [
  '/cards/visa.svg',
  '/cards/mastercard.svg',
  '/cards/amex.svg',
  '/cards/stripe.png',
];

const faqs = [
  'Which payment methods do you offer?',
  'How can I switch my plan?',
  'How can I cancel my plan?',
  'If I cancel my plan, how long will I have access for?',
  'How can I change my email address?',
  'When does my free trial end?',
  'How can I switch to annual billing?',
  'How can I use this information to grow my business?',
  'What is the methodology behind Outrelix data and how does it differ from Google Analytics?',
  "What's the difference between this and the free version?",
  'How can I trial premium/locked features?',
  'Can I switch between trials of your different products/solutions?',
];

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300 mb-2">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
      >
        <span className="text-lg font-semibold text-gray-900 font-poppins pr-4">{question}</span>
        <span className="ml-2">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-6 pb-4 text-gray-600 font-poppins leading-relaxed animate-fade-in">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function PricingPayment() {
  const [billing, setBilling] = useState('monthly');
  const [country, setCountry] = useState('Pakistan');
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '', name: '' });
  const [invoice, setInvoice] = useState({ company: '', address: '', city: '', postal: '' });

  const planPrice = billing === 'monthly' ? 99 : 65;
  const planLabel = billing === 'monthly' ? '$99 / month' : '$65 / month';
  const total = billing === 'monthly' ? 99 : 780;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-100 via-blue-200 to-purple-100 flex flex-col items-center py-10 px-2">
      <h1 className="text-3xl md:text-4xl font-bold font-poppins text-center mb-10 mt-2 tracking-tight">Complete your purchase</h1>
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8 mb-16">
        {/* Left: Payment and Invoice */}
        <div className="flex-1 flex flex-col gap-8">
          {/* Payment method */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-900">Payment method</span>
              <span className="text-xs text-gray-500 flex items-center gap-1"><svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" /><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg> Secured payment</span>
            </div>
            <label className="text-sm font-medium text-gray-700 mb-1">Credit card</label>
            <input type="text" className="w-full border rounded-lg px-4 py-2 mb-2 text-gray-900" placeholder="Card number" value={card.number} onChange={e => setCard({ ...card, number: e.target.value })} />
            <div className="flex items-center gap-2 mb-2">
              {cardLogos.map(src => <img key={src} src={src} alt="card" className="h-6" />)}
              <span className="text-xs text-gray-400 ml-2">Pre-paid cards not accepted</span>
            </div>
            <div className="flex gap-2 mb-2">
              <input type="text" className="flex-1 border rounded-lg px-4 py-2" placeholder="MM/YY" value={card.expiry} onChange={e => setCard({ ...card, expiry: e.target.value })} />
              <input type="text" className="flex-1 border rounded-lg px-4 py-2" placeholder="CVV" value={card.cvc} onChange={e => setCard({ ...card, cvc: e.target.value })} />
              <input type="text" className="flex-1 border rounded-lg px-4 py-2" placeholder="Name on card" value={card.name} onChange={e => setCard({ ...card, name: e.target.value })} />
            </div>
          </div>
          {/* Invoice details */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 flex flex-col gap-4">
            <span className="font-semibold text-gray-900 mb-2">Invoice details</span>
            <div className="flex gap-2 mb-2">
              <input type="text" className="flex-1 border rounded-lg px-4 py-2" placeholder="Company name" value={invoice.company} onChange={e => setInvoice({ ...invoice, company: e.target.value })} />
              <select className="flex-1 border rounded-lg px-4 py-2" value={country} onChange={e => setCountry(e.target.value)}>
                <option>Pakistan</option>
                <option>USA</option>
                <option>UK</option>
                <option>India</option>
                <option>Germany</option>
                <option>France</option>
                <option>Other</option>
              </select>
            </div>
            <input type="text" className="w-full border rounded-lg px-4 py-2 mb-2" placeholder="Address" value={invoice.address} onChange={e => setInvoice({ ...invoice, address: e.target.value })} />
            <div className="flex gap-2">
              <input type="text" className="flex-1 border rounded-lg px-4 py-2" placeholder="City" value={invoice.city} onChange={e => setInvoice({ ...invoice, city: e.target.value })} />
              <input type="text" className="flex-1 border rounded-lg px-4 py-2" placeholder="Postal Code" value={invoice.postal} onChange={e => setInvoice({ ...invoice, postal: e.target.value })} />
            </div>
          </div>
        </div>
        {/* Right: Plan summary and purchase */}
        <div className="w-full md:w-[350px] flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 flex flex-col gap-4">
            <div className="font-semibold text-gray-900 mb-1">Plan details</div>
            <div className="text-sm text-gray-500 mb-2">Competitive Intelligence – Starter</div>
            <div className="flex gap-2 items-center mb-2">
              <span className="text-xs text-gray-500">Billing cycle</span>
              <button onClick={() => setBilling('monthly')} className={`px-3 py-1 rounded-lg text-xs font-semibold border ${billing==='monthly' ? 'bg-blue-100 text-blue-700 border-blue-400' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>Pay monthly</button>
              <button onClick={() => setBilling('annual')} className={`px-3 py-1 rounded-lg text-xs font-semibold border ${billing==='annual' ? 'bg-blue-100 text-blue-700 border-blue-400' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>Pay annually</button>
              {billing==='annual' && <span className="ml-2 px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-semibold">Save 34% with annual</span>}
            </div>
            <div className="flex justify-between text-sm mb-1"><span>Pay annually</span><span>$65 / month</span></div>
            <div className="flex justify-between text-sm mb-1"><span>Pay monthly</span><span>$99 / month</span></div>
            <div className="flex justify-between text-base font-semibold mt-2"><span>Subtotal</span><span>${planPrice}</span></div>
            <div className="flex justify-between text-lg font-bold mt-2"><span>Total due today</span><span>${total}</span></div>
            <button className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white font-semibold font-poppins text-lg shadow-xl hover:shadow-2xl transition-all duration-200 tracking-tight">Purchase</button>
            <div className="flex items-center gap-2 mt-2 text-xs text-green-700"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" /><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg> Secure Payment and PCI compliant</div>
            <div className="flex items-center gap-2 mt-2 text-xs text-blue-700"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16z" /></svg> We will not charge anything until you subscribe to a plan manually.</div>
            <div className="flex gap-2 mt-2">
              <img src="/cards/visa.svg" alt="Visa" className="h-6 w-auto mx-1" />
              <img src="/cards/mastercard.svg" alt="MasterCard" className="h-6 w-auto mx-1" />
              <img src="/cards/amex.svg" alt="Amex" className="h-6 w-auto mx-1" />
              <img src="/cards/stripe.png" alt="Stripe" className="h-6 w-auto mx-1" />
            </div>
            <div className="text-xs text-gray-400 mt-2">Your subscription begins today and can be cancelled anytime.<br/>By purchasing, you accept the <a href="#" className="underline">Terms of Service</a>.<br/>Need some help? <a href="#" className="underline">Contact support</a></div>
          </div>
        </div>
      </div>
      {/* FAQ Section */}
      <div className="w-full max-w-3xl mx-auto mt-12 mb-8">
        <h2 className="text-2xl font-bold font-poppins text-center mb-6">Pricing FAQ</h2>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          {[
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
          ].map((faq, i) => (
            <FAQItem key={i} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </div>
  );
} 