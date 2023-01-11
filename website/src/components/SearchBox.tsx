import React, { useState, useEffect } from 'react';
import { Link } from 'gatsby';
import Fuse from 'fuse.js';
import * as Dialog from '@radix-ui/react-dialog';
import tinykeys from 'tinykeys';

export const SearchBox = () => {
  const [searchPopupStatus, setSearchPopupStatus] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => {
    let unsubscribe = tinykeys(window, {
      '$mod+KeyK': () => setSearchPopupStatus(true),
      'Control+K': () => setSearchPopupStatus(true),
    });
    return () => unsubscribe();
  });
  return (
    <>
      {searchPopupStatus && (
        <span>
          <Dialog.Dialog open={searchPopupStatus}>
            <Dialog.Overlay
              style={{
                backgroundColor: 'rgba(0,0,0,0.5)',
                position: 'fixed',
                inset: 0,
                top: '-76px',
              }}
            ></Dialog.Overlay>
            <Dialog.Content
              onEscapeKeyDown={() => {
                setSearchPopupStatus(false);
                setSearchTerm('');
              }}
              onPointerDownOutside={() => {
                setSearchPopupStatus(false);
                setSearchTerm('');
              }}
              style={{
                backgroundColor: 'white',
                color: 'black',
                borderRadius: 6,
                boxShadow: 'hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px',
                position: 'fixed',
                top: '300px',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '90vw',
                maxWidth: '800px',
                minHeight: '420px',
                maxHeight: '420px',
                overflow: 'hidden',
                padding: 25,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Dialog.Close onClick={() => setSearchPopupStatus(false)} style={{ color: 'black' }}>
                  <i className="fas fa-window-close"></i>
                </Dialog.Close>
              </div>
              <h4>Search Infinity Docs</h4>
              <br />
              <input
                type="text"
                style={{ fontSize: '24px', width: '100%', background: 'transparent', color: 'black' }}
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.currentTarget.value)}
                placeholder="Enter your search term here"
              ></input>
              <br />
              <br />
              <SearchResults searchTerm={searchTerm}></SearchResults>
            </Dialog.Content>
          </Dialog.Dialog>
        </span>
      )}
      <a onClick={() => setSearchPopupStatus(!searchPopupStatus)}>
        <i className={`fas fa-search`} onClick={() => {}}></i>
        <span className="px-2 small-screen-only">Search</span>
      </a>
    </>
  );
};

const SearchResults = (props: { searchTerm: string }) => {
  const fuse = new Fuse(sitemap, {
    keys: ['title', 'description', 'tags'],
  });
  const [results, setResults] = useState<any[]>([]);
  useEffect(() => {
    const results = fuse.search(props.searchTerm);
    setResults(results);
  }, [props.searchTerm]);
  return (
    <>
      {results && results.length > 0 ? (
        <>
          {results.slice(0, 4).map((r, i) => (
            <nav key={i}>
              <Link to={r.item.slug} style={{ paddingBlock: '30px' }}>
                <li style={{ marginBlock: '10px', padding: '10px', border: '1px solid gray' }}>
                  <span style={{ color: 'black' }}>{r.item.title}</span>
                </li>
              </Link>
            </nav>
          ))}
        </>
      ) : (
        <></>
      )}
    </>
  );
};

