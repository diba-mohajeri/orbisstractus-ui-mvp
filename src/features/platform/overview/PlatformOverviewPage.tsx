import { useState } from 'react';
import { Box, Card, CardContent, MenuItem, Stack, Table, TableBody, TableCell, TextField, TableHead, TableRow, Typography } from '@mui/material';
import KpiStrip from '../../../shared/components/KpiStrip';
import StatusChip from '../../../shared/components/StatusChip';
import type { CompanyPlan, CompanyStatus } from '../../../domain/companies';
import { usePortfolioSummary } from '../../client-portal/api';
import { useCompanies } from '../api';
import { pageTitleSx, sectionTitleSx } from '../../insightx/shared/pageStyles';

const PLAN_OPTIONS: CompanyPlan[] = ['Starter', 'Professional', 'Enterprise'];

export default function PlatformOverviewPage() {
  const { data: companies } = useCompanies();
  const { data: summary } = usePortfolioSummary();

  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<CompanyPlan | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<CompanyStatus | 'all'>('all');

  const totalEmployees = (companies ?? []).reduce((sum, c) => sum + c.employeeCount, 0);
  const filteredCompanies = (companies ?? []).filter((c) => {
    const matchesSearch = !search.trim() || c.name.toLowerCase().includes(search.trim().toLowerCase());
    const matchesPlan = planFilter === 'all' || c.plan === planFilter;
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  return (
    <Box>
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ p: { xs: 2, lg: 3 } }}>
          <Typography component="h1" sx={pageTitleSx}>
            Platform Overview
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 700, mb: 2 }}>
            Real-time totals across every company on Orbisstractus — not scoped to any single tenant.
          </Typography>
          <KpiStrip
            items={[
              { label: 'Companies', value: String(companies?.length ?? 0) },
              { label: 'Employees', value: String(totalEmployees) },
              { label: 'Buildings', value: String(summary?.buildings ?? 0) },
              { label: 'Active Projects', value: String(summary?.activeProjects ?? 0) },
              { label: 'Open Deficiencies', value: String(summary?.openDeficiencies ?? 0), tone: (summary?.openDeficiencies ?? 0) > 0 ? 'warning' : 'success' },
              { label: 'High-Risk Items', value: String(summary?.highRiskItems ?? 0), tone: (summary?.highRiskItems ?? 0) > 0 ? 'error' : 'success' },
              { label: 'Reports Delivered', value: String(summary?.reportsAvailable ?? 0) },
              { label: 'Capital Exposure', value: summary?.capitalForecast30yr ?? '—' },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 2.5 }}>
          <Typography sx={{ ...sectionTitleSx, mb: 1.5 }}>Companies at a Glance</Typography>
          <Stack direction="row" spacing={1.5} sx={{ mb: 1.5, flexWrap: 'wrap', rowGap: 1 }}>
            <TextField
              size="small"
              placeholder="Search by name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: 200 }}
            />
            <TextField
              select
              size="small"
              label="Plan"
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value as CompanyPlan | 'all')}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">All Plans</MenuItem>
              {PLAN_OPTIONS.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as CompanyStatus | 'all')}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
            </TextField>
          </Stack>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, pl: 0 }}>Company</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Plan</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 800 }} align="right">Employees</TableCell>
                <TableCell sx={{ fontWeight: 800 }} align="right">Buildings</TableCell>
                <TableCell sx={{ fontWeight: 800 }} align="right">Clients</TableCell>
                <TableCell sx={{ fontWeight: 800, pr: 0 }} align="right">Active Projects</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCompanies.map((c) => (
                <TableRow key={c.id}>
                  <TableCell sx={{ pl: 0, fontWeight: 700 }}>{c.name}</TableCell>
                  <TableCell>{c.plan}</TableCell>
                  <TableCell>
                    <StatusChip label={c.status === 'active' ? 'Active' : 'Suspended'} tone={c.status === 'active' ? 'success' : 'neutral'} />
                  </TableCell>
                  <TableCell align="right">{c.employeeCount}</TableCell>
                  <TableCell align="right">{c.buildingCount}</TableCell>
                  <TableCell align="right">{c.clientCount}</TableCell>
                  <TableCell align="right" sx={{ pr: 0 }}>{c.activeProjectCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
}
