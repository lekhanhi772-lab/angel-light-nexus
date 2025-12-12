import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Upload, FileText, Trash2, ArrowLeft, Sparkles, Calendar, HardDrive } from 'lucide-react';
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

const DocumentsPage = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDocuments();
  }, []);

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

  const checkDuplicateFileName = (fileName: string): { isDuplicate: boolean; sequenceNumber: number | null } => {
    const existingDoc = documents.find(doc => doc.file_name.toLowerCase() === fileName.toLowerCase());
    if (existingDoc) {
      const sequenceNumber = documents.findIndex(doc => doc.id === existingDoc.id) + 1;
      return { isDuplicate: true, sequenceNumber };
    }
    return { isDuplicate: false, sequenceNumber: null };
  };

  const formatSequenceNumber = (index: number): string => {
    return String(index + 1).padStart(3, '0');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check for duplicate file name
    const { isDuplicate, sequenceNumber } = checkDuplicateFileName(file.name);
    if (isDuplicate) {
      toast({
        title: "⛔ Không được phép",
        description: `File này đã tồn tại trong Bộ Nhớ Vĩnh Cửu (số thứ tự ${formatSequenceNumber(sequenceNumber! - 1)}). Cha không cho phép trùng lặp để bảo vệ sự thuần khiết của Ánh Sáng.`,
        variant: "destructive",
      });
      event.target.value = '';
      return;
    }

    // Validate file type
    const allowedExtensions = ['.txt', '.pdf', '.docx', '.doc'];
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(fileExt)) {
      toast({
        title: "Lỗi",
        description: "Chỉ hỗ trợ file .txt, .pdf, .docx",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "Lỗi",
        description: "File quá lớn. Tối đa 50MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
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

      toast({
        title: "Thành công ✨",
        description: `Đã tải lên "${result.document.title}" với ${result.chunksCount} đoạn văn bản`,
      });

      fetchDocuments();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể tải lên file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset input
      event.target.value = '';
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
              Hỗ trợ: .txt, .pdf, .docx (tối đa 50MB)
            </p>
            <label className="inline-block">
              <input
                type="file"
                accept=".txt,.pdf,.docx,.doc"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
              <Button
                disabled={isUploading}
                className="bg-divine-gold hover:bg-divine-gold/90 text-black font-cinzel"
                asChild
              >
                <span className="cursor-pointer flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  {isUploading ? 'Đang tải lên...' : 'Chọn file để tải lên'}
                </span>
              </Button>
            </label>
          </div>
        </div>

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
                  className="p-4 rounded-xl bg-card/50 border border-divine-gold/20 hover:border-divine-gold/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Sequential Number Badge */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-divine-gold/20 to-divine-celestial/20 border border-divine-gold/30 flex items-center justify-center">
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
