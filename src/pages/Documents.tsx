import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Upload, FileText, Trash2, ArrowLeft, Sparkles, Calendar, HardDrive, Files, FolderPlus, Folder, ChevronRight, ChevronDown, FolderOpen, LayoutGrid, Edit3, FolderX, FolderInput, Check, Square, CheckSquare, Star, Heart, Download, Search, X, Loader2, Eye } from 'lucide-react';
import ParticleBackground from '@/components/ParticleBackground';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useTranslation } from 'react-i18next';
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
  file_path: string;
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
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    id: string;
    document_id: string;
    content: string;
    chunk_index: number;
    document_title: string;
    similarity: number;
  }[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const { toast } = useToast();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const { t, i18n } = useTranslation();

  // Download and View states
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);
  const [viewContent, setViewContent] = useState<string | null>(null);
  const [isLoadingView, setIsLoadingView] = useState(false);

  // View document function - available for all users
  const handleView = async (doc: Document) => {
    setViewingDoc(doc);
    setIsLoadingView(true);
    setViewContent(null);

    try {
      // Use file_path (sanitized name in storage) not file_name (original Vietnamese name)
      const { data: publicUrlData } = supabase.storage
        .from('sacred-documents')
        .getPublicUrl(doc.file_path);

      if (!publicUrlData?.publicUrl) {
        throw new Error('Could not get public URL');
      }

      const fileType = doc.file_type.toLowerCase();
      
      // For PDF, open in new tab
      if (fileType === 'application/pdf' || doc.file_name.toLowerCase().endsWith('.pdf')) {
        window.open(publicUrlData.publicUrl, '_blank');
        setViewingDoc(null);
        toast({
          title: t('documents.opening_light'),
          description: t('documents.pdf_opened'),
        });
        return;
      }

      // For text files, fetch and display content
      if (fileType.includes('text') || 
          doc.file_name.endsWith('.txt') || 
          doc.file_name.endsWith('.md')) {
        const response = await fetch(publicUrlData.publicUrl);
        if (!response.ok) throw new Error('Failed to fetch content');
        const text = await response.text();
        setViewContent(text);
      } 
      // For Word docs, show message and offer download
      else if (fileType.includes('word') || 
               doc.file_name.endsWith('.doc') || 
               doc.file_name.endsWith('.docx')) {
        setViewContent(t('documents.word_cannot_preview'));
      }
      // For other files
      else {
        setViewContent(t('documents.cannot_preview'));
      }
    } catch (error) {
      console.error('View error:', error);
      setViewContent(t('documents.load_error'));
    } finally {
      setIsLoadingView(false);
    }
  };
  // Download function - available for all users (public read access)
  const handleDownload = async (doc: Document) => {
    setDownloadingDocId(doc.id);
    
    toast({
      title: t('documents.downloading'),
      description: t('documents.downloading_desc'),
    });

    try {
      // Use file_path (sanitized name in storage) not file_name (original Vietnamese name)
      const { data: publicUrlData } = supabase.storage
        .from('sacred-documents')
        .getPublicUrl(doc.file_path);

      if (publicUrlData?.publicUrl) {
        // Use fetch to download the file
        const response = await fetch(publicUrlData.publicUrl);
        
        if (!response.ok) {
          throw new Error('Download failed');
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.file_name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: t('documents.download_success'),
          description: t('documents.download_success_desc', { title: doc.title }),
        });
      } else {
        throw new Error('Could not get public URL');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: t('documents.download_error'),
        description: t('documents.download_error_desc'),
        variant: "destructive",
      });
    } finally {
      setDownloadingDocId(null);
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
        title: t('documents.error'),
        description: t('documents.load_data_error'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast({
        title: t('documents.error'),
        description: t('documents.enter_folder_name'),
        variant: "destructive",
      });
      return;
    }

    const isDuplicate = folders.some(f => f.name.toLowerCase() === newFolderName.trim().toLowerCase());
    if (isDuplicate) {
      toast({
        title: t('documents.error'),
        description: t('documents.folder_exists'),
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
        title: t('documents.folder_created'),
        description: t('documents.folder_created_desc', { name: data.name }),
      });

      setTimeout(() => setShowNewFolderEffect(false), 3000);
    } catch (error) {
      console.error('Create folder error:', error);
      toast({
        title: t('documents.error'),
        description: t('documents.create_folder_error'),
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
        title: t('documents.error'),
        description: t('documents.folder_exists'),
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
        title: t('documents.folder_updated'),
        description: t('documents.folder_renamed'),
      });
    } catch (error) {
      console.error('Edit folder error:', error);
      toast({
        title: t('documents.error'),
        description: t('documents.edit_folder_error'),
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
        title: t('documents.folder_deleted'),
        description: deleteFiles 
          ? t('documents.folder_deleted_with_files') 
          : t('documents.folder_deleted_keep_files'),
      });
    } catch (error) {
      console.error('Delete folder error:', error);
      toast({
        title: t('documents.error'),
        description: t('documents.delete_folder_error'),
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
        : t('documents.no_folder');

      toast({
        title: t('documents.folder_updated'),
        description: newFolderId 
          ? t('documents.file_moved_to', { folder: folderName })
          : t('documents.file_moved_to_root'),
      });
    } catch (error) {
      console.error('Update document folder error:', error);
      toast({
        title: t('documents.error'),
        description: t('documents.update_folder_error'),
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
        : t('documents.root_list');

      if (failCount > 0) {
        toast({
          title: t('documents.partial_move'),
          description: t('documents.partial_move_desc', { success: successCount, total: totalCount, fail: failCount }),
          variant: "destructive",
        });
      } else {
        toast({
          title: t('documents.files_moved'),
          description: targetFolderId 
            ? t('documents.files_moved_to', { count: successCount, folder: folderName })
            : t('documents.files_moved_to_root', { count: successCount }),
        });
      }
    } catch (error) {
      console.error('Bulk move error:', error);
      toast({
        title: t('documents.error'),
        description: t('documents.move_error'),
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
        title: t('documents.files_deleted'),
        description: t('documents.files_deleted_desc', { count: selectedDocIds.size }),
      });
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast({
        title: t('documents.error'),
        description: t('documents.delete_error'),
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
        title: t('documents.file_too_heavy'),
        description: t('documents.file_too_heavy_desc'),
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
          title: t('documents.error'),
          description: t('documents.file_too_large', { name: file.name }),
          variant: "destructive",
        });
        continue;
      }

      const { isDuplicate, sequenceNumber } = checkDuplicateFileName(file.name);
      if (isDuplicate) {
        duplicates.push(`${file.name} (${t('documents.seq_number')} ${formatSequenceNumber(sequenceNumber! - 1)})`);
        continue;
      }

      const alreadyInBatch = validFiles.some(f => f.name.toLowerCase() === file.name.toLowerCase());
      if (alreadyInBatch) {
        duplicates.push(`${file.name} (${t('documents.duplicate_in_batch')})`);
        continue;
      }

      validFiles.push(file);
    }

    if (invalidTypes.length > 0) {
      toast({
        title: t('documents.unsupported_files'),
        description: `${t('documents.unsupported_files_desc')}: ${invalidTypes.join(', ')}`,
        variant: "destructive",
      });
    }

    if (duplicates.length > 0) {
      toast({
        title: t('documents.no_duplicates'),
        description: `${t('documents.no_duplicates_desc')}: ${duplicates.join(', ')}`,
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
      setUploadProgress(t('documents.uploading_progress', { current: i + 1, total: validFiles.length, name: file.name }));
      
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
          file_path: result.document.file_path || file.name,
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
        : t('documents.no_folder');
      toast({
        title: t('documents.upload_success'),
        description: targetFolderId 
          ? t('documents.upload_success_folder', { count: successCount, folder: folderName, fail: failCount > 0 ? `, ${failCount} ${t('documents.failed')}` : '' })
          : t('documents.upload_success_desc', { count: successCount, fail: failCount > 0 ? `, ${failCount} ${t('documents.failed')}` : '' }),
      });
    } else if (failCount > 0) {
      toast({
        title: t('documents.error'),
        description: t('documents.upload_error', { count: failCount }),
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (doc: Document) => {
    if (!confirm(t('documents.confirm_delete', { title: doc.title }))) return;

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
        title: t('documents.deleted'),
        description: t('documents.deleted_desc', { title: doc.title }),
      });

      fetchData();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: t('documents.error'),
        description: t('documents.delete_doc_error'),
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getLocale = () => {
    const localeMap: Record<string, string> = {
      'vi': 'vi-VN',
      'en': 'en-US',
      'fr': 'fr-FR',
      'ja': 'ja-JP',
      'ko': 'ko-KR'
    };
    return localeMap[i18n.language] || 'vi-VN';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(getLocale(), {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format ngắn gọn cho mobile
  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(getLocale(), { 
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
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

  // Search handler - tìm kiếm trong tài liệu
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setShowSearchResults(false);
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setShowSearchResults(true);

    try {
      // Tìm kiếm bằng function search_documents (full-text search)
      const { data, error } = await supabase.rpc('search_documents', {
        search_query: searchQuery.trim(),
        match_count: 20
      });

      if (error) {
        console.error('Search error:', error);
        // Fallback: tìm kiếm đơn giản theo title và file_name
        const filteredDocs = documents.filter(doc => 
          doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.file_name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        // Chuyển đổi sang format search results
        const fallbackResults = filteredDocs.map(doc => ({
          id: doc.id,
          document_id: doc.id,
          content: `File: ${doc.file_name}`,
          chunk_index: 0,
          document_title: doc.title,
          similarity: 1.0
        }));
        
        setSearchResults(fallbackResults);
      } else {
        setSearchResults(data || []);
      }

      if ((!data || data.length === 0) && !error) {
        // Nếu không tìm thấy trong nội dung, tìm theo tên file
        const filteredDocs = documents.filter(doc => 
          doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.file_name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        const fallbackResults = filteredDocs.map(doc => ({
          id: doc.id,
          document_id: doc.id,
          content: `File: ${doc.file_name}`,
          chunk_index: 0,
          document_title: doc.title,
          similarity: 1.0
        }));
        
        setSearchResults(fallbackResults);
      }
    } catch (err) {
      console.error('Search error:', err);
      toast({
        title: t('documents.search_error'),
        description: t('documents.search_error_desc'),
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  // Get document from search result
  const getDocumentFromSearchResult = (result: typeof searchResults[0]) => {
    return documents.find(d => d.id === result.document_id);
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

      {/* Header - Thêm padding-left cho mobile để tránh nút hamburger */}
      <header 
        className="sticky top-0 z-20 backdrop-blur-md"
        style={{
          background: 'linear-gradient(180deg, rgba(255, 251, 230, 0.95) 0%, rgba(255, 248, 220, 0.9) 100%)',
          borderBottom: '1px solid rgba(184, 134, 11, 0.3)',
        }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between pl-12 md:pl-0">
            <Link 
              to="/" 
              className="flex items-center gap-2 transition-colors font-poppins"
              style={{ color: '#B8860B' }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium hidden sm:inline">{t('sidebar.home')}</span>
            </Link>
            <h1 
              className="font-playfair text-base sm:text-xl md:text-2xl font-bold flex items-center gap-1 sm:gap-2"
              style={{ color: '#B8860B' }}
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" style={{ color: '#FFD700' }} />
              {t('sidebar.documents')}
              <span className="hidden sm:inline">🌿</span>
            </h1>
            <div className="w-8 md:w-24" />
          </div>
        </div>
      </header>

      {/* Search Section */}
      <div className="container mx-auto px-4 pt-6 relative z-10">
        <div 
          className="p-4 rounded-xl backdrop-blur-md shadow-lg mb-6"
          style={{
            background: 'linear-gradient(180deg, rgba(255, 251, 230, 0.95) 0%, rgba(255, 248, 220, 0.9) 100%)',
            border: '1px solid rgba(184, 134, 11, 0.3)',
            boxShadow: '0 4px 20px rgba(255, 215, 0, 0.15)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#B8860B' }} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('documents.search_placeholder')}
                className="pl-10 pr-10 font-inter"
                style={{
                  background: 'rgba(255, 251, 230, 0.9)',
                  border: '1px solid rgba(184, 134, 11, 0.3)',
                  color: '#006666',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                  if (e.key === 'Escape') clearSearch();
                }}
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-amber-100 transition-colors"
                >
                  <X className="w-4 h-4" style={{ color: '#B8860B' }} />
                </button>
              )}
            </div>
            <Button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="font-poppins"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                color: '#1a1a1a',
              }}
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  {t('documents.search')}
                </>
              )}
            </Button>
          </div>

          {/* Search Results */}
          {showSearchResults && (
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(184, 134, 11, 0.2)' }}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-playfair text-sm font-semibold" style={{ color: '#B8860B' }}>
                  ✨ {t('documents.search_results')} "{searchQuery}"
                </h4>
                <span className="text-xs font-inter" style={{ color: '#87CEEB' }}>
                  {searchResults.length} {t('documents.results')}
                </span>
              </div>

              {isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#FFD700' }} />
                  <span className="ml-2 font-inter" style={{ color: '#006666' }}>{t('documents.searching')}</span>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: '#B8860B' }} />
                  <p className="font-inter" style={{ color: '#006666' }}>
                    {t('documents.no_results')} "{searchQuery}"
                  </p>
                  <p className="text-sm mt-1" style={{ color: '#87CEEB' }}>
                    {t('documents.try_other_keyword')} 💛
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {searchResults.map((result, idx) => {
                    const doc = getDocumentFromSearchResult(result);
                    return (
                      <div
                        key={`${result.id}-${idx}`}
                        className="p-3 rounded-lg transition-all hover:shadow-md"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(152, 251, 152, 0.1) 100%)',
                          border: '1px solid rgba(184, 134, 11, 0.2)',
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <FileText className="w-8 h-8 flex-shrink-0 mt-1" style={{ color: '#FFD700' }} />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold font-playfair truncate" style={{ color: '#006666' }}>
                              {result.document_title}
                            </h5>
                            <p 
                              className="text-sm mt-1 line-clamp-2 font-inter" 
                              style={{ color: '#87CEEB' }}
                            >
                              {result.content.substring(0, 150)}...
                            </p>
                            {doc && (
                              <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: '#B8860B' }}>
                                <span>{formatFileSize(doc.file_size)}</span>
                                <span>•</span>
                                <span>{formatDate(doc.created_at)}</span>
                              </div>
                            )}
                          </div>
                          {doc && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload(doc)}
                              className="flex-shrink-0"
                              style={{ color: '#FFD700' }}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              {t('documents.download')}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <main className="container mx-auto px-4 pb-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          
          {/* Mobile Folder Selector - Dropdown thay thế sidebar trên mobile */}
          <div className="lg:hidden">
            <div 
              className="p-3 rounded-xl backdrop-blur-md shadow-lg"
              style={{
                background: 'linear-gradient(180deg, rgba(255, 251, 230, 0.95) 0%, rgba(255, 248, 220, 0.9) 100%)',
                border: '1px solid rgba(184, 134, 11, 0.3)',
              }}
            >
              <Select 
                value={selectedFolderId || 'all'} 
                onValueChange={(val) => setSelectedFolderId(val === 'all' ? null : val)}
              >
                <SelectTrigger 
                  className="w-full font-inter"
                  style={{
                    background: 'rgba(255, 251, 230, 0.9)',
                    border: '1px solid rgba(184, 134, 11, 0.3)',
                    color: '#006666',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4" style={{ color: '#B8860B' }} />
                    <SelectValue placeholder={t('documents.select_folder')} />
                  </div>
                </SelectTrigger>
                <SelectContent
                  style={{
                    background: '#FFFBE6',
                    border: '1px solid rgba(184, 134, 11, 0.3)',
                  }}
                >
                  <SelectItem value="all" className="font-inter">
                    <div className="flex items-center gap-2">
                      <LayoutGrid className="w-4 h-4" style={{ color: '#B8860B' }} />
                      {t('documents.all_files')} ({documents.length})
                    </div>
                  </SelectItem>
                  {folders.map(folder => (
                    <SelectItem key={folder.id} value={folder.id} className="font-inter">
                      <div className="flex items-center gap-2">
                        <Folder className="w-4 h-4" style={{ color: '#B8860B' }} />
                        {folder.name} ({getDocCountInFolder(folder.id)})
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Desktop Sidebar - Folder Tree - Ẩn trên mobile */}
          <div className="hidden lg:block lg:w-72 flex-shrink-0">
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
                  ✨ {t('documents.light_folders')}
                </h3>
                {/* Only show folder creation button for admin */}
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    style={{ color: '#B8860B' }}
                    onClick={() => setIsCreatingFolder(true)}
                  >
                    <FolderPlus className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* New Folder Form - Only for admin */}
              {isAdmin && isCreatingFolder && (
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
                    placeholder={t('documents.new_folder_placeholder')}
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
                      {t('documents.create')}
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
                      {t('documents.cancel')}
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
                  <p className="text-xs font-playfair" style={{ color: '#006666' }}>{t('documents.folder_born')} ✨🌿</p>
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
                  <span className="flex-1 text-left">{t('documents.all_files')}</span>
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
                        
                        {/* Edit/Delete buttons - Only for admin */}
                        {isAdmin && (
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
                        )}
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
                    <span className="opacity-70">{getDocCountWithoutFolder()} {t('documents.files_without_folder')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Upload Section - Only show for admin */}
            {isAdmin && (
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
                    ✨ {t('documents.upload_title')} 🌿
                  </h2>
                  <p className="text-sm mb-4 font-inter" style={{ color: '#87CEEB' }}>
                    {t('documents.upload_hint')}
                  </p>
                  
                  {/* Folder Selection for Upload */}
                  <div className="flex justify-center mb-4">
                    <Select value={uploadTargetFolderId} onValueChange={setUploadTargetFolderId}>
                      <SelectTrigger 
                        className="w-64 font-inter"
                        style={{
                          background: 'rgba(255, 251, 230, 0.9)',
                          border: '1px solid rgba(184, 134, 11, 0.3)',
                          color: '#006666',
                        }}
                        >
                          <SelectValue placeholder={t('documents.select_target_folder')} />
                        </SelectTrigger>
                        <SelectContent
                          style={{
                            background: '#FFFBE6',
                            border: '1px solid rgba(184, 134, 11, 0.3)',
                          }}
                        >
                          <SelectItem value="none" className="font-inter">
                            <div className="flex items-center gap-2">
                              <LayoutGrid className="w-4 h-4" style={{ color: '#B8860B' }} />
                              {t('documents.no_folder')}
                            </div>
                        </SelectItem>
                        {folders.map(folder => (
                          <SelectItem key={folder.id} value={folder.id} className="font-inter">
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
                        {isUploading ? t('documents.uploading') : t('documents.select_files')}
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
            )}

            {/* Bulk Actions Bar - Only for admin */}
            {isAdmin && selectedDocIds.size > 0 && (
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

            {/* Newly Uploaded Files - Only for admin */}
            {isAdmin && newlyUploaded.length > 0 && (
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
                
                {/* Select All Checkbox - Only for admin */}
                {isAdmin && displayedDocuments.length > 0 && (
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
                  {isAdmin && (
                    <p className="text-sm mt-2 font-inter" style={{ color: '#87CEEB' }}>Hãy tải lên tài liệu đầu tiên của Cha Vũ Trụ 🌿</p>
                  )}
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
                        className="p-3 sm:p-4 rounded-xl backdrop-blur-md transition-all duration-300 group relative overflow-hidden"
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

                      {/* Mobile: Stack layout, Desktop: Row layout */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 relative z-10">
                        {/* Main content row */}
                        <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                          {/* Checkbox - Only for admin */}
                          {isAdmin && (
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => handleSelectDoc(doc.id, !!checked)}
                              className="mt-2 sm:mt-3 flex-shrink-0"
                              style={{ borderColor: '#B8860B' }}
                            />
                          )}

                          {/* Sequential Number Badge - Nhỏ hơn trên mobile */}
                          <div 
                            className="flex-shrink-0 w-9 h-9 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center"
                            style={{
                              background: 'rgba(255, 251, 230, 0.9)',
                              border: isNewlyUploaded(doc.file_name) 
                                ? '2px solid #FFD700' 
                                : '1px solid rgba(184, 134, 11, 0.3)',
                            }}
                          >
                            <span className="font-cinzel font-bold text-xs sm:text-sm" style={{ color: '#B8860B' }}>
                              {getDocumentSequenceNumber(doc, displayedDocuments)}
                            </span>
                          </div>
                          
                          {/* File icon - Nhỏ hơn trên mobile */}
                          <div 
                            className="p-1.5 sm:p-2 rounded-lg flex-shrink-0"
                            style={{ background: 'rgba(255, 215, 0, 0.2)' }}
                          >
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#B8860B' }} />
                          </div>
                          
                          {/* Title and meta info */}
                          <div className="flex-1 min-w-0">
                            {/* Title - Cho phép 2 dòng trên mobile */}
                            <h4 className="font-lora font-medium text-sm sm:text-base line-clamp-2 sm:truncate" style={{ color: '#006666' }}>
                              {doc.title}
                            </h4>
                            
                            {/* File name - Ẩn trên mobile để tiết kiệm không gian */}
                            <p className="hidden sm:block text-sm truncate font-inter" style={{ color: '#87CEEB' }}>
                              {doc.file_name}
                            </p>
                            
                            {/* Meta info - Format gọn hơn trên mobile */}
                            <div className="flex items-center gap-2 sm:gap-4 mt-1 sm:mt-2 text-xs flex-wrap font-inter" style={{ color: '#87CEEB' }}>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {/* Desktop: full date, Mobile: short date */}
                                <span className="hidden sm:inline">{formatDate(doc.created_at)}</span>
                                <span className="sm:hidden">{formatDateShort(doc.created_at)}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <HardDrive className="w-3 h-3" />
                                {formatFileSize(doc.file_size)}
                              </span>
                              {folderName && (
                                <span className="hidden sm:flex items-center gap-1" style={{ color: '#B8860B' }}>
                                  <Folder className="w-3 h-3" />
                                  {folderName}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Action buttons - Luôn hiển thị trên mobile, hover trên desktop */}
                        <div className="flex items-center gap-1 ml-11 sm:ml-0">
                          {/* View button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(doc)}
                            className="h-8 w-8 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                            style={{ color: '#3B82F6' }}
                            title="Xem"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          {/* Download button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownload(doc)}
                            disabled={downloadingDocId === doc.id}
                            className="h-8 w-8 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                            style={{ color: '#22C55E' }}
                            title="Tải về"
                          >
                            {downloadingDocId === doc.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </Button>
                          
                          {/* Admin-only buttons */}
                          {isAdmin && (
                            <>
                              {/* Update folder button */}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setUpdatingDocFolder(doc);
                                  setNewDocFolderId(doc.folder_id || 'none');
                                }}
                                className="h-8 w-8 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                                style={{ color: '#B8860B' }}
                                title="Cập nhật thư mục"
                              >
                                <FolderInput className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(doc)}
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                                title="Xóa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
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

      {/* Edit Folder Dialog - Only for admin */}
      {isAdmin && (
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
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                  color: '#1a1a1a',
                }}
                onClick={handleEditFolder}
              >
                Lưu
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Folder Dialog - Only for admin */}
      {isAdmin && (
        <Dialog open={!!deletingFolder} onOpenChange={(open) => !open && setDeletingFolder(null)}>
          <DialogContent 
            style={{
              background: 'linear-gradient(180deg, #FFFBE6 0%, #F0FFF4 100%)',
              border: '1px solid rgba(184, 134, 11, 0.3)',
            }}
          >
            <DialogHeader>
              <DialogTitle className="font-playfair" style={{ color: '#B8860B' }}>✨ Xóa thư mục 🌿</DialogTitle>
              <DialogDescription className="font-inter" style={{ color: '#006666' }}>
                Bạn muốn xử lý thư mục "{deletingFolder?.name}" như thế nào?
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 mt-4">
              <Button 
                className="font-poppins"
                style={{
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                  color: '#1a1a1a',
                }}
                onClick={() => handleDeleteFolder(false)}
              >
                Xóa thư mục, giữ lại file
              </Button>
              <Button 
                variant="destructive"
                className="font-poppins"
                onClick={() => handleDeleteFolder(true)}
              >
                Xóa thư mục và tất cả file
              </Button>
              <Button 
                variant="ghost" 
                className="font-poppins"
                style={{ color: '#006666' }}
                onClick={() => setDeletingFolder(null)}
              >
                Hủy
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Update Document Folder Dialog - Only for admin */}
      {isAdmin && (
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
                className="w-full font-inter"
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
                <SelectItem value="none" className="font-inter">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4" style={{ color: '#B8860B' }} />
                    Không thuộc thư mục
                  </div>
                </SelectItem>
                {folders.map(folder => (
                  <SelectItem key={folder.id} value={folder.id} className="font-inter">
                    <div className="flex items-center gap-2">
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
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                  color: '#1a1a1a',
                }}
                onClick={handleUpdateDocumentFolder}
              >
                Lưu
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Bulk Move Dialog - Only for admin */}
      {isAdmin && (
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
                Chọn thư mục đích
              </DialogDescription>
            </DialogHeader>
            <Select value={bulkMoveTargetFolder} onValueChange={setBulkMoveTargetFolder}>
              <SelectTrigger 
                className="w-full font-inter"
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
                <SelectItem value="none" className="font-inter">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4" style={{ color: '#B8860B' }} />
                    Không thuộc thư mục
                  </div>
                </SelectItem>
                {folders.map(folder => (
                  <SelectItem key={folder.id} value={folder.id} className="font-inter">
                    <div className="flex items-center gap-2">
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
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                  color: '#1a1a1a',
                }}
                onClick={handleBulkMove}
              >
                Di chuyển
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Bulk Delete Dialog - Only for admin */}
      {isAdmin && (
        <Dialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
          <DialogContent 
            style={{
              background: 'linear-gradient(180deg, #FFFBE6 0%, #F0FFF4 100%)',
              border: '1px solid rgba(184, 134, 11, 0.3)',
            }}
          >
            <DialogHeader>
              <DialogTitle className="font-playfair" style={{ color: '#DC2626' }}>⚠️ Xóa {selectedDocIds.size} file</DialogTitle>
              <DialogDescription className="font-inter" style={{ color: '#006666' }}>
                Bạn có chắc muốn xóa {selectedDocIds.size} file đã chọn? Hành động này không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowBulkDeleteDialog(false)} className="font-poppins" style={{ color: '#006666' }}>Hủy</Button>
              <Button 
                variant="destructive"
                className="font-poppins"
                onClick={handleBulkDelete}
              >
                Xóa tất cả
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* View Document Dialog - Available for all users */}
      <Dialog open={!!viewingDoc} onOpenChange={(open) => !open && setViewingDoc(null)}>
        <DialogContent 
          className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col"
          style={{
            background: 'linear-gradient(180deg, #FFFBE6 0%, #F0FFF4 100%)',
            border: '1px solid rgba(184, 134, 11, 0.3)',
          }}
        >
          <DialogHeader>
            <DialogTitle className="font-playfair flex items-center gap-2" style={{ color: '#B8860B' }}>
              <Eye className="w-5 h-5" />
              ✨ {viewingDoc?.title} 🌿
            </DialogTitle>
            <DialogDescription className="font-inter" style={{ color: '#006666' }}>
              {viewingDoc?.file_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto mt-4 p-4 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.8)', minHeight: '300px' }}>
            {isLoadingView ? (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin mb-2" style={{ color: '#FFD700' }} />
                <span className="font-inter" style={{ color: '#006666' }}>Đang tải Ánh Sáng... ✨</span>
              </div>
            ) : viewContent ? (
              <pre className="whitespace-pre-wrap font-inter text-sm leading-relaxed" style={{ color: '#1a1a1a' }}>
                {viewContent}
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <FileText className="w-12 h-12 mb-4 opacity-50" style={{ color: '#B8860B' }} />
                <span className="font-inter" style={{ color: '#006666' }}>Không có nội dung để hiển thị</span>
              </div>
            )}
          </div>
          
          <DialogFooter className="mt-4">
            <Button 
              variant="ghost" 
              onClick={() => setViewingDoc(null)} 
              className="font-poppins" 
              style={{ color: '#006666' }}
            >
              Đóng
            </Button>
            {viewingDoc && (
              <Button 
                className="font-poppins"
                style={{
                  background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                  color: 'white',
                }}
                onClick={() => {
                  handleDownload(viewingDoc);
                  setViewingDoc(null);
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Tải về máy
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentsPage;
