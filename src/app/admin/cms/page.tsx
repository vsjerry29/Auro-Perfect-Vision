"use client";

import React, { useState, useEffect, useRef } from "react";
import { BlogPost } from "@/lib/types";
import { SiteContent } from "@/lib/server/cms";
import { CmsRevision } from "@/lib/types/crm";
import {
  Edit2,
  Plus,
  BookOpen,
  Layout,
  Upload,
  CheckCircle2,
  Image as ImageIcon,
  ExternalLink,
  Save,
  Globe,
  History,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

export default function AdminCmsPage() {
  const [activeTab, setActiveTab] = useState<"homepage" | "blogs" | "revisions">("homepage");

  // Site Content State
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null);
  const [revisions, setRevisions] = useState<CmsRevision[]>([]);
  const [contentLoading, setContentLoading] = useState(true);
  const [savingContent, setSavingContent] = useState(false);
  const [rollingBack, setRollingBack] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Blog State
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [blogModalOpen, setBlogModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  // Blog Form State
  const [blogTitle, setBlogTitle] = useState("");
  const [blogSlug, setBlogSlug] = useState("");
  const [blogCategory, setBlogCategory] = useState("Ocular Wellness");
  const [blogExcerpt, setBlogExcerpt] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [blogAuthor, setBlogAuthor] = useState("Dr. Ananya Sen");
  const [blogCoverImage, setBlogCoverImage] = useState("");
  const [blogPublished, setBlogPublished] = useState(true);

  // Upload States
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingBlog, setUploadingBlog] = useState(false);
  const heroFileRef = useRef<HTMLInputElement>(null);
  const blogFileRef = useRef<HTMLInputElement>(null);

  const fetchSiteContent = async () => {
    try {
      const res = await fetch("/api/admin/cms?revisions=true");
      if (res.ok) {
        const data = await res.json();
        setSiteContent(data.content);
        setRevisions(data.revisions || []);
      }
    } finally {
      setContentLoading(false);
    }
  };

  const fetchBlogs = async () => {
    try {
      const res = await fetch("/api/admin/blogs");
      if (res.ok) {
        const data = await res.json();
        setBlogs(data.blogs || []);
      }
    } finally {
      setBlogsLoading(false);
    }
  };

  useEffect(() => {
    fetchSiteContent();
    fetchBlogs();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleSaveSiteContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteContent) return;
    setSavingContent(true);

    try {
      const res = await fetch("/api/admin/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(siteContent),
      });
      if (res.ok) {
        showToast("Homepage and contact settings published to live website!");
        await fetchSiteContent();
      } else {
        alert("Error saving site content");
      }
    } catch {
      alert("Network error saving site content");
    } finally {
      setSavingContent(false);
    }
  };

  const handleRollback = async (revisionId: string) => {
    if (!confirm("Are you sure you want to rollback to this snapshot? Current content will be backed up as a new revision.")) {
      return;
    }
    try {
      setRollingBack(true);
      const res = await fetch("/api/admin/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rollback", revisionId }),
      });
      if (res.ok) {
        showToast("Content successfully rolled back to selected snapshot!");
        await fetchSiteContent();
      } else {
        alert("Failed to rollback revision.");
      }
    } catch {
      alert("Network error during rollback.");
    } finally {
      setRollingBack(false);
    }
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !siteContent) return;

    setUploadingHero(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setSiteContent({ ...siteContent, heroImageUrl: data.url });
        showToast("Hero image uploaded and updated!");
      } else {
        alert(data.error || "Upload failed");
      }
    } catch {
      alert("Network error uploading hero image");
    } finally {
      setUploadingHero(false);
    }
  };

  const handleBlogImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBlog(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setBlogCoverImage(data.url);
        showToast("Blog cover uploaded!");
      } else {
        alert(data.error || "Upload failed");
      }
    } catch {
      alert("Network error uploading image");
    } finally {
      setUploadingBlog(false);
    }
  };

  const handleOpenNewBlog = () => {
    setEditingPost(null);
    setBlogTitle("");
    setBlogSlug("");
    setBlogCategory("Ocular Wellness");
    setBlogExcerpt("");
    setBlogContent("");
    setBlogAuthor("Dr. Ananya Sen");
    setBlogCoverImage("https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80");
    setBlogPublished(true);
    setBlogModalOpen(true);
  };

  const handleOpenEditBlog = (post: BlogPost) => {
    setEditingPost(post);
    setBlogTitle(post.title);
    setBlogSlug(post.slug);
    setBlogCategory(post.category);
    setBlogExcerpt(post.excerpt);
    setBlogContent(post.content);
    setBlogAuthor(post.authorName);
    setBlogCoverImage(post.coverImage);
    setBlogPublished(post.isPublished);
    setBlogModalOpen(true);
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTitle.trim()) {
      alert("Article title is required.");
      return;
    }

    const payload = {
      ...(editingPost ? { id: editingPost.id } : {}),
      title: blogTitle.trim(),
      slug: blogSlug.trim() || blogTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      category: blogCategory,
      excerpt: blogExcerpt.trim(),
      content: blogContent.trim(),
      authorName: blogAuthor.trim(),
      coverImage: blogCoverImage,
      isPublished: blogPublished,
    };

    try {
      const res = await fetch("/api/admin/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        showToast("Article saved and published to live website!");
        setBlogModalOpen(false);
        fetchBlogs();
      } else {
        alert("Failed to save article.");
      }
    } catch {
      alert("Network error saving article.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-plum text-white px-5 py-3 rounded-2xl shadow-elevated text-xs flex items-center gap-2 border border-gold/40">
          <CheckCircle2 className="w-4 h-4 text-gold" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header with Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ink-border">
        <div>
          <span className="text-xs uppercase font-sans tracking-wider text-gold-dark font-semibold">
            Content & Editorial
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-ink font-normal">
            Website Content & Journal CMS
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Publish headlines, stories, and educational articles without editing code or redeploying.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-ink-border">
          <button
            type="button"
            onClick={() => setActiveTab("homepage")}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === "homepage" ? "bg-plum text-white font-semibold" : "text-ink hover:text-plum"
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>Homepage & Settings</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("blogs")}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === "blogs" ? "bg-plum text-white font-semibold" : "text-ink hover:text-plum"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Journal Articles ({blogs.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("revisions")}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === "revisions" ? "bg-plum text-white font-semibold" : "text-ink hover:text-plum"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Revisions & Rollback ({revisions.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Homepage & Settings Editor */}
      {activeTab === "homepage" && (
        <div className="space-y-6">
          {contentLoading || !siteContent ? (
            <div className="p-12 text-center text-xs text-ink-muted">Loading content schema...</div>
          ) : (
            <form onSubmit={handleSaveSiteContent} className="space-y-6">
              {/* Hero Section Card */}
              <div className="bg-white p-6 rounded-2xl border border-ink-border shadow-subtle space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="font-serif text-base font-medium text-ink">
                    Homepage Hero Section
                  </h3>
                  <Badge variant="plum" className="text-[10px]">
                    Above the Fold
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  <div className="md:col-span-5 space-y-2">
                    <label className="block text-xs font-semibold text-ink uppercase tracking-wide">
                      Hero Photographic Art
                    </label>
                    <div className="relative rounded-2xl overflow-hidden border border-ink-border bg-canvas-dark h-52">
                      <img
                        src={siteContent.heroImageUrl}
                        alt="Hero Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        ref={heroFileRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleHeroImageUpload}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingHero}
                        onClick={() => heroFileRef.current?.click()}
                        className="w-full text-xs gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingHero ? "Uploading..." : "Upload New Hero Photo"}</span>
                      </Button>
                    </div>
                  </div>

                  <div className="md:col-span-7 space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-ink mb-1">
                        Hero Editorial Headline
                      </label>
                      <input
                        type="text"
                        value={siteContent.heroHeadline}
                        onChange={(e) =>
                          setSiteContent({ ...siteContent, heroHeadline: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink text-xs focus:outline-none focus:ring-1 focus:ring-plum font-serif text-base"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-ink mb-1">
                        Hero Philosophical Subtitle
                      </label>
                      <textarea
                        rows={3}
                        value={siteContent.heroSubtitle}
                        onChange={(e) =>
                          setSiteContent({ ...siteContent, heroSubtitle: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink text-xs focus:outline-none focus:ring-1 focus:ring-plum leading-relaxed"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-ink mb-1">
                          Primary CTA Button Label
                        </label>
                        <input
                          type="text"
                          value={siteContent.heroCtaLabel}
                          onChange={(e) =>
                            setSiteContent({ ...siteContent, heroCtaLabel: e.target.value })
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-ink-border bg-canvas-light text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-ink mb-1">
                          Secondary CTA Label
                        </label>
                        <input
                          type="text"
                          value={siteContent.heroSecondaryCtaLabel}
                          onChange={(e) =>
                            setSiteContent({ ...siteContent, heroSecondaryCtaLabel: e.target.value })
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-ink-border bg-canvas-light text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Centre & Contact Information Card */}
              <div className="bg-white p-6 rounded-2xl border border-ink-border shadow-subtle space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="font-serif text-base font-medium text-ink">
                    Auroville Centre & Contact Details
                  </h3>
                  <Badge variant="sage" className="text-[10px]">
                    Site Footer & Contact Page
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1">
                      Primary Contact Phone (Auroville)
                    </label>
                    <input
                      type="text"
                      value={siteContent.contactPhone}
                      onChange={(e) =>
                        setSiteContent({ ...siteContent, contactPhone: e.target.value })
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-ink-border bg-canvas-light text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1">
                      Secondary Inquiry Phone
                    </label>
                    <input
                      type="text"
                      value={siteContent.contactPhoneSecondary}
                      onChange={(e) =>
                        setSiteContent({ ...siteContent, contactPhoneSecondary: e.target.value })
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-ink-border bg-canvas-light text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1">
                      Direct WhatsApp Number
                    </label>
                    <input
                      type="text"
                      value={siteContent.contactWhatsApp}
                      onChange={(e) =>
                        setSiteContent({ ...siteContent, contactWhatsApp: e.target.value })
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-ink-border bg-canvas-light text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1">
                      Public Inquiries Email
                    </label>
                    <input
                      type="email"
                      value={siteContent.contactEmail}
                      onChange={(e) =>
                        setSiteContent({ ...siteContent, contactEmail: e.target.value })
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-ink-border bg-canvas-light text-xs"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-ink mb-1">
                      Physical Location & Sanctuary Address
                    </label>
                    <input
                      type="text"
                      value={siteContent.physicalAddress}
                      onChange={(e) =>
                        setSiteContent({ ...siteContent, physicalAddress: e.target.value })
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-ink-border bg-canvas-light text-xs"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-ink mb-1">
                      Consulting & Practice Hours
                    </label>
                    <input
                      type="text"
                      value={siteContent.openingHours}
                      onChange={(e) =>
                        setSiteContent({ ...siteContent, openingHours: e.target.value })
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-ink-border bg-canvas-light text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button Bar */}
              <div className="flex justify-end pt-2">
                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  disabled={savingContent}
                  className="gap-2 text-xs font-semibold px-6 shadow-subtle"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingContent ? "Publishing Updates..." : "Publish Website Content"}</span>
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* TAB 2: Blogs Listing & Editor */}
      {activeTab === "blogs" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink-muted">
              {blogs.length} published journal articles visible to visitors
            </span>
            <Button variant="primary" size="sm" onClick={handleOpenNewBlog} className="text-xs gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Article</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-2xl border border-ink-border shadow-subtle p-5 flex flex-col justify-between hover:shadow-card transition-all space-y-4"
              >
                <div>
                  <div className="aspect-[16/9] rounded-xl overflow-hidden bg-canvas-dark mb-3">
                    <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex items-center justify-between mb-1.5">
                    <Badge variant="sage" className="text-[10px]">
                      {post.category}
                    </Badge>
                    <span className="text-[11px] text-ink-muted font-mono">{post.publishedDate}</span>
                  </div>

                  <h3 className="font-serif text-base font-medium text-ink mb-1 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-3 border-t border-ink-border/50 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-ink-muted">By {post.authorName}</span>
                  <Button variant="outline" size="sm" onClick={() => handleOpenEditBlog(post)} className="text-xs gap-1">
                    <Edit2 className="w-3 h-3 text-plum" />
                    <span>Edit</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Revisions & Rollback History */}
      {activeTab === "revisions" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-ink-border shadow-subtle space-y-4">
            <div>
              <h2 className="font-serif text-lg font-medium text-ink">
                CMS Version Snapshots & Rollback History
              </h2>
              <p className="text-xs text-ink-muted mt-0.5">
                Each publish automatically snapshots the previous site configuration. Restore any historical version safely.
              </p>
            </div>

            {revisions.length === 0 ? (
              <div className="p-12 text-center text-xs text-ink-muted border border-dashed rounded-xl">
                <History className="w-8 h-8 text-ink-muted/40 mx-auto mb-2" />
                No previous snapshots recorded yet. When you modify and save Homepage or Settings, historical snapshots appear here.
              </div>
            ) : (
              <div className="space-y-3">
                {revisions.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-xl border border-ink-border bg-canvas-light/40 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-plum/30 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-plum">
                          {rev.title}
                        </span>
                        <span className="text-[10px] bg-plum-muted/60 text-plum px-1.5 py-0.2 rounded font-mono">
                          {rev.sectionKey}
                        </span>
                      </div>
                      <div className="text-[11px] text-ink-muted flex items-center gap-2">
                        <span>Authored by {rev.authorStaffName}</span>
                        <span>•</span>
                        <span>
                          {new Date(rev.createdAt).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                      {rev.snapshotJson?.heroHeadline && (
                        <div className="text-xs text-ink italic mt-1">
                          Headline: &ldquo;{rev.snapshotJson.heroHeadline}&rdquo;
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={rollingBack}
                      onClick={() => handleRollback(rev.id)}
                      className="px-3.5 py-1.5 bg-white border border-ink-border hover:border-plum text-plum rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-plum-muted/30 transition-colors self-start md:self-auto disabled:opacity-50"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{rollingBack ? "Restoring..." : "Restore This Snapshot"}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Blog Create / Edit Modal */}
      {blogModalOpen && (
        <Dialog
          open={blogModalOpen}
          onClose={() => setBlogModalOpen(false)}
          title={editingPost ? `Edit: ${editingPost.title}` : "New Journal Article"}
          description="Draft and publish eye wellness insights"
          maxWidth="lg"
        >
          <form onSubmit={handleSaveBlog} className="space-y-4 text-xs">
            <div className="flex items-center gap-4">
              <div className="w-24 h-20 rounded-xl overflow-hidden bg-canvas-dark border shrink-0">
                <img src={blogCoverImage} alt="Cover" className="w-full h-full object-cover" />
              </div>
              <div>
                <input
                  ref={blogFileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleBlogImageUpload}
                />
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  disabled={uploadingBlog}
                  onClick={() => blogFileRef.current?.click()}
                  className="text-xs gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingBlog ? "Uploading..." : "Upload Cover Image"}</span>
                </Button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-ink mb-1">Article Title *</label>
              <input
                type="text"
                required
                value={blogTitle}
                onChange={(e) => {
                  setBlogTitle(e.target.value);
                  if (!editingPost) {
                    setBlogSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                  }
                }}
                className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink text-xs focus:ring-1 focus:ring-plum"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-ink mb-1">Category</label>
                <select
                  value={blogCategory}
                  onChange={(e) => setBlogCategory(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-ink-border bg-canvas-light text-xs"
                >
                  <option value="Ocular Wellness">Ocular Wellness</option>
                  <option value="Eye Yoga & Practices">Eye Yoga & Practices</option>
                  <option value="Holistic Nutrition">Holistic Nutrition</option>
                  <option value="Screen Recovery">Screen Recovery</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">Author Name</label>
                <input
                  type="text"
                  value={blogAuthor}
                  onChange={(e) => setBlogAuthor(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-ink-border bg-canvas-light text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-ink mb-1">Short Excerpt *</label>
              <textarea
                rows={2}
                required
                value={blogExcerpt}
                onChange={(e) => setBlogExcerpt(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-ink mb-1">Full Article Body *</label>
              <textarea
                rows={6}
                required
                value={blogContent}
                onChange={(e) => setBlogContent(e.target.value)}
                placeholder="Use paragraphs or ### Headings for rich layout..."
                className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-xs font-mono"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="blogPublishCheck"
                checked={blogPublished}
                onChange={(e) => setBlogPublished(e.target.checked)}
                className="rounded text-plum focus:ring-plum"
              />
              <label htmlFor="blogPublishCheck" className="text-xs font-medium text-ink cursor-pointer">
                Publish immediately to public website
              </label>
            </div>

            <div className="pt-4 border-t border-ink-border flex justify-end gap-3">
              <Button variant="outline" size="sm" type="button" onClick={() => setBlogModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Save & Synchronize Article
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}
