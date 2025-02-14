import React, { useState } from 'react';
import { Button, LinkButton, Modal, Drawer, Card, TagList, Stack } from '@grafana/ui';
import type { InfinityQuery } from './../types';

export const HelpLinks = () => {
  const [activeTab, setActiveTab] = useState(false);
  return (
    <div>
      <Stack gap={1} alignItems="center">
        <LinkButton size="sm" variant="primary" href="https://grafana.com/docs/plugins/yesoreyeram-infinity-datasource" target="_blank" rel="noreferrer">
          Plugin Docs
        </LinkButton>
        <LinkButton size="sm" variant="secondary" fill="outline" href="https://www.youtube.com/watch?v=Wmgs1E9Ry-s" target="_blank" rel="noreferrer">
          Demo Video
        </LinkButton>
        <Button
          size="sm"
          variant="secondary"
          fill="outline"
          onClick={(e) => {
            setActiveTab(true);
            e.preventDefault();
          }}
        >
          JSON
        </Button>
        <LinkButton size="sm" variant="secondary" fill="outline" href="https://grafana.com/docs/plugins/yesoreyeram-infinity-datasource/latest/csv" target="_blank" rel="noreferrer">
          CSV
        </LinkButton>
        <LinkButton size="sm" variant="secondary" fill="outline" href="https://grafana.com/docs/plugins/yesoreyeram-infinity-datasource/latest/xml" target="_blank" rel="noreferrer">
          XML
        </LinkButton>
        <LinkButton size="sm" variant="secondary" fill="outline" href="https://grafana.com/docs/plugins/yesoreyeram-infinity-datasource/latest/query/uql" target="_blank" rel="noreferrer">
          UQL
        </LinkButton>
        <LinkButton size="sm" variant="secondary" fill="outline" href="https://grafana.com/docs/plugins/yesoreyeram-infinity-datasource/latest/setup/authentication" target="_blank" rel="noreferrer">
          Authentication
        </LinkButton>
        <LinkButton size="sm" variant="secondary" fill="outline" href="https://github.com/grafana/grafana-infinity-datasource/discussions/categories/show-and-tell" target="_blank" rel="noreferrer">
          Examples &amp; Tutorials
        </LinkButton>
        <LinkButton size="sm" variant="secondary" fill="outline" href="https://github.com/grafana/grafana-infinity-datasource/discussions/categories/specific-apis" target="_blank" rel="noreferrer">
          API Specific Question
        </LinkButton>
        <LinkButton size="sm" variant="secondary" fill="outline" href="https://github.com/grafana/grafana-infinity-datasource/discussions/categories/q-a" target="_blank" rel="noreferrer">
          More Questions?
        </LinkButton>
      </Stack>
      {activeTab && (
        <Modal title={'JSON Help'} isOpen={activeTab} onDismiss={() => setActiveTab(false)}>
          <div style={{ padding: '5px' }}>
            <p>
              Getting data from JSON API response sounds simple. But in real world scenarios, It is not the case due to various factors such as authentication issue, connectivity issues and data
              format issues. If you are not seeing the data from your API, then use this quick starter guide and this may help your troubleshoot the issue.
            </p>
            <ul style={{ margin: '5px', listStylePosition: 'inside' }}>
              <li style={{ marginBlock: '10px' }}>
                <b>Change the panel visualization type to Table.</b> This will help you to validate the data your are getting from the API. Don&apos;t worry, You can change it later once you are happy
                with the data.
              </li>
              <li style={{ marginBlock: '10px' }}>Enter the API url in the URL column. Choose JSON as type. Choose URL as source. Choose Table as format.</li>
              <li style={{ marginBlock: '10px' }}>
                <b style={{ fontWeight: 'bolder', color: 'orange' }}>Sample data format 1:</b> If your data is array of objects, You are all good to go. At this point you should see the results. Now
                you can select the fields/columns and formats. Example of array data format is given below
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
                <b style={{ fontWeight: 'bolder', color: 'orange' }}>Sample data format 2:</b> Some times, data may not be straight forward. Response from the API may have additional meta data. Actual
                data you are interested may be deeply inherited inside the response. In that case, you need to specify <b style={{ color: 'yellowgreen' }}>Root</b> of your data. Example data given
                below. In the below case, we are interested only in <b style={{ color: 'yellowgreen' }}>response.results</b>. So specify it as ROOT selector in your query editor. That will simply
                discard <i>meta</i>, <i>response.summary</i> and any other data in the response.
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
                <b style={{ fontWeight: 'bolder', color: 'orange' }}>Golden rule of thumb:</b> Your data needs to be an array of objects. If your api response is not in array format, you will need to
                specify the root of the data which should be array of objects. Think items in the array to the rows in table/csv.
              </li>
              <li style={{ marginBlock: '10px' }}>
                <b style={{ fontWeight: 'bolder', color: 'orange' }}>Complex data format?</b> If your data is not in table format or require further manipulation, Still you have an option.{' '}
                <b style={{ fontWeight: 'bolder', color: 'yellowgreen' }}>UQL</b> query type is there for rescue.
              </li>
            </ul>
            <br />
            <h2>Selecting columns / fields &amp; formats</h2>
            <p>
              Once you see the data with the above options, you can filter the columns/fields you are interested and also specify the correct format for those fields using <b>fields/columns</b> option
            </p>
            <ul style={{ margin: '5px', listStylePosition: 'inside' }}>
              <li style={{ marginBlock: '10px' }}>
                In the below data, You will need to specify <code>id</code>,<code>age</code>,<code>dob</code>,<code>name.first</code>,<code>name.last</code> and <code>last_login_time</code> as your
                selectors. Now your <code>dob</code> column is represented as string. To get that as timestamp, you will specify <b>timestamp</b> as format. In same way <code>last_login_time</code> is
                represented as number. To get that in timestamp, you will need to specify the format as <b>unix timestamp ms</b>
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
            <LinkButton variant="primary" style={{ margin: '10px' }} href="https://grafana.com/docs/plugins/yesoreyeram-infinity-datasource/latest/json" target="_blank" rel="noreferrer">
              Need more help?
            </LinkButton>
          </div>
        </Modal>
      )}
    </div>
  );
};

