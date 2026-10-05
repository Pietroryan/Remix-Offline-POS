/**
 * Utility for local image processing and Base64 conversion for offline POS storage.
 * Reads the file via FileReader API and optionally optimizes dimensions with an off-screen canvas
 * so local persistence (localStorage / IndexedDB) remains lean and performant.
 */

export interface ImageProcessResult {
  dataUrl: string;
  originalName: string;
  originalSize: number;
  optimizedSize: number;
  width: number;
  height: number;
}

/**
 * Converts a local image File into a compact Base64 Data URL.
 * Automatically constrains maximum dimensions (default 600px) and applies JPEG/WebP compression.
 */
export async function convertImageFileToBase64(
  file: File,
  maxDimension = 600,
  quality = 0.85
): Promise<ImageProcessResult> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select a valid image file (JPEG, PNG, WebP, GIF).');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('Failed to read the selected file from disk.'));
    };

    reader.onload = () => {
      const rawDataUrl = reader.result as string;
      if (!rawDataUrl) {
        reject(new Error('Image file is empty or unreadable.'));
        return;
      }

      const img = new Image();
      img.onerror = () => {
        reject(new Error('Could not decode image data.'));
      };

      img.onload = () => {
        let { width, height } = img;
        const originalWidth = width;
        const originalHeight = height;

        // If image is already smaller than max dimensions and file size is small (< 120KB), keep raw
        if (width <= maxDimension && height <= maxDimension && file.size < 120 * 1024) {
          resolve({
            dataUrl: rawDataUrl,
            originalName: file.name,
            originalSize: file.size,
            optimizedSize: rawDataUrl.length,
            width: originalWidth,
            height: originalHeight,
          });
          return;
        }

        // Scale proportionally to maxDimension
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({
            dataUrl: rawDataUrl,
            originalName: file.name,
            originalSize: file.size,
            optimizedSize: rawDataUrl.length,
            width: originalWidth,
            height: originalHeight,
          });
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Keep PNG transparent background if original is PNG, otherwise encode as JPEG
        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const compressedDataUrl = canvas.toDataURL(mimeType, quality);

        resolve({
          dataUrl: compressedDataUrl,
          originalName: file.name,
          originalSize: file.size,
          optimizedSize: compressedDataUrl.length,
          width,
          height,
        });
      };

      img.src = rawDataUrl;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Format bytes into readable KB/MB
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
