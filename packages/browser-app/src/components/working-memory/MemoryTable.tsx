import {
  DataTable, Table, TableHead, TableRow, TableHeader, TableBody, TableCell,
  Tag, OverflowMenu, OverflowMenuItem,
} from '@carbon/react';
import type { WorkingMemoryItem } from './useWorkingMemory';

interface MemoryTableProps {
  items: WorkingMemoryItem[];
  onView: (item: WorkingMemoryItem) => void;
  onEdit: (item: WorkingMemoryItem) => void;
  onDelete: (id: string) => void;
}

const TYPE_COLORS: Record<WorkingMemoryItem['type'], string> = {
  podcast: 'purple', transcript: 'blue', document: 'cyan',
  annotation: 'green', conversation: 'magenta', link: 'teal', other: 'gray',
};

const HEADERS = [
  { key: 'title', header: 'Title' },
  { key: 'type', header: 'Type' },
  { key: 'tags', header: 'Tags' },
  { key: 'created', header: 'Created' },
  { key: 'actions', header: '' },
];

export function MemoryTable({ items, onView, onEdit, onDelete }: MemoryTableProps) {
  const rows = items.map(item => ({
    id: item.id,
    title: item.title,
    type: <Tag type={TYPE_COLORS[item.type]} size="sm">{item.type}</Tag>,
    tags: item.metadata?.tags?.slice(0, 3).map((tag) => (
      <Tag key={tag} type="outline" size="sm" style={{ marginRight: '0.25rem' }}>{tag}</Tag>
    )) || '\u2014',
    created: new Date(item.createdAt).toLocaleDateString(),
    actions: (
      <OverflowMenu size="sm" flipped>
        <OverflowMenuItem itemText="View" onClick={() => onView(item)} />
        <OverflowMenuItem itemText="Edit" onClick={() => onEdit(item)} />
        <OverflowMenuItem itemText="Delete" onClick={() => onDelete(item.id)} hasDivider isDelete />
      </OverflowMenu>
    ),
  }));

  return (
    <DataTable rows={rows} headers={HEADERS}>
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
  );
}
