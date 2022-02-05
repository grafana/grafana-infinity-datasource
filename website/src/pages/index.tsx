import React from 'react';
import { graphql } from 'gatsby';
import { Layout } from '../components/Layout';
import { HeroSection } from '../components/Hero';
import { Features } from '../components/Features';
import { InspiringStory } from '../components/InspiringStory';

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        wallpaper
      }
    }
  }
`;

export default function Home(props: { data: any }) {
  return (
    <Layout showSubMenu={false} title="">
      <div className="home">
        <HeroSection />
        <Features />
        <InspiringStory />
      </div>
    </Layout>
  );
}
