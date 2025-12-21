import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  error?: string;
}

interface UseR2UploadOptions {
  folder?: string;
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: string) => void;
}

export function useR2Upload(options: UseR2UploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (file: File): Promise<UploadResult> => {
    setIsUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", options.folder || "uploads");

      setProgress(30);

      const { data, error } = await supabase.functions.invoke("upload-to-r2", {
        body: formData,
      });

      setProgress(100);

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || "Upload failed");
      }

      const result: UploadResult = {
        success: true,
        url: data.url,
        key: data.key,
        fileName: data.fileName,
        fileSize: data.fileSize,
        fileType: data.fileType,
      };

      options.onSuccess?.(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed";
      options.onError?.(errorMessage);
      toast.error("Upload thất bại: " + errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsUploading(false);
    }
  };

  const uploadMultiple = async (files: File[]): Promise<UploadResult[]> => {
    const results: UploadResult[] = [];
    for (const file of files) {
      const result = await uploadFile(file);
      results.push(result);
    }
    return results;
  };

  return {
    uploadFile,
    uploadMultiple,
    isUploading,
    progress,
  };
}
