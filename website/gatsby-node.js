exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions;
  const typeDefs = `
      type MarkdownRemark implements Node {
        frontmatter: Frontmatter
      }
      type Frontmatter {
        date: String
        category: String
        tags: [String]
        previous_page_title: String
        previous_page_slug: String
        next_page_title: String
        next_page_slug: String
      }
    `;
  createTypes(typeDefs);
};
