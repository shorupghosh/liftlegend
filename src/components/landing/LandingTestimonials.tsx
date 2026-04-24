import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface Review {
  id: string;
  gym_name: string;
  reviewer_name: string;
  rating: number;
  content: string;
}

const FALLBACK_REVIEWS: Review[] = [
  {
    id: '1',
    gym_name: 'Iron Fitness',
    reviewer_name: 'Ahmed',
    rating: 5,
    content: 'LiftLegend completely changed how we handle memberships. No more paper records, and the WhatsApp integrations have boosted our retention by 30%.',
  },
  {
    id: '2',
    gym_name: 'Flex Zone Dhaka',
    reviewer_name: 'Rahim U.',
    rating: 5,
    content: 'The bKash tracking and QR attendance system is exactly what we needed. Best SaaS for gym owners in Bangladesh, hands down.',
  },
  {
    id: '3',
    gym_name: 'PowerHouse Gym',
    reviewer_name: 'Nadia',
    rating: 5,
    content: 'Our members love the fast QR check-in. It gives our gym a very premium feel, and the dashboard helps me track daily revenue effortlessly.',
  }
];

export function LandingTestimonials() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const { data, error } = await supabase
          .from('platform_reviews')
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(6);

        if (error) throw error;
        
        if (data && data.length > 0) {
          setReviews(data);
        } else {
          setReviews(FALLBACK_REVIEWS);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setReviews(FALLBACK_REVIEWS);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, []);

  return (
    <section className="py-24 px-6 bg-white dark:bg-[#111821] relative overflow-hidden" id="testimonials">
      {/* Decorative Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#1978e5]/5 dark:bg-[#1978e5]/10 blur-3xl rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
            <span className="material-symbols-outlined text-sm">stars</span>
            Success Stories
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            Loved by Gym Owners
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            See how LiftLegend is helping fitness businesses across Bangladesh scale operations and increase revenue.
          </p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 h-64 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-lg shadow-slate-200/50 dark:shadow-none hover:-translate-y-1 transition-transform duration-300">
                <div className="flex gap-1 text-[#f97316] mb-6">
                  {[...Array(review.rating)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                  {[...Array(5 - review.rating)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-xl text-slate-200 dark:text-slate-700" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                </div>
                
                <p className="text-slate-700 dark:text-slate-300 mb-8 leading-relaxed italic">
                  "{review.content}"
                </p>

                <div className="flex items-center gap-4 mt-auto">
                  <div className="size-12 rounded-full bg-[#1978e5]/10 text-[#1978e5] flex items-center justify-center font-black text-lg">
                    {review.reviewer_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{review.reviewer_name}</p>
                    <p className="text-xs text-slate-500 font-medium">{review.gym_name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
