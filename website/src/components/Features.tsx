import React from 'react';
import { Link, navigate } from 'gatsby';

export const Features = () => {
  return (
    <div className="grid grid-cols-3 gap-4 gap-y-16">
      <FeatureItem to="/wiki/uql" text="UQL" description="Transform results in a powerful way" />
      <FeatureItem to="/wiki/json" text="JSON" description="Visualize data from any JSON APIs or URLs" />
      <FeatureItem to="/wiki/csv" text="CSV" description="Visualize data from any CSV APIs, or URLs" />
      <FeatureItem to="/wiki/graphql" text="GraphQL" description="Visualize data from any GraphQL APIs or URLs." />
      <FeatureItem to="/wiki/xml" text="XML" description="Visualize data from any XML, RSS, ATOM feeds or URLs." />
      <FeatureItem to="/wiki/html" text="HTML" description="Visualize data from any HTML pages or URLs." />
      <FeatureItem to="/wiki/backend" text="Backend operations" description="Alerts, Recorded queries &amp; Public dashboards" />
      <FeatureItem to="/wiki/authentication" text="Authentication" description="Authenticate APIs with different auth options" />
      <FeatureItem to="/wiki/series" text="Math Series" description="Generate series from mathematical definitions" />
      <FeatureItem to="/wiki/template-variables" text="Utility variables" description="Create custom variables from utility functions" />
    </div>
  );
};

const FeatureItem = (props: { to: string; text: string; description: string }) => {
  return (
    <div className="group rounded-br-full" style={{ border: '#336ebb', boxShadow: `rgb(23 92 230 / 15%) 0px 4px 24px` }}>
      <div className="rounded-br-full dark:group-hover:bg-[#336ebb] p-5 text-left cursor-pointer" onClick={() => navigate(props.to)}>
        <Link className="text-xl py-10 font-bold dark:text-[#336ebb] dark:group-hover:text-white" to="/wiki/uql" style={{ textDecoration: 'none' }}>
          {props.text}
        </Link>
        <p>{props.description}</p>
      </div>
    </div>
  );
};
