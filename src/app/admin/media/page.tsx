"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Image as ImageIcon,
  Upload,
  Copy,
  Trash2,
  Check,
  Search,
  ExternalLink,
  AlertCircle,
  FileText,
} from "lucide-react";
import { MediaAsset } from "@/lib/types/crm";

export default function AdminMediaPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Uploading state
  const [isUploading, setIsUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/media");
      if (!res.ok) throw new Error("Failed to load media assets");
      const data = await res.json();
      setAssets(data.assets || []);
    } catch (err: any) {
      setError(err.message || "Failed to load media");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      // 1. Upload file binary
      const uploadRes = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const data = await uploadRes.json();
        throw new Error(data.error || "File upload failed");
      }

      const uploadData = await uploadRes.json();
      const publicUrl = uploadData.url;

      // 2. Record media asset metadata
      const mediaRes = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          originalName: file.name,
          publicUrl,
          fileSizeBytes: file.size,
          mimeType: file.type,
          altText: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
        }),
      });

      if (!mediaRes.ok) throw new Error("Failed to record media asset");

      await fetchAssets();
    } catch (err: any) {
      alert(err.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      const res = await fetch(`/api/admin/media?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete asset");
      await fetchAssets();
    } catch (err: any) {
      alert(err.message || "Failed to delete");
    }
  };

  const filteredAssets = assets.filter((a) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return a.fileName.toLowerCase().includes(q) || a.altText?.toLowerCase().includes(q);
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-ink-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-medium text-gold-dark uppercase tracking-wider">
              Website CMS
            </span>
            <span className="text-xs text-ink-muted">•</span>
            <span className="text-xs font-sans text-plum font-medium">Assets</span>
          </div>
          <h1 className="font-serif text-2xl lg:text-3xl font-medium text-ink">
            Media Asset Library
          </h1>
          <p className="text-xs font-sans text-ink-muted mt-0.5">
            Upload and organize photography for holistic therapies, retreat programmes, and practitioner portraits.
          </p>
        </div>

        {/* Upload Trigger */}
        <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-plum text-white rounded-md text-xs font-sans hover:bg-plum-light transition-colors self-start sm:self-auto shadow-sm cursor-pointer">
          <Upload className="w-4 h-4" />
          <span>{isUploading ? "Uploading..." : "+ Upload Image"}</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-ink-border p-4 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search images by name or alt text..."
            className="w-full pl-9 pr-3 py-1.5 border border-ink-border rounded-lg text-xs font-sans bg-ivory/30 focus:outline-none focus:border-plum"
          />
        </div>
        <span className="text-xs font-sans text-ink-muted">
          {filteredAssets.length} media assets available
        </span>
      </div>

      {/* Grid of Images */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-4 border-plum border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-ink-muted font-sans">Loading media assets...</p>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="bg-white rounded-xl border border-ink-border p-12 text-center">
          <ImageIcon className="w-10 h-10 text-ink-muted/40 mx-auto mb-3" />
          <h3 className="font-serif text-base font-medium text-ink mb-1">No Media Assets Found</h3>
          <p className="text-xs font-sans text-ink-muted mb-4">
            Upload pictures to reference them across therapies, programmes, or blog articles.
          </p>
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-plum text-white rounded text-xs font-sans cursor-pointer hover:bg-plum-light">
            <Upload className="w-4 h-4" /> Browse Image Files
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredAssets.map((asset) => {
            const isCopied = copiedId === asset.id;
            const fileSizeKB = Math.round((asset.fileSizeBytes || 0) / 1024);

            return (
              <div
                key={asset.id}
                className="bg-white rounded-xl border border-ink-border shadow-xs overflow-hidden flex flex-col justify-between group hover:border-plum/40 transition-colors"
              >
                {/* Image Preview Container */}
                <div className="relative aspect-square bg-ivory/60 border-b border-ink-border/50 flex items-center justify-center overflow-hidden">
                  <img
                    src={asset.publicUrl}
                    alt={asset.altText || asset.fileName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleCopyUrl(asset.publicUrl, asset.id)}
                      className="p-1.5 bg-white text-ink rounded hover:bg-ivory shadow"
                      title="Copy Public URL"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <a
                      href={asset.publicUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 bg-white text-ink rounded hover:bg-ivory shadow"
                      title="View Full Image"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(asset.id, asset.fileName)}
                      className="p-1.5 bg-white text-red-600 rounded hover:bg-red-50 shadow"
                      title="Delete Asset"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Metadata */}
                <div className="p-3 text-[11px] font-sans space-y-1">
                  <div className="font-medium text-ink truncate" title={asset.fileName}>
                    {asset.fileName}
                  </div>
                  <div className="text-ink-muted flex items-center justify-between text-[10px]">
                    <span>{fileSizeKB > 0 ? `${fileSizeKB} KB` : "Asset"}</span>
                    <span>{asset.createdAt ? asset.createdAt.split("T")[0] : "2026-11"}</span>
                  </div>
                  <button
                    onClick={() => handleCopyUrl(asset.publicUrl, asset.id)}
                    className="w-full text-center py-1 mt-1 rounded bg-ivory hover:bg-plum-muted/60 text-plum font-mono text-[10px] transition-colors flex items-center justify-center gap-1"
                  >
                    {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    {isCopied ? "URL Copied!" : "Copy Path"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
