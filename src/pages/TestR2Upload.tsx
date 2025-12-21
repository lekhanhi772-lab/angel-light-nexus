import { useState } from "react";
import { useR2Upload } from "@/hooks/useR2Upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, CheckCircle, XCircle, Loader2 } from "lucide-react";

const TestR2Upload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { uploadFile, isUploading, progress } = useR2Upload({
    folder: "test-uploads",
    onSuccess: (result) => {
      setUploadedUrl(result.url || null);
      setError(null);
    },
    onError: (err) => {
      setError(err);
      setUploadedUrl(null);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadedUrl(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      await uploadFile(selectedFile);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-6 h-6" />
              Test Upload lên Cloudflare R2
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Chọn file để upload:</label>
              <Input
                type="file"
                onChange={handleFileChange}
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
              />
            </div>

            {/* Selected File Info */}
            {selectedFile && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>File:</strong> {selectedFile.name}
                </p>
                <p className="text-sm">
                  <strong>Size:</strong> {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
                <p className="text-sm">
                  <strong>Type:</strong> {selectedFile.type}
                </p>
              </div>
            )}

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang upload... {progress}%
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload lên R2
                </>
              )}
            </Button>

            {/* Success Result */}
            {uploadedUrl && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Upload thành công!</span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">URL:</p>
                  <code className="block p-2 bg-background rounded text-xs break-all">
                    {uploadedUrl}
                  </code>
                </div>
                {selectedFile?.type.startsWith("image/") && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Preview:</p>
                    <img
                      src={uploadedUrl}
                      alt="Uploaded"
                      className="max-w-full h-auto rounded-lg border"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Error Result */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="w-5 h-5" />
                  <span className="font-medium">Upload thất bại!</span>
                </div>
                <p className="text-sm mt-2">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestR2Upload;
