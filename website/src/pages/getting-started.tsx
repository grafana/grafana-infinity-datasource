import React from 'react';
import { Link } from 'gatsby';
import { Layout } from '../components/Layout';

export default function GettingStarted() {
  return (
    <Layout showSubMenu={true} title="Getting Started">
      <div className="container mx-auto my-4">
        <section className="my-4">
          <h2 className="my-4 py-2 font-bolder text-xl">Install</h2>
          <div>
            You can install the plugin with one of the following methods
            <ul className="list-unstyled mt-2">
              <li>
                Install from{' '}
                <a href="https://grafana.com/grafana/plugins/yesoreyeram-infinity-datasource/" target="_blank" rel="noreferrer">
                  grafana.com
                </a>
              </li>
              <li>
                Install from{' '}
                <a href="https://github.com/yesoreyeram/grafana-infinity-datasource/releases" target="_blank" rel="noreferrer">
                  github
                </a>
              </li>
              <li>Install using grafana-cli </li>
              <li>Install using docker</li>
              <li>Install using helm </li>
            </ul>
            <br />
            You can read more about installation process at the <Link to="/wiki/installation">installation page.</Link>
          </div>
        </section>
        <section className="my-4">
          <h2 className="my-4 py-2 font-bolder text-xl">Configure</h2>
          <div>
            This datasource can work without any additional configuration. If your URL needs authenticated, or if you need to pass any additional headers or query strings, configure the corresponding
            section.
            <br />
            More details can be found in the <Link to="/wiki/configuration">configuration section</Link>
          </div>
        </section>
        <section className="my-4">
          <h2 className="my-4 py-2 font-bolder text-xl">Query &amp; Visualize</h2>
          <div>
            <p>
              Based on the url/api you want to query, Choose the type from <Link to="/wiki/json">JSON</Link>, <Link to="/wiki/csv">CSV</Link>, <Link to="/wiki/xml">XML</Link>,{' '}
              <Link to="/wiki/graphql">GraphQL</Link> or <Link to="/wiki/html">HTML</Link> and then enter your URL.
            </p>
            <p>
              You can also choose <b>Inline</b> option, In case if you are performing adhoc/static analysis over inline data.
              <br />
              More details about the queries can be found in the individual sections of the APIs.
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
}
