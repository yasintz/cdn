import React from 'react';
import Markdown from 'react-markdown';

type MarkdownRendererProps = {
  content: string;
};

const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
  return <Markdown>{content}</Markdown>;
};

export default MarkdownRenderer;
