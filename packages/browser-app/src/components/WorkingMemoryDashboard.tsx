import { Button, Modal, InlineNotification } from '@carbon/react';
import { Add, Edit, TrashCan, BookmarkAdd } from '@carbon/icons-react';
import { useWorkingMemory } from './working-memory/useWorkingMemory';
import { MemoryItemForm } from './working-memory/MemoryItemForm';
import { MemoryTable } from './working-memory/MemoryTable';
import './DashboardSection.css';
import './WorkingMemoryDashboard.css';

// Re-export for consumers
export type { WorkingMemoryItem } from './working-memory/useWorkingMemory';

function WorkingMemoryDashboard() {
  const wm = useWorkingMemory();

  return (
    <div className="working-memory-dashboard">
      <div className="dashboard-header-row">
        <div>
          <h3>Working Memory</h3>
          <p>Store reference materials, transcripts, and notes for content generation</p>
        </div>
        <Button renderIcon={Add} onClick={() => { wm.resetForm(); wm.setIsAddModalOpen(true); }} size="sm">
          Add Item
        </Button>
      </div>

      {wm.storageError && (
        <InlineNotification kind="error" title="Storage error" subtitle={wm.storageError}
          onClose={() => wm.setStorageError(null)} lowContrast style={{ marginBottom: '1rem' }} />
      )}

      {wm.items.length === 0 ? (
        <div className="empty-state">
          <BookmarkAdd size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <h4>No items in working memory</h4>
          <p>Add documents, transcripts, podcasts, or other reference materials to use in your content generation.</p>
          <Button renderIcon={Add} onClick={() => wm.setIsAddModalOpen(true)} size="sm">
            Add First Item
          </Button>
        </div>
      ) : (
        <MemoryTable
          items={wm.items}
          onView={wm.handleViewItem}
          onEdit={wm.handleEditItem}
          onDelete={wm.handleDeleteItem}
        />
      )}

      {/* Add Modal */}
      <Modal open={wm.isAddModalOpen} modalHeading="Add to Working Memory"
        primaryButtonText="Add" secondaryButtonText="Cancel"
        onRequestClose={() => wm.setIsAddModalOpen(false)}
        onRequestSubmit={wm.handleAddItem} size="md">
        <div className="modal-content">
          <MemoryItemForm formData={wm.formData} onChange={wm.setFormData} />
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={wm.isDeleteModalOpen} danger modalHeading="Delete item?"
        primaryButtonText="Delete" secondaryButtonText="Cancel"
        onRequestClose={() => wm.setIsDeleteModalOpen(false)}
        onRequestSubmit={wm.confirmDelete} size="sm">
        <p>This action cannot be undone.</p>
      </Modal>

      {/* View/Edit Modal */}
      <Modal open={wm.isViewModalOpen}
        modalHeading={wm.editMode ? 'Edit Working Memory Item' : 'View Working Memory Item'}
        primaryButtonText={wm.editMode ? 'Save Changes' : 'Close'}
        secondaryButtonText={wm.editMode ? 'Cancel' : undefined}
        onRequestClose={() => { wm.setIsViewModalOpen(false); wm.setEditMode(false); }}
        onRequestSubmit={wm.editMode ? wm.handleUpdateItem : () => wm.setIsViewModalOpen(false)}
        size="md">
        <div className="modal-content">
          {!wm.editMode && wm.selectedItem && (
            <div className="view-mode-actions" style={{ marginBottom: '1rem' }}>
              <Button kind="ghost" size="sm" renderIcon={Edit} onClick={() => wm.setEditMode(true)}>
                Edit
              </Button>
              <Button kind="danger--ghost" size="sm" renderIcon={TrashCan}
                onClick={() => wm.handleDeleteItem(wm.selectedItem!.id)}>
                Delete
              </Button>
            </div>
          )}
          <MemoryItemForm formData={wm.formData} onChange={wm.setFormData}
            disabled={!wm.editMode} idPrefix="view-" />
        </div>
      </Modal>
    </div>
  );
}

export default WorkingMemoryDashboard;
