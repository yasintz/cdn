import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FileTreeNode } from './utils/folderUtils';

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
  filePath?: string;
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
  commentText: string;
  selectionPosition: { line: number; column: number } | null;
  commentsSidebarCollapsed: boolean;
  
  // Folder mode state
  isFolderMode: boolean;
  folderHandle: FileSystemDirectoryHandle | null;
  folderName: string;
  fileTree: FileTreeNode[];
  currentFilePath: string | null;
  fileComments: { [filePath: string]: Comment[] };

  // Actions
  setMarkdownContent: (content: string, fileName: string) => void;
  setFolderMode: (folderHandle: FileSystemDirectoryHandle | null, folderName: string, fileTree: FileTreeNode[]) => void;
  setCurrentFile: (filePath: string | null) => void;
  getCurrentFileComments: () => Comment[];
  addComment: (comment: Comment, filePath?: string) => void;
  addReplyToComment: (commentId: string, reply: CommentReply, filePath?: string) => void;
  deleteComment: (id: string, filePath?: string) => void;
  deleteReply: (commentId: string, replyId: string, filePath?: string) => void;
  updateComment: (id: string, text: string, filePath?: string) => void;
  updateReply: (commentId: string, replyId: string, text: string, filePath?: string) => void;
  setSelectedText: (text: string) => void;
  setShowCommentDialog: (show: boolean) => void;
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
      commentText: '',
      selectionPosition: null,
      commentsSidebarCollapsed: false,
      isFolderMode: false,
      folderHandle: null,
      folderName: '',
      fileTree: [],
      currentFilePath: null,
      fileComments: {},

      setMarkdownContent: (content, fileName) => {
        const state = get();

        // Check if content actually changed - if not, don't clear comments
        const contentChanged = content !== state.markdownContent || fileName !== state.currentFileName;
        
        if (!contentChanged) {
          // Content hasn't changed, just update the state without clearing comments
          set({
            markdownContent: content,
            currentFileName: fileName,
          });
          return;
        }

        // Only save to history if there are comments for the current version
        // When content changes and comments exist, save them to history and clear comments
        let updatedHistory = state.commentHistory;
        const currentComments = state.isFolderMode && state.currentFilePath
          ? state.fileComments[state.currentFilePath] || []
          : state.comments;
          
        if (currentComments.length > 0) {
          // Save current comments to history before updating content
          const historyEntry: CommentHistory = {
            id: Date.now().toString(),
            fileName: state.currentFileName || fileName,
            filePath: state.currentFilePath || undefined,
            comments: currentComments,
            savedAt: Date.now(),
          };
          updatedHistory = [...state.commentHistory, historyEntry];
        }

        // Update content and clear comments for current file
        // New version will only be saved when user adds comments
        if (state.isFolderMode && state.currentFilePath) {
          // In folder mode, clear comments for the current file
          const updatedFileComments = { ...state.fileComments };
          updatedFileComments[state.currentFilePath] = [];
          set({
            markdownContent: content,
            currentFileName: fileName,
            fileComments: updatedFileComments,
            commentHistory: updatedHistory,
            selectedHistoryId: null,
          });
        } else {
          // Single file mode
          set({
            markdownContent: content,
            currentFileName: fileName,
            comments: [],
            commentHistory: updatedHistory,
            selectedHistoryId: null,
          });
        }
      },

      setFolderMode: (folderHandle, folderName, fileTree) => {
        set({
          isFolderMode: folderHandle !== null,
          folderHandle,
          folderName,
          fileTree,
          currentFilePath: null,
          markdownContent: '',
          currentFileName: '',
        });
      },

      setCurrentFile: (filePath) => {
        const state = get();
        const fileComments = state.fileComments[filePath || ''] || [];
        set({
          currentFilePath: filePath,
          comments: fileComments, // Set comments for the selected file
        });
      },

      getCurrentFileComments: () => {
        const state = get();
        if (state.isFolderMode && state.currentFilePath) {
          return state.fileComments[state.currentFilePath] || [];
        }
        return state.comments;
      },

      saveCurrentCommentsToHistory: () => {
        const state = get();
        const currentComments = state.isFolderMode && state.currentFilePath
          ? state.fileComments[state.currentFilePath] || []
          : state.comments;
          
        if (!state.currentFileName || currentComments.length === 0) return;

        const historyEntry: CommentHistory = {
          id: Date.now().toString(),
          fileName: state.currentFileName,
          filePath: state.currentFilePath || undefined,
          comments: currentComments,
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

      addComment: (comment, filePath) =>
        set((state) => {
          if (state.isFolderMode && filePath) {
            const fileComments = state.fileComments[filePath] || [];
            return {
              fileComments: {
                ...state.fileComments,
                [filePath]: [...fileComments, comment],
              },
              comments: [...fileComments, comment], // Update current comments
            };
          }
          return { comments: [...state.comments, comment] };
        }),

      addReplyToComment: (commentId, reply, filePath) =>
        set((state) => {
          const updateComments = (comments: Comment[]) =>
            comments.map((c) =>
              c.id === commentId
                ? { ...c, replies: [...(c.replies || []), reply] }
                : c
            );

          if (state.isFolderMode && filePath) {
            const fileComments = state.fileComments[filePath] || [];
            const updated = updateComments(fileComments);
            return {
              fileComments: {
                ...state.fileComments,
                [filePath]: updated,
              },
              comments: updated, // Update current comments
            };
          }
          return {
            comments: updateComments(state.comments),
          };
        }),

      deleteComment: (id, filePath) =>
        set((state) => {
          if (state.isFolderMode && filePath) {
            const fileComments = state.fileComments[filePath] || [];
            const updated = fileComments.filter((c) => c.id !== id);
            return {
              fileComments: {
                ...state.fileComments,
                [filePath]: updated,
              },
              comments: updated, // Update current comments
            };
          }
          return {
            comments: state.comments.filter((c) => c.id !== id),
          };
        }),

      deleteReply: (commentId, replyId, filePath) =>
        set((state) => {
          const updateComments = (comments: Comment[]) =>
            comments.map((c) =>
              c.id === commentId
                ? {
                    ...c,
                    replies: (c.replies || []).filter((r) => r.id !== replyId),
                  }
                : c
            );

          if (state.isFolderMode && filePath) {
            const fileComments = state.fileComments[filePath] || [];
            const updated = updateComments(fileComments);
            return {
              fileComments: {
                ...state.fileComments,
                [filePath]: updated,
              },
              comments: updated, // Update current comments
            };
          }
          return {
            comments: updateComments(state.comments),
          };
        }),

      updateComment: (id, text, filePath) =>
        set((state) => {
          const updateComments = (comments: Comment[]) =>
            comments.map((c) => (c.id === id ? { ...c, text } : c));

          if (state.isFolderMode && filePath) {
            const fileComments = state.fileComments[filePath] || [];
            const updated = updateComments(fileComments);
            return {
              fileComments: {
                ...state.fileComments,
                [filePath]: updated,
              },
              comments: updated, // Update current comments
            };
          }
          return {
            comments: updateComments(state.comments),
          };
        }),

      updateReply: (commentId, replyId, text, filePath) =>
        set((state) => {
          const updateComments = (comments: Comment[]) =>
            comments.map((c) =>
              c.id === commentId
                ? {
                    ...c,
                    replies: (c.replies || []).map((r) =>
                      r.id === replyId ? { ...r, text } : r
                    ),
                  }
                : c
            );

          if (state.isFolderMode && filePath) {
            const fileComments = state.fileComments[filePath] || [];
            const updated = updateComments(fileComments);
            return {
              fileComments: {
                ...state.fileComments,
                [filePath]: updated,
              },
              comments: updated, // Update current comments
            };
          }
          return {
            comments: updateComments(state.comments),
          };
        }),

      setSelectedText: (text) => set({ selectedText: text }),

      setShowCommentDialog: (show) => set({ showCommentDialog: show }),

      setCommentText: (text) => set({ commentText: text }),

      setSelectionPosition: (position) => set({ selectionPosition: position }),

      resetComments: () => {
        const state = get();
        if (state.isFolderMode && state.currentFilePath) {
          const updatedFileComments = { ...state.fileComments };
          updatedFileComments[state.currentFilePath] = [];
          set({
            fileComments: updatedFileComments,
            comments: [],
          });
        } else {
          set({ comments: [] });
        }
      },

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
        isFolderMode: state.isFolderMode,
        folderName: state.folderName,
        fileTree: state.fileTree,
        currentFilePath: state.currentFilePath,
        fileComments: state.fileComments,
        // Note: folderHandle cannot be persisted, will need to be re-selected
      }),
    }
  )
);
