import React, { useState, useEffect } from 'react';
import { graphql } from 'gatsby';
import { Layout } from '../components/Layout';
import { HeroSection } from '../components/Hero';
import { Badges } from '../components/Badges';
import { Features } from '../components/Features';

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
      <HeroSection />
      <Features />
      <Badges />
    </Layout>
  );
}
