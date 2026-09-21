"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AdminProject } from "@/services/adminProjectsService";
import { saveProject } from "@/services/adminProjectsService";
import { getSupabase } from "@/lib/supabase/client";
import { useEffect } from "react";
import { ImageCropDialog, getCroppedImg } from "./ImageCropDialog";

export function ProjectEditor({ project }: { project?: AdminProject }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState("idle");

  const [formData, setFormData] = useState({
    title: project?.title || "",
    slug: project?.slug || "",
    category: project?.category || "",
    short_description: project?.short_description || "",
    descriptor: project?.descriptor || "",
    repository_url: project?.repository_url || "",
    demo_url: project?.demo_url || "",
    status: project?.status || "published",
    featured: project?.featured ?? true,
    cover_image_url: project?.cover_image_url || "",
  });

  const [technologies, setTechnologies] = useState(
    project?.technologies.map(t => t.label).join(", ") || ""
  );

  const [file, setFile] = useState<File | Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cropSourceFile, setCropSourceFile] = useState<File | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (cropImageSrc) URL.revokeObjectURL(cropImageSrc);
    };
  }, [previewUrl, cropImageSrc]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    
    // Reset input immediately so the same file can be re-selected if canceled
    e.target.value = "";
    
    if (f.size > 5 * 1024 * 1024) {
      alert("> IMAGE_EXCEEDS_SIZE_LIMIT");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(f.type)) {
      alert("> UNSUPPORTED_IMAGE_FORMAT");
      return;
    }

    const objectUrl = URL.createObjectURL(f);
    
    try {
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = objectUrl;
      });

      const width = img.naturalWidth;
      const height = img.naturalHeight;
      const ratio = width / height;
      const targetRatio = 16 / 9;
      
      const ratioMatches = Math.abs(ratio - targetRatio) / targetRatio <= 0.01;

      if (ratioMatches) {
        try {
          const blob = await getCroppedImg(
            objectUrl,
            { x: 0, y: 0, width: width, height: height },
            1600,
            900
          );
          if (blob) {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setFile(blob);
            setPreviewUrl(URL.createObjectURL(blob));
          }
        } catch (err) {
          console.error("Auto-process failed", err);
          alert("> IMAGE_PROCESSING_FAILED");
        } finally {
          URL.revokeObjectURL(objectUrl);
        }
      } else {
        if (cropImageSrc) URL.revokeObjectURL(cropImageSrc);
        setCropSourceFile(f);
        setCropImageSrc(objectUrl);
        setIsCropOpen(true);
      }
    } catch (err) {
      console.error("Failed to decode image", err);
      alert("> UNSUPPORTED_IMAGE_FORMAT");
      URL.revokeObjectURL(objectUrl);
    }
  };

  const handleCropConfirm = (croppedBlob: Blob) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(croppedBlob);
    setPreviewUrl(URL.createObjectURL(croppedBlob));
    setIsCropOpen(false);
    
    if (cropImageSrc) URL.revokeObjectURL(cropImageSrc);
    setCropImageSrc(null);
    setCropSourceFile(null);
  };

  const handleCropCancel = () => {
    setIsCropOpen(false);
    if (cropImageSrc) URL.revokeObjectURL(cropImageSrc);
    setCropImageSrc(null);
    setCropSourceFile(null);
  };

  const handleRemoveImage = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFormData({ ...formData, cover_image_url: "" });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      // Only auto-generate slug for new projects if user hasn't typed in slug manually
      slug: !project && !prev.slug ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : prev.slug
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("saving");
    startTransition(async () => {
      try {
        let finalImageUrl = formData.cover_image_url;
        let oldFileNameToCleanup: string | null = null;

        if (file) {
          setStatus("uploading");
          const client = getSupabase();
          const safeSlug = formData.slug || "project";
          const fileName = `${safeSlug}-${Date.now()}.webp`;
          
          const { error } = await client.storage
            .from("portfolio-projects")
            .upload(fileName, file, { contentType: "image/webp" });

          if (error) throw new Error(error.message);
          
          const { data: urlData } = client.storage.from("portfolio-projects").getPublicUrl(fileName);
          finalImageUrl = urlData.publicUrl;

          if (project?.cover_image_url && project.cover_image_url !== finalImageUrl) {
            const parts = project.cover_image_url.split("/portfolio-projects/");
            if (parts.length === 2) {
              oldFileNameToCleanup = parts[1];
            }
          }
        }

        setStatus("saving");
        const parsedTech = technologies
          .split(",")
          .map(t => t.trim())
          .filter(t => t.length > 0)
          .map((label, idx) => ({ label, sort_order: idx }));

        await saveProject({
          id: project?.id,
          ...formData,
          status: formData.status as "draft" | "published" | "archived",
          cover_image_url: finalImageUrl,
          technologies: parsedTech,
          sort_order: project?.sort_order ?? 0,
        });

        if (oldFileNameToCleanup) {
          const client = getSupabase();
          await client.storage.from("portfolio-projects").remove([oldFileNameToCleanup]).catch(console.error);
        }

        setStatus("success");
        router.push("/admin/projects");
        router.refresh();
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    });
  };

  return (
    <>
    <form className="control-form" onSubmit={handleSubmit}>
      <fieldset disabled={isPending || status === 'uploading' || status === 'saving'} className="panel control-fields">
        <legend className="code cyan">PROJECT DETAILS</legend>
        <div className="form-grid">
          <label className="full-width">
            <span>Title *</span>
            <input required type="text" value={formData.title} onChange={handleTitleChange} />
          </label>
          
          <label>
            <span>Slug *</span>
            <input required type="text" pattern="^[a-z0-9-]+$" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} />
          </label>

          <label>
            <span>Category *</span>
            <input required type="text" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
          </label>

          <label className="full-width">
            <span>Short Description *</span>
            <textarea required rows={3} value={formData.short_description} onChange={e => setFormData({ ...formData, short_description: e.target.value })} />
          </label>

          <label>
            <span>Descriptor (optional code/label)</span>
            <input type="text" value={formData.descriptor} onChange={e => setFormData({ ...formData, descriptor: e.target.value })} />
          </label>

          <label className="full-width">
            <span>Technologies (comma separated) *</span>
            <input required type="text" value={technologies} onChange={e => setTechnologies(e.target.value)} />
          </label>

          <label>
            <span>Repository URL</span>
            <input type="url" value={formData.repository_url} onChange={e => setFormData({ ...formData, repository_url: e.target.value })} />
          </label>
          
          <label>
            <span>Demo URL</span>
            <input type="url" value={formData.demo_url} onChange={e => setFormData({ ...formData, demo_url: e.target.value })} />
          </label>

          <label>
            <span>Status</span>
            <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as "draft" | "published" | "archived" })}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          
          <label style={{ flexDirection: "row", alignItems: "center", gap: "8px" }}>
            <input type="checkbox" checked={formData.featured} onChange={e => setFormData({ ...formData, featured: e.target.checked })} style={{ width: "auto" }} />
            <span>Featured on Homepage</span>
          </label>
        </div>
      </fieldset>

      <fieldset disabled={isPending || status === 'uploading' || status === 'saving'} className="panel control-fields">
        <legend className="code cyan">MEDIA</legend>
        <label>
          <span>Cover Image (max 5MB)</span>
          {(previewUrl || formData.cover_image_url) && (
            <div style={{ marginBottom: "12px", border: "1px solid var(--border)", padding: "12px", background: "var(--surface-lowest)" }}>
              <div className="muted micro" style={{ marginBottom: "8px" }}>PROJECT COVER PREVIEW</div>
              <img 
                src={previewUrl || formData.cover_image_url} 
                alt="Cover Preview" 
                style={{ 
                  width: "100%", 
                  maxWidth: "400px", 
                  aspectRatio: "16/9", 
                  objectFit: "cover", 
                  display: "block",
                  border: "1px solid var(--border)" 
                }} 
              />
              <div className="editor-actions" style={{ marginTop: "12px" }}>
                <button type="button" onClick={handleRemoveImage}>Remove Image</button>
              </div>
            </div>
          )}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={handleFileChange} />
        </label>
      </fieldset>

      <div className="panel save-panel">
        <p className="code cyan" role="status" aria-live="polite">
          {status === 'idle' ? '> READY_' : 
           status === 'uploading' ? '> UPLOADING_ASSET...' :
           status === 'saving' ? '> WRITING_RECORD...' :
           status === 'success' ? '> RECORD_SAVED' :
           status === 'error' ? '> OPERATION_FAILED' : '> READY_'}
        </p>
        <div style={{ display: "flex", gap: "12px" }}>
          <button type="button" onClick={() => router.back()} disabled={isPending || status === 'uploading' || status === 'saving'} className="pixel-button secondary">
            CANCEL
          </button>
          <button disabled={isPending || status === 'uploading' || status === 'saving'} type="submit" className="pixel-button">
            {status === 'saving' || status === 'uploading' ? "SAVING..." : "SAVE PROJECT"}
          </button>
        </div>
      </div>
    </form>
    
    {isCropOpen && cropSourceFile && (
      <ImageCropDialog
        isOpen={isCropOpen}
        imageSrc={cropImageSrc}
        onConfirm={handleCropConfirm}
        onCancel={handleCropCancel}
      />
    )}
    </>
  );
}
