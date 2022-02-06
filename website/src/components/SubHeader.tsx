import React from 'react';

export const SubHeader = (props: { title: string; children?: React.ReactNode }) => {
  return (
    <section className="text-center py-12">
      <h1 className="font-normal text-4xl">{props.title}</h1>
    </section>
  );
};
