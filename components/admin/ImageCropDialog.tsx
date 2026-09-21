/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import Cropper from "react-easy-crop";

interface ImageCropDialogProps {
  isOpen: boolean;
  imageSrc: string | null;
  onConfirm: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

export function ImageCropDialog({ isOpen, imageSrc, onConfirm, onCancel }: ImageCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && imageSrc) {
      if (!dialog.open) {
        dialog.showModal();
        setZoom(1);
        setCrop({ x: 0, y: 0 });
        setIsProcessing(false);
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen, imageSrc]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
      if (!isProcessing) {
        onCancel();
      }
    };

    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [onCancel, isProcessing]);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleReset = () => {
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  };

  const handleConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (blob) {
        onConfirm(blob);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to crop image.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <dialog 
      ref={dialogRef} 
      className="confirm-dialog image-crop-dialog" 
      aria-modal="true" 
      aria-labelledby="crop-dialog-title"
      style={{ position: 'fixed', inset: 0, zIndex: 1000, margin: 'auto' }}
    >
      <div className="confirm-dialog-content panel" style={{ width: "100%", maxWidth: "800px" }}>
        <div className="confirm-header code" id="crop-dialog-title">
          <span className="cyan">[ IMAGE PROCESSOR // PROJECT COVER ]</span>
        </div>
        
        <div className="confirm-body">
          <p className="code cyan" style={{ marginBottom: "1rem" }}>
            {">"} DEFINE_VISIBLE_REGION
          </p>
          
          <div className="confirm-meta code muted" style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", marginTop: 0, border: "none", paddingTop: 0 }}>
            <span>TARGET_RATIO: <span className="cyan">16:9</span></span>
            <span>OUTPUT_FORMAT: <span className="cyan">WEBP</span></span>
          </div>

          <div style={{ position: "relative", width: "100%", height: "400px", background: "#000", border: "1px solid var(--border)", marginBottom: "1rem" }}>
             {imageSrc && (
               <Cropper
                 image={imageSrc}
                 crop={crop}
                 zoom={zoom}
                 aspect={16 / 9}
                 onCropChange={setCrop}
                 onCropComplete={onCropComplete}
                 onZoomChange={setZoom}
                 style={{
                   containerStyle: { background: 'var(--surface-lowest)' },
                   cropAreaStyle: { border: '1px solid var(--secondary)', boxShadow: '0 0 0 9999em rgba(0, 0, 0, 0.5)' }
                 }}
               />
             )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
            <span className="code muted micro">ZOOM</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              style={{ flex: 1 }}
              disabled={isProcessing}
            />
          </div>

        </div>

        <div className="editor-actions" style={{ marginTop: "1.5rem", justifyContent: "space-between" }}>
          <button type="button" className="admin-action-btn" onClick={handleReset} disabled={isProcessing}>
            [ RESET ]
          </button>
          
          <div style={{ display: "flex", gap: "8px" }}>
            <button type="button" className="admin-action-btn" onClick={onCancel} disabled={isProcessing}>
              [ CANCEL ]
            </button>
            <button type="button" className="admin-action-btn primary" onClick={handleConfirm} disabled={isProcessing}>
              {isProcessing ? "> PROCESSING_IMAGE..." : "[ APPLY ]"}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}

export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });

export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  targetWidth = 1600,
  targetHeight = 900
): Promise<Blob | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    targetWidth,
    targetHeight
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((file) => {
      if (file) {
        resolve(file);
      } else {
        reject(new Error("Canvas toBlob failed"));
      }
    }, "image/webp", 0.9);
  });
}
