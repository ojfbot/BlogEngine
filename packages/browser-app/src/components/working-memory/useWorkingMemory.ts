import { useState, useEffect } from 'react';

export interface WorkingMemoryItem {
  id: string;
  title: string;
  type: 'podcast' | 'transcript' | 'document' | 'annotation' | 'conversation' | 'link' | 'other';
  content: string;
  metadata?: {
    url?: string;
    author?: string;
    date?: string;
    tags?: string[];
    source?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface FormData {
  title: string;
  type: WorkingMemoryItem['type'];
  content: string;
  url: string;
  author: string;
  tags: string;
}

const STORAGE_KEY = 'blogengine-working-memory';

const EMPTY_FORM: FormData = {
  title: '', type: 'document', content: '', url: '', author: '', tags: '',
};

export function useWorkingMemory() {
  const [items, setItems] = useState<WorkingMemoryItem[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<WorkingMemoryItem | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch {
        setStorageError('Working memory data appears corrupted — starting fresh.');
      }
    }
  }, []);

  const saveItems = (newItems: WorkingMemoryItem[]) => {
    setItems(newItems);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
      setStorageError(null);
    } catch (e) {
      const msg = e instanceof Error && e.name === 'QuotaExceededError'
        ? 'Storage quota exceeded — some items may not be saved. Remove older items to free space.'
        : 'Failed to save to local storage.';
      setStorageError(msg);
    }
  };

  const resetForm = () => setFormData(EMPTY_FORM);

  const handleAddItem = () => {
    const newItem: WorkingMemoryItem = {
      id: crypto.randomUUID(),
      title: formData.title,
      type: formData.type,
      content: formData.content,
      metadata: {
        url: formData.url || undefined,
        author: formData.author || undefined,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : undefined,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveItems([...items, newItem]);
    resetForm();
    setIsAddModalOpen(false);
  };

  const handleUpdateItem = () => {
    if (!selectedItem) return;
    const updatedItems = items.map(item =>
      item.id === selectedItem.id
        ? {
            ...item,
            title: formData.title, type: formData.type, content: formData.content,
            metadata: {
              url: formData.url || undefined,
              author: formData.author || undefined,
              tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : undefined,
            },
            updatedAt: new Date().toISOString(),
          }
        : item
    );
    saveItems(updatedItems);
    setEditMode(false);
    setIsViewModalOpen(false);
    setSelectedItem(null);
    resetForm();
  };

  const handleDeleteItem = (id: string) => {
    setPendingDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!pendingDeleteId) return;
    saveItems(items.filter(item => item.id !== pendingDeleteId));
    if (selectedItem?.id === pendingDeleteId) {
      setIsViewModalOpen(false);
      setSelectedItem(null);
    }
    setPendingDeleteId(null);
    setIsDeleteModalOpen(false);
  };

  const handleViewItem = (item: WorkingMemoryItem) => {
    setSelectedItem(item);
    setFormData({
      title: item.title, type: item.type, content: item.content,
      url: item.metadata?.url || '', author: item.metadata?.author || '',
      tags: item.metadata?.tags?.join(', ') || '',
    });
    setIsViewModalOpen(true);
    setEditMode(false);
  };

  const handleEditItem = (item: WorkingMemoryItem) => {
    setSelectedItem(item);
    setFormData({
      title: item.title, type: item.type, content: item.content,
      url: item.metadata?.url || '', author: item.metadata?.author || '',
      tags: item.metadata?.tags?.join(', ') || '',
    });
    setIsViewModalOpen(true);
    setEditMode(true);
  };

  return {
    items,
    formData, setFormData,
    isAddModalOpen, setIsAddModalOpen,
    isViewModalOpen, setIsViewModalOpen,
    isDeleteModalOpen, setIsDeleteModalOpen,
    selectedItem,
    editMode, setEditMode,
    storageError, setStorageError,
    resetForm,
    handleAddItem,
    handleUpdateItem,
    handleDeleteItem,
    confirmDelete,
    handleViewItem,
    handleEditItem,
  };
}
