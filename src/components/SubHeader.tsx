import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';

interface SubHeaderProps {
  title: string;
}

export const SubHeader: React.FC<SubHeaderProps> = (props) => {
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
    <section
      className="subheader py-5 text-center"
      style={{
        backgroundColor: '#021E40',
        color: 'white',
        backgroundPositionX: '80%',
        backgroundPositionY: '20%',
        backgroundImage: `url(${data.site.siteMetadata.wallpaper})`,
      }}
    >
      <h1>{props.title}</h1>
    </section>
  );
};
