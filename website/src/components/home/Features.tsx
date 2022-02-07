import React from 'react';
import { Link } from 'gatsby';

export const Feature = (props: { title: string; to: string; description: string }) => {
  return (
    <Link to={props.to} className="p-10 m-3 text-center rounded-full rounded-tr-lg rounded-bl-lg">
      <h4 className="font-bolder text-3xl mb-6">{props.title}</h4>
      <p>{props.description}</p>
    </Link>
  );
};

export const Features = () => {
  return (
    <div className="p-10">
      <h2 className="text-6xl font-thin my-8 mb-24 text-center">Visualize data from multiple sources</h2>
      <div className="grid grid-rows-3 grid-flow-col">
        <Feature title="UQL" to="/wiki/uql" description="Transform results in a powerful way" />
        <Feature title="GraphQL" to="/wiki/graphql" description="Visualize data from any GraphQL APIs or URLs." />
        <Feature title="XML" to="/wiki/xml" description="Visualize data from any XML APIs or URLs." />
        <Feature title="JSON" to="/wiki/json" description="Visualize data from any JSON APIs or URLs" />
        <Feature title="HTML" to="/wiki/html" description="Visualize data from any HTML pages or URLs." />
        <Feature title="Math Series" to="/wiki/series" description="Generate series from mathematical definitions." />
        <Feature title="CSV" to="/wiki/csv" description="Visualize data from any CSV APIs, or TSV files" />
        <Feature title="Utility variables" to="/wiki/template-variables" description="Create custom variables from utility functions" />
        <Feature title="GROQ" to="/wiki/groq" description="Use GROQ to transform results" />
      </div>
    </div>
  );
};
