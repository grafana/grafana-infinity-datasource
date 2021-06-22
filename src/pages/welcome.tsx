import React from 'react';
import { Layout } from '../components/website/Layout';
import { Features } from '../components/website/Features';

export default function Welcome() {
  return (
    <Layout showSubMenu={true} title="Grafana Infinity Datasource">
      <Features />
    </Layout>
  );
}
