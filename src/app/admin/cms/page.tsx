"use client";

import React, { useState, useEffect, useRef } from "react";
import { BlogPost, HeroCarouselSlide, SiteContent } from "@/lib/types";
import { DEFAULT_HERO_CAROUSEL_SLIDES } from "@/lib/demo-data";
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
  Copy,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  Phone,
  Mail,
  MapPin,
  Clock,
  Compass,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { HeroCarousel } from "@/components/public/hero-carousel";

export default function AdminCmsPage() {
  const [activeTab, setActiveTab] = useState<
    "homepage" | "about" | "contact" | "blogs" | "revisions"
  >("homepage");

  // Site Content State
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null);
  const [revisions, setRevisions] = useState<CmsRevision[]>([]);
  const [contentLoading, setContentLoading] = useState(true);
  const [savingContent, setSavingContent] = useState(false);
  const [rollingBack, setRollingBack] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Slide Management State
  const [slideModalOpen, setSlideModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroCarouselSlide | null>(null);
  const [slideDeleteConfirmOpen, setSlideDeleteConfirmOpen] = useState(false);
  const [slideToDelete, setSlideToDelete] = useState<HeroCarouselSlide | null>(null);
  const [uploadingSlideImage, setUploadingSlideImage] = useState(false);
  const slideFileInputRef = useRef<HTMLInputElement>(null);

  // Slide Form Fields
  const [slideTitle, setSlideTitle] = useState("");
  const [slideBadge, setSlideBadge] = useState("");
  const [slideSubtitle, setSlideSubtitle] = useState("");
  const [slideImageUrl, setSlideImageUrl] = useState("");
  const [slideLinkUrl, setSlideLinkUrl] = useState("/therapies");
  const [slideLinkText, setSlideLinkText] = useState("Explore Therapy");
  const [slideOrder, setSlideOrder] = useState(1);
  const [slideActive, setSlideActive] = useState(true);

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
  const [uploadingBlog, setUploadingBlog] = useState(false);
  const blogFileRef = useRef<HTMLInputElement>(null);

  const fetchSiteContent = async () => {
    try {
      const res = await fetch("/api/admin/cms?revisions=true");
      if (res.ok) {
        const data = await res.json();
        const content = data.content;
        // Ensure slides array is initialized
        if (!content.heroCarouselSlides || content.heroCarouselSlides.length === 0) {
          content.heroCarouselSlides = DEFAULT_HERO_CAROUSEL_SLIDES;
        }
        setSiteContent(content);
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

  // ==================== SAVE / PUBLISH ====================

  const handleSaveSiteContent = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!siteContent) return;
    setSavingContent(true);

    try {
      const res = await fetch("/api/admin/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(siteContent),
      });
      if (res.ok) {
        showToast("Homepage and CMS settings published to live website!");
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

  // ==================== CAROUSEL SLIDE ACTIONS ====================

  const currentSlides: HeroCarouselSlide[] =
    siteContent?.heroCarouselSlides && siteContent.heroCarouselSlides.length > 0
      ? siteContent.heroCarouselSlides
      : DEFAULT_HERO_CAROUSEL_SLIDES;

  const handleOpenAddSlide = () => {
    setEditingSlide(null);
    setSlideTitle("");
    setSlideBadge("Clinical Therapy");
    setSlideSubtitle("");
    setSlideImageUrl("/images/hero-carousel/vision-therapy.webp");
    setSlideLinkUrl("/therapies");
    setSlideLinkText("Explore Therapy");
    setSlideOrder(currentSlides.length + 1);
    setSlideActive(true);
    setSlideModalOpen(true);
  };

  const handleOpenEditSlide = (slide: HeroCarouselSlide) => {
    setEditingSlide(slide);
    setSlideTitle(slide.title);
    setSlideBadge(slide.badge);
    setSlideSubtitle(slide.subtitle);
    setSlideImageUrl(slide.imageUrl);
    setSlideLinkUrl(slide.linkUrl);
    setSlideLinkText(slide.linkText);
    setSlideOrder(slide.order);
    setSlideActive(slide.active);
    setSlideModalOpen(true);
  };

  const handleDuplicateSlide = (slide: HeroCarouselSlide) => {
    if (!siteContent) return;
    const newSlide: HeroCarouselSlide = {
      ...slide,
      id: `slide-${Date.now()}`,
      title: `${slide.title} (Copy)`,
      order: currentSlides.length + 1,
    };
    const updated = [...currentSlides, newSlide];
    setSiteContent({ ...siteContent, heroCarouselSlides: updated });
    showToast(`Duplicated slide "${slide.title}". Click Publish to save.`);
  };

  const handleToggleSlideActive = (slideId: string) => {
    if (!siteContent) return;
    const updated = currentSlides.map((s) =>
      s.id === slideId ? { ...s, active: !s.active } : s
    );
    setSiteContent({ ...siteContent, heroCarouselSlides: updated });
  };

  const handleMoveSlide = (index: number, direction: "up" | "down") => {
    if (!siteContent) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentSlides.length) return;

    const list = [...currentSlides];
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    // Reassign order indices
    const updated = list.map((item, i) => ({ ...item, order: i + 1 }));
    setSiteContent({ ...siteContent, heroCarouselSlides: updated });
  };

  const handleConfirmDeleteSlide = () => {
    if (!slideToDelete || !siteContent) return;
    const updated = currentSlides.filter((s) => s.id !== slideToDelete.id);
    setSiteContent({ ...siteContent, heroCarouselSlides: updated });
    setSlideDeleteConfirmOpen(false);
    setSlideToDelete(null);
    showToast(`Slide "${slideToDelete.title}" removed. Click Publish to persist.`);
  };

  const handleSaveSlideForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteContent) return;
    if (!slideTitle.trim() || !slideImageUrl.trim()) {
      alert("Slide Title and Image URL are required.");
      return;
    }

    let updated: HeroCarouselSlide[];
    if (editingSlide) {
      updated = currentSlides.map((s) =>
        s.id === editingSlide.id
          ? {
              ...s,
              title: slideTitle.trim(),
              badge: slideBadge.trim(),
              subtitle: slideSubtitle.trim(),
              imageUrl: slideImageUrl.trim(),
              linkUrl: slideLinkUrl.trim(),
              linkText: slideLinkText.trim(),
              order: slideOrder,
              active: slideActive,
            }
          : s
      );
    } else {
      const newSlide: HeroCarouselSlide = {
        id: `slide-${Date.now()}`,
        title: slideTitle.trim(),
        badge: slideBadge.trim(),
        subtitle: slideSubtitle.trim(),
        imageUrl: slideImageUrl.trim(),
        linkUrl: slideLinkUrl.trim(),
        linkText: slideLinkText.trim(),
        order: slideOrder,
        active: slideActive,
      };
      updated = [...currentSlides, newSlide];
    }

    setSiteContent({ ...siteContent, heroCarouselSlides: updated });
    setSlideModalOpen(false);
    showToast("Slide updated! Remember to click Publish to make changes live.");
  };

  const handleSlideImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSlideImage(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setSlideImageUrl(data.url);
        showToast("Carousel slide image uploaded successfully!");
      } else {
        alert(data.error || "Upload failed");
      }
    } catch {
      alert("Network error uploading image");
    } finally {
      setUploadingSlideImage(false);
    }
  };

  // ==================== BLOG ACTIONS ====================

  const handleOpenNewBlog = () => {
    setEditingPost(null);
    setBlogTitle("");
    setBlogSlug("");
    setBlogCategory("Ocular Wellness");
    setBlogExcerpt("");
    setBlogContent("");
    setBlogAuthor("Dr. Ananya Sen");
    setBlogCoverImage("https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80");
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
        showToast("Blog cover image uploaded!");
      } else {
        alert(data.error || "Upload failed");
      }
    } catch {
      alert("Network error uploading blog cover image");
    } finally {
      setUploadingBlog(false);
    }
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
        showToast("Article saved successfully!");
        setBlogModalOpen(false);
        fetchBlogs();
      } else {
        alert("Failed to save article");
      }
    } catch {
      alert("Network error saving article");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-brand-purple text-white px-5 py-3 rounded-2xl shadow-elevated text-xs flex items-center gap-2 border border-brand-orange/40">
          <CheckCircle2 className="w-4 h-4 text-brand-orange" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ink-border">
        <div>
          <span className="text-xs uppercase font-sans tracking-wider text-brand-purple font-semibold">
            Content Management System
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-ink font-normal">
            Website Editor & Content Suite
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Manage the hero carousel, headlines, therapeutic philosophies, contact details, and journal articles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open("/", "_blank")}
            className="text-xs gap-1.5 border-ink-border"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Site</span>
          </Button>

          {activeTab !== "blogs" && activeTab !== "revisions" && (
            <Button
              variant="primary"
              size="md"
              disabled={savingContent}
              onClick={() => handleSaveSiteContent()}
              className="gap-2 text-xs font-semibold bg-brand-orange hover:bg-brand-orangeHover text-white shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{savingContent ? "Publishing..." : "Publish Live Changes"}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-ink-border overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("homepage")}
          className={`px-4 py-2 text-xs font-sora font-semibold rounded-t-xl transition-all whitespace-nowrap ${
            activeTab === "homepage"
              ? "bg-white text-brand-purple border-t border-l border-r border-ink-border shadow-sm"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          Homepage & Hero Carousel
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("about")}
          className={`px-4 py-2 text-xs font-sora font-semibold rounded-t-xl transition-all whitespace-nowrap ${
            activeTab === "about"
              ? "bg-white text-brand-purple border-t border-l border-r border-ink-border shadow-sm"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          About Sanctuary
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("contact")}
          className={`px-4 py-2 text-xs font-sora font-semibold rounded-t-xl transition-all whitespace-nowrap ${
            activeTab === "contact"
              ? "bg-white text-brand-purple border-t border-l border-r border-ink-border shadow-sm"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          Contact & Location
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("blogs")}
          className={`px-4 py-2 text-xs font-sora font-semibold rounded-t-xl transition-all whitespace-nowrap ${
            activeTab === "blogs"
              ? "bg-white text-brand-purple border-t border-l border-r border-ink-border shadow-sm"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          Journal & Articles ({blogs.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("revisions")}
          className={`px-4 py-2 text-xs font-sora font-semibold rounded-t-xl transition-all whitespace-nowrap ${
            activeTab === "revisions"
              ? "bg-white text-brand-purple border-t border-l border-r border-ink-border shadow-sm"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          Revisions & Rollback ({revisions.length})
        </button>
      </div>

      {/* TAB 1: HOMEPAGE & HERO CAROUSEL */}
      {activeTab === "homepage" && (
        <div className="space-y-8">
          {contentLoading || !siteContent ? (
            <div className="p-12 text-center text-xs text-ink-muted">Loading content schema...</div>
          ) : (
            <div className="space-y-8">
              {/* SECTION A: HERO CAROUSEL MANAGER */}
              <div className="bg-white p-6 rounded-2xl border border-ink-border shadow-subtle space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-lg font-medium text-ink">
                        Hero Carousel Manager (Photographic Stories)
                      </h3>
                      <Badge variant="plum" className="text-[10px]">
                        Instagram Stories Style
                      </Badge>
                    </div>
                    <p className="text-xs text-ink-muted mt-1">
                      Manage the 4:5 therapy cards displayed above the fold. Slides auto-rotate every 5.5s with segmented progress bars.
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleOpenAddSlide}
                    className="gap-1.5 text-xs font-semibold bg-brand-orange hover:bg-brand-orangeHover text-white shadow-sm shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Carousel Slide</span>
                  </Button>
                </div>

                {/* Slides Grid & Live Preview Split */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left: Editable Slide Cards List (7 Cols) */}
                  <div className="lg:col-span-7 space-y-4">
                    <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider block">
                      Active Slides ({currentSlides.filter((s) => s.active).length} of {currentSlides.length} enabled)
                    </span>

                    <div className="space-y-3">
                      {currentSlides.map((slide, idx) => (
                        <div
                          key={slide.id}
                          className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                            slide.active
                              ? "bg-white border-ink-border shadow-subtle hover:shadow-card"
                              : "bg-canvas-light/60 border-ink-border/50 opacity-60"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {/* Slide Thumbnail */}
                            <div className="w-16 h-20 rounded-xl overflow-hidden bg-brand-charcoal border border-ink-border shrink-0 relative">
                              <img
                                src={slide.imageUrl}
                                alt={slide.title}
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-xs text-[9px] font-mono font-bold text-white px-1 rounded">
                                #{idx + 1}
                              </span>
                            </div>

                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-brand-lavender text-brand-purple text-[10px] font-bold">
                                  {slide.badge}
                                </span>
                                {!slide.active && (
                                  <Badge variant="warning" className="text-[9px]">
                                    Disabled
                                  </Badge>
                                )}
                              </div>
                              <h4 className="font-sora font-bold text-sm text-ink truncate">
                                {slide.title}
                              </h4>
                              <p className="text-[11px] text-ink-muted line-clamp-1">
                                {slide.subtitle}
                              </p>
                              <span className="text-[10px] font-mono text-brand-purple block truncate">
                                {slide.linkText} → {slide.linkUrl}
                              </span>
                            </div>
                          </div>

                          {/* Slide Actions */}
                          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                            {/* Reorder Buttons */}
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveSlide(idx, "up")}
                              title="Move Slide Up"
                              className="p-1.5 rounded-lg border border-ink-border hover:bg-canvas-light disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ArrowUp className="w-3.5 h-3.5 text-ink" />
                            </button>

                            <button
                              type="button"
                              disabled={idx === currentSlides.length - 1}
                              onClick={() => handleMoveSlide(idx, "down")}
                              title="Move Slide Down"
                              className="p-1.5 rounded-lg border border-ink-border hover:bg-canvas-light disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ArrowDown className="w-3.5 h-3.5 text-ink" />
                            </button>

                            {/* Active Toggle */}
                            <button
                              type="button"
                              onClick={() => handleToggleSlideActive(slide.id)}
                              title={slide.active ? "Disable Slide" : "Enable Slide"}
                              className={`p-1.5 rounded-lg border ${
                                slide.active
                                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                                  : "border-ink-border bg-canvas-light text-ink-muted"
                              }`}
                            >
                              {slide.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            </button>

                            {/* Duplicate */}
                            <button
                              type="button"
                              onClick={() => handleDuplicateSlide(slide)}
                              title="Duplicate Slide"
                              className="p-1.5 rounded-lg border border-ink-border hover:bg-canvas-light text-ink"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenEditSlide(slide)}
                              className="text-xs gap-1 border-ink-border hover:bg-canvas-light px-2.5"
                            >
                              <Edit2 className="w-3 h-3 text-brand-purple" />
                              <span>Edit</span>
                            </Button>

                            {/* Remove */}
                            <button
                              type="button"
                              onClick={() => {
                                setSlideToDelete(slide);
                                setSlideDeleteConfirmOpen(true);
                              }}
                              title="Remove Slide"
                              className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Live Interactive Preview (5 Cols) */}
                  <div className="lg:col-span-5 space-y-2">
                    <div className="flex items-center justify-between pb-1">
                      <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider block">
                        Live Carousel Preview (As Rendered)
                      </span>
                      <span className="text-[10px] text-brand-purple font-medium">Interactive</span>
                    </div>

                    <div className="p-3 rounded-3xl bg-canvas-dark border border-ink-border/50 shadow-inner">
                      <HeroCarousel slides={currentSlides} />
                    </div>
                    <p className="text-[11px] text-ink-muted text-center pt-1">
                      Hover to pause • Top progress indicators match Instagram Stories
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION B: HOMEPAGE HEADLINES & CTAS */}
              <div className="bg-white p-6 rounded-2xl border border-ink-border shadow-subtle space-y-6">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h3 className="font-serif text-lg font-medium text-ink">
                      Hero Editorial Typography & Call-To-Action
                    </h3>
                    <p className="text-xs text-ink-muted">
                      Text content displayed on the left column beside the photographic carousel.
                    </p>
                  </div>
                  <Badge variant="plum" className="text-[10px]">
                    Live Synced
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Headline */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-ink">
                      Hero Editorial Headline *
                    </label>
                    <input
                      type="text"
                      required
                      value={siteContent.heroHeadline}
                      onChange={(e) =>
                        setSiteContent({ ...siteContent, heroHeadline: e.target.value })
                      }
                      placeholder="e.g. See Better. Live Brighter."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-canvas-light text-ink text-sm font-serif focus:ring-1 focus:ring-brand-purple"
                    />
                    <p className="text-[11px] text-ink-muted">
                      Periods or line breaks automatically highlight the concluding phrase with the brand gradient.
                    </p>
                  </div>

                  {/* Subtitle */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-ink">
                      Hero Philosophical Subtitle *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={siteContent.heroSubtitle}
                      onChange={(e) =>
                        setSiteContent({ ...siteContent, heroSubtitle: e.target.value })
                      }
                      placeholder="Experience personalized vision therapy, eye yoga, and wellness programmes..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-canvas-light text-ink text-xs focus:ring-1 focus:ring-brand-purple leading-relaxed"
                    />
                  </div>

                  {/* Primary CTA */}
                  <div className="p-4 rounded-xl bg-canvas-light border border-ink-border/60 space-y-3">
                    <span className="font-sora font-bold text-xs text-brand-orange block uppercase tracking-wider">
                      Primary Action Button (Orange Glow)
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-ink mb-1">
                          Button Text
                        </label>
                        <input
                          type="text"
                          value={siteContent.heroCtaLabel || siteContent.primaryCtaText}
                          onChange={(e) =>
                            setSiteContent({
                              ...siteContent,
                              heroCtaLabel: e.target.value,
                              primaryCtaText: e.target.value,
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-ink-border bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-ink mb-1">
                          Destination URL
                        </label>
                        <input
                          type="text"
                          value={siteContent.primaryCtaLink || "/book"}
                          onChange={(e) =>
                            setSiteContent({ ...siteContent, primaryCtaLink: e.target.value })
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-ink-border bg-white text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Secondary CTA */}
                  <div className="p-4 rounded-xl bg-canvas-light border border-ink-border/60 space-y-3">
                    <span className="font-sora font-bold text-xs text-brand-purple block uppercase tracking-wider">
                      Secondary Action Button (Outline)
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-ink mb-1">
                          Button Text
                        </label>
                        <input
                          type="text"
                          value={siteContent.heroSecondaryCtaLabel || "Explore Therapies"}
                          onChange={(e) =>
                            setSiteContent({
                              ...siteContent,
                              heroSecondaryCtaLabel: e.target.value,
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-ink-border bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-ink mb-1">
                          Destination URL
                        </label>
                        <input
                          type="text"
                          value={siteContent.secondaryCtaLink || "/therapies"}
                          onChange={(e) =>
                            setSiteContent({ ...siteContent, secondaryCtaLink: e.target.value })
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-ink-border bg-white text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-ink-border/50">
                  <Button
                    variant="primary"
                    size="md"
                    disabled={savingContent}
                    onClick={() => handleSaveSiteContent()}
                    className="gap-2 text-xs font-semibold bg-brand-orange hover:bg-brand-orangeHover text-white shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingContent ? "Publishing Updates..." : "Publish Website Content"}</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ABOUT SANCTUARY */}
      {activeTab === "about" && siteContent && (
        <div className="bg-white p-6 rounded-2xl border border-ink-border shadow-subtle space-y-6">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-serif text-lg font-medium text-ink">
                About Page & Sanctuary Narrative
              </h3>
              <p className="text-xs text-ink-muted">
                Core philosophy, founding vision, and integral eye care mission in Pondicherry.
              </p>
            </div>
            <Badge variant="sage" className="text-[10px]">
              About Page
            </Badge>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-ink mb-1">About Page Main Heading</label>
              <input
                type="text"
                value={siteContent.aboutHeading}
                onChange={(e) => setSiteContent({ ...siteContent, aboutHeading: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-canvas-light text-ink text-sm font-serif"
              />
            </div>

            <div>
              <label className="block font-semibold text-ink mb-1">Philosophical Summary & Mission</label>
              <textarea
                rows={4}
                value={siteContent.aboutSummary}
                onChange={(e) => setSiteContent({ ...siteContent, aboutSummary: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-canvas-light text-ink text-xs leading-relaxed"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-ink-border/50">
            <Button
              variant="primary"
              size="md"
              disabled={savingContent}
              onClick={() => handleSaveSiteContent()}
              className="gap-2 text-xs font-semibold bg-brand-orange hover:bg-brand-orangeHover text-white shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{savingContent ? "Publishing Updates..." : "Publish Website Content"}</span>
            </Button>
          </div>
        </div>
      )}

      {/* TAB 3: CONTACT & LOCATION */}
      {activeTab === "contact" && siteContent && (
        <div className="bg-white p-6 rounded-2xl border border-ink-border shadow-subtle space-y-6">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-serif text-lg font-medium text-ink">
                Pondicherry Centre &amp; Contact Details
              </h3>
              <p className="text-xs text-ink-muted">
                Used in site header, footer, booking receipts, and the Contact page.
              </p>
            </div>
            <Badge variant="sage" className="text-[10px]">
              Global Contact Info
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-ink mb-1">Primary Phone</label>
              <input
                type="text"
                value={siteContent.contactPhone || siteContent.phone}
                onChange={(e) =>
                  setSiteContent({
                    ...siteContent,
                    contactPhone: e.target.value,
                    phone: e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink"
              />
            </div>

            <div>
              <label className="block font-semibold text-ink mb-1">Secondary Phone</label>
              <input
                type="text"
                value={siteContent.contactPhoneSecondary || ""}
                onChange={(e) =>
                  setSiteContent({ ...siteContent, contactPhoneSecondary: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink"
              />
            </div>

            <div>
              <label className="block font-semibold text-ink mb-1">Direct WhatsApp Number</label>
              <input
                type="text"
                value={siteContent.contactWhatsApp || ""}
                onChange={(e) =>
                  setSiteContent({
                    ...siteContent,
                    contactWhatsApp: e.target.value,
                    whatsappLink: `https://wa.me/${e.target.value.replace(/[^0-9]/g, "")}`,
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-ink mb-1">Inquiries Email Address</label>
              <input
                type="email"
                value={siteContent.contactEmail || siteContent.email}
                onChange={(e) =>
                  setSiteContent({
                    ...siteContent,
                    contactEmail: e.target.value,
                    email: e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-ink mb-1">Clinic Physical Address</label>
              <input
                type="text"
                value={siteContent.physicalAddress || siteContent.address}
                onChange={(e) =>
                  setSiteContent({
                    ...siteContent,
                    physicalAddress: e.target.value,
                    address: e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-ink mb-1">Practice & Consultation Hours</label>
              <input
                type="text"
                value={siteContent.openingHours}
                onChange={(e) => setSiteContent({ ...siteContent, openingHours: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-ink-border/50">
            <Button
              variant="primary"
              size="md"
              disabled={savingContent}
              onClick={() => handleSaveSiteContent()}
              className="gap-2 text-xs font-semibold bg-brand-orange hover:bg-brand-orangeHover text-white shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{savingContent ? "Publishing Updates..." : "Publish Website Content"}</span>
            </Button>
          </div>
        </div>
      )}

      {/* TAB 4: BLOGS */}
      {activeTab === "blogs" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink-muted">
              {blogs.length} published journal articles visible to visitors
            </span>
            <Button variant="primary" size="sm" onClick={handleOpenNewBlog} className="text-xs gap-1.5 bg-brand-orange text-white">
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

                <div className="pt-3 border-t border-ink-border/60 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-ink-muted">{post.authorName}</span>
                  <Button variant="outline" size="sm" onClick={() => handleOpenEditBlog(post)} className="text-xs gap-1">
                    <Edit2 className="w-3 h-3 text-brand-purple" />
                    <span>Edit</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: REVISIONS & ROLLBACK */}
      {activeTab === "revisions" && (
        <div className="bg-white p-6 rounded-2xl border border-ink-border shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-serif text-base font-medium text-ink">
                Audit Trail & Snapshot Rollback
              </h3>
              <p className="text-xs text-ink-muted mt-0.5">
                Every publish action creates an immutable version snapshot. Restore any previous state safely.
              </p>
            </div>
            <Badge variant="plum" className="text-[10px]">
              Automated Snapshots
            </Badge>
          </div>

          {revisions.length === 0 ? (
            <p className="text-xs text-ink-muted py-6">No historical revisions recorded yet.</p>
          ) : (
            <div className="divide-y divide-ink-border text-xs">
              {revisions.map((rev) => (
                <div key={rev.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-ink">{rev.title}</span>
                      <span className="font-mono text-[10px] text-ink-muted">
                        {new Date(rev.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {rev.snapshotJson?.heroHeadline && (
                      <p className="text-[11px] text-ink-muted italic">
                        &ldquo;{rev.snapshotJson.heroHeadline}&rdquo;
                      </p>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={rollingBack}
                    onClick={() => handleRollback(rev.id)}
                    className="text-xs gap-1 border-brand-purple/30 text-brand-purple hover:bg-brand-lavender/50"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Restore Snapshot</span>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SLIDE EDIT / CREATE MODAL */}
      {slideModalOpen && (
        <Dialog
          open={slideModalOpen}
          onClose={() => setSlideModalOpen(false)}
          title={editingSlide ? `Edit Slide: ${editingSlide.title}` : "Add New Hero Carousel Slide"}
          description="Configure photo, badges, title, description, and link destination."
          maxWidth="lg"
        >
          <form onSubmit={handleSaveSlideForm} className="space-y-4 text-xs">
            {/* Image Preview & Upload */}
            <div className="flex items-start gap-4">
              <div className="w-24 h-32 rounded-2xl overflow-hidden bg-brand-charcoal border-2 border-brand-purple/20 shrink-0 relative">
                {slideImageUrl ? (
                  <img src={slideImageUrl} alt="Slide Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-ink-muted m-auto" />
                )}
              </div>

              <div className="flex-1 space-y-2">
                <label className="block font-semibold text-ink">Slide Photography (4:5 Aspect Ratio) *</label>
                <div className="flex items-center gap-2">
                  <input
                    ref={slideFileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleSlideImageUpload}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploadingSlideImage}
                    onClick={() => slideFileInputRef.current?.click()}
                    className="text-xs gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingSlideImage ? "Uploading..." : "Upload New Photo"}</span>
                  </Button>
                </div>
                <input
                  type="text"
                  required
                  value={slideImageUrl}
                  onChange={(e) => setSlideImageUrl(e.target.value)}
                  placeholder="Or enter image URL (e.g. /images/hero-carousel/vision-therapy.webp)"
                  className="w-full px-3 py-1.5 rounded-lg border border-ink-border bg-canvas-light text-ink text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-ink mb-1">Therapy Title *</label>
                <input
                  type="text"
                  required
                  value={slideTitle}
                  onChange={(e) => setSlideTitle(e.target.value)}
                  placeholder="e.g. Vision Therapy"
                  className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink focus:ring-1 focus:ring-brand-purple"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">Category Badge Label *</label>
                <input
                  type="text"
                  required
                  value={slideBadge}
                  onChange={(e) => setSlideBadge(e.target.value)}
                  placeholder="e.g. Clinical Therapy, Athletic Performance"
                  className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink focus:ring-1 focus:ring-brand-purple"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-ink mb-1">Slide Philosophical Subtitle *</label>
              <textarea
                rows={2}
                required
                value={slideSubtitle}
                onChange={(e) => setSlideSubtitle(e.target.value)}
                placeholder="Customized neuro-visual retraining for amblyopia and convergence..."
                className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink focus:ring-1 focus:ring-brand-purple leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-ink mb-1">Action Button Text</label>
                <input
                  type="text"
                  value={slideLinkText}
                  onChange={(e) => setSlideLinkText(e.target.value)}
                  placeholder="e.g. Explore Vision Therapy"
                  className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">Action Destination URL</label>
                <input
                  type="text"
                  value={slideLinkUrl}
                  onChange={(e) => setSlideLinkUrl(e.target.value)}
                  placeholder="e.g. /therapies"
                  className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-ink-border/50">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={slideActive}
                  onChange={(e) => setSlideActive(e.target.checked)}
                  className="rounded text-brand-purple focus:ring-brand-purple"
                />
                <span className="font-semibold text-ink">Active (visible in public rotation)</span>
              </label>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setSlideModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" className="bg-brand-orange text-white">
                  Save Slide
                </Button>
              </div>
            </div>
          </form>
        </Dialog>
      )}

      {/* SLIDE REMOVE CONFIRMATION MODAL */}
      {slideToDelete && (
        <ConfirmModal
          open={slideDeleteConfirmOpen}
          onClose={() => {
            setSlideDeleteConfirmOpen(false);
            setSlideToDelete(null);
          }}
          onConfirm={handleConfirmDeleteSlide}
          title={`Remove Slide: "${slideToDelete.title}"?`}
          variant="danger"
          confirmText="Remove Slide"
          description={
            <div className="space-y-1">
              <p>This slide will no longer appear on the public homepage hero carousel.</p>
              <p className="text-ink-muted text-[11px]">
                The underlying photo asset remains preserved in the Media Library.
              </p>
            </div>
          }
        />
      )}

      {/* BLOG CREATE / EDIT MODAL */}
      {blogModalOpen && (
        <Dialog
          open={blogModalOpen}
          onClose={() => setBlogModalOpen(false)}
          title={editingPost ? `Edit Article: ${editingPost.title}` : "Create New Journal Article"}
          description="Write and publish articles on holistic eye care, Bates relaxation, and digital recovery."
          maxWidth="lg"
        >
          <form onSubmit={handleSaveBlog} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-ink mb-1">Article Title *</label>
              <input
                type="text"
                required
                value={blogTitle}
                onChange={(e) => setBlogTitle(e.target.value)}
                placeholder="e.g. Bates Palming: Deep Relaxation for Digital Eyes"
                className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink font-serif text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-ink mb-1">URL Slug</label>
                <input
                  type="text"
                  value={blogSlug}
                  onChange={(e) => setBlogSlug(e.target.value)}
                  placeholder="auto-generated-from-title"
                  className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">Category</label>
                <select
                  value={blogCategory}
                  onChange={(e) => setBlogCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink"
                >
                  <option value="Ocular Wellness">Ocular Wellness</option>
                  <option value="Vision Therapy">Vision Therapy</option>
                  <option value="Digital Eye Strain">Digital Eye Strain</option>
                  <option value="Integral Vision Care">Integral Vision Care</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-ink mb-1">Cover Image</label>
              <div className="flex items-center gap-2">
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
                  <span>{uploadingBlog ? "Uploading..." : "Upload Cover Photo"}</span>
                </Button>
                <input
                  type="text"
                  value={blogCoverImage}
                  onChange={(e) => setBlogCoverImage(e.target.value)}
                  placeholder="Image URL"
                  className="flex-1 px-3 py-1.5 rounded-lg border border-ink-border bg-canvas-light text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-ink mb-1">Summary Excerpt</label>
              <textarea
                rows={2}
                value={blogExcerpt}
                onChange={(e) => setBlogExcerpt(e.target.value)}
                placeholder="Short excerpt for social and listing cards..."
                className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink"
              />
            </div>

            <div>
              <label className="block font-semibold text-ink mb-1">Full Article Content</label>
              <textarea
                rows={6}
                value={blogContent}
                onChange={(e) => setBlogContent(e.target.value)}
                placeholder="Complete article body..."
                className="w-full px-3 py-2 rounded-xl border border-ink-border bg-canvas-light text-ink leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-ink-border/50">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={blogPublished}
                  onChange={(e) => setBlogPublished(e.target.checked)}
                  className="rounded text-brand-purple focus:ring-brand-purple"
                />
                <span className="font-semibold text-ink">Publish to public website</span>
              </label>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setBlogModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" className="bg-brand-orange text-white">
                  Save Article
                </Button>
              </div>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}
