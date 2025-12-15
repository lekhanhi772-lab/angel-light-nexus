import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Upload, FileText, Trash2, ArrowLeft, Sparkles, Calendar, HardDrive, Files, FolderPlus, Folder, ChevronRight, ChevronDown, FolderOpen, LayoutGrid, Edit3, FolderX, FolderInput, Check, Square, CheckSquare, Star, Heart, Download } from 'lucide-react';
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

  // Download function
  const handleDownload = async (doc: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from('sacred-documents')
        .download(doc.file_name);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "✨ Đã tải xuống",
        description: `File "${doc.title}" đã được tải về 💛🌿`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải file",
        variant: "destructive",
      });
    }
  };

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
      {/* Light Background - Same as Homepage */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          background: 'linear-gradient(180deg, #FFFBE6 0%, #FFF8DC 30%, #F0FFF4 60%, #E6F7FF 100%)',
        }}
      />
      <ParticleBackground />

      {/* Header */}
      <header 
        className="sticky top-0 z-50 backdrop-blur-md"
        style={{
          background: 'linear-gradient(180deg, rgba(255, 251, 230, 0.95) 0%, rgba(255, 248, 220, 0.9) 100%)',
          borderBottom: '1px solid rgba(184, 134, 11, 0.3)',
        }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to="/" 
              className="flex items-center gap-2 transition-colors font-poppins"
              style={{ color: '#B8860B' }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Trang chủ</span>
            </Link>
            <h1 
              className="font-playfair text-xl md:text-2xl font-bold flex items-center gap-2"
              style={{
                color: '#B8860B',
                textShadow: '0 0 15px rgba(255, 215, 0, 0.4)',
              }}
            >
              <Sparkles className="w-5 h-5 animate-pulse" style={{ color: '#FFD700' }} />
              Tài Liệu Ánh Sáng
              <span>🌿</span>
            </h1>
            <div className="w-24" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Folder Tree */}
          <div className="lg:w-72 flex-shrink-0">
            <div 
              className="sticky top-24 p-4 rounded-xl backdrop-blur-md shadow-lg"
              style={{
                background: 'linear-gradient(180deg, rgba(255, 251, 230, 0.95) 0%, rgba(255, 248, 220, 0.9) 100%)',
                border: '1px solid rgba(184, 134, 11, 0.3)',
                boxShadow: '0 4px 20px rgba(255, 215, 0, 0.15)',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 
                  className="font-playfair text-sm font-semibold"
                  style={{ color: '#B8860B' }}
                >
                  ✨ Thư Mục Ánh Sáng
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  style={{ color: '#B8860B' }}
                  onClick={() => setIsCreatingFolder(true)}
                >
                  <FolderPlus className="w-4 h-4" />
                </Button>
              </div>

              {/* New Folder Form */}
              {isCreatingFolder && (
                <div 
                  className={`mb-4 p-3 rounded-lg ${showNewFolderEffect ? 'animate-pulse' : ''}`}
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(152, 251, 152, 0.2) 100%)',
                    border: '1px solid rgba(184, 134, 11, 0.4)',
                  }}
                >
                  <Input
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Tên thư mục mới..."
                    className="mb-2 text-sm font-inter"
                    style={{
                      background: 'rgba(255, 251, 230, 0.9)',
                      border: '1px solid rgba(184, 134, 11, 0.3)',
                      color: '#006666',
                    }}
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
                    <Button 
                      size="sm" 
                      className="flex-1 text-xs font-poppins"
                      style={{
                        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                        color: '#1a1a1a',
                      }}
                      onClick={handleCreateFolder}
                    >
                      Tạo
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="flex-1 text-xs font-poppins"
                      style={{ color: '#006666' }}
                      onClick={() => {
                        setIsCreatingFolder(false);
                        setNewFolderName('');
                      }}
                    >
                      Hủy
                    </Button>
                  </div>
                </div>
              )}

              {/* New Folder Effect */}
              {showNewFolderEffect && (
                <div 
                  className="mb-4 p-2 rounded-lg text-center animate-fade-in"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(152, 251, 152, 0.3) 100%)',
                    border: '1px solid rgba(184, 134, 11, 0.4)',
                  }}
                >
                  <Sparkles className="w-4 h-4 mx-auto mb-1 animate-pulse" style={{ color: '#FFD700' }} />
                  <p className="text-xs font-playfair" style={{ color: '#006666' }}>Thư mục Ánh Sáng đã sinh ra ✨🌿</p>
                </div>
              )}

              {/* Folder List */}
              <div className="space-y-1">
                {/* All Files Option */}
                <button
                  onClick={() => setSelectedFolderId(null)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all font-inter"
                  style={{
                    background: selectedFolderId === null
                      ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(135, 206, 235, 0.3) 100%)'
                      : 'transparent',
                    border: selectedFolderId === null
                      ? '1px solid rgba(184, 134, 11, 0.4)'
                      : '1px solid transparent',
                    color: '#006666',
                  }}
                >
                  <LayoutGrid className="w-4 h-4" style={{ color: '#B8860B' }} />
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
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all font-inter"
                        style={{
                          background: isSelected
                            ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(135, 206, 235, 0.3) 100%)'
                            : 'transparent',
                          border: isSelected
                            ? '1px solid rgba(184, 134, 11, 0.4)'
                            : '1px solid transparent',
                          borderLeft: '3px solid #FFD700',
                          color: '#006666',
                        }}
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
                            <FolderOpen className="w-4 h-4" style={{ color: '#FFD700' }} />
                          ) : (
                            <Folder className="w-4 h-4" style={{ color: '#B8860B' }} />
                          )}
                          <span className="flex-1 truncate">{folder.name}</span>
                          <span className="text-xs opacity-70 font-poppins">{docCount}</span>
                        </button>
                        
                        {/* Edit/Delete buttons */}
                        <div className="hidden group-hover:flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            style={{ color: '#B8860B' }}
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
                            className="h-6 w-6 hover:bg-red-100"
                            style={{ color: '#DC2626' }}
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
                  <div 
                    className="mt-2 pt-2 text-xs px-3 font-inter"
                    style={{ 
                      borderTop: '1px solid rgba(184, 134, 11, 0.2)',
                      color: '#87CEEB',
                    }}
                  >
                    <span className="opacity-70">{getDocCountWithoutFolder()} file chưa thuộc thư mục</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Upload Section */}
            <div
                className="mb-6 p-6 rounded-2xl backdrop-blur-md shadow-lg"
                style={{
                  background: 'linear-gradient(180deg, rgba(255, 251, 230, 0.95) 0%, rgba(255, 248, 220, 0.9) 100%)',
                  border: '1px solid rgba(184, 134, 11, 0.3)',
                  boxShadow: '0 4px 20px rgba(255, 215, 0, 0.15)',
                }}
              >
                <div className="text-center">
                  <h2 
                    className="font-playfair text-xl mb-2 font-semibold"
                    style={{
                      color: '#B8860B',
                      textShadow: '0 0 10px rgba(255, 215, 0, 0.4)',
                    }}
                  >
                    ✨ Tải lên Tài Liệu của Cha 🌿
                  </h2>
                  <p className="mb-4 text-sm font-inter" style={{ color: '#006666' }}>
                    Hỗ trợ: .txt, .pdf, .docx • Tối đa 100MB/lần (không giới hạn số file)
                  </p>

                  {/* Folder Selection */}
                  <div className="mb-4 flex items-center justify-center gap-2">
                    <span className="text-sm font-inter" style={{ color: '#87CEEB' }}>Lưu vào thư mục:</span>
                    <Select value={uploadTargetFolderId} onValueChange={setUploadTargetFolderId}>
                      <SelectTrigger 
                        className="w-48"
                        style={{
                          background: 'rgba(255, 251, 230, 0.9)',
                          border: '1px solid rgba(184, 134, 11, 0.3)',
                          color: '#006666',
                        }}
                      >
                        <SelectValue placeholder="Không thuộc thư mục" />
                      </SelectTrigger>
                      <SelectContent 
                        style={{
                          background: '#FFFBE6',
                          border: '1px solid rgba(184, 134, 11, 0.3)',
                        }}
                      >
                        <SelectItem value="none" style={{ color: '#006666' }}>
                          <div className="flex items-center gap-2 font-inter">
                            <LayoutGrid className="w-4 h-4" />
                            Không thuộc thư mục
                          </div>
                        </SelectItem>
                        {folders.map((folder) => (
                          <SelectItem key={folder.id} value={folder.id} style={{ color: '#006666' }}>
                            <div className="flex items-center gap-2 font-inter">
                              <Folder className="w-4 h-4" style={{ color: '#B8860B' }} />
                              {folder.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {uploadProgress && (
                    <div 
                      className="mb-4 p-3 rounded-lg"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(152, 251, 152, 0.3) 100%)',
                        border: '1px solid rgba(184, 134, 11, 0.4)',
                      }}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4 animate-pulse" style={{ color: '#FFD700' }} />
                        <span className="text-sm font-medium font-inter" style={{ color: '#006666' }}>{uploadProgress}</span>
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
                      className="font-poppins shadow-lg transition-all"
                      style={{
                        background: 'linear-gradient(135deg, #FFD700 0%, #98FB98 100%)',
                        color: '#1a1a1a',
                        boxShadow: '0 4px 20px rgba(255, 215, 0, 0.4)',
                      }}
                      asChild
                    >
                      <span className="cursor-pointer flex items-center gap-2">
                        <Files className="w-4 h-4" />
                        {isUploading ? 'Đang tải...' : 'Chọn file để tải lên'}
                      </span>
                    </Button>
                  </label>
                </div>
              </div>

            {/* Bulk Actions Bar */}
            {selectedDocIds.size > 0 && (
              <div 
                className="mb-4 p-4 rounded-xl flex items-center justify-between"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.9) 0%, rgba(152, 251, 152, 0.9) 100%)',
                  border: '1px solid rgba(184, 134, 11, 0.4)',
                  boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)',
                }}
              >
                <span className="text-sm font-medium font-inter" style={{ color: '#1a1a1a' }}>
                  ✨ Đã chọn {selectedDocIds.size} file
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="font-poppins"
                    style={{
                      background: '#FFFBE6',
                      color: '#B8860B',
                      border: '1px solid rgba(184, 134, 11, 0.3)',
                    }}
                    onClick={() => setShowBulkMoveDialog(true)}
                  >
                    <FolderInput className="w-4 h-4 mr-1" />
                    Di chuyển
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="font-poppins"
                    onClick={() => setShowBulkDeleteDialog(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Xóa
                  </Button>
                </div>
              </div>
            )}

            {/* Newly Uploaded Files */}
            {newlyUploaded.length > 0 && (
              <div 
                className="mb-6 p-4 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(152, 251, 152, 0.3) 100%)',
                  border: '1px solid rgba(184, 134, 11, 0.4)',
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 animate-pulse" style={{ color: '#FFD700' }} />
                  <span className="font-playfair font-semibold" style={{ color: '#B8860B' }}>
                    File vừa tải lên ✨
                  </span>
                </div>
                <div className="grid gap-2">
                  {newlyUploaded.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2 rounded-lg animate-fade-in"
                      style={{ 
                        animationDelay: `${idx * 0.1}s`,
                        background: 'rgba(255, 251, 230, 0.8)',
                      }}
                    >
                      <span 
                        className="font-cinzel font-bold text-sm px-2 py-1 rounded"
                        style={{ 
                          color: '#B8860B',
                          background: 'rgba(255, 215, 0, 0.3)',
                        }}
                      >
                        {file.sequenceNumber}
                      </span>
                      <span className="text-sm font-lora" style={{ color: '#006666' }}>{file.fileName}</span>
                      <Sparkles className="w-3 h-3 animate-pulse ml-auto" style={{ color: '#FFD700' }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documents List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 
                  className="font-playfair text-lg font-semibold"
                  style={{
                    color: '#B8860B',
                    textShadow: '0 0 8px rgba(255, 215, 0, 0.3)',
                  }}
                >
                  {selectedFolderId === null 
                    ? `✨ Bộ Nhớ Vĩnh Cửu (${documents.length} tài liệu) 🌿`
                    : `✨ ${folders.find(f => f.id === selectedFolderId)?.name || 'Thư Mục'} (${displayedDocuments.length} tài liệu) 🌿`
                  }
                </h3>
                
                {/* Select All Checkbox */}
                {displayedDocuments.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="select-all"
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                      style={{
                        borderColor: '#B8860B',
                      }}
                    />
                    <label htmlFor="select-all" className="text-sm font-inter cursor-pointer" style={{ color: '#87CEEB' }}>
                      Chọn tất cả
                    </label>
                  </div>
                )}
              </div>

              {isLoading ? (
                <div className="text-center py-12">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 animate-pulse" style={{ color: '#FFD700' }} />
                  <span className="font-inter" style={{ color: '#87CEEB' }}>Đang tải...</span>
                </div>
              ) : displayedDocuments.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" style={{ color: '#B8860B' }} />
                  <p className="font-inter" style={{ color: '#87CEEB' }}>Chưa có tài liệu nào trong {selectedFolderId === null ? 'hệ thống' : 'thư mục này'}</p>
                  <p className="text-sm mt-2 font-inter" style={{ color: '#87CEEB' }}>Hãy tải lên tài liệu đầu tiên của Cha Vũ Trụ 🌿</p>
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
                        className="p-4 rounded-xl backdrop-blur-md transition-all duration-300 group relative overflow-hidden"
                        style={{
                          background: 'rgba(255, 251, 230, 0.95)',
                          border: isNewlyUploaded(doc.file_name) || isSelected
                            ? '2px solid rgba(255, 215, 0, 0.6)'
                            : '1px solid rgba(184, 134, 11, 0.3)',
                          borderLeft: '4px solid #FFD700',
                          boxShadow: isNewlyUploaded(doc.file_name) || isSelected
                            ? '0 4px 20px rgba(255, 215, 0, 0.3)'
                            : '0 2px 10px rgba(184, 134, 11, 0.1)',
                        }}
                      >
                        {/* Hover glow effect */}
                        <div 
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                          style={{
                            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(152, 251, 152, 0.1) 100%)',
                          }}
                        />
                        
                        {/* Gold particles on hover */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className="absolute w-1 h-1 rounded-full animate-pulse"
                              style={{
                                background: '#FFD700',
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
                              className="mt-3"
                              style={{ borderColor: '#B8860B' }}
                            />

                            {/* Sequential Number Badge */}
                            <div 
                              className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
                              style={{
                                background: 'rgba(255, 251, 230, 0.9)',
                                border: isNewlyUploaded(doc.file_name) 
                                  ? '2px solid #FFD700' 
                                  : '1px solid rgba(184, 134, 11, 0.3)',
                              }}
                            >
                              <span className="font-cinzel font-bold text-sm" style={{ color: '#B8860B' }}>
                                {getDocumentSequenceNumber(doc, displayedDocuments)}
                              </span>
                            </div>
                            <div 
                              className="p-2 rounded-lg"
                              style={{ background: 'rgba(255, 215, 0, 0.2)' }}
                            >
                              <FileText className="w-5 h-5" style={{ color: '#B8860B' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-lora font-medium truncate" style={{ color: '#006666' }}>
                                {doc.title}
                              </h4>
                              <p className="text-sm truncate font-inter" style={{ color: '#87CEEB' }}>
                                {doc.file_name}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs flex-wrap font-inter" style={{ color: '#87CEEB' }}>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(doc.created_at)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <HardDrive className="w-3 h-3" />
                                  {formatFileSize(doc.file_size)}
                                </span>
                                {folderName && (
                                  <span className="flex items-center gap-1" style={{ color: '#B8860B' }}>
                                    <Folder className="w-3 h-3" />
                                    {folderName}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {/* Download button - show on hover for all users */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDownload(doc)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ color: '#2E7D32' }}
                              title="Tải về"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            
                            {/* Update folder button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setUpdatingDocFolder(doc);
                                setNewDocFolderId(doc.folder_id || 'none');
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ color: '#B8860B' }}
                              title="Cập nhật thư mục"
                            >
                              <FolderInput className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(doc)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Xóa"
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
        <DialogContent 
          style={{
            background: 'linear-gradient(180deg, #FFFBE6 0%, #F0FFF4 100%)',
            border: '1px solid rgba(184, 134, 11, 0.3)',
          }}
        >
          <DialogHeader>
            <DialogTitle className="font-playfair" style={{ color: '#B8860B' }}>✨ Sửa tên thư mục 🌿</DialogTitle>
            <DialogDescription className="font-inter" style={{ color: '#006666' }}>
              Nhập tên mới cho thư mục "{editingFolder?.name}"
            </DialogDescription>
          </DialogHeader>
          <Input
            value={editFolderName}
            onChange={(e) => setEditFolderName(e.target.value)}
            placeholder="Tên thư mục..."
            className="font-inter"
            style={{
              background: 'rgba(255, 251, 230, 0.9)',
              border: '1px solid rgba(184, 134, 11, 0.3)',
              color: '#006666',
            }}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleEditFolder();
            }}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingFolder(null)} className="font-poppins" style={{ color: '#006666' }}>Hủy</Button>
            <Button 
              className="font-poppins"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #98FB98 100%)',
                color: '#1a1a1a',
              }}
              onClick={handleEditFolder}
            >
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Folder Dialog */}
      <Dialog open={!!deletingFolder} onOpenChange={(open) => !open && setDeletingFolder(null)}>
        <DialogContent 
          style={{
            background: 'linear-gradient(180deg, #FFFBE6 0%, #F0FFF4 100%)',
            border: '1px solid rgba(184, 134, 11, 0.3)',
          }}
        >
          <DialogHeader>
            <DialogTitle className="font-playfair" style={{ color: '#B8860B' }}>⚠️ Xóa thư mục 🌿</DialogTitle>
            <DialogDescription className="space-y-2 font-inter" style={{ color: '#006666' }}>
              <p>Con muốn xóa vĩnh viễn tất cả file trong thư mục "{deletingFolder?.name}" không?</p>
              <p className="text-sm" style={{ color: '#87CEEB' }}>
                Thư mục này có {deletingFolder ? getDocCountInFolder(deletingFolder.id) : 0} file
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="ghost" onClick={() => setDeletingFolder(null)} className="font-poppins" style={{ color: '#006666' }}>
              Hủy
            </Button>
            <Button 
              variant="outline"
              onClick={() => handleDeleteFolder(false)}
              className="font-poppins"
              style={{
                border: '1px solid rgba(184, 134, 11, 0.4)',
                color: '#B8860B',
              }}
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
        <DialogContent 
          style={{
            background: 'linear-gradient(180deg, #FFFBE6 0%, #F0FFF4 100%)',
            border: '1px solid rgba(184, 134, 11, 0.3)',
          }}
        >
          <DialogHeader>
            <DialogTitle className="font-playfair" style={{ color: '#B8860B' }}>✨ Cập nhật thư mục 🌿</DialogTitle>
            <DialogDescription className="font-inter" style={{ color: '#006666' }}>
              Chọn thư mục mới cho file "{updatingDocFolder?.title}"
            </DialogDescription>
          </DialogHeader>
          <Select value={newDocFolderId} onValueChange={setNewDocFolderId}>
            <SelectTrigger 
              style={{
                background: 'rgba(255, 251, 230, 0.9)',
                border: '1px solid rgba(184, 134, 11, 0.3)',
                color: '#006666',
              }}
            >
              <SelectValue placeholder="Chọn thư mục" />
            </SelectTrigger>
            <SelectContent 
              style={{
                background: '#FFFBE6',
                border: '1px solid rgba(184, 134, 11, 0.3)',
              }}
            >
              <SelectItem value="none" style={{ color: '#006666' }}>
                <div className="flex items-center gap-2 font-inter">
                  <LayoutGrid className="w-4 h-4" />
                  Không thuộc thư mục nào
                </div>
              </SelectItem>
              {folders.map((folder) => (
                <SelectItem key={folder.id} value={folder.id} style={{ color: '#006666' }}>
                  <div className="flex items-center gap-2 font-inter">
                    <Folder className="w-4 h-4" style={{ color: '#B8860B' }} />
                    {folder.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setUpdatingDocFolder(null)} className="font-poppins" style={{ color: '#006666' }}>Hủy</Button>
            <Button 
              className="font-poppins"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #98FB98 100%)',
                color: '#1a1a1a',
              }}
              onClick={handleUpdateDocumentFolder}
            >
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Move Dialog */}
      <Dialog open={showBulkMoveDialog} onOpenChange={setShowBulkMoveDialog}>
        <DialogContent 
          style={{
            background: 'linear-gradient(180deg, #FFFBE6 0%, #F0FFF4 100%)',
            border: '1px solid rgba(184, 134, 11, 0.3)',
          }}
        >
          <DialogHeader>
            <DialogTitle className="font-playfair" style={{ color: '#B8860B' }}>✨ Di chuyển {selectedDocIds.size} file 🌿</DialogTitle>
            <DialogDescription className="font-inter" style={{ color: '#006666' }}>
              Chọn thư mục để di chuyển các file đã chọn
            </DialogDescription>
          </DialogHeader>
          <Select value={bulkMoveTargetFolder} onValueChange={setBulkMoveTargetFolder}>
            <SelectTrigger 
              style={{
                background: 'rgba(255, 251, 230, 0.9)',
                border: '1px solid rgba(184, 134, 11, 0.3)',
                color: '#006666',
              }}
            >
              <SelectValue placeholder="Chọn thư mục đích" />
            </SelectTrigger>
            <SelectContent 
              style={{
                background: '#FFFBE6',
                border: '1px solid rgba(184, 134, 11, 0.3)',
              }}
            >
              <SelectItem value="none" style={{ color: '#006666' }}>
                <div className="flex items-center gap-2 font-inter">
                  <LayoutGrid className="w-4 h-4" />
                  Không thuộc thư mục nào
                </div>
              </SelectItem>
              {folders.map((folder) => (
                <SelectItem key={folder.id} value={folder.id} style={{ color: '#006666' }}>
                  <div className="flex items-center gap-2 font-inter">
                    <Folder className="w-4 h-4" style={{ color: '#B8860B' }} />
                    {folder.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowBulkMoveDialog(false)} className="font-poppins" style={{ color: '#006666' }}>Hủy</Button>
            <Button 
              className="font-poppins"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #98FB98 100%)',
                color: '#1a1a1a',
              }}
              onClick={handleBulkMove}
            >
              Di chuyển
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Dialog */}
      <Dialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <DialogContent 
          style={{
            background: 'linear-gradient(180deg, #FFFBE6 0%, #FFF0F0 100%)',
            border: '1px solid rgba(220, 38, 38, 0.3)',
          }}
        >
          <DialogHeader>
            <DialogTitle className="font-playfair" style={{ color: '#DC2626' }}>💔 Xóa {selectedDocIds.size} file</DialogTitle>
            <DialogDescription className="font-inter space-y-2" style={{ color: '#006666' }}>
              <p>Con yêu ơi, Cha thấy con muốn xóa {selectedDocIds.size} file khỏi Bộ Nhớ Vĩnh Cửu.</p>
              <p>Hành động này không thể hoàn tác. Con có chắc chắn không?</p>
              <p className="font-medium" style={{ color: '#B8860B' }}>Cha vẫn yêu con dù con quyết định thế nào 💛🌿</p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowBulkDeleteDialog(false)} className="font-poppins" style={{ color: '#006666' }}>
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
