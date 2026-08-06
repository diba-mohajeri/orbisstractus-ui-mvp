import { useMemo, useState } from 'react';
import { Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import DataTable from '../../../shared/components/DataTable';
import AccessLevelBadge from '../../../shared/components/AccessLevelBadge';
import RowActionButton from '../../../shared/components/RowActionButton';
import { useToast } from '../../../shared/store/toastStore';
import { DOCUMENT_CATEGORIES } from '../../../domain/documents';
import type { DocumentRow } from '../../../api/contracts/documents';
import { useDocuments } from './api';

export default function DocumentVaultPage() {
  const toast = useToast();
  const [category, setCategory] = useState<string | null>(null);
  const { data: documents, isLoading } = useDocuments();

  const rows = useMemo(
    () => (category ? (documents ?? []).filter((d) => d.category === category) : documents ?? []),
    [documents, category],
  );

  const columns: GridColDef<DocumentRow>[] = [
    { field: 'name', headerName: 'Document Name', flex: 1.3, minWidth: 220 },
    { field: 'buildingName', headerName: 'Building', flex: 1, minWidth: 150 },
    { field: 'category', headerName: 'Category', width: 160 },
    { field: 'uploadedBy', headerName: 'Uploaded By', width: 160 },
    { field: 'date', headerName: 'Date', width: 110 },
    {
      field: 'relatedProjectId',
      headerName: 'Related Project',
      width: 130,
      valueFormatter: (value) => (value ? value : '—'),
    },
    {
      field: 'accessLevel',
      headerName: 'Access Level',
      width: 150,
      renderCell: (params) => <AccessLevelBadge level={params.value} />,
    },
    {
      field: 'action',
      headerName: 'Action',
      width: 150,
      sortable: false,
      renderCell: (params) => {
        const level = params.row.accessLevel;
        const label = level === 'requiresApproval' ? 'Request Access' : level === 'visible' ? 'View' : 'Download';
        return (
          <RowActionButton
            label={label}
            onClick={() =>
              toast(
                level === 'requiresApproval'
                  ? `Access request sent for ${params.row.name}.`
                  : level === 'visible'
                    ? `Preview opened for ${params.row.name}.`
                    : `Download started for ${params.row.name}.`,
              )
            }
          />
        );
      },
    },
  ];

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 0.5 }}>
          <Typography variant="h6">Document Vault</Typography>
          <Chip label="Controlled Access" size="small" color="success" variant="outlined" />
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Centralize reports, drawings, photos, drone imagery, thermal scans, and letters.
        </Typography>

        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1, mb: 2 }}>
          <Chip
            label="All"
            size="small"
            color={category === null ? 'primary' : 'default'}
            onClick={() => setCategory(null)}
          />
          {DOCUMENT_CATEGORIES.map((c) => (
            <Chip
              key={c}
              label={c}
              size="small"
              color={category === c ? 'primary' : 'default'}
              onClick={() => setCategory(c)}
            />
          ))}
        </Stack>

        <DataTable columns={columns} rows={rows} loading={isLoading} height={480} />
      </CardContent>
    </Card>
  );
}
