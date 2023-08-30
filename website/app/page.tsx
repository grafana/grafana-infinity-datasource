import Hero from '@/components/hero';
import ApiShowcase from '@/components/api-showcase';
import FeaturesGrid from '@/components/features-grid';

export default function Home() {
  return (
    <div className="flex flex-col gap-8 container">
      <Hero />
      <ApiShowcase />
      <FeaturesGrid />
    </div>
  );
}
