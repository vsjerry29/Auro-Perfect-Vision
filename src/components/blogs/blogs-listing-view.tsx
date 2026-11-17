"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useDemoStore } from "@/lib/store";
import { BlogPost } from "@/lib/types";
import { Clock, ArrowRight, BookOpen, Search, Sparkles } from "lucide-react";

interface BlogsListingViewProps {
  initialBlogs?: BlogPost[];
}

export function BlogsListingView({ initialBlogs }: BlogsListingViewProps) {
  const { blogs: storeBlogs } = useDemoStore();
  const blogs = initialBlogs && initialBlogs.length > 0 ? initialBlogs : storeBlogs;

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
    <div className="bg-[#FAF9FC] min-h-screen pb-24">
      {/* Header */}
      <section className="pt-20 pb-16 bg-white border-b border-brand-gray/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-lavender text-brand-purple text-xs font-inter font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
            <span>Vision Research & Daily Practices</span>
          </div>
          <h1 className="font-sora text-4xl sm:text-5xl font-extrabold text-brand-charcoal tracking-tight">
            The Eye Wellness <span className="text-brand-purple">Journal</span>
          </h1>
          <p className="font-inter text-base text-brand-secondary max-w-xl mx-auto leading-relaxed">
            Practical guides on digital eye strain, classical palming routines, and holistic visual habits from our Auroville practitioners.
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
                className={`px-4 py-2 text-xs rounded-full font-sora font-semibold transition-all ${
                  selectedCategory === cat
                    ? "bg-brand-purple text-white shadow-sm"
                    : "bg-white text-brand-charcoal hover:bg-brand-lavender/40 border border-brand-gray"
                }`}
              >
                {cat === "all" ? "All Topics" : cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-brand-secondary absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles & guides..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-full border border-brand-gray bg-white text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-purple/50 shadow-sm"
            />
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((post) => (
            <Link
              key={post.id}
              href={`/blogs/${post.slug}`}
              className="group bg-white rounded-3xl overflow-hidden border border-brand-gray/80 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(75,29,143,0.1)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="aspect-[16/10] overflow-hidden bg-brand-gray relative">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute top-3.5 left-3.5">
                    <span className="px-3 py-1 rounded-full text-xs font-sora font-semibold bg-white/95 backdrop-blur-sm text-brand-purple shadow-sm">
                      {post.category}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs font-inter text-brand-secondary mb-2.5">
                    <Clock className="w-3.5 h-3.5 text-brand-purple" />
                    <span>{post.readTime}</span>
                    <span>•</span>
                    <span>{post.publishedDate}</span>
                  </div>

                  <h3 className="font-sora text-xl font-bold text-brand-charcoal group-hover:text-brand-purple transition-colors leading-snug mb-2.5">
                    {post.title}
                  </h3>

                  <p className="font-inter text-xs sm:text-sm text-brand-secondary line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-brand-gray/60 mt-4 flex items-center justify-between text-xs font-sora font-semibold text-brand-orange">
                <span>Read Article</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
