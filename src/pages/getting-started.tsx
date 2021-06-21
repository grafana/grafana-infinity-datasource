import React from 'react';
import { Link } from 'gatsby';
import { Layout } from '../components/website/Layout';

export default function GettingStarted() {
  return (
    <Layout showSubMenu={true} title="Getting Started">
      <div className="container py-4">
        <div className="accordion" id="accordionExample">
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingOne">
              <button
                className="accordion-button"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseOne"
                aria-expanded="true"
                aria-controls="collapseOne"
              >
                Install
              </button>
            </h2>
            <div
              id="collapseOne"
              className="accordion-collapse collapse show"
              aria-labelledby="headingOne"
              data-bs-parent="#accordionExample"
            >
              <div className="accordion-body">
                You can install the plugin with one of the following methods
                <ul className="list-unstyled mt-2">
                  <li>
                    Install from{' '}
                    <a
                      href="https://grafana.com/grafana/plugins/yesoreyeram-infinity-datasource/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      grafana.com
                    </a>
                  </li>
                  <li>
                    Install from{' '}
                    <a
                      href="https://github.com/yesoreyeram/grafana-infinity-datasource/releases"
                      target="_blank"
                      rel="noreferrer"
                    >
                      github
                    </a>
                  </li>
                  <li>Install using grafana-cli </li>
                  <li>Install using docker</li>
                  <li>Install using helm </li>
                </ul>
                <div className="mt-2">
                  You can read more about installation process at the{' '}
                  <Link to="/wiki/installation">installation page.</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingTwo">
              <button
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseTwo"
                aria-expanded="false"
                aria-controls="collapseTwo"
              >
                Configure
              </button>
            </h2>
            <div
              id="collapseTwo"
              className="accordion-collapse collapse"
              aria-labelledby="headingTwo"
              data-bs-parent="#accordionExample"
            >
              <div className="accordion-body">
                This datasource can work without any additional configuration. If your URL needs authenticated, or if
                you need to pass any additional headers or query strings, configure the corresponding section.
                <div className="mt-2">
                  More details can be found in the <Link to="/wiki/configuration">configuration section</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingThree">
              <button
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseThree"
                aria-expanded="false"
                aria-controls="collapseThree"
              >
                Query &amp; Visualize
              </button>
            </h2>
            <div
              id="collapseThree"
              className="accordion-collapse collapse"
              aria-labelledby="headingThree"
              data-bs-parent="#accordionExample"
            >
              <div className="accordion-body">
                <p>
                  Based on the <b>URL/API</b> you want to query, Choose the type from <Link to="/wiki/json">JSON</Link>,{' '}
                  <Link to="/wiki/csv">CSV</Link>, <Link to="/wiki/xml">XML</Link>,{' '}
                  <Link to="/wiki/graphql">GraphQL</Link> or <Link to="/wiki/html">HTML</Link> and then enter your URL.
                </p>
                <p>
                  Choose <b>Local file</b> option, in case if you are reading file from local server where grafana
                  deployed.
                </p>
                <p>
                  You can also choose <b>Inline</b> option, In case if you are performing adhoc/static analysis over
                  inline data.
                </p>
                <div className="mt-2">
                  More details about the queries can be found in the individual sections of the APIs.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
