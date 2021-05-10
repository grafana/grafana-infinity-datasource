import React from 'react';
import { navigate } from 'gatsby';
import { Layout } from '../components/Layout';

export default function Welcome() {
  const patternImage =
    'https://images.unsplash.com/photo-1620503374956-c942862f0372?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2250&q=80';
  return (
    <Layout showSubHeader={true}>
      <>
        <section className="subheader py-5 text-center" style={{ backgroundColor: '#021E40', color: 'white' }}>
          <h1>Grafana Infinity Datasource</h1>
        </section>
        <div className="container my-4">
          <div className="row">
            <div className="col-sm-6 col-lg-6 mb-4" onClick={() => navigate('/wiki/json')}>
              <div
                className="card p-3 text-center feature-card"
                style={{
                  backgroundPosition: 'cover',
                  backgroundPositionY: '70%',
                  backgroundPositionX: '20%',
                  backgroundImage: `url(${patternImage})`,
                }}
              >
                <h6 className="display-6 text-dark">JSON</h6>
                <p className="text-white">Visualize data from any JSON APIs or URLs.</p>
              </div>
            </div>
            <div className="col-sm-6 col-lg-6 mb-4" onClick={() => navigate('/wiki/csv')}>
              <div
                className="card p-3 text-center feature-card"
                style={{
                  backgroundPosition: 'cover',
                  backgroundPositionY: '80%',
                  backgroundImage: `url(${patternImage})`,
                }}
              >
                <h6 className="display-6 text-dark">CSV</h6>
                <p className="text-white">Visualize data from any CSV APIs or URLs.</p>
              </div>
            </div>
            <div className="col-sm-6 col-lg-4 mb-4" onClick={() => navigate('/wiki/graphql')}>
              <div
                className="card p-3 text-center feature-card"
                style={{
                  backgroundPosition: 'cover',
                  backgroundPositionY: '90%',
                  backgroundPositionX: '20%',
                  backgroundImage: `url(${patternImage})`,
                }}
              >
                <h6 className="display-6 text-dark">GraphQL</h6>
                <p className="text-white">Visualize data from any GraphQL APIs or URLs.</p>
              </div>
            </div>
            <div className="col-sm-6 col-lg-4 mb-4" onClick={() => navigate('/wiki/html')}>
              <div
                className="card p-3 text-center feature-card"
                style={{
                  backgroundPosition: 'cover',
                  backgroundPositionY: '80%',
                  backgroundPositionX: '20%',
                  backgroundImage: `url(${patternImage})`,
                }}
              >
                <h6 className="display-6 text-dark">HTML</h6>
                <p className="text-white">Visualize data from any HTML pages or URLs.</p>
              </div>
            </div>
            <div className="col-sm-6 col-lg-4 mb-4" onClick={() => navigate('/wiki/xml')}>
              <div
                className="card p-3 text-center feature-card"
                style={{
                  backgroundPosition: 'cover',
                  backgroundPositionY: '80%',
                  backgroundPositionX: '20%',
                  backgroundImage: `url(${patternImage})`,
                }}
              >
                <h6 className="display-6 text-dark">XML</h6>
                <p className="text-white">Visualize data from any XML APIs or URLs.</p>
              </div>
            </div>
            <div className="col-sm-6 col-lg-4 mb-4" onClick={() => navigate('/wiki/series')}>
              <div
                className="card p-3 text-center feature-card"
                style={{
                  backgroundPosition: 'cover',
                  backgroundPositionY: '30%',
                  backgroundPositionX: '10%',
                  backgroundImage: `url(${patternImage})`,
                }}
              >
                <h6 className="display-6 text-dark">Math series</h6>
                <p className="text-white">Generate series from mathematical definitions.</p>
              </div>
            </div>
            <div className="col-sm-6 col-lg-8 mb-4" onClick={() => navigate('/wiki/template-variables')}>
              <div
                className="card p-3 text-center feature-card"
                style={{
                  backgroundPosition: 'cover',
                  backgroundPositionY: '50%',
                  backgroundPositionX: '70%',
                  backgroundImage: `url(${patternImage})`,
                }}
              >
                <h6 className="display-6 text-dark">Utility variables</h6>
                <p className="text-white">Create custom variables from utility functions</p>
              </div>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="row" data-masonry='{"percentPosition": true }' style={{ position: 'relative' }}></div>
        </div>
      </>
    </Layout>
  );
}
