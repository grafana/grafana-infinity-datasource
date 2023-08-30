'use client';

import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

export const ExampleAccordion = ({ items }: { items: { name: string; children: React.ReactNode }[] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  return (
    <div className="grid auto-rows-20 grid-cols-8 my-4">
      <div className="col-span-2 border-r-2">
        <ScrollArea>
          {(items || []).map((i, idx) => (
            <div key={idx} className={`p-2 border-solid border-gray-400 ${idx === activeIndex ? 'bg-secondary font-bold' : ''}`} onClick={() => setActiveIndex(idx)}>
              {i.name}
            </div>
          ))}
        </ScrollArea>
      </div>
      <div className="col-span-6 p-2 px-4">{items.filter((_, idx) => idx === activeIndex).map((item) => item.children)}</div>
    </div>
  );
};
