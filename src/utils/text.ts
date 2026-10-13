// Keep ordinary hyphens so PDF keyword searches still match.
export function nowrapHyphenated(html: string): string {
  return html
    .split(/(<[^>]*>)/)
    .map((part, segmentIndex) => {
      const isHtmlTag = segmentIndex % 2 === 1;
      return isHtmlTag
        ? part
        : part.replace(
            /[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)+/gu,
            (word) => `<span class="nb">${word}</span>`,
          );
    })
    .join("");
}
