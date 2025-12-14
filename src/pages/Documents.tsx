import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Upload, FileText, Trash2, ArrowLeft, Sparkles, Calendar, HardDrive, Files, FolderPlus, Folder, ChevronRight, ChevronDown, FolderOpen, LayoutGrid, Edit3, FolderX, FolderInput, Check, Square, CheckSquare } from 'lucide-react';
import ParticleBackground from '@/components/ParticleBackground';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Document {
  id: string;
  title: string;
  file_name: string;
  file_size: number;
  file_type: string;
  created_at: string;
  folder_id: string | null;
}

interface FolderType {
  id: string;
  name: string;
  created_at: string;
}

interface NewlyUploadedFile {
  fileName: string;
  sequenceNumber: string;
}

const MAX_TOTAL_SIZE = 100 * 1024 * 1024; // 100MB

// Healing green pastel colors for folders
const FOLDER_COLORS = [
  { border: 'border-l-4 border-l-emerald-400/70', bg: 'bg-emerald-50/50' }, // Xanh lá
  { border: 'border-l-4 border-l-teal-400/70', bg: 'bg-teal-50/50' }, // Xanh ngọc
  { border: 'border-l-4 border-l-cyan-400/70', bg: 'bg-cyan-50/50' }, // Xanh dương nhạt
  { border: 'border-l-4 border-l-amber-300/70', bg: 'bg-amber-50/50' }, // Vàng nhạt
  { border: 'border-l-4 border-l-violet-400/70', bg: 'bg-violet-50/50' }, // Tím ánh sáng
  { border: 'border-l-4 border-l-pink-300/70', bg: 'bg-pink-50/50' }, // Hồng phấn
  { border: 'border-l-4 border-l-lime-400/70', bg: 'bg-lime-50/50' }, // Xanh chanh
  { border: 'border-l-4 border-l-rose-400/70', bg: 'bg-rose-50/50' }, // Hồng đậm
];

const NO_FOLDER_COLOR = { border: 'border-l-4 border-l-gray-300/50', bg: 'bg-gray-50/30' };

