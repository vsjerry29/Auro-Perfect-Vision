import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPostBySlug, getAllBlogPosts } from "@/lib/server/cms";
import { Clock, ArrowLeft, ArrowRight, User, Calendar, ShieldCheck, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

interface BlogDetailPageProps {
  params: {
    slug: string;
  };
}

export default function BlogDetailPage({ params }: BlogDetailPageProps) {
  const post = getBlogPostBySlug(params.slug);

  if (!post || !post.isPublished) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-4 bg-white">
        <h2 className="font-sora text-3xl font-bold text-brand-charcoal">Article Not Found</h2>
        <p className="text-sm font-inter text-brand-secondary">The requested journal entry does not exist or is still in draft.</p>
        <Link
          href="/blogs"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-purple text-white text-sm font-sora font-semibold hover:bg-brand-violet transition-colors"
        >
          Return to Journal
        </Link>
      </div>
    );
  }

  const allBlogs = getAllBlogPosts(false);
  const related = allBlogs.filter((b) => b.id !== post.id).slice(0, 2);

  return (
    <article className="bg-[#FAF9FC] min-h-screen pb-24">
      {/* Back link */}
      <div className="bg-white border-b border-brand-gray/80 py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 text-xs font-sora font-semibold text-brand-secondary hover:text-brand-purple transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Articles</span>
          </Link>
        </div>
      </div>

      {/* Article Header */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 space-y-5 text-center">
        <div className="inline-flex items-center gap-2">
          <span className="px-3.5 py-1 rounded-full text-xs font-sora font-semibold bg-brand-lavender text-brand-purple">
            {post.category}
          </span>
          <span className="text-xs font-inter text-brand-secondary flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-brand-orange" /> {post.readTime}
          </span>
        </div>

        <h1 className="font-sora text-3xl sm:text-4xl lg:text-5xl font-extrabold text-brand-charcoal tracking-tight leading-tight">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-inter text-brand-secondary pt-2 border-t border-b border-brand-gray/80 py-3">
          <span className="font-semibold text-brand-charcoal">Author: {post.authorName}</span>
          <span>•</span>
          <span>Published: {post.publishedDate}</span>
          <span>•</span>
          <span>Auroville Vision Insights</span>
        </div>
      </header>

      {/* Hero Cover Image */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="rounded-3xl overflow-hidden shadow-lg border border-brand-gray/80 bg-white">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-80 sm:h-[460px] object-cover"
          />
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-brand-gray/80 shadow-sm space-y-6">
          {post.content.split("\n\n").map((para, i) => {
            if (para.startsWith("### ")) {
              return (
                <h3 key={i} className="font-sora text-xl sm:text-2xl font-bold text-brand-charcoal mt-8 mb-3">
                  {para.replace("### ", "")}
                </h3>
              );
            }
            return (
              <p key={i} className="text-brand-charcoal/90 leading-relaxed text-sm sm:text-base font-inter">
                {para}
              </p>
            );
          })}

          {/* Disclaimer Note */}
          <div className="mt-8 p-6 bg-brand-lavender/50 rounded-2xl border border-brand-purple/20 text-xs font-inter text-brand-secondary leading-relaxed flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-brand-purple flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-brand-charcoal block mb-0.5">Educational Purpose Notice:</span>
              <span>
                The routines and concepts outlined in this article are intended for ocular relaxation, visual ergonomics, and natural wellness education. They do not substitute for certified clinical ophthalmological diagnoses or surgical treatment.
              </span>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        <div className="mt-16 pt-10 border-t border-brand-gray/80 space-y-6">
          <h3 className="font-sora text-2xl font-bold text-brand-charcoal">
            More from the Journal
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {related.map((item) => (
              <Link
                key={item.id}
                href={`/blogs/${item.slug}`}
                className="p-6 rounded-3xl bg-white border border-brand-gray/80 shadow-sm hover:shadow-md hover:border-brand-purple/30 transition-all flex flex-col justify-between group"
              >
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-sora font-semibold bg-brand-lavender text-brand-purple mb-3">
                    {item.category}
                  </span>
                  <h4 className="font-sora text-base font-bold text-brand-charcoal group-hover:text-brand-purple transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h4>
                </div>
                <div className="pt-4 text-xs font-sora font-semibold text-brand-orange flex items-center gap-1">
                  <span>Read article</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
