import { useState, useRef, useCallback } from 'react';

interface SelectionPosition {
  line: number;
  column: number;
}

interface CommentIconPosition {
  top: number;
  left: number;
}

interface UseTextSelectionResult {
  previewRef: React.RefObject<HTMLDivElement>;
  commentIconPosition: CommentIconPosition | null;
  selectedText: string;
  selectionPosition: SelectionPosition | null;
  handleTextSelection: () => void;
  handleCommentIconClick: (e: React.MouseEvent) => void;
  clearSelection: () => void;
}

export function useTextSelection(
  onSelectionChange: (text: string, position: SelectionPosition) => void
): UseTextSelectionResult {
  const previewRef = useRef<HTMLDivElement>(null);
  const [commentIconPosition, setCommentIconPosition] = useState<CommentIconPosition | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const [selectionPosition, setSelectionPosition] = useState<SelectionPosition | null>(null);

  const handleTextSelection = useCallback(() => {
    setTimeout(() => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        const text = selection.toString();
        const range = selection.getRangeAt(0);

        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(previewRef.current!);
        preCaretRange.setEnd(range.startContainer, range.startOffset);
        const textBeforeSelection = preCaretRange.toString();

        const lines = textBeforeSelection.split('\n');
        const line = lines.length;
        const column = lines[lines.length - 1].length + 1;

        const rect = range.getBoundingClientRect();
        const previewRect = previewRef.current!.getBoundingClientRect();

        const position = { line, column };
        setSelectedText(text);
        setSelectionPosition(position);
        setCommentIconPosition({
          top: rect.top - previewRect.top - 40,
          left: rect.right - previewRect.left,
        });
        onSelectionChange(text, position);
      } else {
        setCommentIconPosition(null);
        setSelectedText('');
        setSelectionPosition(null);
      }
    }, 10);
  }, [onSelectionChange]);

  const handleCommentIconClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCommentIconPosition(null);
  }, []);

  const clearSelection = useCallback(() => {
    setCommentIconPosition(null);
    setSelectedText('');
    setSelectionPosition(null);
  }, []);

  return {
    previewRef,
    commentIconPosition,
    selectedText,
    selectionPosition,
    handleTextSelection,
    handleCommentIconClick,
    clearSelection,
  };
}

