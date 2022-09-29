import { css } from '@emotion/css';
import { Button, CustomScrollbar, Drawer, LinkButton, Tab, TabContent, TabsBar, useTheme } from '@grafana/ui';
import { EditorField } from './extended/EditorField';
import React, { useState } from 'react';

export const InfinityHelp = () => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  return (
    <EditorField label="Help">
      <>
        <div style={{ paddingBlockStart: '4px' }}>
          <Button icon="question-circle" size="sm" variant="secondary" onClick={() => setIsOpen(!isOpen)}>
            Need Help?
          </Button>
        </div>
        {isOpen && (
          <Drawer
            title="Infinity Datasource Plugin Help"
            onClose={() => setIsOpen(false)}
            width={'50%'}
            subtitle={
              <>
                <TabsBar
                  className={css({
                    paddingLeft: theme.spacing.md,
                    margin: `${theme.spacing.lg} -${theme.spacing.sm} -${theme.spacing.lg} -${theme.spacing.lg}`,
                  })}
                >
                  <Tab label="JSON" onChangeTab={() => setActiveTab('json')} active={activeTab === 'json'}></Tab>
                  <Tab label="CSV" onChangeTab={() => setActiveTab('csv')} active={activeTab === 'csv'}></Tab>
                  <Tab label="XML" onChangeTab={() => setActiveTab('xml')} active={activeTab === 'xml'}></Tab>
                  <Tab label="UQL" onChangeTab={() => setActiveTab('uql')} active={activeTab === 'uql'}></Tab>
                  <Tab label="General" onChangeTab={() => setActiveTab('general')} active={activeTab === 'general'}></Tab>
                </TabsBar>
              </>
            }
          >
            <CustomScrollbar autoHeightMin={'100%'}>
              {activeTab === 'general' && (
                <TabContent>
                  <div style={{ padding: '5px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <Button style={{ margin: '10px' }} onClick={() => setActiveTab('json')}>
                        JSON
                      </Button>
                      <Button style={{ margin: '10px' }} onClick={() => setActiveTab('csv')}>
                        CSV
                      </Button>
                      <Button style={{ margin: '10px' }} onClick={() => setActiveTab('xml')}>
                        XML
                      </Button>
                      <Button style={{ margin: '10px' }} onClick={() => setActiveTab('uql')}>
                        UQL
                      </Button>
                    </div>
                    <div>
                      <LinkButton variant="link" style={{ margin: '10px' }} href="https://yesoreyeram.github.io/grafana-infinity-datasource/" target="_blank" rel="noreferrer">
                        Plugin Docs
                      </LinkButton>
                      <br />
                      <LinkButton
                        variant="link"
                        style={{ margin: '10px' }}
                        href="https://github.com/yesoreyeram/grafana-infinity-datasource/discussions/categories/show-and-tell"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Examples &amp; Tutorials
                      </LinkButton>
                      <br />
                      <LinkButton
                        variant="link"
                        style={{ margin: '10px' }}
                        href="https://github.com/yesoreyeram/grafana-infinity-datasource/discussions/categories/specific-apis"
                        target="_blank"
                        rel="noreferrer"
                      >
                        API Specific Question
                      </LinkButton>
                      <br />
                      <LinkButton
                        variant="link"
                        style={{ margin: '10px' }}
                        href="https://github.com/yesoreyeram/grafana-infinity-datasource/discussions/categories/q-a"
                        target="_blank"
                        rel="noreferrer"
                      >
                        More Questions?
                      </LinkButton>
                      <br />
                      <LinkButton variant="link" style={{ margin: '10px' }} href="https://yesoreyeram.github.io/grafana-infinity-datasource/wiki/authentication" target="_blank" rel="noreferrer">
                        Authentication
                      </LinkButton>
                    </div>
                    <br />
                    <h3 style={{ textAlign: 'center' }}>Demo Video</h3>
                    <br />
                    <div style={{ textAlign: 'center' }}>
                      <a href="https://www.youtube.com/watch?v=Wmgs1E9Ry-s" target="_blank" rel="noreferrer">
                        <img src="https://img.youtube.com/vi/Wmgs1E9Ry-s/sddefault.jpg" height="200px" />
                      </a>
                    </div>
                  </div>
                </TabContent>
              )}
              {activeTab === 'json' && (
                <TabContent>
                  <div style={{ padding: '5px' }}>
                    <p>
                      Getting data from JSON API response sounds simple. But in real world scenarios, It is not the case due to various factors such as authentication issue, connectivity issues and
                      data format issues. If you are not seeing the data from your API, then use this quick starter guide and this may help your troubleshoot the issue.
                    </p>
                    <ul style={{ margin: '5px', listStylePosition: 'inside' }}>
                      <li style={{ marginBlock: '10px' }}>
                        <b>Change the panel visualization type to Table.</b> This will help you to validate the data your are getting from the API. Don&apos;t worry, You can change it later once you
                        are happy with the data.
                      </li>
                      <li style={{ marginBlock: '10px' }}>Enter the API url in the URL column. Choose JSON as type. Choose URL as source. Choose Table as format.</li>
                      <li style={{ marginBlock: '10px' }}>
                        <b style={{ fontWeight: 'bolder', color: 'orange' }}>Sample data format 1:</b> If your data is array of objects, You are all good to go. At this point you should see the
                        results. Now you can select the fields/columns and formats. Example of array data format is given below
                      </li>
                      <pre>
                        {`[
      {
          "entity":"GOOGL",
          "price": 2155.85,
          "time": 1653603843766
      },
      {
          "entity":"AAPL",
          "price": 143.78,
          "time":1653603943766
      }
  ]`}
                      </pre>
                      <li>
                        <b style={{ fontWeight: 'bolder', color: 'orange' }}>Sample data format 2:</b> Some times, data may not be straight forward. Response from the API may have additional meta
                        data. Actual data you are interested may be deeply inherited inside the response. In that case, you need to specify <b style={{ color: 'yellowgreen' }}>Root</b> of your data.
                        Example data given below. In the below case, we are interested only in <b style={{ color: 'yellowgreen' }}>response.results</b>. So specify it as ROOT selector in your query
                        editor. That will simply discard <i>meta</i>, <i>response.summary</i> and any other data in the response.
                      </li>
                      <pre>
                        {`{
      "meta": {
          "time_taken" : 300,
          "total_records": 2
      },
      "response": {
          "summary": {
              "status": "GOOD",
              "description": "overall the market was in upward trend."
          },
          "results" [
              {
                  "entity":"GOOGL",
                  "price": 2155.85,
                  "time": 1653603843766
              },
              {
                  "entity":"AAPL",
                  "price": 143.78,
                  "time":1653603943766
              }
          ]
      }
  }`}
                      </pre>
                      <li style={{ marginBlock: '10px' }}>
                        <b style={{ fontWeight: 'bolder', color: 'orange' }}>Golden rule of thumb:</b> Your data needs to be an array of objects. If your api response is not in array format, you will
                        need to specify the root of the data which should be array of objects. Think items in the array to the rows in table/csv.
                      </li>
                      <li style={{ marginBlock: '10px' }}>
                        <b style={{ fontWeight: 'bolder', color: 'orange' }}>Complex data format?</b> If your data is not in table format or require further manipulation, Still you have an option.{' '}
                        <b style={{ fontWeight: 'bolder', color: 'yellowgreen' }}>UQL</b> query type is there for rescue.
                      </li>
                      {/* <div style={{ textAlign: 'center' }}>
                    <br />
                    <img src="" width="80%" height="200px" />
                    <br />
                    &nbsp;
                  </div> */}
                    </ul>
                    <br />
                    <h2>Selecting columns / fields &amp; formats</h2>
                    <p>
                      Once you see the data with the above options, you can filter the columns/fields you are interested and also specify the correct format for those fields using{' '}
                      <b>fields/columns</b> option
                    </p>
                    <ul style={{ margin: '5px', listStylePosition: 'inside' }}>
                      <li style={{ marginBlock: '10px' }}>
                        In the below data, You will need to specify <code>id</code>,<code>age</code>,<code>dob</code>,<code>name.first</code>,<code>name.last</code> and <code>last_login_time</code> as
                        your selectors. Now your <code>dob</code> column is represented as string. To get that as timestamp, you will specify <b>timestamp</b> as format. In same way{' '}
                        <code>last_login_time</code> is represented as number. To get that in timestamp, you will need to specify the format as <b>unix timestamp ms</b>
                      </li>
                      <pre>
                        {`[
      {
          "id":"john.doe",
          "age": 23,
          "dob" : "1995-JAN-12",
          "name": {
              "first" : "John",
              "last" : "Doe"
          },
          "last_login_time" : 1653603843766
      },
      {
          "id":"alice.bob",
          "age": 35,
          "dob" : "2012-JAN-12",
          "name": {
              "first" : "Alice",
              "last" : "Bob"
          },
          "last_login_time" : 1653603943766
      }
  ]`}
                      </pre>
                      <li style={{ marginBlock: '10px' }}>So your columns / fields will look like this for the above example</li>
                      <table style={{ width: '100%', border: '1px solid gray' }}>
                        <tr style={{ border: '1px solid gray' }}>
                          <th>Selector</th>
                          <th>Alias / as</th>
                          <th>Format</th>
                        </tr>
                        <tr style={{ border: '1px solid gray' }}>
                          <td>id</td>
                          <td>User ID</td>
                          <td>String</td>
                        </tr>
                        <tr style={{ border: '1px solid gray' }}>
                          <td>age</td>
                          <td></td>
                          <td>Number</td>
                        </tr>
                        <tr style={{ border: '1px solid gray' }}>
                          <td>dob</td>
                          <td>Date of birth</td>
                          <td>Timestamp</td>
                        </tr>
                        <tr style={{ border: '1px solid gray' }}>
                          <td>name.first</td>
                          <td>First Name</td>
                          <td>String</td>
                        </tr>
                        <tr style={{ border: '1px solid gray' }}>
                          <td>name.last</td>
                          <td>Last Name</td>
                          <td>String</td>
                        </tr>
                        <tr style={{ border: '1px solid gray' }}>
                          <td>last_login_time</td>
                          <td>Login Time</td>
                          <td>Unix Timestamp (ms)</td>
                        </tr>
                      </table>
                    </ul>
                    <br />
                    <LinkButton variant="primary" style={{ margin: '10px' }} href="https://yesoreyeram.github.io/grafana-infinity-datasource/wiki/json" target="_blank" rel="noreferrer">
                      Need more help?
                    </LinkButton>
                    <Button onClick={() => setActiveTab('uql')}>Advanced use cases / UQL</Button>
                  </div>
                </TabContent>
              )}

              {activeTab === 'csv' && (
                <TabContent>
                  <div style={{ padding: '5px' }}>
                    <a className="btn btn-primary" style={{ margin: '10px' }} href="https://yesoreyeram.github.io/grafana-infinity-datasource/wiki/csv" target="_blank" rel="noreferrer">
                      CSV Docs
                    </a>
                  </div>
                </TabContent>
              )}
              {activeTab === 'xml' && (
                <TabContent>
                  <div style={{ padding: '5px' }}>
                    <a className="btn btn-primary" style={{ margin: '10px' }} href="https://yesoreyeram.github.io/grafana-infinity-datasource/wiki/xml" target="_blank" rel="noreferrer">
                      XML Docs
                    </a>
                  </div>
                </TabContent>
              )}
              {activeTab === 'uql' && (
                <TabContent>
                  <div style={{ padding: '5px' }}>
                    <a className="btn btn-primary" style={{ margin: '10px' }} href="https://yesoreyeram.github.io/grafana-infinity-datasource/wiki/uql" target="_blank" rel="noreferrer">
                      UQL Docs
                    </a>
                  </div>
                </TabContent>
              )}
            </CustomScrollbar>
          </Drawer>
        )}
      </>
    </EditorField>
  );
};
