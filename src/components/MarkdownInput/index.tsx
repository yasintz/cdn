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
import { PanelTopCloseIcon } from 'lucide-react';

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

const ToolbarContent = ({
  show,
  setShow,
}: {
  show: boolean;
  setShow: (show: boolean) => void;
}) => {
  if (show) {
    return (
      <div className="flex gap-2 items-center">
        <KitchenSinkToolbar />
        <PanelTopCloseIcon
          className="size-4 text-gray-600"
          onClick={() => setShow(false)}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-1.5 bg-gray-100" onClick={() => setShow(true)} />
  );
};

const allPlugins = ({
  diffMarkdown,
  showToolbar,
  setShowToolbar,
}: {
  diffMarkdown: string;
  showToolbar: boolean;
  setShowToolbar: (show: boolean) => void;
}) => [
  toolbarPlugin({
    toolbarClassName: cn({ 'hidden-toolbar': !showToolbar }),
    toolbarContents: () => (
      <ToolbarContent show={showToolbar} setShow={setShowToolbar} />
    ),
  }),
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
  showToolbar?: boolean;
};

const MarkdownInput = ({
  onChange,
  value,
  className,
  showToolbar: showToolbarProp = false,
}: MarkdownInputProps) => {
  const [showToolbar, setShowToolbar] = React.useState(showToolbarProp);

  return (
    <MDXEditor
      markdown={value}
      className={cn(className, 'mt-2 full-demo-mdxeditor border rounded-sm')}
      contentEditableClassName="prose max-w-full font-sans"
      plugins={allPlugins({ diffMarkdown: value, showToolbar, setShowToolbar })}
      onChange={onChange}
    />
  );
};

export default MarkdownInput;