export const SampleQueries = (props: { onChange: (query: InfinityQuery) => void; onRunQuery: () => void }) => {
  const [showSampleQueries, setShowSampleQueries] = useState(false);
  const queries: Array<{ title: string; description?: string; query: InfinityQuery; tags?: string[] }> = [
    {
      title: 'Simple JSON',
      query: {
        type: 'json',
        source: 'inline',
        parser: 'backend',
        refId: '',
        root_selector: '',
        columns: [],
        format: 'dataframe',
        data: sampleJSON,
      },
      tags: ['json', 'backend'],
    },
    {
      title: 'Simple CSV',
      query: {
        type: 'csv',
        source: 'inline',
        parser: 'backend',
        refId: '',
        root_selector: '',
        format: 'dataframe',
        data: sampleCSV,
        columns: [
          {
            selector: 'name',
            text: 'Name',
            type: 'string',
          },
          {
            selector: 'age',
            text: 'Age',
            type: 'number',
          },
          {
            selector: 'country',
            text: 'Country',
            type: 'string',
          },
          {
            selector: 'occupation',
            text: 'Occupation',
            type: 'string',
          },
          {
            selector: 'salary',
            text: 'Salary',
            type: 'number',
          },
        ],
      },
      tags: ['csv', 'backend'],
    },
    {
      title: 'Simple TSV',
      query: {
        type: 'tsv',
        source: 'inline',
        parser: 'backend',
        refId: '',
        root_selector: '',
        format: 'dataframe',
        data: sampleTSV,
        columns: [
          {
            selector: 'name',
            text: 'Name',
            type: 'string',
          },
          {
            selector: 'age',
            text: 'Age',
            type: 'number',
          },
          {
            selector: 'country',
            text: 'Country',
            type: 'string',
          },
          {
            selector: 'occupation',
            text: 'Occupation',
            type: 'string',
          },
          {
            selector: 'salary',
            text: 'Salary',
            type: 'number',
          },
        ],
      },
      tags: ['tsv', 'backend'],
    },
    {
      title: 'Simple XML',
      query: {
        type: 'xml',
        source: 'inline',
        parser: 'backend',
        refId: '',
        format: 'dataframe',
        data: sampleXML,
        root_selector: 'root.row',
        columns: [
          {
            selector: 'name',
            text: 'Name',
            type: 'string',
          },
          {
            selector: 'age',
            text: 'Age',
            type: 'number',
          },
          {
            selector: 'country',
            text: 'Country',
            type: 'string',
          },
          {
            selector: 'occupation',
            text: 'Occupation',
            type: 'string',
          },
          {
            selector: 'salary',
            text: 'Salary',
            type: 'number',
          },
        ],
      },
      tags: ['xml', 'backend'],
    },
    {
      title: 'Simple HTML',
      query: {
        type: 'html',
        source: 'inline',
        parser: 'backend',
        refId: '',
        format: 'dataframe',
        data: sampleHTML,
        root_selector: 'html.body.table.tbody.tr',
        columns: [
          {
            selector: 'td.0',
            text: 'Name',
            type: 'string',
          },
          {
            selector: 'td.1.#content',
            text: 'Age',
            type: 'number',
          },
          {
            selector: 'td.2',
            text: 'Country',
            type: 'string',
          },
          {
            selector: 'td.3',
            text: 'Occupation',
            type: 'string',
          },
          {
            selector: 'td.4.#content',
            text: 'Salary',
            type: 'number',
          },
        ],
      },
      tags: ['html', 'backend'],
    },
  ];
  return (
    <>
      <Button
        variant="secondary"
        fill="outline"
        size="sm"
        icon="document-info"
        style={{ marginTop: '18px', padding: '10px', marginRight: '10px' }}
        onClick={() => setShowSampleQueries(!showSampleQueries)}
      >
        Examples
      </Button>
      {showSampleQueries ? (
        <Drawer title="Sample Queries" onClose={() => setShowSampleQueries(false)}>
          <>
            {queries.map((q, index) => (
              <Card key={index}>
                <Card.Heading>{q.title}</Card.Heading>
                {q.description ? <Card.Description>{q.description}</Card.Description> : null}
                <Card.Actions>
                  <Button
                    key="run"
                    variant="secondary"
                    onClick={(e) => {
                      props.onChange(q.query);
                      props.onRunQuery();
                      setShowSampleQueries(false);
                      e.preventDefault();
                    }}
                  >
                    Run Query
                  </Button>
                </Card.Actions>
                <Card.Tags>
                  <TagList tags={q.tags || []} onClick={() => {}} />
                </Card.Tags>
              </Card>
            ))}
          </>
        </Drawer>
      ) : null}
    </>
  );
};