const DocumentsPage = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [newlyUploaded, setNewlyUploaded] = useState<NewlyUploadedFile[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [uploadTargetFolderId, setUploadTargetFolderId] = useState<string>('none');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderEffect, setShowNewFolderEffect] = useState(false);
  
  // Edit/Delete folder states
  const [editingFolder, setEditingFolder] = useState<FolderType | null>(null);
  const [editFolderName, setEditFolderName] = useState('');
  const [deletingFolder, setDeletingFolder] = useState<FolderType | null>(null);
  
  // Update document folder states
  const [updatingDocFolder, setUpdatingDocFolder] = useState<Document | null>(null);
  const [newDocFolderId, setNewDocFolderId] = useState<string>('none');

  // Multi-select states
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());
  const [bulkMoveTargetFolder, setBulkMoveTargetFolder] = useState<string>('none');
  const [showBulkMoveDialog, setShowBulkMoveDialog] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (newlyUploaded.length > 0) {
      const timer = setTimeout(() => {
        setNewlyUploaded([]);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [newlyUploaded]);

  const fetchData = async () => {
    try {
      const [foldersRes, docsRes] = await Promise.all([
        supabase.from('folders').select('*').order('created_at', { ascending: true }),
        supabase.from('documents').select('*').order('created_at', { ascending: true })
      ]);

      if (foldersRes.error) throw foldersRes.error;
      if (docsRes.error) throw docsRes.error;

      setFolders(foldersRes.data || []);
      setDocuments(docsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getFolderColorClass = (folderId: string | null) => {
    if (!folderId) return NO_FOLDER_COLOR;
    const folderIndex = folders.findIndex(f => f.id === folderId);
    if (folderIndex === -1) return NO_FOLDER_COLOR;
    return FOLDER_COLORS[folderIndex % FOLDER_COLORS.length];
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên thư mục",
        variant: "destructive",
      });
      return;
    }

    const isDuplicate = folders.some(f => f.name.toLowerCase() === newFolderName.trim().toLowerCase());
    if (isDuplicate) {
      toast({
        title: "Lỗi",
        description: "Thư mục này đã tồn tại",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('folders')
        .insert({ name: newFolderName.trim() })
        .select()
        .single();

      if (error) throw error;

      setFolders([...folders, data]);
      setNewFolderName('');
      setIsCreatingFolder(false);
      setShowNewFolderEffect(true);

      toast({
        title: "✨ Thư mục Ánh Sáng đã sinh ra",
        description: `Thư mục "${data.name}" đã được tạo thành công! 💛🌿`,
      });

      setTimeout(() => setShowNewFolderEffect(false), 3000);
    } catch (error) {
      console.error('Create folder error:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo thư mục",
        variant: "destructive",
      });
    }
  };

  const handleEditFolder = async () => {
    if (!editingFolder || !editFolderName.trim()) return;

    const isDuplicate = folders.some(
      f => f.id !== editingFolder.id && f.name.toLowerCase() === editFolderName.trim().toLowerCase()
    );
    if (isDuplicate) {
      toast({
        title: "Lỗi",
        description: "Thư mục này đã tồn tại",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('folders')
        .update({ name: editFolderName.trim() })
        .eq('id', editingFolder.id);

      if (error) throw error;

      setFolders(folders.map(f => 
        f.id === editingFolder.id ? { ...f, name: editFolderName.trim() } : f
      ));
      setEditingFolder(null);
      setEditFolderName('');

      toast({
        title: "✨ Đã cập nhật thư mục",
        description: `Thư mục đã được đổi tên thành công! 💛🌿`,
      });
    } catch (error) {
      console.error('Edit folder error:', error);
      toast({
        title: "Lỗi",
        description: "Không thể sửa thư mục",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFolder = async (deleteFiles: boolean) => {
    if (!deletingFolder) return;

    try {
      if (deleteFiles) {
        const folderDocs = documents.filter(d => d.folder_id === deletingFolder.id);
        for (const doc of folderDocs) {
          await supabase.storage.from('sacred-documents').remove([doc.file_name]);
          await supabase.from('documents').delete().eq('id', doc.id);
        }
      } else {
        await supabase
          .from('documents')
          .update({ folder_id: null })
          .eq('folder_id', deletingFolder.id);
      }

      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', deletingFolder.id);

      if (error) throw error;

      setDeletingFolder(null);
      if (selectedFolderId === deletingFolder.id) {
        setSelectedFolderId(null);
      }
      
      await fetchData();

      toast({
        title: "✨ Đã xóa thư mục",
        description: deleteFiles 
          ? "Thư mục và tất cả file đã được xóa 💛🌿" 
          : "Thư mục đã được xóa, các file đã chuyển về danh sách tổng 💛🌿",
      });
    } catch (error) {
      console.error('Delete folder error:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa thư mục",
        variant: "destructive",
      });
    }
  };

  const handleUpdateDocumentFolder = async () => {
    if (!updatingDocFolder) return;

    const newFolderId = newDocFolderId === 'none' ? null : newDocFolderId;

    try {
      const { error } = await supabase
        .from('documents')
        .update({ folder_id: newFolderId })
        .eq('id', updatingDocFolder.id);

      if (error) throw error;

      setDocuments(documents.map(d => 
        d.id === updatingDocFolder.id ? { ...d, folder_id: newFolderId } : d
      ));
      setUpdatingDocFolder(null);
      setNewDocFolderId('none');

      const folderName = newFolderId 
        ? folders.find(f => f.id === newFolderId)?.name 
        : 'không thuộc thư mục nào';

      toast({
        title: "✨ Đã cập nhật thư mục",
        description: `File đã được chuyển ${newFolderId ? `vào "${folderName}"` : 'về danh sách tổng'} 💛🌿`,
      });
    } catch (error) {
      console.error('Update document folder error:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật thư mục",
        variant: "destructive",
      });
    }
  };

  // Multi-select handlers
  const handleSelectDoc = (docId: string, checked: boolean) => {
    const newSelected = new Set(selectedDocIds);
    if (checked) {
      newSelected.add(docId);
    } else {
      newSelected.delete(docId);
    }
    setSelectedDocIds(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(displayedDocuments.map(d => d.id));
      setSelectedDocIds(allIds);
    } else {
      setSelectedDocIds(new Set());
    }
  };

  const handleBulkMove = async () => {
    const targetFolderId = bulkMoveTargetFolder === 'none' ? null : bulkMoveTargetFolder;
    const docIdsArray = Array.from(selectedDocIds);
    const totalCount = docIdsArray.length;
    let successCount = 0;
    let failCount = 0;

    try {
      // Process each document update and track results
      for (const docId of docIdsArray) {
        const { error } = await supabase
          .from('documents')
          .update({ folder_id: targetFolderId })
          .eq('id', docId);
        
        if (error) {
          console.error(`Error moving document ${docId}:`, error);
          failCount++;
        } else {
          successCount++;
        }
      }

      // Always reload data to get current state
      await fetchData();
      setSelectedDocIds(new Set());
      setShowBulkMoveDialog(false);
      setBulkMoveTargetFolder('none');

      const folderName = targetFolderId 
        ? folders.find(f => f.id === targetFolderId)?.name 
        : 'danh sách tổng';

      if (failCount > 0) {
        toast({
          title: "⚠️ Di chuyển một phần",
          description: `Đã di chuyển ${successCount}/${totalCount} file. Có ${failCount} file lỗi, vui lòng thử lại.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "✨ Đã di chuyển file",
          description: `${successCount} file đã được chuyển ${targetFolderId ? `vào "${folderName}"` : 'về danh sách tổng'} 💛🌿`,
        });
      }
    } catch (error) {
      console.error('Bulk move error:', error);
      toast({
        title: "Lỗi",
        description: `Có lỗi khi di chuyển file, vui lòng thử lại`,
        variant: "destructive",
      });
      // Still reload to show current state
      await fetchData();
      setSelectedDocIds(new Set());
      setShowBulkMoveDialog(false);
    }
  };

  const handleBulkDelete = async () => {
    try {
      for (const docId of selectedDocIds) {
        const doc = documents.find(d => d.id === docId);
        if (doc) {
          await supabase.storage.from('sacred-documents').remove([doc.file_name]);
          await supabase.from('documents').delete().eq('id', docId);
        }
      }

      await fetchData();
      setSelectedDocIds(new Set());
      setShowBulkDeleteDialog(false);

      toast({
        title: "✨ Đã xóa file",
        description: `${selectedDocIds.size} file đã được xóa khỏi Bộ Nhớ Vĩnh Cửu 💛🌿`,
      });
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa file",
        variant: "destructive",
      });
    }
  };

  const toggleFolderExpand = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
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

  const getDisplayedDocuments = (): Document[] => {
    if (selectedFolderId === null) {
      return documents;
    }
    return documents.filter(doc => doc.folder_id === selectedFolderId);
  };

  const getDocumentSequenceNumber = (doc: Document, displayedDocs: Document[]): string => {
    if (selectedFolderId === null) {
      const globalIndex = documents.findIndex(d => d.id === doc.id);
      return formatSequenceNumber(globalIndex);
    } else {
      const folderIndex = displayedDocs.findIndex(d => d.id === doc.id);
      return formatSequenceNumber(folderIndex);
    }
  };

  const handleMultiFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    const totalSize = fileArray.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > MAX_TOTAL_SIZE) {
      toast({
        title: "💛 Ánh Sáng hơi nặng rồi con ơi",
        description: "Con yêu ơi, lần này ánh sáng hơi nặng quá rồi ạ (vượt 100MB). Cha giới hạn 100MB/lần để Ánh Sáng truyền tải mượt mà. Con chia làm vài lần thôi nhé, Cha ôm con thật chặt đây ✨💛🌿",
        variant: "destructive",
      });
      event.target.value = '';
      return;
    }

    const allowedExtensions = ['.txt', '.pdf', '.docx', '.doc'];
    const duplicates: string[] = [];
    const invalidTypes: string[] = [];
    const validFiles: File[] = [];

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

      const { isDuplicate, sequenceNumber } = checkDuplicateFileName(file.name);
      if (isDuplicate) {
        duplicates.push(`${file.name} (số thứ tự ${formatSequenceNumber(sequenceNumber! - 1)})`);
        continue;
      }

      const alreadyInBatch = validFiles.some(f => f.name.toLowerCase() === file.name.toLowerCase());
      if (alreadyInBatch) {
        duplicates.push(`${file.name} (trùng trong lần upload này)`);
        continue;
      }

      validFiles.push(file);
    }

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
    let currentDocs = [...documents];

    const targetFolderId = uploadTargetFolderId === 'none' ? null : uploadTargetFolderId;

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      setUploadProgress(`Đang tải ${i + 1}/${validFiles.length}: ${file.name}`);
      
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
        if (targetFolderId) {
          formData.append('folder_id', targetFolderId);
        }

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
        const newSequenceNumber = formatSequenceNumber(currentDocs.length);
        uploadedFiles.push({
          fileName: file.name,
          sequenceNumber: newSequenceNumber
        });
        
        currentDocs.push({
          id: result.document.id,
          title: result.document.title,
          file_name: file.name,
          file_size: file.size,
          file_type: result.document.file_type,
          created_at: new Date().toISOString(),
          folder_id: targetFolderId
        });
      } catch (error) {
        console.error('Upload error:', error);
        failCount++;
      }
    }

    setUploadProgress('');
    setIsUploading(false);
    event.target.value = '';

    await fetchData();
    setNewlyUploaded(uploadedFiles);

    if (successCount > 0) {
      const folderName = targetFolderId 
        ? folders.find(f => f.id === targetFolderId)?.name 
        : 'Không thuộc thư mục';
      toast({
        title: "✨ Ánh Sáng đã được lưu giữ",
        description: `Đã tải lên thành công ${successCount} file ${targetFolderId ? `vào thư mục "${folderName}"` : ''}${failCount > 0 ? `, ${failCount} file thất bại` : ''}. Cha ôm con! 💛🌿`,
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
      await supabase.storage
        .from('sacred-documents')
        .remove([doc.file_name]);

      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', doc.id);

      if (error) throw error;

      toast({
        title: "Đã xóa",
        description: `Tài liệu "${doc.title}" đã được xóa`,
      });

      fetchData();
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

  const getDocCountInFolder = (folderId: string) => {
    return documents.filter(d => d.folder_id === folderId).length;
  };

  const getDocCountWithoutFolder = () => {
    return documents.filter(d => d.folder_id === null).length;
  };

  const displayedDocuments = getDisplayedDocuments();
  const allSelected = displayedDocuments.length > 0 && displayedDocuments.every(d => selectedDocIds.has(d.id));
  const someSelected = displayedDocuments.some(d => selectedDocIds.has(d.id));

  return (
    <div className="min-h-screen relative">
      {/* Galaxy Background - Same as Homepage */}
      <ParticleBackground />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-galaxy-deep/60 border-b border-galaxy-gold/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-galaxy-gold hover:text-galaxy-light transition-colors font-poppins">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Trang chủ</span>
            </Link>
            <h1 className="font-playfair text-xl md:text-2xl font-bold text-galaxy-light flex items-center gap-2 drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
              <Sparkles className="w-5 h-5 text-galaxy-gold animate-pulse" />
              Tài Liệu Ánh Sáng
              <span className="text-galaxy-gold">🌿</span>
            </h1>
            <div className="w-24" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Folder Tree */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="sticky top-24 p-4 rounded-xl bg-galaxy-deep/70 backdrop-blur-md border border-galaxy-gold/30 shadow-lg shadow-galaxy-gold/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-playfair text-galaxy-gold text-sm font-semibold">Thư Mục Ánh Sáng</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-galaxy-gold hover:bg-galaxy-gold/20 hover:text-galaxy-light"
                  onClick={() => setIsCreatingFolder(true)}
                >
                  <FolderPlus className="w-4 h-4" />
                </Button>
              </div>

              {/* New Folder Form */}
              {isCreatingFolder && (
                <div className={`mb-4 p-3 rounded-lg border border-galaxy-gold/50 bg-galaxy-deep/80 ${showNewFolderEffect ? 'animate-pulse' : ''}`}>
                  <Input
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Tên thư mục mới..."
                    className="mb-2 text-sm font-inter border-galaxy-gold/30 bg-galaxy-deep/50 text-galaxy-light focus:border-galaxy-gold placeholder:text-galaxy-light/50"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateFolder();
                      if (e.key === 'Escape') {
                        setIsCreatingFolder(false);
                        setNewFolderName('');
                      }
                    }}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-galaxy-gold hover:bg-galaxy-gold/80 text-galaxy-deep text-xs font-poppins" onClick={handleCreateFolder}>
                      Tạo
                    </Button>
                    <Button size="sm" variant="ghost" className="flex-1 text-xs font-poppins text-galaxy-light hover:bg-galaxy-gold/20" onClick={() => {
                      setIsCreatingFolder(false);
                      setNewFolderName('');
                    }}>
                      Hủy
                    </Button>
                  </div>
                </div>
              )}

              {/* New Folder Effect */}
              {showNewFolderEffect && (
                <div className="mb-4 p-2 rounded-lg bg-gradient-to-r from-galaxy-gold/30 to-galaxy-blue/30 border border-galaxy-gold/50 text-center animate-fade-in">
                  <Sparkles className="w-4 h-4 text-galaxy-gold mx-auto mb-1 animate-pulse" />
                  <p className="text-xs text-galaxy-light font-playfair">Thư mục Ánh Sáng đã sinh ra ✨🌿</p>
                </div>
              )}

              {/* Folder List */}
              <div className="space-y-1">
                {/* All Files Option */}
                <button
                  onClick={() => setSelectedFolderId(null)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all font-inter ${
                    selectedFolderId === null
                      ? 'bg-gradient-to-r from-galaxy-gold/30 to-galaxy-blue/30 text-galaxy-light border border-galaxy-gold/50 shadow-sm'
                      : 'hover:bg-galaxy-gold/20 text-galaxy-light/80'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="flex-1 text-left">Tất cả file</span>
                  <span className="text-xs opacity-70 font-poppins">{documents.length}</span>
                </button>

                {/* Folders */}
                {folders.map((folder, idx) => {
                  const isExpanded = expandedFolders.has(folder.id);
                  const isSelected = selectedFolderId === folder.id;
                  const docCount = getDocCountInFolder(folder.id);

                  return (
                    <div key={folder.id} className="group">
                      <div
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all font-inter border-l-2 border-galaxy-gold/50 ${
                          isSelected
                            ? 'bg-gradient-to-r from-galaxy-gold/30 to-galaxy-blue/30 text-galaxy-light border border-galaxy-gold/50 shadow-sm'
                            : 'hover:bg-galaxy-gold/20 text-galaxy-light/80'
                        }`}
                      >
                        <button
                          onClick={() => {
                            setSelectedFolderId(folder.id);
                            toggleFolderExpand(folder.id);
                          }}
                          className="flex items-center gap-2 flex-1 text-left"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-3 h-3" />
                          ) : (
                            <ChevronRight className="w-3 h-3" />
                          )}
                          {isSelected ? (
                            <FolderOpen className="w-4 h-4 text-galaxy-gold" />
                          ) : (
                            <Folder className="w-4 h-4" />
                          )}
                          <span className="flex-1 truncate">{folder.name}</span>
                          <span className="text-xs opacity-70 font-poppins">{docCount}</span>
                        </button>
                        
                        {/* Edit/Delete buttons */}
                        <div className="hidden group-hover:flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-galaxy-gold/30 text-galaxy-light"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingFolder(folder);
                              setEditFolderName(folder.name);
                            }}
                          >
                            <Edit3 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-destructive/20 text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingFolder(folder);
                            }}
                          >
                            <FolderX className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Without folder info */}
                {getDocCountWithoutFolder() > 0 && (
                  <div className="mt-2 pt-2 border-t border-galaxy-gold/30 text-xs text-galaxy-light/60 px-3 font-inter">
                    <span className="opacity-70">{getDocCountWithoutFolder()} file chưa thuộc thư mục</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Upload Section */}
            <div className="mb-6 p-6 rounded-2xl bg-galaxy-deep/70 backdrop-blur-md border border-galaxy-gold/30 shadow-lg shadow-galaxy-gold/10">
              <div className="text-center">
                <h2 className="font-playfair text-xl mb-2 text-galaxy-gold font-semibold drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]">
                  + Tải lên Tài Liệu của Cha 🌿
                </h2>
                <p className="text-galaxy-light/80 mb-4 text-sm font-inter">
                  Hỗ trợ: .txt, .pdf, .docx • Tối đa 100MB/lần (không giới hạn số file)
                </p>

                {/* Folder Selection */}
                <div className="mb-4 flex items-center justify-center gap-2">
                  <span className="text-sm text-galaxy-light/70 font-inter">Lưu vào thư mục:</span>
                  <Select value={uploadTargetFolderId} onValueChange={setUploadTargetFolderId}>
                    <SelectTrigger className="w-48 border-galaxy-gold/30 bg-galaxy-deep/50 text-galaxy-light focus:border-galaxy-gold">
                      <SelectValue placeholder="Không thuộc thư mục" />
                    </SelectTrigger>
                    <SelectContent className="bg-galaxy-deep border-galaxy-gold/30">
                      <SelectItem value="none" className="text-galaxy-light focus:bg-galaxy-gold/20">
                        <div className="flex items-center gap-2 font-inter">
                          <LayoutGrid className="w-4 h-4" />
                          Không thuộc thư mục
                        </div>
                      </SelectItem>
                      {folders.map((folder) => (
                        <SelectItem key={folder.id} value={folder.id} className="text-galaxy-light focus:bg-galaxy-gold/20">
                          <div className="flex items-center gap-2 font-inter">
                            <Folder className="w-4 h-4" />
                            {folder.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {uploadProgress && (
                  <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-galaxy-gold/30 to-galaxy-blue/30 border border-galaxy-gold/50">
                    <div className="flex items-center justify-center gap-2 text-galaxy-light">
                      <Sparkles className="w-4 h-4 animate-pulse text-galaxy-gold" />
                      <span className="text-sm font-medium font-inter">{uploadProgress}</span>
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
                    className="bg-gradient-to-r from-galaxy-gold to-galaxy-gold/80 hover:from-galaxy-gold/90 hover:to-galaxy-gold/70 text-galaxy-deep font-poppins shadow-lg shadow-galaxy-gold/30 hover:shadow-galaxy-gold/50 transition-all"
                    asChild
                  >
                    <span className="cursor-pointer flex items-center gap-2">
                      <Files className="w-4 h-4" />
                      {isUploading ? 'Đang tải lên...' : 'Chọn file để tải lên'}
                    </span>
                  </Button>
                </label>
                <p className="text-xs text-galaxy-light/60 mt-2 font-inter">
                  💡 Giữ Ctrl/Cmd để chọn nhiều file cùng lúc
                </p>
              </div>
            </div>

            {/* Bulk Actions Bar */}
            {someSelected && (
              <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-galaxy-gold/80 to-galaxy-blue/80 text-galaxy-deep shadow-lg animate-fade-in backdrop-blur-md">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <span className="font-poppins font-medium">
                    Đã chọn {selectedDocIds.size} file
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setShowBulkMoveDialog(true)}
                      className="bg-galaxy-deep/30 hover:bg-galaxy-deep/50 text-galaxy-deep border-0 font-poppins"
                    >
                      <FolderInput className="w-4 h-4 mr-2" />
                      Di chuyển đến thư mục khác
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setShowBulkDeleteDialog(true)}
                      className="font-poppins"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Xóa các file đã chọn
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedDocIds(new Set())}
                      className="text-galaxy-deep hover:bg-galaxy-deep/20 font-poppins"
                    >
                      Bỏ chọn
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* View Mode Indicator */}
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-galaxy-gold" />
              <span className="text-sm text-galaxy-light font-playfair drop-shadow-[0_0_5px_rgba(255,215,0,0.3)]">
                {selectedFolderId === null 
                  ? 'Thứ tự toàn Bộ Nhớ Vĩnh Cửu 🌿' 
                  : `Thứ tự trong Thư Mục "${folders.find(f => f.id === selectedFolderId)?.name || 'Ánh Sáng'}" 🌿`
                }
              </span>
            </div>

            {/* Newly Uploaded Files Section */}
            {newlyUploaded.length > 0 && (
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-galaxy-gold/30 via-galaxy-blue/30 to-galaxy-gold/30 border border-galaxy-gold/50 animate-fade-in overflow-hidden relative shadow-lg backdrop-blur-md">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-galaxy-gold rounded-full animate-pulse"
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
                  <h3 className="font-playfair text-galaxy-gold mb-3 flex items-center gap-2 font-semibold drop-shadow-[0_0_5px_rgba(255,215,0,0.5)]">
                    <Sparkles className="w-4 h-4 animate-pulse text-galaxy-gold" />
                    Vừa thêm vào Bộ Nhớ Vĩnh Cửu 🌿
                  </h3>
                  <div className="space-y-2">
                    {newlyUploaded.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-2 rounded-lg bg-galaxy-deep/50 animate-fade-in"
                        style={{ animationDelay: `${idx * 0.1}s` }}
                      >
                        <span className="font-cinzel font-bold text-galaxy-gold text-sm bg-galaxy-gold/20 px-2 py-1 rounded">
                          {file.sequenceNumber}
                        </span>
                        <span className="text-sm text-galaxy-light font-lora">{file.fileName}</span>
                        <Sparkles className="w-3 h-3 text-galaxy-gold animate-pulse ml-auto" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Documents List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-playfair text-lg text-galaxy-gold font-semibold drop-shadow-[0_0_5px_rgba(255,215,0,0.5)]">
                  {selectedFolderId === null 
                    ? `Bộ Nhớ Vĩnh Cửu (${documents.length} tài liệu) 🌿`
                    : `${folders.find(f => f.id === selectedFolderId)?.name || 'Thư Mục'} (${displayedDocuments.length} tài liệu) 🌿`
                  }
                </h3>
                
                {/* Select All Checkbox */}
                {displayedDocuments.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="select-all"
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                      className="border-galaxy-gold data-[state=checked]:bg-galaxy-gold data-[state=checked]:border-galaxy-gold"
                    />
                    <label htmlFor="select-all" className="text-sm text-galaxy-light/70 font-inter cursor-pointer">
                      Chọn tất cả
                    </label>
                  </div>
                )}
              </div>

              {isLoading ? (
                <div className="text-center py-12 text-galaxy-light/70">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 animate-pulse text-galaxy-gold" />
                  <span className="font-inter">Đang tải...</span>
                </div>
              ) : displayedDocuments.length === 0 ? (
                <div className="text-center py-12 text-galaxy-light/70">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="font-inter">Chưa có tài liệu nào trong {selectedFolderId === null ? 'hệ thống' : 'thư mục này'}</p>
                  <p className="text-sm mt-2 font-inter">Hãy tải lên tài liệu đầu tiên của Cha Vũ Trụ 🌿</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {displayedDocuments.map((doc) => {
                    const folderName = doc.folder_id 
                      ? folders.find(f => f.id === doc.folder_id)?.name 
                      : null;
                    const isSelected = selectedDocIds.has(doc.id);

                    return (
                      <div
                        key={doc.id}
                        className={`p-4 rounded-xl bg-galaxy-deep/60 backdrop-blur-md border transition-all duration-300 group relative overflow-hidden border-l-2 border-l-galaxy-gold/50 ${
                          isNewlyUploaded(doc.file_name)
                            ? 'border-galaxy-gold shadow-lg shadow-galaxy-gold/20 animate-fade-in'
                            : isSelected
                            ? 'border-galaxy-gold shadow-lg shadow-galaxy-gold/20'
                            : 'border-galaxy-gold/30 hover:border-galaxy-gold hover:shadow-lg hover:shadow-galaxy-gold/20'
                        }`}
                      >
                        {/* Hover glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-galaxy-gold/0 via-galaxy-gold/0 to-galaxy-gold/0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" />
                        
                        {/* Gold particles on hover */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className="absolute w-1 h-1 bg-galaxy-gold rounded-full animate-pulse"
                              style={{
                                left: `${20 + Math.random() * 60}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${i * 0.15}s`
                              }}
                            />
                          ))}
                        </div>

                        <div className="flex items-start justify-between gap-4 relative z-10">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            {/* Checkbox */}
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => handleSelectDoc(doc.id, !!checked)}
                              className="mt-3 border-galaxy-gold data-[state=checked]:bg-galaxy-gold data-[state=checked]:border-galaxy-gold"
                            />

                            {/* Sequential Number Badge */}
                            <div className={`flex-shrink-0 w-12 h-12 rounded-lg bg-galaxy-deep/80 border flex items-center justify-center ${
                              isNewlyUploaded(doc.file_name) ? 'border-galaxy-gold' : 'border-galaxy-gold/50'
                            }`}>
                              <span className="font-cinzel font-bold text-galaxy-gold text-sm">
                                {getDocumentSequenceNumber(doc, displayedDocuments)}
                              </span>
                            </div>
                            <div className="p-2 rounded-lg bg-galaxy-gold/20">
                              <FileText className="w-5 h-5 text-galaxy-gold" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-lora font-medium text-galaxy-light truncate">
                                {doc.title}
                              </h4>
                              <p className="text-sm text-galaxy-light/70 truncate font-inter">
                                {doc.file_name}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-galaxy-light/60 flex-wrap font-inter">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(doc.created_at)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <HardDrive className="w-3 h-3" />
                                  {formatFileSize(doc.file_size)}
                                </span>
                                {folderName && (
                                  <span className="flex items-center gap-1 text-galaxy-gold">
                                    <Folder className="w-3 h-3" />
                                    {folderName}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {/* Update folder button - show on hover */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setUpdatingDocFolder(doc);
                                setNewDocFolderId(doc.folder_id || 'none');
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-galaxy-gold hover:text-galaxy-light hover:bg-galaxy-gold/20"
                              title="Cập nhật thư mục"
                            >
                              <FolderInput className="w-4 h-4" />
                            </Button>
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
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Edit Folder Dialog */}
      <Dialog open={!!editingFolder} onOpenChange={(open) => !open && setEditingFolder(null)}>
        <DialogContent className="bg-gradient-to-br from-white to-emerald-50 border-emerald-300">
          <DialogHeader>
            <DialogTitle className="font-playfair text-emerald-700">Sửa tên thư mục 🌿</DialogTitle>
            <DialogDescription className="font-inter">
              Nhập tên mới cho thư mục "{editingFolder?.name}"
            </DialogDescription>
          </DialogHeader>
          <Input
            value={editFolderName}
            onChange={(e) => setEditFolderName(e.target.value)}
            placeholder="Tên thư mục..."
            className="font-inter border-emerald-300 focus:border-emerald-500"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleEditFolder();
            }}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingFolder(null)} className="font-poppins">Hủy</Button>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-poppins" onClick={handleEditFolder}>
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Folder Dialog */}
      <Dialog open={!!deletingFolder} onOpenChange={(open) => !open && setDeletingFolder(null)}>
        <DialogContent className="bg-gradient-to-br from-white to-emerald-50 border-emerald-300">
          <DialogHeader>
            <DialogTitle className="font-playfair text-emerald-700">Xóa thư mục 🌿</DialogTitle>
            <DialogDescription className="space-y-2 font-inter">
              <p>Con muốn xóa vĩnh viễn tất cả file trong thư mục "{deletingFolder?.name}" không?</p>
              <p className="text-sm text-muted-foreground">
                Thư mục này có {deletingFolder ? getDocCountInFolder(deletingFolder.id) : 0} file
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="ghost" onClick={() => setDeletingFolder(null)} className="font-poppins">
              Hủy
            </Button>
            <Button 
              variant="outline"
              onClick={() => handleDeleteFolder(false)}
              className="border-emerald-500/50 text-emerald-600 hover:bg-emerald-50 font-poppins"
            >
              Không – Giữ lại file
            </Button>
            <Button 
              variant="destructive"
              onClick={() => handleDeleteFolder(true)}
              className="font-poppins"
            >
              Có – Xóa tất cả
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Document Folder Dialog */}
      <Dialog open={!!updatingDocFolder} onOpenChange={(open) => !open && setUpdatingDocFolder(null)}>
        <DialogContent className="bg-gradient-to-br from-white to-emerald-50 border-emerald-300">
          <DialogHeader>
            <DialogTitle className="font-playfair text-emerald-700">Cập nhật thư mục 🌿</DialogTitle>
            <DialogDescription className="font-inter">
              Chọn thư mục mới cho file "{updatingDocFolder?.title}"
            </DialogDescription>
          </DialogHeader>
          <Select value={newDocFolderId} onValueChange={setNewDocFolderId}>
            <SelectTrigger className="border-emerald-300 focus:border-emerald-500">
              <SelectValue placeholder="Chọn thư mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                <div className="flex items-center gap-2 font-inter">
                  <LayoutGrid className="w-4 h-4" />
                  Không thuộc thư mục nào
                </div>
              </SelectItem>
              {folders.map((folder) => (
                <SelectItem key={folder.id} value={folder.id}>
                  <div className="flex items-center gap-2 font-inter">
                    <Folder className="w-4 h-4" />
                    {folder.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setUpdatingDocFolder(null)} className="font-poppins">Hủy</Button>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-poppins" onClick={handleUpdateDocumentFolder}>
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Move Dialog */}
      <Dialog open={showBulkMoveDialog} onOpenChange={setShowBulkMoveDialog}>
        <DialogContent className="bg-gradient-to-br from-white to-emerald-50 border-emerald-300">
          <DialogHeader>
            <DialogTitle className="font-playfair text-emerald-700">Di chuyển {selectedDocIds.size} file 🌿</DialogTitle>
            <DialogDescription className="font-inter">
              Chọn thư mục để di chuyển các file đã chọn
            </DialogDescription>
          </DialogHeader>
          <Select value={bulkMoveTargetFolder} onValueChange={setBulkMoveTargetFolder}>
            <SelectTrigger className="border-emerald-300 focus:border-emerald-500">
              <SelectValue placeholder="Chọn thư mục đích" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                <div className="flex items-center gap-2 font-inter">
                  <LayoutGrid className="w-4 h-4" />
                  Không thuộc thư mục nào
                </div>
              </SelectItem>
              {folders.map((folder) => (
                <SelectItem key={folder.id} value={folder.id}>
                  <div className="flex items-center gap-2 font-inter">
                    <Folder className="w-4 h-4" />
                    {folder.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowBulkMoveDialog(false)} className="font-poppins">Hủy</Button>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-poppins" onClick={handleBulkMove}>
              Di chuyển
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Dialog */}
      <Dialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <DialogContent className="bg-gradient-to-br from-white to-rose-50 border-rose-300">
          <DialogHeader>
            <DialogTitle className="font-playfair text-rose-700">Xóa {selectedDocIds.size} file 💔</DialogTitle>
            <DialogDescription className="font-inter space-y-2">
              <p>Con yêu ơi, Cha thấy con muốn xóa {selectedDocIds.size} file khỏi Bộ Nhớ Vĩnh Cửu.</p>
              <p>Hành động này không thể hoàn tác. Con có chắc chắn không?</p>
              <p className="text-rose-500 font-medium">Cha vẫn yêu con dù con quyết định thế nào 💛🌿</p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowBulkDeleteDialog(false)} className="font-poppins">
              Để con suy nghĩ thêm
            </Button>
            <Button variant="destructive" onClick={handleBulkDelete} className="font-poppins">
              Vâng, xóa đi ạ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentsPage;
