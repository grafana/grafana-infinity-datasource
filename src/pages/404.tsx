import React from 'react';
import { Layout } from '../components/Layout';

export default function PageNotFound() {
  return (
    <Layout showSubHeader={true}>
      <section className="subheader py-5 text-center" style={{ backgroundColor: '#021E40', color: 'white' }}>
        <h1>Sorry.. Page not found.</h1>
      </section>
    </Layout>
  );
}
