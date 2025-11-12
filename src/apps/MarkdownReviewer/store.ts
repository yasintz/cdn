import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Comment {
  id: string;
  text: string;
  selectedText: string;
  line: number;
  column: number;
  timestamp: number;
}

interface MarkdownReviewerState {
  markdownContent: string;
  comments: Comment[];
  selectedText: string;
  showCommentDialog: boolean;
  showExportDialog: boolean;
  commentText: string;
  selectionPosition: { line: number; column: number } | null;
  
  // Actions
  setMarkdownContent: (content: string) => void;
  addComment: (comment: Comment) => void;
  deleteComment: (id: string) => void;
  setSelectedText: (text: string) => void;
  setShowCommentDialog: (show: boolean) => void;
  setShowExportDialog: (show: boolean) => void;
  setCommentText: (text: string) => void;
  setSelectionPosition: (position: { line: number; column: number } | null) => void;
  resetComments: () => void;
  clearCommentDialog: () => void;
}

export const useMarkdownReviewerStore = create<MarkdownReviewerState>()(
  persist(
    (set) => ({
      markdownContent: '',
      comments: [],
      selectedText: '',
      showCommentDialog: false,
      showExportDialog: false,
      commentText: '',
      selectionPosition: null,

      setMarkdownContent: (content) => set({ markdownContent: content }),
      
      addComment: (comment) =>
        set((state) => ({ comments: [...state.comments, comment] })),
      
      deleteComment: (id) =>
        set((state) => ({
          comments: state.comments.filter((c) => c.id !== id),
        })),
      
      setSelectedText: (text) => set({ selectedText: text }),
      
      setShowCommentDialog: (show) => set({ showCommentDialog: show }),
      
      setShowExportDialog: (show) => set({ showExportDialog: show }),
      
      setCommentText: (text) => set({ commentText: text }),
      
      setSelectionPosition: (position) => set({ selectionPosition: position }),
      
      resetComments: () => set({ comments: [] }),
      
      clearCommentDialog: () =>
        set({
          showCommentDialog: false,
          commentText: '',
          selectedText: '',
          selectionPosition: null,
        }),
    }),
    {
      name: 'markdown-reviewer-storage',
      partialize: (state) => ({
        markdownContent: state.markdownContent,
        comments: state.comments,
      }),
    }
  )
);

