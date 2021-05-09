import React from 'react';
import { Layout } from '../components/Layout';

export default function Features() {
  return (
    <Layout showSubHeader={true}>
      <>
        <section className="subheader py-5 text-center" style={{ backgroundColor: '#021E40', color: 'white' }}>
          <h1>Grafana Infinity Datasource</h1>
        </section>
        <div className="container my-4">
          <div className="row">
            <div className="col-sm-4 col-lg-6 mb-4">
              <div
                className="card p-3 text-center"
                style={{
                  backgroundPosition: 'cover',
                  backgroundPositionY: '10%',
                  backgroundImage: 'url(https://play.grafana.org/public/img/login_background_dark.svg)',
                }}
              >
                <h6 className="display-6 text-white">JSON</h6>
                <p className="text-white">Visualize data from any JSON APIs or URLs.</p>
              </div>
            </div>
            <div className="col-sm-4 col-lg-6 mb-4">
              <div
                className="card p-3 text-center"
                style={{
                  backgroundPosition: 'cover',
                  backgroundPositionY: '80%',
                  backgroundImage: 'url(https://play.grafana.org/public/img/login_background_dark.svg)',
                }}
              >
                <h6 className="display-6 text-white">CSV</h6>
                <p className="text-white">Visualize data from any JSON APIs or URLs.</p>
              </div>
            </div>
            <div className="col-sm-6 col-lg-4 mb-4">
              <div
                className="card p-3 text-center"
                style={{
                  backgroundPosition: 'cover',
                  backgroundPositionY: '90%',
                  backgroundPositionX: '20%',
                  backgroundImage: 'url(https://play.grafana.org/public/img/login_background_dark.svg)',
                }}
              >
                <h6 className="display-6 text-white">GraphQL</h6>
                <p className="text-white">Visualize data from any JSON APIs or URLs.</p>
              </div>
            </div>
            <div className="col-sm-6 col-lg-4 mb-4">
              <div className="card p-3 text-center" style={{ background: '#ebaca2' }}>
                <h6 className="display-6">HTML</h6>
                <p className="muted">Visualize data from any JSON APIs or URLs.</p>
              </div>
            </div>
            <div className="col-sm-6 col-lg-4 mb-4">
              <div className="card p-3 text-center" style={{ background: '#FADE2' }}>
                <h6 className="display-6">XML</h6>
                <p className="muted">Visualize data from any JSON APIs or URLs.</p>
              </div>
            </div>
            <div className="col-sm-6 col-lg-4 mb-4">
              <div className="card p-3  text-center" style={{ background: '#F05A28' }}>
                <h6 className="display-6">Math Series</h6>
                <p className="muted">Visualize data from any JSON APIs or URLs.</p>
              </div>
            </div>
            <div className="col-sm-6 col-lg-8 mb-4">
              <div className="card p-3 bg-success text-center">
                <h6 className="display-6">Utility Variables</h6>
                <p className="muted">Visualize data from any JSON APIs or URLs.</p>
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
