import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../../components/BrandLogo';


const BLOG_POSTS = [
  {
    slug: 'open-gym-dhaka-2026',
    title: 'The 2026 Guide to Opening a Gym in Dhaka',
    excerpt: 'Everything you need to know about locations, equipment costs, and management software to run a profitable fitness center in BD.',
    date: 'May 1, 2026',
  },
  {
    slug: 'calculate-gym-profit-margins',
    title: 'How to Calculate Gym Profit Margins in Bangladesh',
    excerpt: 'Stop guessing your revenue. Learn how to calculate churn, member LTV, and operating costs in BDT.',
    date: 'April 25, 2026',
  },
  {
    slug: 'stop-unpaid-gym-members',
    title: 'How to Stop Members Using Your Gym Without Paying',
    excerpt: 'If 5 members skip their 1500 BDT fee, you lose 7500 BDT. Learn how automated SMS reminders and QR access can stop revenue leaks.',
    date: 'April 15, 2026',
  }
];

export default function BlogHub() {
  useEffect(() => {
    document.title = "Bangladesh Gym Owner's Guide | LiftLegend Blog";
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Learn how to open a gym, calculate profit margins, and stop revenue leakage. The ultimate resource for gym owners in Bangladesh.');
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-display">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/"><BrandLogo className="h-12 w-auto" variant="auto" /></Link>
          <Link to="/login?signup=true&plan=ADVANCED" className="bg-[#1978e5] text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg hover:bg-blue-600 transition-all">Start 30-Day Trial</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black mb-6">Bangladesh Gym Owner's Guide</h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Resources, guides, and tips to help you build a more profitable fitness business in BD.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BLOG_POSTS.map(post => (
            <Link to={`/blog/${post.slug}`} key={post.slug} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 flex flex-col h-full hover:scale-105 transition-transform cursor-pointer hover:shadow-xl">
              <span className="text-xs font-bold text-slate-400 mb-3">{post.date}</span>
              <h2 className="text-xl font-bold mb-3">{post.title}</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 flex-grow">{post.excerpt}</p>
              <span className="text-[#1978e5] font-bold text-sm flex items-center gap-1">Read Article <span className="material-symbols-outlined text-sm">arrow_forward</span></span>
            </Link>
          ))}
        </div>

      </main>
    </div>
  );
}
