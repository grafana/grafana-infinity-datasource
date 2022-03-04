import React, { useState, useEffect, Fragment } from 'react';
import { navigate } from 'gatsby';
import Fuse from 'fuse.js';
import { Dialog, Combobox, Transition } from '@headlessui/react';
import tinykeys from 'tinykeys';

export const SearchBox = () => {
  const [searchPopupStatus, setSearchPopupStatus] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  useEffect(() => {
    let unsubscribe = tinykeys(window, {
      '$mod+KeyK': () => setSearchPopupStatus(!searchPopupStatus),
      'Control+K': () => setSearchPopupStatus(!searchPopupStatus),
    });
    return () => unsubscribe();
  });
  const fuse = new Fuse(sitemap, {
    keys: ['title', 'description', 'tags'],
  });
  useEffect(() => setResults(fuse.search(searchTerm)), [searchTerm]);
  return (
    <>
      <Transition.Root show={searchPopupStatus} as={Fragment} afterLeave={() => setSearchTerm('')}>
        <Dialog open={searchPopupStatus} onClose={setSearchPopupStatus} className="fixed inset-0 p-4 pt-[25vh] overflow-y-auto">
          <Transition.Child enter="duration-300 ease-out" enterFrom="opacity-0" enterTo="opacity-100" leave="duration-200 ease-in" leaveFrom="opacity-100" leaveTo="opacity-0">
            <Dialog.Overlay className="fixed inset-0 bg-gray-500/75" />
          </Transition.Child>
          <Transition.Child
            enter="duration-300 ease-out"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Combobox
              as="div"
              className="overflow-hidden relative mx-auto max-w-xl rounded-xl bg-white shadow-2xl ring-1 ring-black/5 divide-y divide-gray-100"
              onChange={(value: any) => {
                setSearchPopupStatus(false);
                navigate(value.item.slug);
              }}
              value={searchTerm}
            >
              <div className="flex items-center px-4">
                <i className="fas fa-search h-6 w-6 my-2 py-1 text-gray-500"></i>
                <Combobox.Input
                  className="w-full bg-transparent border-0 focus:ring-0 p-2 text-sm text-gray-800 placeholder-gray-400 h-12"
                  placeholder="Enter your search term here"
                  onKeyUp={(e) => {
                    if (e.key === 'Enter' && results.length > 0) {
                      setSearchPopupStatus(false);
                      navigate(results[0].item.slug);
                    }
                  }}
                  onChange={(e) => setSearchTerm(e.currentTarget.value)}
                  value={searchTerm}
                />
              </div>
              {results.length ? (
                <Combobox.Options static={true} className="py-4 text-sm max-h-96 overflow-y-auto">
                  {results.map((r) => {
                    return (
                      <Combobox.Option value={r} key={r.item.slug}>
                        {({ active }) => {
                          return (
                            <div className={`px-4 py-2 space-x-1 ${active ? 'bg-gray-100' : ''}`}>
                              <span className="font-medium text-gray-900">{r.item.title}</span>
                            </div>
                          );
                        }}
                      </Combobox.Option>
                    );
                  })}
                </Combobox.Options>
              ) : (
                <></>
              )}
              {searchTerm && results.length < 1 ? <div className="p-4 text-center text-gray-400 text-sm">No results found</div> : <></>}
            </Combobox>
          </Transition.Child>
        </Dialog>
      </Transition.Root>
      <button onClick={() => setSearchPopupStatus(!searchPopupStatus)} title="Search docs">
        <i className="fas fa-search" onClick={() => {}}></i>
        <span className="lg:hidden ml-2">Search</span>
      </button>
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
    tags: ['uql', 'query', 'unstructured query language', 'sql'],
  },
  {
    title: 'GROQ',
    slug: '/wiki/groq',
    description: 'Groq Query language',
    tags: ['groq', 'query', 'sanity'],
  },
  {
    title: 'Configuration',
    slug: '/wiki/configuration',
    description: 'Grafana datasource configuration',
    tags: ['datasource', 'configuration', 'provisioning', 'authentication', 'authorization', 'headers', 'proxy', 'oauth', 'forward oauth identity', 'setup', 'setting'],
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
    description: 'Grafana datasource installation',
    tags: ['datasource', 'installation', 'grafana.com', 'grafana-cli', 'docker', 'docker-compose', 'helm', 'download'],
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
    tags: ['variables', 'template variables', 'query', 'global variables'],
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
  {
    title: 'Home',
    slug: '/',
    description: 'Infinity datasource documentation homepage',
    tags: ['json', 'api', 'rest', 'welcome', 'hello', 'intro'],
  },
];
