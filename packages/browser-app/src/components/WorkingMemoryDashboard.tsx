import { useState, useEffect } from 'react';
import {
  Button,
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Modal,
  TextInput,
  TextArea,
  Select,
  SelectItem,
  Tag,
  OverflowMenu,
  OverflowMenuItem,
} from '@carbon/react';
import { Add, TrashCan, Edit, BookmarkAdd } from '@carbon/icons-react';
import './DashboardSection.css';
import './WorkingMemoryDashboard.css';

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

const STORAGE_KEY = 'blogengine-working-memory';

function WorkingMemoryDashboard() {
  const [items, setItems] = useState<WorkingMemoryItem[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WorkingMemoryItem | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    type: 'document' as WorkingMemoryItem['type'],
    content: '',
    url: '',
    author: '',
    tags: '',
  });

  // Load items from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse working memory items:', e);
      }
    }
  }, []);

  // Save items to localStorage
  const saveItems = (newItems: WorkingMemoryItem[]) => {
    setItems(newItems);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
  };

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
            title: formData.title,
            type: formData.type,
            content: formData.content,
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
    if (confirm('Delete this item from working memory?')) {
      saveItems(items.filter(item => item.id !== id));
      if (selectedItem?.id === id) {
        setIsViewModalOpen(false);
        setSelectedItem(null);
      }
    }
  };

  const handleViewItem = (item: WorkingMemoryItem) => {
    setSelectedItem(item);
    setFormData({
      title: item.title,
      type: item.type,
      content: item.content,
      url: item.metadata?.url || '',
      author: item.metadata?.author || '',
      tags: item.metadata?.tags?.join(', ') || '',
    });
    setIsViewModalOpen(true);
    setEditMode(false);
  };

  const handleEditItem = (item: WorkingMemoryItem) => {
    setSelectedItem(item);
    setFormData({
      title: item.title,
      type: item.type,
      content: item.content,
      url: item.metadata?.url || '',
      author: item.metadata?.author || '',
      tags: item.metadata?.tags?.join(', ') || '',
    });
    setIsViewModalOpen(true);
    setEditMode(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'document',
      content: '',
      url: '',
      author: '',
      tags: '',
    });
  };

  const getTypeColor = (type: WorkingMemoryItem['type']) => {
    const colors: Record<WorkingMemoryItem['type'], string> = {
      podcast: 'purple',
      transcript: 'blue',
      document: 'cyan',
      annotation: 'green',
      conversation: 'magenta',
      link: 'teal',
      other: 'gray',
    };
    return colors[type];
  };

  const headers = [
    { key: 'title', header: 'Title' },
    { key: 'type', header: 'Type' },
    { key: 'tags', header: 'Tags' },
    { key: 'created', header: 'Created' },
    { key: 'actions', header: '' },
  ];

  const rows = items.map(item => ({
    id: item.id,
    title: item.title,
    type: <Tag type={getTypeColor(item.type)} size="sm">{item.type}</Tag>,
    tags: item.metadata?.tags?.slice(0, 3).map((tag, i) => (
      <Tag key={i} type="outline" size="sm" style={{ marginRight: '0.25rem' }}>{tag}</Tag>
    )) || '—',
    created: new Date(item.createdAt).toLocaleDateString(),
    actions: (
      <OverflowMenu size="sm" flipped>
        <OverflowMenuItem itemText="View" onClick={() => handleViewItem(item)} />
        <OverflowMenuItem itemText="Edit" onClick={() => handleEditItem(item)} />
        <OverflowMenuItem
          itemText="Delete"
          onClick={() => handleDeleteItem(item.id)}
          hasDivider
          isDelete
        />
      </OverflowMenu>
    ),
  }));

  return (
    <div className="working-memory-dashboard">
      <div className="dashboard-header-row">
        <div>
          <h3>Working Memory</h3>
          <p>Store reference materials, transcripts, and notes for content generation</p>
        </div>
        <Button
          renderIcon={Add}
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
          size="sm"
        >
          Add Item
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <BookmarkAdd size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <h4>No items in working memory</h4>
          <p>Add documents, transcripts, podcasts, or other reference materials to use in your content generation.</p>
          <Button
            renderIcon={Add}
            onClick={() => setIsAddModalOpen(true)}
            size="sm"
          >
            Add First Item
          </Button>
        </div>
      ) : (
        <DataTable rows={rows} headers={headers}>
          {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
            <Table {...getTableProps()} size="sm">
              <TableHead>
                <TableRow>
                  {headers.map(header => (
                    <TableHeader {...getHeaderProps({ header })} key={header.key}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map(row => (
                  <TableRow {...getRowProps({ row })} key={row.id}>
                    {row.cells.map(cell => (
                      <TableCell key={cell.id}>{cell.value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DataTable>
      )}

      {/* Add/Edit Modal */}
      <Modal
        open={isAddModalOpen}
        modalHeading="Add to Working Memory"
        primaryButtonText="Add"
        secondaryButtonText="Cancel"
        onRequestClose={() => setIsAddModalOpen(false)}
        onRequestSubmit={handleAddItem}
        size="md"
      >
        <div className="modal-content">
          <TextInput
            id="title"
            labelText="Title *"
            placeholder="e.g., 'AI Ethics Podcast - Episode 42'"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <Select
            id="type"
            labelText="Type *"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as WorkingMemoryItem['type'] })}
          >
            <SelectItem value="podcast" text="Podcast" />
            <SelectItem value="transcript" text="Transcript" />
            <SelectItem value="document" text="Document" />
            <SelectItem value="annotation" text="Annotation" />
            <SelectItem value="conversation" text="Conversation" />
            <SelectItem value="link" text="Link/Reference" />
            <SelectItem value="other" text="Other" />
          </Select>
          <TextInput
            id="url"
            labelText="URL (optional)"
            placeholder="https://..."
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          />
          <TextInput
            id="author"
            labelText="Author/Source (optional)"
            placeholder="e.g., Jane Smith"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          />
          <TextInput
            id="tags"
            labelText="Tags (comma-separated, optional)"
            placeholder="e.g., AI, ethics, philosophy"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          />
          <TextArea
            id="content"
            labelText="Content/Notes *"
            placeholder="Paste transcript, notes, quotes, or other reference material..."
            rows={8}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            required
          />
        </div>
      </Modal>

      {/* View/Edit Modal */}
      <Modal
        open={isViewModalOpen}
        modalHeading={editMode ? 'Edit Working Memory Item' : 'View Working Memory Item'}
        primaryButtonText={editMode ? 'Save Changes' : 'Close'}
        secondaryButtonText={editMode ? 'Cancel' : undefined}
        onRequestClose={() => {
          setIsViewModalOpen(false);
          setEditMode(false);
          setSelectedItem(null);
        }}
        onRequestSubmit={editMode ? handleUpdateItem : () => setIsViewModalOpen(false)}
        size="md"
      >
        <div className="modal-content">
          {!editMode && selectedItem && (
            <div className="view-mode-actions" style={{ marginBottom: '1rem' }}>
              <Button
                kind="ghost"
                size="sm"
                renderIcon={Edit}
                onClick={() => setEditMode(true)}
              >
                Edit
              </Button>
              <Button
                kind="danger--ghost"
                size="sm"
                renderIcon={TrashCan}
                onClick={() => handleDeleteItem(selectedItem.id)}
              >
                Delete
              </Button>
            </div>
          )}
          <TextInput
            id="view-title"
            labelText="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            disabled={!editMode}
          />
          <Select
            id="view-type"
            labelText="Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as WorkingMemoryItem['type'] })}
            disabled={!editMode}
          >
            <SelectItem value="podcast" text="Podcast" />
            <SelectItem value="transcript" text="Transcript" />
            <SelectItem value="document" text="Document" />
            <SelectItem value="annotation" text="Annotation" />
            <SelectItem value="conversation" text="Conversation" />
            <SelectItem value="link" text="Link/Reference" />
            <SelectItem value="other" text="Other" />
          </Select>
          <TextInput
            id="view-url"
            labelText="URL"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            disabled={!editMode}
          />
          <TextInput
            id="view-author"
            labelText="Author/Source"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            disabled={!editMode}
          />
          <TextInput
            id="view-tags"
            labelText="Tags (comma-separated)"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            disabled={!editMode}
          />
          <TextArea
            id="view-content"
            labelText="Content/Notes"
            rows={10}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            disabled={!editMode}
          />
        </div>
      </Modal>
    </div>
  );
}

export default WorkingMemoryDashboard;
