import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CommentReply {
  id: string;
  text: string;
  timestamp: number;
}

export interface Comment {
  id: string;
  text: string;
  selectedText: string;
  line: number;
  column: number;
  timestamp: number;
  replies: CommentReply[];
}

export interface CommentHistory {
  id: string;
  fileName: string;
  comments: Comment[];
  savedAt: number;
}

interface MarkdownReviewerState {
  markdownContent: string;
  currentFileName: string;
  comments: Comment[];
  commentHistory: CommentHistory[];
  selectedHistoryId: string | null;
  selectedText: string;
  showCommentDialog: boolean;
  showExportDialog: boolean;
  commentText: string;
  selectionPosition: { line: number; column: number } | null;
  commentsSidebarCollapsed: boolean;

  // Actions
  setMarkdownContent: (content: string, fileName: string) => void;
  addComment: (comment: Comment) => void;
  addReplyToComment: (commentId: string, reply: CommentReply) => void;
  deleteComment: (id: string) => void;
  deleteReply: (commentId: string, replyId: string) => void;
  updateComment: (id: string, text: string) => void;
  updateReply: (commentId: string, replyId: string, text: string) => void;
  setSelectedText: (text: string) => void;
  setShowCommentDialog: (show: boolean) => void;
  setShowExportDialog: (show: boolean) => void;
  setCommentText: (text: string) => void;
  setSelectionPosition: (
    position: { line: number; column: number } | null
  ) => void;
  saveCurrentCommentsToHistory: () => void;
  loadHistoryComments: (historyId: string) => void;
  setSelectedHistoryId: (id: string | null) => void;
  resetComments: () => void;
  clearCommentDialog: () => void;
  setCommentsSidebarCollapsed: (collapsed: boolean) => void;
}

export const useMarkdownReviewerStore = create<MarkdownReviewerState>()(
  persist(
    (set, get) => ({
      markdownContent: '',
      currentFileName: '',
      comments: [],
      commentHistory: [],
      selectedHistoryId: null,
      selectedText: '',
      showCommentDialog: false,
      showExportDialog: false,
      commentText: '',
      selectionPosition: null,
      commentsSidebarCollapsed: false,

      setMarkdownContent: (content, fileName) => {
        const state = get();

        // Only save to history if there are comments for the current version
        // When content changes and comments exist, save them to history and clear comments
        let updatedHistory = state.commentHistory;
        if (state.comments.length > 0) {
          // Save current comments to history before updating content
          const historyEntry: CommentHistory = {
            id: Date.now().toString(),
            fileName: state.currentFileName || fileName,
            comments: state.comments,
            savedAt: Date.now(),
          };
          updatedHistory = [...state.commentHistory, historyEntry];
        }

        // Update content and clear comments
        // New version will only be saved when user adds comments
        set({
          markdownContent: content,
          currentFileName: fileName,
          comments: [],
          commentHistory: updatedHistory,
          selectedHistoryId: null,
        });
      },

      saveCurrentCommentsToHistory: () => {
        const state = get();
        if (!state.currentFileName || state.comments.length === 0) return;

        const historyEntry: CommentHistory = {
          id: Date.now().toString(),
          fileName: state.currentFileName,
          comments: state.comments,
          savedAt: Date.now(),
        };

        set({
          commentHistory: [...state.commentHistory, historyEntry],
        });
      },

      loadHistoryComments: (historyId) => {
        const state = get();
        const history = state.commentHistory.find((h) => h.id === historyId);
        if (history) {
          set({
            selectedHistoryId: historyId,
          });
        }
      },

      setSelectedHistoryId: (id) => set({ selectedHistoryId: id }),

      addComment: (comment) =>
        set((state) => ({ comments: [...state.comments, comment] })),

      addReplyToComment: (commentId, reply) =>
        set((state) => ({
          comments: state.comments.map((c) =>
            c.id === commentId
              ? { ...c, replies: [...(c.replies || []), reply] }
              : c
          ),
        })),

      deleteComment: (id) =>
        set((state) => ({
          comments: state.comments.filter((c) => c.id !== id),
        })),

      deleteReply: (commentId, replyId) =>
        set((state) => ({
          comments: state.comments.map((c) =>
            c.id === commentId
              ? {
                  ...c,
                  replies: (c.replies || []).filter((r) => r.id !== replyId),
                }
              : c
          ),
        })),

      updateComment: (id, text) =>
        set((state) => ({
          comments: state.comments.map((c) =>
            c.id === id ? { ...c, text } : c
          ),
        })),

      updateReply: (commentId, replyId, text) =>
        set((state) => ({
          comments: state.comments.map((c) =>
            c.id === commentId
              ? {
                  ...c,
                  replies: (c.replies || []).map((r) =>
                    r.id === replyId ? { ...r, text } : r
                  ),
                }
              : c
          ),
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

      setCommentsSidebarCollapsed: (collapsed) =>
        set({ commentsSidebarCollapsed: collapsed }),
    }),
    {
      name: 'markdown-reviewer-storage',
      partialize: (state) => ({
        markdownContent: state.markdownContent,
        currentFileName: state.currentFileName,
        comments: state.comments,
        commentHistory: state.commentHistory,
      }),
    }
  )
);
