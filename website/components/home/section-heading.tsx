import React from 'react';

export default function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h6 className="w-full text-center mb-10 text-2xl text-white font-semibold">{children}</h6>;
}
