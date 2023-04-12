import React, { useEffect, useRef } from 'react';
import stackblitz from '@stackblitz/sdk';
import { Layout } from './../components/Layout';

const default_query = `parse-json
| where "age" > 20
| summarize sum("salary") by "country"
`;

export default function Home() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      stackblitz.embedProject(
        ref.current,
        {
          files: {
            'data.txt': JSON.stringify(
              [
                {
                  name: 'Leanne Graham',
                  age: 38,
                  country: 'USA',
                  occupation: 'Devops Engineer',
                  salary: 3000,
                },
                {
                  name: 'Ervin Howell',
                  age: 27,
                  country: 'USA',
                  occupation: 'Software Engineer',
                  salary: 2300,
                },
                {
                  name: 'Clementine Bauch',
                  age: 17,
                  country: 'Canada',
                  occupation: 'Student',
                  salary: null,
                },
                {
                  name: 'Patricia Lebsack',
                  age: 42,
                  country: 'UK',
                  occupation: 'Software Engineer',
                  salary: 2800,
                },
                {
                  name: 'Leanne Bell',
                  age: 38,
                  country: 'USA',
                  occupation: 'Senior Software Engineer',
                  salary: 4000,
                },
                {
                  name: 'Chelsey Dietrich',
                  age: 32,
                  country: 'USA',
                  occupation: 'Software Engineer',
                  salary: 3500,
                },
              ],
              null,
              4
            ),
            'query.uql': default_query,
            'index.js': `const fs = require("fs");
            const uql = require("uql");
            
            const fo = { encoding: "utf8", flag: "r" };
            const data = fs.readFileSync("./data.txt", fo);
            const query = fs.readFileSync("./query.uql", fo);
            
            uql
              .uql(query, { data })
              .then(console.table)
              .catch((ex) => console.error("error occurred while executing the uql query"));`,
            'package.json': JSON.stringify(
              {
                scripts: { start: 'node index.js' },
                dependencies: { uql: 'latest' },
              },
              null,
              4
            ),
          },
          template: 'node',
          title: 'UQL playground',
          description: '',
          settings: {
            compile: {
              clearConsole: true,
              trigger: 'save',
              action: 'hmr',
            },
          },
        },
        {
          startScript: 'start',
          openFile: ['data.txt', 'query.uql'],
          view: 'editor',
          hideExplorer: true,
          sidebarView: 'project',
          terminalHeight: 50,
        }
      );
    }
  }, [ref]);

  return (
    <Layout title="UQL playground">
      <div className="container py-4">
        <br />
        <div className="h-[600px] w-full" ref={ref} />
        <br />
        <h5>How to use this playground?</h5>
        <ol className="list-decimal p-2">
          <li className="ml-4">
            Edit the <code>data.txt</code> file for the data. <kbd>ctl+s</kbd> to save. ( <i>This data can be one of json/csv/tsv/xml/html format.</i> )
          </li>
          <li className="ml-4">
            Edit the <code>query.uql</code> file with your UQL query. <kbd>ctl+s</kbd> to save.
          </li>
          <li className="ml-4">
            In the terminal below type <code>npm start</code> and hit enter to see the results.
          </li>
        </ol>
        <br />
      </div>
    </Layout>
  );
}
