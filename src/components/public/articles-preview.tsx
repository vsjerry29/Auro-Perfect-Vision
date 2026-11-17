"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import { useDemoStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { BlogPost } from "@/lib/types";

interface ArticlesPreviewProps {
  initialBlogs?: BlogPost[];
}

export function ArticlesPreview({ initialBlogs }: ArticlesPreviewProps) {
  const { blogs: storeBlogs } = useDemoStore();
  const blogs = initialBlogs && initialBlogs.length > 0 ? initialBlogs : storeBlogs;

  return (
    <section className="py-20 lg:py-28 bg-canvas border-b border-ink-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-3 max-w-2xl">
            <Badge variant="gold" className="px-3 py-1 text-xs">
              Vision Insights & Research
            </Badge>
            <h2 className="font-serif text-3xl sm:text-4xl text-ink font-normal tracking-tight">
              From our <span className="italic text-plum">wellness journal.</span>
            </h2>
            <p className="text-sm sm:text-base text-ink-muted">
              Thoughtful articles, scientific insights on digital eye fatigue, and daily palming rituals.
            </p>
          </div>

          <Link href="/blogs">
            <Button variant="outline" size="sm" className="gap-1.5 self-start md:self-auto">
              <span>View All Articles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {/* 3 Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogs.slice(0, 3).map((post) => (
            <Link
              key={post.id}
              href={`/blogs/${post.slug}`}
              className="group bg-white rounded-2xl overflow-hidden border border-ink-border shadow-subtle hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="h-48 overflow-hidden bg-canvas-dark">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between text-xs text-ink-muted">
                    <Badge variant="sage">{post.category}</Badge>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {post.readTime}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-medium text-ink group-hover:text-plum transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-xs text-ink-muted line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-ink-border/40 text-xs font-medium text-plum flex items-center justify-between mt-auto">
                <span>By {post.authorName}</span>
                <span className="group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 text-gold-dark">
                  Read article <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
