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
  previewRef: React.RefObject<HTMLDivElement | null>;
  commentIconPosition: CommentIconPosition | null;
  selectedText: string;
  selectionPosition: SelectionPosition | null;
  handleTextSelection: () => void;
  handleCommentIconClick: (e: React.MouseEvent) => void;
  clearSelection: () => void;
}

// Utility function to normalize whitespace
function normalizeText(str: string): string {
  return str.replace(/\s+/g, ' ').trim();
}

// Find all occurrences of a search string in content
function findAllOccurrences(searchText: string, content: string): number[] {
  const occurrences: number[] = [];
  let index = content.indexOf(searchText);
  while (index !== -1) {
    occurrences.push(index);
    index = content.indexOf(searchText, index + 1);
  }
  return occurrences;
}

// Get context before and after selection from HTML
function getSelectionContext(
  range: Range,
  previewElement: HTMLDivElement
): { before: string; after: string } {
  const preCaretRange = range.cloneRange();
  preCaretRange.selectNodeContents(previewElement);
  preCaretRange.setEnd(range.startContainer, range.startOffset);
  const textBeforeSelection = preCaretRange.toString();

  const postCaretRange = range.cloneRange();
  postCaretRange.selectNodeContents(previewElement);
  postCaretRange.setStart(range.endContainer, range.endOffset);
  const textAfterSelection = postCaretRange.toString();

  return {
    before: textBeforeSelection,
    after: textAfterSelection,
  };
}

// Find the occurrence closest to estimated HTML line position
function findClosestOccurrence(
  occurrences: number[],
  markdownContent: string,
  estimatedHtmlLine: number
): number {
  let closestOccurrence = occurrences[0];
  let minDistance = Infinity;

  for (const occurrence of occurrences) {
    const textBeforeOcc = markdownContent.substring(0, occurrence);
    const occLine = textBeforeOcc.split('\n').length;
    const distance = Math.abs(occLine - estimatedHtmlLine);
    if (distance < minDistance) {
      minDistance = distance;
      closestOccurrence = occurrence;
    }
  }

  return closestOccurrence;
}

// Find unique match by expanding context progressively
function findUniqueMatch(
  searchText: string,
  contextBefore: string,
  contextAfter: string,
  htmlTextBefore: string,
  markdownContent: string,
  maxContextLines: number = 10
): number | null {
  const occurrences = findAllOccurrences(searchText, markdownContent);
  if (occurrences.length === 1) {
    return occurrences[0];
  }
  if (occurrences.length === 0) {
    return null;
  }

  // Normalize context from HTML
  const normalizedBefore = normalizeText(contextBefore);
  const normalizedAfter = normalizeText(contextAfter);

  // Split context into words for matching
  const beforeWords = normalizedBefore.split(/\s+/).filter((w) => w.length > 0);
  const afterWords = normalizedAfter.split(/\s+/).filter((w) => w.length > 0);

  // Try expanding context progressively
  for (
    let contextSize = 1;
    contextSize <= Math.max(beforeWords.length, afterWords.length, maxContextLines);
    contextSize++
  ) {
    // Get context words (take last N words before, first N words after)
    const contextBeforeWords = beforeWords.slice(-contextSize);
    const contextAfterWords = afterWords.slice(0, contextSize);

    const contextBeforeText = contextBeforeWords.join(' ');
    const contextAfterText = contextAfterWords.join(' ');

    // Try to find unique match by checking context around each occurrence
    let uniqueMatch: number | null = null;
    let matchCount = 0;

    for (const occurrence of occurrences) {
      // Get surrounding text from markdown at this occurrence
      const textBeforeOccurrence = markdownContent.substring(
        Math.max(0, occurrence - 1000),
        occurrence
      );
      const textAfterOccurrence = markdownContent.substring(
        occurrence + searchText.length,
        Math.min(markdownContent.length, occurrence + searchText.length + 1000)
      );

      const normalizedBeforeOcc = normalizeText(textBeforeOccurrence);
      const normalizedAfterOcc = normalizeText(textAfterOccurrence);

      // Check if context matches
      const beforeWordsOcc = normalizedBeforeOcc.split(/\s+/).filter((w) => w.length > 0);
      const afterWordsOcc = normalizedAfterOcc.split(/\s+/).filter((w) => w.length > 0);

      const contextBeforeOccWords = beforeWordsOcc.slice(-contextSize);
      const contextAfterOccWords = afterWordsOcc.slice(0, contextSize);

      const contextBeforeOccText = contextBeforeOccWords.join(' ');
      const contextAfterOccText = contextAfterOccWords.join(' ');

      // Check if contexts match (allow partial matches)
      const beforeMatches =
        contextBeforeText &&
        (contextBeforeOccText.includes(contextBeforeText) ||
          contextBeforeText.includes(contextBeforeOccText) ||
          (contextBeforeOccWords.length > 0 &&
            contextBeforeWords.length > 0 &&
            contextBeforeOccWords
              .slice(-Math.min(contextBeforeWords.length, contextBeforeOccWords.length))
              .join(' ') === contextBeforeWords.join(' ')));

      const afterMatches =
        contextAfterText &&
        (contextAfterOccText.includes(contextAfterText) ||
          contextAfterText.includes(contextAfterOccText) ||
          (contextAfterOccWords.length > 0 &&
            contextAfterWords.length > 0 &&
            contextAfterOccWords
              .slice(0, Math.min(contextAfterWords.length, contextAfterOccWords.length))
              .join(' ') === contextAfterWords.join(' ')));

      // If we have context, require at least one match; if no context, accept all
      const matches =
        (!contextBeforeText && !contextAfterText) ||
        (contextBeforeText && beforeMatches) ||
        (contextAfterText && afterMatches);

      if (matches) {
        if (uniqueMatch === null) {
          uniqueMatch = occurrence;
          matchCount = 1;
        } else if (uniqueMatch !== occurrence) {
          matchCount++;
          break; // Multiple matches, need more context
        }
      }
    }

    // If we found exactly one match, return it
    if (matchCount === 1 && uniqueMatch !== null) {
      return uniqueMatch;
    }
  }

  // If still multiple matches, try to use the one closest to the HTML position estimate
  const htmlLines = htmlTextBefore.split('\n');
  const estimatedHtmlLine = htmlLines.length;
  return findClosestOccurrence(occurrences, markdownContent, estimatedHtmlLine);
}

