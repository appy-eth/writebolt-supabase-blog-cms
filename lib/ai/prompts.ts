export const PROMPTS = {
  generateDraft: (topic: string, tone: string) =>
    `Write a blog article about "${topic}" in a ${tone} tone. Use clear H2 subheadings. Write naturally and vary sentence length. Output as Markdown.`,

  rewrite: (text: string) =>
    `Rewrite the following text to improve clarity and flow while maintaining the original meaning:\n\n${text}`,

  expand: (text: string) =>
    `Expand the following outline or bullet points into full, well-written prose paragraphs:\n\n${text}`,

  suggestHeadlines: (topic: string) =>
    `Generate 5 compelling blog headline options for an article about: "${topic}". Return as a numbered list.`,

  generateExcerpt: (content: string) =>
    `Write a 1-2 sentence excerpt summarizing this article for use as a preview on a blog listing page:\n\n${content.slice(0, 2000)}`,

  generateImagePrompt: (
    description: string,
    style: string
  ) =>
    `Create a ${style} image: ${description}. The image should be suitable as a blog article illustration. No text in the image.`,
};
