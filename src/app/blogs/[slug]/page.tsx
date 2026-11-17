"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { useDemoStore } from "@/lib/store";
import { Clock, ArrowLeft, ArrowRight, User, Calendar, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { blogs } = useDemoStore();

  const post = useMemo(() => {
    return blogs.find((b) => b.slug === slug);
  }, [blogs, slug]);

  if (!post) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-4">
        <h2 className="font-serif text-3xl text-ink">Article Not Found</h2>
        <p className="text-sm text-ink-muted">The requested journal entry does not exist.</p>
        <Link href="/blogs">
          <Button variant="primary" size="md">
            Return to Journal
          </Button>
        </Link>
      </div>
    );
  }

  const related = blogs.filter((b) => b.id !== post.id).slice(0, 2);

  return (
    <article className="bg-canvas min-h-screen pb-24">
      {/* Back link */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link
          href="/blogs"
          className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-plum font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Journal</span>
        </Link>
      </div>

      {/* Article Header */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10 space-y-5 text-center">
        <div className="inline-flex items-center gap-2">
          <Badge variant="plum">{post.category}</Badge>
          <span className="text-xs text-ink-muted flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {post.readTime}
          </span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-ink font-normal tracking-tight leading-tight">
          {post.title}
        </h1>

        <div className="flex items-center justify-center gap-4 text-xs text-ink-muted pt-2 border-t border-b border-ink-border/50 py-3">
          <span className="font-medium text-ink">Author: {post.authorName}</span>
          <span>•</span>
          <span>Published: {post.publishedDate}</span>
          <span>•</span>
          <span>Auroville Vision Insights</span>
        </div>
      </header>

      {/* Hero Cover Image */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="rounded-3xl overflow-hidden shadow-elevated border-4 border-white">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-80 sm:h-[420px] object-cover"
          />
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="prose prose-stone max-w-none text-ink leading-relaxed space-y-6 text-base font-sans">
          {post.content.split("\n\n").map((para, i) => {
            if (para.startsWith("### ")) {
              return (
                <h3 key={i} className="font-serif text-2xl text-ink font-medium mt-8 mb-3">
                  {para.replace("### ", "")}
                </h3>
              );
            }
            return (
              <p key={i} className="text-ink/90 leading-relaxed text-sm sm:text-base">
                {para}
              </p>
            );
          })}
        </div>

        {/* Disclaimer Note */}
        <div className="mt-12 p-6 bg-sage/40 rounded-2xl border border-sage-muted text-xs text-ink-muted leading-relaxed flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-sage-dark flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-ink block mb-0.5">Educational Notice:</span>
            <span>
              The techniques discussed in this article are intended for ocular relaxation, stress release, and natural ergonomic awareness. They are not a substitute for professional clinical medical advice or surgical treatments.
            </span>
          </div>
        </div>

        {/* Related Articles */}
        <div className="mt-16 pt-10 border-t border-ink-border space-y-6">
          <h3 className="font-serif text-2xl text-ink font-normal">
            More from the Journal
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {related.map((item) => (
              <Link
                key={item.id}
                href={`/blogs/${item.slug}`}
                className="p-5 rounded-2xl bg-white border border-ink-border shadow-subtle hover:shadow-card transition-all flex flex-col justify-between"
              >
                <div>
                  <Badge variant="sage" className="mb-2 text-[10px]">
                    {item.category}
                  </Badge>
                  <h4 className="font-serif text-base font-medium text-ink line-clamp-2">
                    {item.title}
                  </h4>
                </div>
                <div className="pt-4 text-xs text-gold-dark font-medium flex items-center gap-1">
                  <span>Read article</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
