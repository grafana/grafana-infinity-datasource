import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';

interface SubHeaderProps {
  title: string;
  children?: React.ReactNode;
}

export const SubHeader = (props: SubHeaderProps) => {
  const data = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            wallpaper
          }
        }
      }
    `
  );
  return (
    <section className="text-center py-12 bg-teal-700 subheader">
      <h1 className="font-normal text-4xl">{props.title}</h1>
    </section>
  );
};
