// Keeps hyphenated words ("full-stack", "end-to-end") on one line without
// swapping the hyphen for U+2011, which would break keyword search in a PDF.
// Splitting on tags with a capture group puts markup on the odd indices, so
// only the text segments are touched and attribute values/URLs stay intact.
// Input is trusted, author-written HTML and is returned as HTML.
export function nowrapHyphenated(html: string): string {
  return html
    .split(/(<[^>]*>)/)
    .map((part, i) =>
      i % 2 === 1
        ? part
        : part.replace(
            /[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)+/gu,
            (word) => `<span class="nb">${word}</span>`,
          ),
    )
    .join("");
}
