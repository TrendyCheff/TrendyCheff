import { Sparkles, Heart, ChefHat } from 'lucide-react';
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
      'Recipes passed down and perfected over decades of home cooking.',
  },
  {
    icon: ChefHat,
    title: 'Fresh & Personal',
    description:
      'I cook every order myself. No commissary kitchen, no reheats.',
  },
];

export default function About() {
  return (
    <>
      <section className="py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 md:grid-cols-2">
          <img
            src="https://lh3.googleusercontent.com/d/1fxDchg3M4ykCm8x_xyClyBHFEXBk0HXE"
            alt="Trendy Chefff"
            className="aspect-square w-full rounded-3xl object-cover shadow-xl"
            onError={(e) => {
              e.currentTarget.src =
                'https://placehold.co/800x800/f97316/ffffff?text=Chef';
            }}
          />
          <div>
            <h1 className="font-display text-4xl font-bold text-gray-900 sm:text-5xl">
              Meet <span className="text-primary-500">Trendy Chefff</span>
            </h1>
            <p className="mt-5 text-lg text-gray-700">
              For two decades the chef has been cooking the food that families
              grew up with — the smoky butter chicken of Delhi weddings, the
              street-side hakka noodles of Mumbai, the slow-simmered lentils
              every Sunday. Trendy Chefff brings those flavors to your table,
              fresh and made just for you.
            </p>
            <p className="mt-4 text-gray-600">
              Whether it's a quiet dinner for six or a graduation party for
              sixty, every order gets the same treatment: hand-marinated
              proteins, spices bloomed in real ghee, and trays assembled the
              morning of your event.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-6 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      <ContactSection />
    </>
  );
}