const sitemap: any[] = [
  {
    title: 'JSON',
    slug: '/wiki/json',
    description: '',
    tags: ['json', 'api', 'rest'],
  },
  {
    title: 'csv',
    slug: '/wiki/csv',
    description: '',
    tags: ['csv'],
  },
  {
    title: 'graphql',
    slug: '/wiki/graphql',
    description: '',
    tags: ['graphql', 'github'],
  },
  {
    title: 'XML',
    slug: '/wiki/xml',
    description: 'XML',
    tags: ['xml', 'rss', 'soap', 'atom'],
  },
  {
    title: 'UQL',
    slug: '/wiki/uql',
    description: 'UQL',
    tags: ['uql', 'query', 'unstructured query language', 'sql', 'jsonata', 'kusto', 'mv-expand', 'project', 'summarize', 'group by', 'aggregate', 'jsonata'],
  },
  {
    title: 'GROQ',
    slug: '/wiki/groq',
    description: 'Groq Query language',
    tags: ['groq', 'query', 'sanity', 'filter'],
  },
  {
    title: 'Backend Parser',
    slug: '/wiki/backend',
    description: 'Infinity backend parser',
    tags: ['backend', 'parser', 'json', 'csv', 'tsv', 'alerting', 'recorded queries', 'caching', 'public dashboards', 'summarize', 'gjson', 'jsonpath', 'calculated field', 'computed columns'],
  },
  {
    title: 'Reference data',
    slug: '/wiki/reference-data',
    description: 'Reference data',
    tags: ['reference', 'reference data', 'variables', 'static data', 'inline', 'global', 'config'],
  },
  {
    title: 'Configuration',
    slug: '/wiki/configuration',
    description: 'Grafana datasource configuration',
    tags: ['datasource', 'configuration', 'provisioning', 'authentication', 'authorization', 'headers', 'proxy', 'oauth', 'forward oauth identity', 'setup', 'setting'],
  },
  {
    title: 'Authentication',
    slug: '/wiki/authentication',
    description: 'Various authentication methods',
    tags: ['authentication', 'auth', 'username', 'password', 'secure', 'security', 'oauth', 'oauth2', 'api token', 'api key', 'bearer token', 'forward oauth identity', 'digest authentication'],
  },
  {
    title: 'Azure Authentication',
    slug: '/wiki/azure-authentication',
    description: 'Microsoft Azure Authentication Steps',
    tags: ['authentication', 'auth', 'username', 'password', 'secure', 'security', 'oauth', 'oauth2', 'azure', 'microsoft', 'cloud', 'kusto', 'log analytics', 'azure monitor'],
  },
  {
    title: 'AWS Authentication',
    slug: '/wiki/aws-authentication',
    description: 'AWS Cloud Authentication Steps',
    tags: ['authentication', 'auth', 'username', 'password', 'secure', 'security', 'oauth', 'oauth2', 'aws', 'amazon', 'cloud', 'cloudwatch', 'signing'],
  },
  {
    title: 'Global Queries',
    slug: '/wiki/global-queries',
    description: 'Grafana datasource configuration with global queries',
    tags: ['datasource', 'configuration', 'global queries'],
  },
  {
    title: 'Installation',
    slug: '/wiki/installation',
    description: 'Grafana infinity datasource installation',
    tags: ['datasource', 'installation', 'grafana.com', 'grafana-cli', 'docker', 'docker-compose', 'helm', 'download'],
  },
  {
    title: 'Limitations',
    slug: '/wiki/limitations',
    description: 'Grafana infinity datasource limitations',
    tags: ['limitations', 'feature', 'recorded queries', 'alerting', 'oauth'],
  },
  {
    title: 'Provisioning',
    slug: '/wiki/provisioning',
    description: 'Grafana datasource provisioning',
    tags: ['datasource', 'provisioning', 'configuration'],
  },
  {
    title: 'Time formats',
    slug: '/wiki/time-formats',
    description: 'Time formats in query',
    tags: ['query', 'time', 'format', 'timeseries', 'utc', 'epoch', 'millisecond', 'second', 'unix'],
  },
  {
    title: 'Template Variables',
    slug: '/wiki/template-variables',
    description: 'Creating template variables',
    tags: ['variables', 'template variables', 'query', 'global variables', 'collection', 'collection lookup', 'join', 'random', 'UnixTimeStamp'],
  },
  {
    title: 'Macros',
    slug: '/wiki/macros',
    description: 'Using macros in your queries/ template variables',
    tags: ['macros', 'variables', 'template variables', 'query', 'combine values', 'custom interval', 'dynamic interval', 'dynamic value', `customInterval`, `combineValues`],
  },
  {
    title: 'Annotations',
    slug: '/wiki/annotations',
    description: 'Creating annotations',
    tags: ['annotations'],
  },
  {
    title: 'Node graph',
    slug: '/wiki/node-graph',
    description: 'Creating Node Graph',
    tags: ['node graph'],
  },
  {
    title: 'URL',
    slug: '/wiki/url',
    description: 'Framing URl',
    tags: ['uql', 'headers', 'authorization', 'authentication'],
  },
  {
    title: 'Blog',
    slug: '/blog',
    description: 'Blogs and examples',
    tags: ['blog', 'github', 'thingspeak', 'aws status feed'],
  },
  {
    title: 'Community',
    slug: '/community',
    description: 'Community links',
    tags: ['help', 'bug', 'faq', 'discussions', 'example', 'sample', 'twitter', 'youtube', 'feature request', 'null', 'undefined', 'connection error', 'error', 'timeout'],
  },
  {
    title: 'Changelog',
    slug: '/changelog',
    description: 'changelog',
    tags: ['changelog', `what's new`, 'download'],
  },
  {
    title: 'License',
    slug: '/license',
    description: 'license',
    tags: ['license', 'apache'],
  },
];
