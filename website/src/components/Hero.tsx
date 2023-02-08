import React from 'react';
import { Link } from 'gatsby';
import { TypeWriter } from './TypeWriter';

export const HeroSection = () => {
  return (
    <div>
      <div className="flex" style={{ width: '100vw', height: 'calc(100vh + 63px)', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <div className="mb-20">
          <div className="mx-auto mb-20 rounded-3xl h-[500px] w-[936px] shadow-[#e05050_0px_4px_16px]">
            <img alt="Grafana Infinity data source" src="https://user-images.githubusercontent.com/153843/189875668-3ac061a9-c548-4bfe-abcc-6d0d7e6bdb55.png" />
          </div>
          <div
            style={{
              background: 'linear-gradient(270deg, #fec000 0%, #e05050 80%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            <h1 className="text-5xl font-bold">Grafana Infinity datasource plugin</h1>
          </div>
          <br />
          <TypeWriter />
          <br />
          <div style={{ display: 'flex', flexFlow: 'row wrap', rowGap: '10px', alignContent: 'center', justifyContent: 'center' }}>
            <HomeLink text="Install" to="/wiki/installation" special={true} />
            <HomeLink text="Configuration" to="/wiki/configuration" special={false} />
            <HomeLink text="Blog" to="/blog" special={false} />
          </div>
        </div>
      </div>
    </div>
  );
};

const HomeLink = ({ special, to, text }: { special: boolean; to: string; text: string }) => {
  return (
    <div
      style={{
        marginInlineEnd: '16px',
        background: special ? 'linear-gradient(270deg, rgb(245, 95, 62) 0%, rgb(255, 136, 51)' : '',
        borderRadius: '24px',
        padding: '1px',
        height: '40px',
        lineHeight: '16px',
      }}
    >
      <div style={{ borderRadius: '24px', backgroundColor: 'rgb(34, 37, 43)' }}>
        <div
          style={{
            backgroundColor: 'rgb(34, 37, 43)',
            borderRadius: '24px',
            lineHeight: '20px',
            padding: '9px 20px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            color: 'rgb(ff,ff,ff)',
          }}
        >
          <Link to={to}>{text}</Link>
        </div>
      </div>
    </div>
  );
};
