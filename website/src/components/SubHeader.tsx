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
    <section id="subheader" className="subheader py-5 text-center">
      <h1>{props.title}</h1>
    </section>
  );
};
