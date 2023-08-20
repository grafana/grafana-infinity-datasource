import Link from 'next/link';
import { allBlogs } from 'contentlayer/generated';

export default function Blog() {
  return (
    <>
      <header>
        <h1 className="mb-2 font-extrabold text-2xl">Articles & Examples</h1>
        {/* {post.description && <p className="text-xl mt-0 mb-6 text-gray-700 dark:text-gray-200">{post.description}</p>} */}
        <p className="space-x-1 text-xs text-gray-500"></p>
      </header>
      <hr className="my-6" />
      <div className="flex w-full flex-col gap-4">
        {allBlogs.map((b) => (
          <div key={b.title} className="p-6 bg-slate-800 text-gray-100 border-red-200 rounded-md">
            <Link className="text-lg font-light" href={`/blog/${b.page_slug}`}>
              {b.title || ''}
            </Link>
            <br />
            <span className="text-sm text-gray-400">Tags: {(b.tags || []).join(', ')}</span>
          </div>
        ))}
      </div>
    </>
  );
}
