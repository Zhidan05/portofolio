"use client";

import React, { useState } from "react";
import { ProjectImagePlaceholder } from "./ProjectImagePlaceholder";

interface ProjectCoverImageProps {
  src: string | null;
  alt: string;
}

export function ProjectCoverImage({ src, alt }: ProjectCoverImageProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div style={{ marginBottom: "1rem" }}>
        <ProjectImagePlaceholder />
      </div>
    );
  }

  return (
    <div style={{ marginBottom: "1rem", border: "1px solid var(--border)", padding: "0.25rem", aspectRatio: "16 / 9", overflow: "hidden", position: "relative" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src={src} 
        alt={alt} 
        onError={() => setError(true)}
        style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }} 
      />
    </div>
  );
}
