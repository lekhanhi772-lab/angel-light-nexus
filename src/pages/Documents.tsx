import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Upload, FileText, Trash2, ArrowLeft, Sparkles, Calendar, HardDrive, Files } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Document {
  id: string;
  title: string;
  file_name: string;
  file_size: number;
  file_type: string;
  created_at: string;
}

interface NewlyUploadedFile {
  fileName: string;
  sequenceNumber: string;
}

const MAX_TOTAL_SIZE = 100 * 1024 * 1024; // 100MB

const DocumentsPage = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [newlyUploaded, setNewlyUploaded] = useState<NewlyUploadedFile[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Clear newly uploaded highlight after 10 seconds
  useEffect(() => {
    if (newlyUploaded.length > 0) {
      const timer = setTimeout(() => {
        setNewlyUploaded([]);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [newlyUploaded]);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: true }); // Oldest first for sequential numbering

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách tài liệu",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkDuplicateFileName = (fileName: string, currentDocs: Document[]): { isDuplicate: boolean; sequenceNumber: number | null } => {
    const existingDoc = currentDocs.find(doc => doc.file_name.toLowerCase() === fileName.toLowerCase());
    if (existingDoc) {
      const sequenceNumber = currentDocs.findIndex(doc => doc.id === existingDoc.id) + 1;
      return { isDuplicate: true, sequenceNumber };
    }
    return { isDuplicate: false, sequenceNumber: null };
  };

  const formatSequenceNumber = (index: number): string => {
    return String(index + 1).padStart(3, '0');
  };

  const handleMultiFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    
    // Check total size
    const totalSize = fileArray.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > MAX_TOTAL_SIZE) {
      toast({
        title: "💛 Ánh Sáng hơi nhiều rồi con ơi",
        description: "Con yêu ơi, lần này hơi nhiều ánh sáng quá rồi ạ. Cha giới hạn 100MB/lần để Ánh Sáng được truyền tải mượt mà nhé. Con chia làm 2–3 lần được không? Cha ôm con đây ✨💛",
        variant: "destructive",
      });
      event.target.value = '';
      return;
    }

    // Validate file types and check duplicates
    const allowedExtensions = ['.txt', '.pdf', '.docx', '.doc'];
    const duplicates: string[] = [];
    const invalidTypes: string[] = [];
    const validFiles: File[] = [];
    
    // Get current documents to check against
    let currentDocs = [...documents];

    for (const file of fileArray) {
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!allowedExtensions.includes(fileExt)) {
        invalidTypes.push(file.name);
        continue;
      }

      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "Lỗi",
          description: `File "${file.name}" quá lớn. Tối đa 50MB/file.`,
          variant: "destructive",
        });
        continue;
      }

      const { isDuplicate, sequenceNumber } = checkDuplicateFileName(file.name, currentDocs);
      if (isDuplicate) {
        duplicates.push(`${file.name} (số thứ tự ${formatSequenceNumber(sequenceNumber! - 1)})`);
        continue;
      }

      // Also check against files we're about to upload in this batch
      const alreadyInBatch = validFiles.some(f => f.name.toLowerCase() === file.name.toLowerCase());
      if (alreadyInBatch) {
        duplicates.push(`${file.name} (trùng trong lần upload này)`);
        continue;
      }

      validFiles.push(file);
    }

    // Show warnings for skipped files
    if (invalidTypes.length > 0) {
      toast({
        title: "Bỏ qua file không hỗ trợ",
        description: `Các file sau không được hỗ trợ: ${invalidTypes.join(', ')}`,
        variant: "destructive",
      });
    }

    if (duplicates.length > 0) {
      toast({
        title: "⛔ Không được phép trùng lặp",
        description: `Cha không cho phép trùng lặp để bảo vệ sự thuần khiết của Ánh Sáng: ${duplicates.join(', ')}`,
        variant: "destructive",
      });
    }

    if (validFiles.length === 0) {
      event.target.value = '';
      return;
    }

    setIsUploading(true);
    const uploadedFiles: NewlyUploadedFile[] = [];
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      setUploadProgress(`Đang tải ${i + 1}/${validFiles.length}: ${file.name}`);
      
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', file.name.replace(/\.[^/.]+$/, ''));

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-document`,
          {
            method: 'POST',
            body: formData,
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Upload failed');
        }

        successCount++;
        // Calculate the new sequence number
        const newSequenceNumber = formatSequenceNumber(currentDocs.length);
        uploadedFiles.push({
          fileName: file.name,
          sequenceNumber: newSequenceNumber
        });
        
        // Add to currentDocs to prevent duplicates in the same batch
        currentDocs.push({
          id: result.document.id,
          title: result.document.title,
          file_name: file.name,
          file_size: file.size,
          file_type: result.document.file_type,
          created_at: new Date().toISOString()
        });
      } catch (error) {
        console.error('Upload error:', error);
        failCount++;
      }
    }

    setUploadProgress('');
    setIsUploading(false);
    event.target.value = '';

    // Refresh documents list
    await fetchDocuments();

    // Set newly uploaded files for highlighting
    setNewlyUploaded(uploadedFiles);

    // Show summary toast
    if (successCount > 0) {
      toast({
        title: "✨ Ánh Sáng đã được lưu giữ",
        description: `Đã tải lên thành công ${successCount} file${failCount > 0 ? `, ${failCount} file thất bại` : ''}. Cha ôm con! 💛`,
      });
    } else if (failCount > 0) {
      toast({
        title: "Lỗi",
        description: `Không thể tải lên ${failCount} file`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (doc: Document) => {
    if (!confirm(`Bạn có chắc muốn xóa "${doc.title}"?`)) return;

    try {
      // Delete from storage
      await supabase.storage
        .from('sacred-documents')
        .remove([doc.file_name]);

      // Delete from database (chunks will be deleted via cascade)
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', doc.id);

      if (error) throw error;

      toast({
        title: "Đã xóa",
        description: `Tài liệu "${doc.title}" đã được xóa`,
      });

      fetchDocuments();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa tài liệu",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isNewlyUploaded = (fileName: string) => {
    return newlyUploaded.some(f => f.fileName === fileName);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-divine-gold/5">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-divine-gold/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-divine-gold hover:text-divine-gold/80 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-cinzel">Trang chủ</span>
            </Link>
            <h1 className="font-cinzel text-xl md:text-2xl font-bold text-divine-gold flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Tài Liệu Ánh Sáng
            </h1>
            <div className="w-24" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Upload Section */}
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-divine-gold/10 to-divine-celestial/10 border border-divine-gold/30">
          <div className="text-center">
            <h2 className="font-cinzel text-xl mb-2 text-divine-gold">
              + Tải lên Tài Liệu của Cha
            </h2>
            <p className="text-muted-foreground mb-4">
              Hỗ trợ: .txt, .pdf, .docx • Tối đa 50MB/file • Tổng cộng ≤ 100MB/lần
            </p>
            
            {uploadProgress && (
              <div className="mb-4 p-3 rounded-lg bg-divine-gold/10 border border-divine-gold/30">
                <div className="flex items-center justify-center gap-2 text-divine-gold">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span className="text-sm font-medium">{uploadProgress}</span>
                </div>
              </div>
            )}
            
            <label className="inline-block">
              <input
                type="file"
                accept=".txt,.pdf,.docx,.doc"
                multiple
                onChange={handleMultiFileUpload}
                disabled={isUploading}
                className="hidden"
              />
              <Button
                disabled={isUploading}
                className="bg-divine-gold hover:bg-divine-gold/90 text-black font-cinzel"
                asChild
              >
                <span className="cursor-pointer flex items-center gap-2">
                  <Files className="w-4 h-4" />
                  {isUploading ? 'Đang tải lên...' : 'Chọn nhiều file để tải lên'}
                </span>
              </Button>
            </label>
            <p className="text-xs text-muted-foreground mt-2">
              💡 Giữ Ctrl/Cmd để chọn nhiều file cùng lúc
            </p>
          </div>
        </div>

        {/* Newly Uploaded Files Section */}
        {newlyUploaded.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-divine-gold/20 via-divine-celestial/10 to-divine-gold/20 border border-divine-gold/40 animate-fade-in overflow-hidden relative">
            {/* Light particles effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-divine-gold rounded-full animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${i * 0.2}s`,
                    opacity: 0.6
                  }}
                />
              ))}
            </div>
            
            <div className="relative z-10">
              <h3 className="font-cinzel text-divine-gold mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-pulse" />
                Vừa thêm vào Bộ Nhớ Vĩnh Cửu
              </h3>
              <div className="space-y-2">
                {newlyUploaded.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2 rounded-lg bg-background/50 animate-fade-in"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <span className="font-cinzel font-bold text-divine-gold text-sm bg-divine-gold/20 px-2 py-1 rounded">
                      {file.sequenceNumber}
                    </span>
                    <span className="text-sm text-foreground">{file.fileName}</span>
                    <Sparkles className="w-3 h-3 text-divine-gold animate-pulse ml-auto" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Documents List */}
        <div className="space-y-4">
          <h3 className="font-cinzel text-lg text-divine-gold mb-4">
            Bộ Nhớ Vĩnh Cửu ({documents.length} tài liệu)
          </h3>

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              <Sparkles className="w-8 h-8 mx-auto mb-2 animate-pulse text-divine-gold" />
              Đang tải...
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Chưa có tài liệu nào</p>
              <p className="text-sm mt-2">Hãy tải lên tài liệu đầu tiên của Cha Vũ Trụ</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {documents.map((doc, index) => (
                <div
                  key={doc.id}
                  className={`p-4 rounded-xl bg-card/50 border transition-all duration-500 ${
                    isNewlyUploaded(doc.file_name)
                      ? 'border-divine-gold/60 shadow-lg shadow-divine-gold/20 animate-fade-in'
                      : 'border-divine-gold/20 hover:border-divine-gold/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Sequential Number Badge */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-divine-gold/20 to-divine-celestial/20 border flex items-center justify-center ${
                        isNewlyUploaded(doc.file_name) ? 'border-divine-gold/60' : 'border-divine-gold/30'
                      }`}>
                        <span className="font-cinzel font-bold text-divine-gold text-sm">
                          {formatSequenceNumber(index)}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-divine-gold/10">
                        <FileText className="w-5 h-5 text-divine-gold" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">
                          {doc.title}
                        </h4>
                        <p className="text-sm text-muted-foreground truncate">
                          {doc.file_name}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(doc.created_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <HardDrive className="w-3 h-3" />
                            {formatFileSize(doc.file_size)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(doc)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DocumentsPage;
