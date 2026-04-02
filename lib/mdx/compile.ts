import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { mdxComponents } from "./components";

export async function compileMdx(source: string) {
  const { content, frontmatter } = await compileMDX({
    source,
    components: mdxComponents,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: "wrap",
              properties: { className: ["anchor-link"] },
            },
          ],
        ],
      },
    },
  });

  return { content, frontmatter };
}
