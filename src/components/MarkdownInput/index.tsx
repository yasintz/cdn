import React from 'react';
import { cn } from '@/lib/utils';
import {
  toolbarPlugin,
  KitchenSinkToolbar,
  listsPlugin,
  quotePlugin,
  headingsPlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  tablePlugin,
  thematicBreakPlugin,
  frontmatterPlugin,
  codeBlockPlugin,
  sandpackPlugin,
  codeMirrorPlugin,
  directivesPlugin,
  AdmonitionDirectiveDescriptor,
  diffSourcePlugin,
  markdownShortcutPlugin,
  SandpackConfig,
  MDXEditor,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import './style.scss';

const defaultSnippetContent = `
export default function App() {
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
    </div>
  );
}
`.trim();

const reactSandpackConfig: SandpackConfig = {
  defaultPreset: 'react',
  presets: [
    {
      label: 'React',
      name: 'react',
      meta: 'live',
      sandpackTemplate: 'react',
      sandpackTheme: 'light',
      snippetFileName: '/App.js',
      snippetLanguage: 'jsx',
      initialSnippetContent: defaultSnippetContent,
    },
  ],
};
const allPlugins = (diffMarkdown: string) => [
  toolbarPlugin({ toolbarContents: () => <KitchenSinkToolbar /> }),
  listsPlugin(),
  quotePlugin(),
  headingsPlugin(),
  linkPlugin(),
  linkDialogPlugin(),
  // eslint-disable-next-line @typescript-eslint/require-await
  imagePlugin({ imageUploadHandler: async () => '/sample-image.png' }),
  tablePlugin(),
  thematicBreakPlugin(),
  frontmatterPlugin(),
  codeBlockPlugin({ defaultCodeBlockLanguage: 'txt' }),
  sandpackPlugin({ sandpackConfig: reactSandpackConfig }),
  codeMirrorPlugin({
    codeBlockLanguages: {
      js: 'JavaScript',
      css: 'CSS',
      txt: 'text',
      tsx: 'TypeScript',
    },
  }),
  directivesPlugin({ directiveDescriptors: [AdmonitionDirectiveDescriptor] }),
  diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown }),
  markdownShortcutPlugin(),
];

type MarkdownInputProps = {
  onChange: (value: string) => void;
  value: string;
  className?: string;
};

const MarkdownInput = ({ onChange, value, className }: MarkdownInputProps) => {
  return (
    <MDXEditor
      markdown={value}
      className={cn(className, 'mt-2 full-demo-mdxeditor border rounded-sm')}
      contentEditableClassName="prose max-w-full font-sans"
      plugins={allPlugins(value)}
      onChange={onChange}
    />
  );
};

export default MarkdownInput;