// Calculate line and column position from character index
function calculatePositionFromIndex(
  index: number,
  content: string
): SelectionPosition {
  const textBeforeMatch = content.substring(0, index);
  const lines = textBeforeMatch.split('\n');
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  };
}

// Calculate position from HTML text (fallback)
function calculatePositionFromHTML(textBeforeSelection: string): SelectionPosition {
  const lines = textBeforeSelection.split('\n');
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  };
}

export function useTextSelection(
  onSelectionChange: (text: string, position: SelectionPosition) => void,
  markdownContent?: string
): UseTextSelectionResult {
  const previewRef = useRef<HTMLDivElement>(null);
  const [commentIconPosition, setCommentIconPosition] = useState<CommentIconPosition | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const [selectionPosition, setSelectionPosition] = useState<SelectionPosition | null>(null);

  const handleTextSelection = useCallback(() => {
    setTimeout(() => {
      const selection = window.getSelection();
      if (!selection || selection.toString().trim().length === 0) {
        setCommentIconPosition(null);
        setSelectedText('');
        setSelectionPosition(null);
        return;
      }

      const text = selection.toString().trim();
      const range = selection.getRangeAt(0);

      if (!previewRef.current) {
        return;
      }

      let position: SelectionPosition;

      if (markdownContent) {
        // Get context from HTML to help disambiguate multiple matches
        const { before: textBeforeSelection, after: textAfterSelection } =
          getSelectionContext(range, previewRef.current);

        // Try to find unique match in markdown
        const matchIndex = findUniqueMatch(
          text,
          textBeforeSelection,
          textAfterSelection,
          textBeforeSelection,
          markdownContent
        );

        if (matchIndex !== null && matchIndex !== -1) {
          position = calculatePositionFromIndex(matchIndex, markdownContent);
        } else {
          // Fallback: use HTML-based calculation
          position = calculatePositionFromHTML(textBeforeSelection);
        }
      } else {
        // Fallback: use HTML-based calculation if no markdown content
        const { before: textBeforeSelection } = getSelectionContext(
          range,
          previewRef.current
        );
        position = calculatePositionFromHTML(textBeforeSelection);
      }

      // Calculate comment icon position
      const rect = range.getBoundingClientRect();
      const previewRect = previewRef.current.getBoundingClientRect();

      setSelectedText(text);
      setSelectionPosition(position);
      setCommentIconPosition({
        top: rect.top - previewRect.top - 40,
        left: rect.right - previewRect.left,
      });
      onSelectionChange(text, position);
    }, 10);
  }, [onSelectionChange, markdownContent]);

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

