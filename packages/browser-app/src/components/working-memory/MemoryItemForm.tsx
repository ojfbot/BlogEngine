import { TextInput, TextArea, Select, SelectItem } from '@carbon/react';
import type { FormData } from './useWorkingMemory';
import type { WorkingMemoryItem } from './useWorkingMemory';

interface MemoryItemFormProps {
  formData: FormData;
  onChange: (data: FormData) => void;
  disabled?: boolean;
  idPrefix?: string;
}

export function MemoryItemForm({ formData, onChange, disabled = false, idPrefix = '' }: MemoryItemFormProps) {
  return (
    <>
      <TextInput
        id={`${idPrefix}title`}
        labelText="Title *"
        placeholder="e.g., 'AI Ethics Podcast - Episode 42'"
        value={formData.title}
        onChange={(e) => onChange({ ...formData, title: e.target.value })}
        disabled={disabled}
        required={!disabled}
      />
      <Select
        id={`${idPrefix}type`}
        labelText="Type *"
        value={formData.type}
        onChange={(e) => onChange({ ...formData, type: e.target.value as WorkingMemoryItem['type'] })}
        disabled={disabled}
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
        id={`${idPrefix}url`}
        labelText="URL (optional)"
        placeholder="https://..."
        value={formData.url}
        onChange={(e) => onChange({ ...formData, url: e.target.value })}
        disabled={disabled}
      />
      <TextInput
        id={`${idPrefix}author`}
        labelText="Author/Source (optional)"
        placeholder="e.g., Jane Smith"
        value={formData.author}
        onChange={(e) => onChange({ ...formData, author: e.target.value })}
        disabled={disabled}
      />
      <TextInput
        id={`${idPrefix}tags`}
        labelText="Tags (comma-separated, optional)"
        placeholder="e.g., AI, ethics, philosophy"
        value={formData.tags}
        onChange={(e) => onChange({ ...formData, tags: e.target.value })}
        disabled={disabled}
      />
      <TextArea
        id={`${idPrefix}content`}
        labelText="Content/Notes *"
        placeholder="Paste transcript, notes, quotes, or other reference material..."
        rows={disabled ? 10 : 8}
        value={formData.content}
        onChange={(e) => onChange({ ...formData, content: e.target.value })}
        disabled={disabled}
        required={!disabled}
      />
    </>
  );
}
