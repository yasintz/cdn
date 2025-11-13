import { useState, useCallback } from 'react';
import { CommentReply } from '../store';

interface UseCommentsResult {
  editingCommentId: string | null;
  editingReplyId: string | null;
  editText: string;
  replyingToCommentId: string | null;
  replyText: string;
  setEditText: (text: string) => void;
  setReplyText: (text: string) => void;
  handleStartEdit: (commentId: string, text: string) => void;
  handleStartEditReply: (commentId: string, replyId: string, text: string) => void;
  handleSaveEdit: (updateComment: (id: string, text: string) => void, updateReply: (commentId: string, replyId: string, text: string) => void) => void;
  handleCancelEdit: () => void;
  handleStartReply: (commentId: string) => void;
  handleSaveReply: (commentId: string, addReplyToComment: (commentId: string, reply: CommentReply) => void) => void;
  handleCancelReply: () => void;
}

export function useComments(): UseCommentsResult {
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleStartEdit = useCallback((commentId: string, text: string) => {
    setEditingCommentId(commentId);
    setEditText(text);
  }, []);

  const handleStartEditReply = useCallback((commentId: string, replyId: string, text: string) => {
    setEditingCommentId(commentId);
    setEditingReplyId(replyId);
    setEditText(text);
  }, []);

  const handleSaveEdit = useCallback((
    updateComment: (id: string, text: string) => void,
    updateReply: (commentId: string, replyId: string, text: string) => void
  ) => {
    if (editText.trim()) {
      if (editingReplyId) {
        updateReply(editingCommentId!, editingReplyId, editText);
      } else {
        updateComment(editingCommentId!, editText);
      }
    }
    setEditingCommentId(null);
    setEditingReplyId(null);
    setEditText('');
  }, [editText, editingCommentId, editingReplyId]);

  const handleCancelEdit = useCallback(() => {
    setEditingCommentId(null);
    setEditingReplyId(null);
    setEditText('');
  }, []);

  const handleStartReply = useCallback((commentId: string) => {
    setReplyingToCommentId(commentId);
    setReplyText('');
  }, []);

  const handleSaveReply = useCallback((commentId: string, addReplyToComment: (commentId: string, reply: CommentReply) => void) => {
    if (replyText.trim()) {
      const reply: CommentReply = {
        id: Date.now().toString(),
        text: replyText,
        timestamp: Date.now(),
      };
      addReplyToComment(commentId, reply);
      setReplyingToCommentId(null);
      setReplyText('');
    }
  }, [replyText]);

  const handleCancelReply = useCallback(() => {
    setReplyingToCommentId(null);
    setReplyText('');
  }, []);

  return {
    editingCommentId,
    editingReplyId,
    editText,
    replyingToCommentId,
    replyText,
    setEditText,
    setReplyText,
    handleStartEdit,
    handleStartEditReply,
    handleSaveEdit,
    handleCancelEdit,
    handleStartReply,
    handleSaveReply,
    handleCancelReply,
  };
}

