import { Comment } from '../store';

export function generateMarkdownExport(comments: Comment[]): string {
  let markdown = '# Comments\n\n';

  comments.forEach((comment, index) => {
    markdown += `## Comment ${index + 1}\n`;
    markdown += `**Selected Text:**\n> ${comment.selectedText}\n`;
    markdown += `**Position:** Line ${comment.line}, Column ${comment.column}\n`;
    markdown += `**Comment:**\n${comment.text}\n`;

    if (comment.replies.length > 0) {
      comment.replies.forEach((reply) => {
        markdown += `${reply.text}\n`;
      });
    }

    markdown += '---\n\n';
  });

  return markdown;
}

export function copyMarkdownToClipboard(markdown: string): Promise<void> {
  return navigator.clipboard.writeText(markdown).then(() => {
    alert('Markdown copied to clipboard!');
  });
}

export function downloadMarkdown(markdown: string): void {
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `markdown-review-${Date.now()}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

