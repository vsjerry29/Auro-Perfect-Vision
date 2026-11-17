"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Sparkles } from "lucide-react";
import { BlogPost } from "@/lib/types";

interface ArticlesPreviewProps {
  initialBlogs?: BlogPost[];
}

export function ArticlesPreview({ initialBlogs }: ArticlesPreviewProps) {
  const blogs = initialBlogs || [];

  return (
    <section className="py-16 lg:py-20 bg-brand-offwhite border-b border-brand-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="space-y-2 max-w-2xl text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-lavender text-brand-purple text-xs font-inter font-bold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5 text-brand-orange" />
              <span>Wellness Journal</span>
            </div>
            <h2 className="font-sora text-2xl sm:text-3xl font-bold text-brand-charcoal tracking-tight">
              Educational Eye-Care Articles
            </h2>
            <p className="font-inter text-xs sm:text-sm text-brand-secondary">
              Evidence-based insights on screen fatigue, Bates palming routines, and pediatric visual habits.
            </p>
          </div>

          <Link
            href="/blogs"
            className="inline-flex items-center gap-1.5 text-xs font-sora font-bold text-brand-purple hover:text-brand-violet transition-colors self-start md:self-auto"
          >
            <span>Read All Articles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 3 Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogs.slice(0, 3).map((post) => (
            <Link
              key={post.id}
              href={`/blogs/${post.slug}`}
              className="group bg-white rounded-2xl overflow-hidden border border-brand-gray hover:border-brand-purple/40 shadow-subtle hover:shadow-card transition-all duration-300 flex flex-col justify-between transform hover:-translate-y-1"
            >
              <div>
                <div className="aspect-[16/9] overflow-hidden bg-brand-gray">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-5 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-brand-secondary">
                    <span className="px-2 py-0.5 rounded-md bg-brand-lavender text-brand-purple font-inter font-semibold">
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>

                  <h3 className="font-sora text-base font-bold text-brand-charcoal group-hover:text-brand-purple transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h3>

                  <p className="font-inter text-xs text-brand-secondary line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-brand-gray/60 text-xs font-inter font-semibold text-brand-purple flex items-center justify-between mt-auto">
                <span className="text-[11px] text-brand-secondary">By {post.authorName}</span>
                <span className="group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 text-brand-orange font-sora">
                  Read &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
