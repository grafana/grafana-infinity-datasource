import { defineDocumentType, defineNestedType, makeSource } from 'contentlayer/source-files';
import readingTime from 'reading-time';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import remarkGfm from 'remark-gfm';
import rehypeCodeTitles from 'rehype-code-titles';
import rehypePrism from 'rehype-prism-plus';

/** @type {import('contentlayer/source-files').ComputedFields} */
const computedFields: any = {
  slug: {
    type: 'string',
    resolve: (doc: any) => `/${doc._raw.flattenedPath}`,
  },
  slugAsParams: {
    type: 'string',
    resolve: (doc: any) => doc._raw.flattenedPath.split('/').slice(1).join('/'),
  },
  readingTime: { type: 'json', resolve: (doc: any) => readingTime(doc.body.raw) },
};

export const Doc = defineDocumentType(() => ({
  name: 'Doc',
  filePathPattern: `docs/**/*.mdx`,
  contentType: 'mdx',
  fields: {
    title: {
      type: 'string',
      required: true,
    },
    description: {
      type: 'string',
      required: false,
    },
    date: {
      type: 'date',
      required: false,
    },
    category: {
      type: 'string',
      required: false,
    },
    image: {
      type: 'string',
      required: false,
    },
    slug: { type: 'string' },
    previous_page_title: { type: 'string' },
    previous_page_slug: { type: 'string' },
    next_page_title: { type: 'string' },
    next_page_slug: { type: 'string' },
  },
  computedFields,
}));

export const Blog = defineDocumentType(() => ({
  name: 'Blog',
  filePathPattern: `blog/**/*.mdx`,
  contentType: 'mdx',
  fields: {
    tags: {
      type: 'list',
      of: { type: 'string' },
      required: true,
    },
    title: {
      type: 'string',
      required: true,
    },
    description: {
      type: 'string',
      required: false,
    },
    date: {
      type: 'date',
      required: false,
    },
    category: {
      type: 'string',
      required: false,
    },
    image: {
      type: 'string',
      required: false,
    },
    slug: { type: 'string' },
    previous_page_title: { type: 'string' },
    previous_page_slug: { type: 'string' },
    next_page_title: { type: 'string' },
    next_page_slug: { type: 'string' },
  },
  computedFields,
}));

export default makeSource({
  contentDirPath: './content',
  documentTypes: [Doc, Blog],
  mdx: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      rehypeCodeTitles,
      rehypePrism,
      [
        rehypeAutolinkHeadings,
        {
          properties: {
            className: ['anchor'],
          },
        },
      ],
    ],
  },
});