const sampleJSON = `[  
  {    
      "name": "Leanne Graham",    
      "age": 38,   
      "country": "USA",    
      "occupation": "Devops Engineer",    
      "salary": 3000  
  },  
  {    
      "name": "Ervin Howell",    
      "age": 27,    
      "country": "USA",    
      "occupation": "Software Engineer",   
      "salary": 2300  
  },  
  {    
      "name": "Clementine Bauch",    
      "age": 17,   
      "country": "Canada",    
      "occupation": "Student",    
      "salary": null  
  },  
  {    
      "name": "Patricia Lebsack",    
      "age": 42,    
      "country": "UK",    
      "occupation": "Software Engineer",    
      "salary": 2800  
  },  
  {    
      "name": "Leanne Bell",    
      "age": 38,   
      "country": "USA",   
      "occupation": "Senior Software Engineer",   
       "salary": 4000  
  },  
  {    
      "name": "Chelsey Dietrich",   
      "age": 32,   
      "country": "USA",    
      "occupation": "Software Engineer",    
      "salary": 3500  
  }
]`;
const sampleCSV = `name,age,country,occupation,salary
Leanne Graham,38,USA,Devops Engineer,3000
Ervin Howell,27,USA,Software Engineer,2300
Clementine Bauch,17,Canada,Student,
Patricia Lebsack,42,UK,Software Engineer,2800
Leanne Bell,38,USA,Senior Software Engineer,4000
Chelsey Dietrich,32,USA,Software Engineer,3500`;
const sampleTSV = `name	age	country	occupation	salary
Leanne Graham	38	USA	Devops Engineer	3000
Ervin Howell	27	USA	Software Engineer	2300
Clementine Bauch	17	Canada	Student	
Patricia Lebsack	42	UK	Software Engineer	2800
Leanne Bell	38	USA	Senior Software Engineer	4000
Chelsey Dietrich	32	USA	Software Engineer	3500`;
const sampleXML = `<?xml version="1.0" encoding="UTF-8" ?>
<root>  
    <row>    
        <name>Leanne Graham</name>    
        <age>38</age>    
        <country>USA</country>
        <occupation>Devops Engineer</occupation>
        <salary>3000</salary>  
    </row>
    <row>    
        <name>Ervin Howell</name>
        <age>27</age>
        <country>USA</country>
        <occupation>Software Engineer</occupation>
        <salary>2300</salary>  
    </row>  
    <row>
        <name>Clementine Bauch</name>
        <age>17</age>
        <country>Canada</country>
        <occupation>Student</occupation>
        <salary />
    </row>  
    <row>
        <name>Patricia Lebsack</name>
        <age>42</age>
        <country>UK</country>
        <occupation>Software Engineer</occupation>
        <salary>2800</salary>
    </row>  
    <row>
        <name>Leanne Bell</name>
        <age>38</age>
        <country>USA</country>
        <occupation>Senior Software Engineer</occupation>
        <salary>4000</salary>
    </row>  
    <row>
        <name>Chelsey Dietrich</name>
        <age>32</age>
        <country>USA</country>
        <occupation>Software Engineer</occupation>
        <salary>3500</salary>
    </row>
</root>`;
const sampleHTML = `<!DOCTYPE html>
<html lang="en">
    <head>    
        <meta charset="UTF-8" />
        <title>Users</title></head>
    <body>
        <table class="table table-bordered table-hover table-condensed">
            <thead>        
                <tr>
                    <th title="Field #1">name</th>
                    <th title="Field #2">age</th>
                    <th title="Field #3">country</th>
                    <th title="Field #4">occupation</th>
                    <th title="Field #5">salary</th>
                </tr>
            </thead>
            <tbody>        
                <tr>
                    <td>Leanne Graham</td>
                    <td align="right">38</td>
                    <td>USA</td>
                    <td>Devops Engineer</td>
                    <td align="right">3000</td>
                </tr>        
                <tr>
                    <td>Ervin Howell</td>
                    <td align="right">27</td>
                    <td>USA</td>
                    <td>Software Engineer</td>
                    <td align="right">2300</td>
                </tr>        
                <tr>
                    <td>Clementine Bauch</td>
                    <td align="right">17</td>
                    <td>Canada</td>
                    <td>Student</td>
                    <td align="right"></td>
                </tr>       
                <tr>
                    <td>Patricia Lebsack</td>
                    <td align="right">42</td>
                    <td>UK</td>
                    <td>Software Engineer</td>
                    <td align="right">2800</td>
                </tr>       
                <tr>
                    <td>Leanne Bell</td>
                    <td align="right">38</td>
                    <td>USA</td>
                    <td>Senior Software Engineer</td>
                    <td align="right">4000</td>
                </tr>        
                <tr>
                    <td>Chelsey Dietrich</td>
                    <td align="right">32</td>
                    <td>USA</td>
                    <td>Software Engineer</td>
                    <td align="right">3500</td>
                </tr>      
            </tbody>    
        </table>  
    </body>
</html>`;
