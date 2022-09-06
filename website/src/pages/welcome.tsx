import React from 'react';
import { Layout } from './../components/Layout';
import { Features } from './../components/Features';

export default function Welcome() {
  return (
    <Layout showSubMenu={true} title="Grafana Infinity Datasource">
      <Features />
    </Layout>
  );
}
