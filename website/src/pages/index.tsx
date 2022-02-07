import React from 'react';
import { Layout } from '../components/Layout';
import { HeroSection } from '../components/home/Hero';
import { Features } from '../components/home/Features';
import { InspiringStory } from '../components/home/InspiringStory';

export default function Home() {
  return (
    <Layout showSubMenu={false} title="">
      <div>
        <HeroSection />
        <Features />
        <InspiringStory />
      </div>
    </Layout>
  );
}
