interface MarkdownPreviewProps {
  htmlContent: string;
  previewRef: React.RefObject<HTMLDivElement | null>;
  commentIconPosition: { top: number; left: number } | null;
  isFolderMode: boolean;
  fileTreeLength: number;
  onTextSelection: (e: React.MouseEvent<HTMLDivElement>) => void;
  onCommentIconClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function MarkdownPreview({
  htmlContent,
  previewRef,
  commentIconPosition,
  isFolderMode,
  fileTreeLength,
  onTextSelection,
  onCommentIconClick,
}: MarkdownPreviewProps) {
  if (!htmlContent) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 italic">
        <p>
          {isFolderMode
            ? fileTreeLength > 0
              ? 'Select a file from the file tree to start reviewing'
              : 'No markdown files found in the selected folder'
            : 'Upload a markdown file to start reviewing'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 relative overflow-auto">
      <div
        ref={previewRef}
        className="flex-1 overflow-auto p-4 leading-relaxed select-text cursor-text prose prose-sm max-w-none [&_h1]:mt-6 [&_h1]:mb-2 [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:leading-tight [&_h1]:border-b [&_h1]:border-gray-200 [&_h1]:pb-1 [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:leading-tight [&_h2]:border-b [&_h2]:border-gray-200 [&_h2]:pb-1 [&_h3]:mt-4 [&_h3]:mb-1 [&_h3]:text-lg [&_h3]:font-semibold [&_h4]:mt-4 [&_h4]:mb-1 [&_h4]:text-base [&_h5]:mt-4 [&_h5]:mb-1 [&_h5]:text-sm [&_h6]:mt-4 [&_h6]:mb-1 [&_h6]:text-xs [&_h6]:text-gray-500 [&_p]:mb-4 [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono [&_pre]:bg-gray-100 [&_pre]:p-4 [&_pre]:rounded-md [&_pre]:overflow-x-auto [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:text-gray-600 [&_blockquote]:my-4 [&_ul]:pl-8 [&_ul]:mb-4 [&_ul]:list-disc [&_ol]:pl-8 [&_ol]:mb-4 [&_ol]:list-decimal [&_li]:mb-1 [&_a]:text-blue-600 [&_a]:no-underline hover:[&_a]:underline [&_img]:max-w-full [&_img]:h-auto [&_table]:border-collapse [&_table]:w-full [&_table]:mb-4 [&_th]:border [&_th]:border-gray-300 [&_th]:px-4 [&_th]:py-2 [&_th]:text-left [&_th]:bg-gray-100 [&_th]:font-semibold [&_td]:border [&_td]:border-gray-300 [&_td]:px-4 [&_td]:py-2 [&_hr]:border-0 [&_hr]:border-t-2 [&_hr]:border-gray-200 [&_hr]:my-8 [&_::selection]:bg-blue-200"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
        onMouseUp={onTextSelection}
      />
      {commentIconPosition && (
        <button
          className="absolute w-9 h-9 rounded-full bg-blue-600 text-white border-2 border-white shadow-lg cursor-pointer flex items-center justify-center text-xl transition-all z-10 animate-in fade-in zoom-in hover:bg-blue-700 hover:scale-110 hover:shadow-xl active:scale-95"
          style={{
            top: `${commentIconPosition.top}px`,
            left: `${commentIconPosition.left}px`,
          }}
          onClick={onCommentIconClick}
          onMouseDown={(e) => e.preventDefault()}
          title="Add comment"
        >
          💬
        </button>
      )}
    </div>
  );
}

