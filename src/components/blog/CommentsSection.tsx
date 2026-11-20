'use client';

import React, { useState } from 'react';
import { Comment } from '@/types/blog';
import { formatWATDate } from '@/lib/utils';
import { MessageSquare, Reply, User, Send, CheckCircle2 } from 'lucide-react';
import { addComment } from '@/lib/postsStore';

interface CommentsSectionProps {
  postSlug: string;
  initialComments: Comment[];
}

export function CommentsSection({ postSlug, initialComments }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments || []);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyName, setReplyName] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  const handleSubmitTopLevel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      const newComment = await addComment({
        post_slug: postSlug,
        author_name: name.trim(),
        author_email: email.trim() || undefined,
        content: content.trim(),
      });

      setComments((prev) => [...prev, newComment]);
      setName('');
      setEmail('');
      setContent('');
      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 4000);
    } catch (err) {
      console.error('Failed to post comment', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyName.trim() || !replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      const newReply = await addComment({
        post_slug: postSlug,
        parent_id: parentId,
        author_name: replyName.trim(),
        content: replyContent.trim(),
      });

      // Update local nested state
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === parentId) {
            return {
              ...c,
              replies: [...(c.replies || []), newReply],
            };
          }
          return c;
        })
      );

      setReplyingToId(null);
      setReplyName('');
      setReplyContent('');
      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 4000);
    } catch (err) {
      console.error('Failed to reply', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalCount = comments.reduce(
    (acc, c) => acc + 1 + (c.replies?.length || 0),
    0
  );

  return (
    <section className="mt-12 pt-8 border-t-2 border-zinc-200 dark:border-zinc-800 transition-colors">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-red-600 text-white rounded-lg">
            <MessageSquare className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight text-zinc-950 dark:text-white font-sans">
              Discussion & Student Opinions
            </h3>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {totalCount} {totalCount === 1 ? 'comment' : 'comments'} • Guest comments welcome (No login required)
            </span>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="mb-6 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Your comment has been posted successfully and is now visible to all readers!</span>
        </div>
      )}

      {/* Main Comment Form */}
      <form onSubmit={handleSubmitTopLevel} className="mb-10 bg-zinc-50 dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 transition-colors">
        <h4 className="text-xs font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200 mb-3">
          Leave a Comment or Gist
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Your Name / Nickname <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Oghenero or 200L Law"
              className="w-full px-3.5 py-2 text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Email (Optional, won&apos;t be published)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="youremail@example.com"
              className="w-full px-3.5 py-2 text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Comment <span className="text-red-600">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts or update on this story..."
            className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 resize-y"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Posting...' : 'Post Comment'}</span>
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-8 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs">
            Be the first to share your opinion on this story!
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 flex items-center justify-center font-bold text-xs shrink-0">
                    <User className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                      {comment.author_name}
                    </span>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block font-mono">
                      {formatWATDate(comment.created_at, { format: 'relative', includeTime: true })}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}
                  className="text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1"
                >
                  <Reply className="w-3.5 h-3.5" />
                  <span>Reply</span>
                </button>
              </div>

              <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-3 leading-relaxed">
                {comment.content}
              </p>

              {/* Nested Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-4 pl-4 sm:pl-6 border-l-2 border-red-200 dark:border-red-900 space-y-3">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-lg border border-zinc-200/80 dark:border-zinc-700">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {reply.author_name}
                        </span>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                          {formatWATDate(reply.created_at, { format: 'relative' })}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed">
                        {reply.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Inline Reply Form */}
              {replyingToId === comment.id && (
                <div className="mt-4 p-3 bg-red-50/50 rounded-xl border border-red-200">
                  <h5 className="text-[11px] font-bold text-red-800 uppercase tracking-wider mb-2">
                    Reply to {comment.author_name}
                  </h5>
                  <div className="mb-2">
                    <input
                      type="text"
                      required
                      placeholder="Your name / handle"
                      value={replyName}
                      onChange={(e) => setReplyName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-red-600"
                    />
                  </div>
                  <div className="mb-2">
                    <textarea
                      rows={2}
                      required
                      placeholder="Write your reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-red-600"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setReplyingToId(null)}
                      className="px-3 py-1 text-xs text-zinc-600 hover:text-zinc-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleSubmitReply(comment.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded"
                    >
                      {isSubmitting ? 'Posting...' : 'Send Reply'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </section>
  );
}

