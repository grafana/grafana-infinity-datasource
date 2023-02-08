import React from 'react';
import { Layout } from './../components/Layout';
import { HeroSection } from './../components/Hero';
import { Badges } from './../components/Badges';
import { Features } from './../components/Features';
import { InspiringStory } from './../components/InspiringStory';

export default function Home() {
  return (
    <Layout title="">
      <HomeSection color1="rgb(51, 110, 187)" color2="rgb(109, 163, 236)" bgColor="rgba(17, 18, 23, 0.1)" title="Features" hideTitle={true} fullHeight={true}>
        <HeroSection />
      </HomeSection>
      <HomeSection color1="rgb(51, 110, 187)" color2="rgb(109, 163, 236)" bgColor="rgba(255, 255, 255, 0.02)" title="Features">
        <Features />
      </HomeSection>
      <HomeSection color1="rgb(224, 80, 80)" color2="rgb(254, 192, 0)" bgColor="rgba(17, 18, 23, 0.1)" title="Share">
        <InspiringStory />
      </HomeSection>
      <HomeSection color1="rgb(82, 111, 98)" color2="rgb(185, 223, 205)" bgColor="rgba(255, 255, 255, 0.02)" title="Project Status">
        <Badges />
      </HomeSection>
    </Layout>
  );
}

const HomeSection = (props: { fullHeight?: boolean; hideTitle?: boolean; children: React.ReactChild; color1: string; color2: string; title: string; bgColor: string }) => {
  return (
    <div
      style={{
        backgroundColor: props.bgColor,
        height: props.fullHeight ? 'calc(100vh - 80px)' : '100%',
        width: props.fullHeight ? '100vw' : '100%',
        paddingBlockEnd: '60px',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      {!props.hideTitle && (
        <div
          style={{
            fontWeight: 'bolder',
            paddingBlock: '60px',
            background: `linear-gradient(20deg, ${props.color1} 0%, ${props.color2} 100%`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textDecoration: 'underline',
          }}
        >
          <h2 style={{ fontSize: '60px' }}>{props.title}</h2>
        </div>
      )}
      {props.fullHeight ? <div>{props.children}</div> : <div className="container">{props.children}</div>}
    </div>
  );
};
