import React from 'react';
import Image from 'next/image';
import SectionHeading from './home/section-heading';

const ImageWrapper = (props: { src: string; alt: string }) => {
  return (
    <div className="bg-[rgba(255,255,255,0.05)] flex justify-center p-4 rounded-md hover:bg-[rgba(255,255,255,0.08)]">
      <Image src={props.src} alt={props.alt} width={60} height={60} />
      <h6 className="md:hidden my-4 font-bold text-white ">{props.alt}</h6>
    </div>
  );
};

export default function ApiShowcase() {
  return (
    <div className="flex w-full place-content-center justify-center p-2 px-8 flex-wrap flex-col align-center">
      <SectionHeading>Trusted by the community to connect over 1000s of APIs including</SectionHeading>
      <div className="w-full text-center gap-10 place-content-center grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6">
        <ImageWrapper src="https://www.svgrepo.com/show/448274/azure.svg" alt="azure" />
        <ImageWrapper src="https://www.svgrepo.com/show/448223/gcp.svg" alt="GCP" />
        <ImageWrapper src="https://pbs.twimg.com/profile_images/1217566226827759616/hM6lnfw8_400x400.jpg" alt="aws" />
        <ImageWrapper src="https://pbs.twimg.com/profile_images/1682468555709898752/_a3um164_400x400.jpg" alt="pagerduty" />
        <ImageWrapper src="https://pbs.twimg.com/profile_images/1663544295276822528/h_WXRFA6_400x400.png" alt="solarwinds" />
        <ImageWrapper src="https://pbs.twimg.com/profile_images/1678792573346013184/HdfdMzkM_400x400.jpg" alt="bigpanda" />
        <ImageWrapper src="https://www.svgrepo.com/show/448249/snyk.svg" alt="snyk" />
        <ImageWrapper src="https://www.svgrepo.com/show/353564/cloudflare.svg" alt="cloudflare" />
        <ImageWrapper src="https://pbs.twimg.com/profile_images/1674929360669917185/RodzH3gN_400x400.png" alt="thousandeyes" />
        <ImageWrapper src="https://www.svgrepo.com/show/353783/github-octocat.svg" alt="github" />
        <ImageWrapper src="https://www.svgrepo.com/show/354389/statuspage.svg" alt="statuspage" />
        <ImageWrapper src="https://www.svgrepo.com/show/276264/pokeball-pokemon.svg" alt="pokemon" />
      </div>
    </div>
  );
}
