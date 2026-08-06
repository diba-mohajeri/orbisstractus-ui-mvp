import { Box } from '@mui/material';
import { DataGrid, type GridColDef, type GridPaginationModel, type GridSortModel } from '@mui/x-data-grid';

interface DataTableProps<Row extends { id: string }> {
  columns: GridColDef[];
  rows: Row[];
  loading?: boolean;
  height?: number;
  onRowClick?: (row: Row) => void;
  paginationMode?: 'client' | 'server';
  rowCount?: number;
  paginationModel?: GridPaginationModel;
  onPaginationModelChange?: (model: GridPaginationModel) => void;
  sortModel?: GridSortModel;
  onSortModelChange?: (model: GridSortModel) => void;
  pageSizeOptions?: number[];
}

export default function DataTable<Row extends { id: string }>({
  columns,
  rows,
  loading,
  height = 420,
  onRowClick,
  paginationMode = 'client',
  rowCount,
  paginationModel,
  onPaginationModelChange,
  sortModel,
  onSortModelChange,
  pageSizeOptions = [10, 25, 50],
}: DataTableProps<Row>) {
  return (
    <Box sx={{ height, width: '100%' }}>
      <DataGrid
        columns={columns}
        rows={rows}
        loading={loading}
        disableColumnMenu
        disableRowSelectionOnClick
        density="comfortable"
        pageSizeOptions={pageSizeOptions}
        paginationMode={paginationMode}
        rowCount={paginationMode === 'server' ? rowCount : undefined}
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        sortingMode={paginationMode}
        sortModel={sortModel}
        onSortModelChange={onSortModelChange}
        onRowClick={onRowClick ? (params) => onRowClick(params.row as Row) : undefined}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          bgcolor: '#fff',
          '& .MuiDataGrid-columnHeaders': { bgcolor: '#f8fafc' },
          '& .MuiDataGrid-row': { cursor: onRowClick ? 'pointer' : 'default' },
        }}
      />
    </Box>
  );
}
