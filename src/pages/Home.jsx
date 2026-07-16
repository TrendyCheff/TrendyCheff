import { Link } from 'react-router-dom';
import { Star, Users, Utensils, ChefHat, Heart, Sparkles } from 'lucide-react';
import { STATIC_REVIEWS } from '../data/staticReviews.js';
import ReviewCard from '../components/ReviewCard.jsx';
import FAQ from '../components/FAQ.jsx';
import ContactSection from '../components/ContactSection.jsx';
import FeatureCard from '../components/FeatureCard.jsx';

const FEATURES = [
  {
    icon: Sparkles,
    title: 'Quality First',
    description:
      'Hand-picked ingredients from local markets. No shortcuts, ever.',
  },
  {
    icon: Heart,
    title: 'Made with Love',
    description:
      'Family recipes passed down and refined over 20+ years of cooking.',
  },
  {
    icon: ChefHat,
    title: 'Fresh & Personal',
    description:
      'I cook every order myself. No commissary kitchen, no reheats.',
  },
];

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-24">
          <div className="flex flex-col items-center justify-center text-center md:items-start md:text-left">
            <span className="inline-block rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
              Personal Chef in Maryland
            </span>
            <h1 className="mt-5 font-display text-5xl font-bold leading-tight text-gray-900 sm:text-6xl">
              Food Made <span className="text-primary-500">Fresh</span> For You
            </h1>
            <p className="mt-5 max-w-lg text-lg text-gray-600">
              Authentic Indo-Chinese, Indian and Italian prepared in your
              kitchen by Trendy Cheff for intimate dinners, parties and
              full-scale events.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
              <Link to="/menu" className="btn-primary">
                View Our Menu
              </Link>
              <Link to="/catering" className="btn-outline">
                Catering
              </Link>
            </div>
          </div>
          <div className="hidden md:flex items-center justify-center">
            <div className="aspect-square w-72 h-72 rounded-full bg-primary-100/60 flex items-center justify-center">
              <ChefHat size={120} className="text-primary-400" />
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-gray-100 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-3 gap-6 px-6 py-10 text-center">
          {[
            { icon: Users, value: '500+', label: 'Happy customers' },
            { icon: Utensils, value: '50+', label: 'Menu items' },
            { icon: Star, value: '5★', label: 'Average rating' },
          ].map((s, i) => (
            <div key={i}>
              <s.icon className="mx-auto text-primary-500" size={28} />
              <div className="mt-2 text-3xl font-bold text-gray-900">
                {s.value}
              </div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center font-display text-3xl font-bold text-gray-900 sm:text-4xl">
            Why Trendy Cheff
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center font-display text-3xl font-bold text-gray-900 sm:text-4xl">
            What our customers say
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {STATIC_REVIEWS.slice(0, 6).map((r, i) => (
              <ReviewCard key={i} {...r} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/reviews" className="btn-outline">
              See all reviews
            </Link>
          </div>
        </div>
      </section>

      {/* MEET THE CHEF */}
      <section
        id="about-chef"
        className="bg-gradient-to-br from-orange-50 to-white py-20 scroll-mt-20"
      >
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <img
              src="https://lh3.googleusercontent.com/d/1fxDchg3M4ykCm8x_xyClyBHFEXBk0HXE"
              alt="Trendy Cheff"
              className="mx-auto aspect-square w-full max-w-md rounded-3xl object-cover shadow-2xl"
              onError={(e) => {
                e.currentTarget.src =
                  'https://placehold.co/800x800/f97316/ffffff?text=Trendy+Cheff';
              }}
            />
          </div>
          <div className="order-1 md:order-2">
            <span className="inline-block rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
              Meet the Chef
            </span>
            <h2 className="mt-4 font-display text-4xl font-bold text-gray-900 sm:text-5xl">
              The face behind{' '}
              <span className="text-primary-500">Trendy Cheff</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-gray-700">
              With over 10 years of hands-on culinary experience, I bring the
              vibrant flavors of India and the bold zest of Chinese cuisine to
              every plate. Originally from Delhi, India, I specialize in
              crafting rich, aromatic dishes like my signature Chicken Korma,
              along with a variety of authentic curries, stir-fries, and comfort
              favorites. As a ServSafe Certified Chef, I combine traditional
              recipes with modern kitchen standards to deliver meals that are
              not only delicious but made with care and precision. Every dish I
              create tells a story of passion, culture, and flavor—served from
              my heart to your table.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-gray-700 ring-1 ring-gray-200">
                🛡️ ServSafe Certified
              </span>
              <span className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-gray-700 ring-1 ring-gray-200">
                🇮🇳 Originally from Delhi
              </span>
              <span className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-gray-700 ring-1 ring-gray-200">
                🍛 10+ years cooking
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center font-display text-3xl font-bold text-gray-900 sm:text-4xl">
            Frequently asked questions
          </h2>
          <div className="mt-10">
            <FAQ />
          </div>
        </div>
      </section>

      <ContactSection />
    </>
  );
}
