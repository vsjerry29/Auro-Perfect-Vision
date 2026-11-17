"use client";

import React, { useState } from "react";
import { useDemoStore } from "@/lib/store";
import { BlogPost } from "@/lib/types";
import { Edit2, Plus, BookOpen, Clock, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

export default function AdminCmsPage() {
  const { blogs, saveBlogPost } = useDemoStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Ocular Wellness");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("Dr. Ananya Sen");

  const handleOpenEdit = (post: BlogPost) => {
    setEditingPost(post);
    setTitle(post.title);
    setSlug(post.slug);
    setCategory(post.category);
    setExcerpt(post.excerpt);
    setContent(post.content);
    setAuthorName(post.authorName);
    setModalOpen(true);
  };

  const handleOpenNew = () => {
    setEditingPost(null);
    setTitle("");
    setSlug("");
    setCategory("Ocular Wellness");
    setExcerpt("");
    setContent("");
    setAuthorName("Dr. Ananya Sen");
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveBlogPost({
      id: editingPost?.id,
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      category,
      excerpt,
      content,
      authorName,
      readTime: "5 min read",
      publishedDate: "November 2026",
      coverImage: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80",
      isPublished: true,
    });
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ink-border">
        <div>
          <span className="text-xs uppercase font-sans tracking-wider text-gold-dark font-semibold">
            Content Management
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-ink font-normal">
            Articles & Journal CMS
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Publish educational articles and updates on eye yoga and screen recovery without developer assistance.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={handleOpenNew} className="gap-1.5 text-xs">
          <Plus className="w-4 h-4" />
          <span>New Journal Article</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-xl border border-ink-border shadow-subtle p-5 flex flex-col justify-between hover:shadow-card transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-2 text-xs">
                <Badge variant="sage">{post.category}</Badge>
                <span className="text-ink-muted text-[11px]">{post.publishedDate}</span>
              </div>

              <h3 className="font-serif text-base font-medium text-ink mb-2 line-clamp-2">
                {post.title}
              </h3>

              <p className="text-xs text-ink-muted line-clamp-3 leading-relaxed mb-4">
                {post.excerpt}
              </p>
            </div>

            <div className="pt-3 border-t border-ink-border/50 flex items-center justify-between">
              <span className="text-[11px] text-ink-muted">By {post.authorName}</span>
              <button
                type="button"
                onClick={() => handleOpenEdit(post)}
                className="text-xs text-plum hover:underline font-medium flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <Dialog
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingPost ? "Edit Journal Article" : "New Journal Article"}
          description="Draft and publish eye wellness insights"
          maxWidth="lg"
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-ink mb-1">Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-ink-border bg-canvas-light text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-ink mb-1">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-ink-border bg-canvas-light text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-ink mb-1">Author Name</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-ink-border bg-canvas-light text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-ink mb-1">Excerpt *</label>
              <textarea
                rows={2}
                required
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-ink-border bg-canvas-light text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-ink mb-1">Full Article Body *</label>
              <textarea
                rows={6}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-ink-border bg-canvas-light text-xs font-mono"
              />
            </div>

            <div className="pt-4 border-t flex justify-end gap-3">
              <Button variant="outline" size="sm" type="button" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Save & Publish
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}
