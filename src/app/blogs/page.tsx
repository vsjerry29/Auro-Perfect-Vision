import React from "react";
import { getAllBlogPosts } from "@/lib/server/cms";
import { BlogsListingView } from "@/components/blogs/blogs-listing-view";

export const dynamic = "force-dynamic";

export default function BlogsListingPage() {
  const publishedBlogs = getAllBlogPosts(false); // published only

  return <BlogsListingView initialBlogs={publishedBlogs} />;
}
