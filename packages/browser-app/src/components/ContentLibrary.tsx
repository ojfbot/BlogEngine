import { DataTable, Table, TableHead, TableRow, TableHeader, TableBody, TableCell, Button } from '@carbon/react';
import { Add } from '@carbon/icons-react';
import './DashboardSection.css';

function ContentLibrary() {
  const headers = [
    { key: 'title', header: 'Title' },
    { key: 'type', header: 'Type' },
    { key: 'status', header: 'Status' },
    { key: 'updated', header: 'Last Updated' },
  ];

  const rows = [
    { id: '1', title: 'Getting Started with React', type: 'Tutorial', status: 'Published', updated: '2 days ago' },
    { id: '2', title: 'TypeScript Best Practices', type: 'Blog Article', status: 'Draft', updated: '1 week ago' },
    { id: '3', title: 'API Documentation', type: 'Documentation', status: 'Review', updated: '3 days ago' },
  ];

  return (
    <div className="content-library">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h3>Content Library</h3>
          <p style={{ marginBottom: 0 }}>Manage your blog articles, tutorials, and documentation</p>
        </div>
        <Button kind="primary" renderIcon={Add}>
          New Content
        </Button>
      </div>

      <DataTable rows={rows} headers={headers}>
        {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
          <Table {...getTableProps()}>
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableHeader {...getHeaderProps({ header })} key={header.key}>
                    {header.header}
                  </TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow {...getRowProps({ row })} key={row.id}>
                  {row.cells.map((cell) => (
                    <TableCell key={cell.id}>{cell.value}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataTable>
    </div>
  );
}

export default ContentLibrary;
