"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useDemoStore } from "@/lib/store";
import { Clock, ArrowRight, BookOpen, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function BlogsListingPage() {
  const { blogs } = useDemoStore();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["all", "Ocular Wellness", "Eye Yoga & Practices", "Holistic Nutrition"];

  const filtered = blogs.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || post.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-canvas min-h-screen pb-24">
      {/* Editorial Header */}
      <section className="pt-16 pb-16 border-b border-ink-border/50 bg-canvas-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <Badge variant="gold" className="text-xs">
            Vision Research & Practices
          </Badge>
          <h1 className="font-serif text-4xl sm:text-5xl text-ink font-normal tracking-tight">
            The Eye Wellness <span className="italic text-plum">Journal</span>
          </h1>
          <p className="text-sm sm:text-base text-ink-muted max-w-xl mx-auto leading-relaxed">
            Practical guides on digital eye strain, classical palming routines, and holistic nourishment from our Auroville practitioners.
          </p>
        </div>
      </section>

      {/* Filter and Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
                  selectedCategory === cat
                    ? "bg-plum text-white shadow-xs"
                    : "bg-white text-ink border border-ink-border hover:bg-canvas-light"
                }`}
              >
                {cat === "all" ? "All Topics" : cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-ink-muted absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-ink-border bg-white text-ink focus:outline-none focus:ring-1 focus:ring-plum"
            />
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filtered.map((post) => (
            <Link
              key={post.id}
              href={`/blogs/${post.slug}`}
              className="group bg-white rounded-2xl overflow-hidden border border-ink-border shadow-subtle hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="h-52 overflow-hidden bg-canvas-dark">
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
                <span className="text-ink-muted font-normal text-[11px]">
                  By {post.authorName} • {post.publishedDate}
                </span>
                <span className="group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 text-gold-dark">
                  Read <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
