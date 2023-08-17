import Image from 'next/image';
import { useMDXComponent } from 'next-contentlayer/hooks';
import { cn } from '@/lib/utils';

const getAnchor = (text: React.ReactNode) => {
  return text
    ?.toString()
    .toLowerCase()
    .replace(/[^a-z0-9\- ]/g, '')
    .replace(/[ ]/g, '-')
    .replace('object-object', '');
};

const H2 = ({ children }: { children: string }) => {
  const anchor = getAnchor(children);
  const link = `#${anchor}`;
  return (
    <h2 id={anchor} className="pb-2 font-bold">
      {children}
      <a href={link} className="anchor-link ml-2 text-orange-500">
        #
      </a>
    </h2>
  );
};

const H3 = ({ children }: { children: string }) => {
  const anchor = getAnchor(children);
  const link = `#${anchor}`;
  return (
    <h3 id={anchor}>
      {children}
      <a href={link} className="anchor-link ml-2 text-orange-500">
        #
      </a>
    </h3>
  );
};

const H4 = ({ children }: { children: string }) => {
  const anchor = getAnchor(children);
  const link = `#${anchor}`;
  return (
    <h4 id={anchor}>
      {children}
      <a href={link} className="anchor-link ml-2 text-orange-500">
        #
      </a>
    </h4>
  );
};

const mdxComponents = {
  Image,
  h2: H2,
  h3: H3,
  h4: H4,
  ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => <ul className={cn('my-6 ml-6 list-disc', className)} {...props} />,
  ol: ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => <ol className={cn('my-6 ml-6 list-decimal', className)} {...props} />,
  li: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => <li className={cn('mt-2', className)} {...props} />,
  blockquote: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => <blockquote className={cn('mt-6 border-l-2 pl-6 italic', className)} {...props} />,
  code: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => <code className={cn('relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm', className)} {...props} />,
  pre: ({
    className,
    __rawString__,
    __withMeta__,
    __src__,
    ...props
  }: React.HTMLAttributes<HTMLPreElement> & {
    __rawString__?: string;
    __withMeta__?: boolean;
    __src__?: string;
  }) => <pre className={cn('mb-4 mt-6 p-6 max-h-[650px] overflow-x-auto text-orange-100 rounded-lg border bg-zinc-950 py-4 dark:bg-zinc-900', className)} {...props} />,
  table: ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-6 w-full overflow-y-auto">
      <table className={cn('w-full', className)} {...props} />
    </div>
  ),
  tr: ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => <tr className={cn('m-0 border-t p-0 even:bg-muted', className)} {...props} />,
  th: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th className={cn('border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right', className)} {...props} />
  ),
  td: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className={cn('border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right', className)} {...props} />
  ),
};

interface MdxProps {
  code: string;
}

export function Mdx({ code }: MdxProps) {
  const MDXContent = useMDXComponent(code) as any;
  return <MDXContent components={mdxComponents} />;
}
