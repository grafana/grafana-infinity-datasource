import React from 'react';
import { Link, navigate } from 'gatsby';

export const Feature = (props: { title: string; to: string; description: string }) => {
  return (
    <Link
      to={props.to}
      className="bg-teal-900 text-teal-100 p-10 m-3 rounded-tl-3xl rounded-br-3xl hover:rounded-tl-none hover:rounded-br-none hover:rounded-tr-3xl hover:rounded-bl-3xl hover:bg-teal-100 hover:text-teal-900 transition-all duration-1000 text-center"
    >
      <span className="font-bolder text-3xl">{props.title}</span>
      <p>{props.description}</p>
    </Link>
  );
};

export const Features = () => {
  return (
    <div className="p-10 grid grid-rows-3 grid-flow-col">
      <Feature title="UQL" to="/wiki/uql" description="Transform results in a powerful way" />
      <Feature title="GraphQL" to="/wiki/graphql" description="Visualize data from any GraphQL APIs or URLs." />
      <Feature title="XML" to="/wiki/xml" description="Visualize data from any XML APIs or URLs." />
      <Feature title="JSON" to="/wiki/json" description="Visualize data from any JSON APIs or URLs" />
      <Feature title="HTML" to="/wiki/html" description="Visualize data from any HTML pages or URLs." />
      <Feature title="Math Series" to="/wiki/series" description="Generate series from mathematical definitions." />
      <Feature title="CSV" to="/wiki/csv" description="Visualize data from any CSV APIs, or TSV files" />
      <Feature title="Utility variables" to="/wiki/template-variables" description="Create custom variables from utility functions" />
    </div>
  );
};
