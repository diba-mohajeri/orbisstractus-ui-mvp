import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { ApiError } from '../../../api/client';
import DetailDrawer from '../../../shared/components/DetailDrawer';
import KpiStrip from '../../../shared/components/KpiStrip';
import StatusChip, { healthTone, riskTone } from '../../../shared/components/StatusChip';
import { useToast } from '../../../shared/store/toastStore';
import type { Company, CompanyPlan, CompanyStatus } from '../../../domain/companies';
import { EMPLOYEE_ROLE_OPTIONS, type EmployeeRole } from '../../../domain/auth';
import type { EmployeeStatus } from '../../../domain/employees';
import { useInviteEmployee } from '../../insightx/administration/subviews/employees/api';
import { useCompanies, useCompanyDetail, useCreateCompany, useDeleteCompany, useUpdateCompany } from '../api';
import { pageTitleSx, rowCardSx, sectionTitleSx, subsectionTitleSx } from '../../insightx/shared/pageStyles';

const PLAN_OPTIONS: CompanyPlan[] = ['Starter', 'Professional', 'Enterprise'];
const ROLE_LABEL = new Map(EMPLOYEE_ROLE_OPTIONS.map((o) => [o.value, o.label]));
const STATUS_TONE: Record<EmployeeStatus, 'success' | 'warning' | 'neutral'> = {
  active: 'success',
  invited: 'warning',
  suspended: 'neutral',
};

interface NewCompanyForm {
  name: string;
  plan: CompanyPlan;
  primaryContactName: string;
  primaryContactEmail: string;
  firstAdminName: string;
  firstAdminEmail: string;
}

const EMPTY_FORM: NewCompanyForm = {
  name: '',
  plan: 'Starter',
  primaryContactName: '',
  primaryContactEmail: '',
  firstAdminName: '',
  firstAdminEmail: '',
};

interface InviteForm {
  name: string;
  email: string;
  role: EmployeeRole;
  title: string;
  department: string;
}

const EMPTY_INVITE: InviteForm = { name: '', email: '', role: 'overview', title: '', department: '' };

interface EditCompanyForm {
  name: string;
  plan: CompanyPlan;
  status: CompanyStatus;
  primaryContactName: string;
  primaryContactEmail: string;
}

function toEditForm(company: Company): EditCompanyForm {
  return {
    name: company.name,
    plan: company.plan,
    status: company.status,
    primaryContactName: company.primaryContactName,
    primaryContactEmail: company.primaryContactEmail,
  };
}

export default function CompaniesPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { data: companies, isLoading } = useCompanies();
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();
  const deleteCompany = useDeleteCompany();
  const inviteEmployee = useInviteEmployee();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<NewCompanyForm>(EMPTY_FORM);

  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const { data: detail } = useCompanyDetail(selectedCompanyId);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState<InviteForm>(EMPTY_INVITE);

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditCompanyForm | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<CompanyPlan | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<CompanyStatus | 'all'>('all');

  useEffect(() => {
    if (detail) setEditForm(toEditForm(detail.company));
  }, [detail]);

  const filteredCompanies = (companies ?? []).filter((c) => {
    const matchesSearch = !search.trim() || c.name.toLowerCase().includes(search.trim().toLowerCase());
    const matchesPlan = planFilter === 'all' || c.plan === planFilter;
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const canSubmit =
    form.name.trim() && form.primaryContactName.trim() && form.primaryContactEmail.trim() &&
    form.firstAdminName.trim() && form.firstAdminEmail.trim();

  function submit() {
    createCompany.mutate(form, {
      onSuccess: (result) => {
        toast(`${result.company.name} created — ${result.adminEmployee.email} invited as Administration.`);
        setOpen(false);
        setForm(EMPTY_FORM);
      },
    });
  }

  function submitInvite() {
    if (!selectedCompanyId) return;
    inviteEmployee.mutate(
      { ...inviteForm, companyId: selectedCompanyId },
      {
        onSuccess: () => {
          toast(`Invited ${inviteForm.name} as ${ROLE_LABEL.get(inviteForm.role)} at ${detail?.company.name ?? 'the company'}.`);
          setInviteOpen(false);
          setInviteForm(EMPTY_INVITE);
          queryClient.invalidateQueries({ queryKey: ['companies'] });
        },
      },
    );
  }

  function toggleStatus() {
    if (!selectedCompanyId || !detail) return;
    const nextStatus: CompanyStatus = detail.company.status === 'active' ? 'suspended' : 'active';
    updateCompany.mutate(
      { id: selectedCompanyId, status: nextStatus },
      { onSuccess: () => toast(`${detail.company.name} ${nextStatus === 'active' ? 'reactivated' : 'suspended'}.`) },
    );
  }

  function submitDelete() {
    if (!selectedCompanyId || !detail) return;
    deleteCompany.mutate(selectedCompanyId, {
      onSuccess: () => {
        toast(`${detail.company.name} deleted.`);
        setDeleteConfirmOpen(false);
        setSelectedCompanyId(null);
      },
      onError: (error) => {
        toast(error instanceof ApiError ? error.message : 'Could not delete company.');
      },
    });
  }

  function submitEdit() {
    if (!selectedCompanyId || !editForm) return;
    updateCompany.mutate(
      { id: selectedCompanyId, ...editForm },
      {
        onSuccess: () => {
          toast('Company details updated.');
          setEditOpen(false);
        },
      },
    );
  }

  return (
    <Box>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography component="h1" sx={pageTitleSx}>
          Companies
        </Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>
          + New Company
        </Button>
      </Stack>

      <Stack direction="row" spacing={1.5} sx={{ mb: 2, flexWrap: 'wrap', rowGap: 1 }}>
        <TextField
          size="small"
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 220 }}
        />
        <TextField
          select
          size="small"
          label="Plan"
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value as CompanyPlan | 'all')}
          sx={{ minWidth: 160 }}
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
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="all">All Statuses</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="suspended">Suspended</MenuItem>
        </TextField>
        <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
          {filteredCompanies.length} of {companies?.length ?? 0} companies
        </Typography>
      </Stack>

      {isLoading && (
        <Typography variant="body2" color="text.secondary">
          Loading companies…
        </Typography>
      )}

      <Stack spacing={1.25}>
        {filteredCompanies.map((c) => (
          <Card
            key={c.id}
            component="button"
            type="button"
            onClick={() => setSelectedCompanyId(c.id)}
            sx={{ textAlign: 'left', font: 'inherit', cursor: 'pointer', width: '100%', display: 'block' }}
          >
            <CardContent sx={{ p: 2 }}>
              <Box sx={rowCardSx}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ ...sectionTitleSx, fontSize: 16 }}>{c.name}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {c.primaryContactName} · {c.primaryContactEmail} · Created {c.createdAt}
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ mt: 1, flexWrap: 'wrap', rowGap: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">{c.employeeCount} employees</Typography>
                    <Typography variant="caption" color="text.secondary">{c.buildingCount} buildings</Typography>
                    <Typography variant="caption" color="text.secondary">{c.clientCount} clients</Typography>
                    <Typography variant="caption" color="text.secondary">{c.activeProjectCount} active projects</Typography>
                  </Stack>
                </Box>
                <Stack spacing={0.5} sx={{ alignItems: 'flex-end' }}>
                  <StatusChip label={c.plan} tone="neutral" />
                  <StatusChip label={c.status === 'active' ? 'Active' : 'Suspended'} tone={c.status === 'active' ? 'success' : 'neutral'} />
                </Stack>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <DetailDrawer
        open={Boolean(selectedCompanyId)}
        onClose={() => setSelectedCompanyId(null)}
        title={detail?.company.name ?? 'Company'}
        subtitle={detail ? `${detail.company.plan} plan · ${detail.company.primaryContactEmail}` : undefined}
      >
        {detail && (
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="contained" onClick={() => setEditOpen(true)}>
                Edit Company
              </Button>
              <Button size="small" variant="outlined" onClick={toggleStatus} disabled={updateCompany.isPending}>
                {detail.company.status === 'active' ? 'Suspend Company' : 'Reactivate Company'}
              </Button>
              <Button size="small" variant="outlined" color="error" onClick={() => setDeleteConfirmOpen(true)}>
                Delete Company
              </Button>
            </Stack>

            <KpiStrip
              items={[
                { label: 'Employees', value: String(detail.employees.length) },
                { label: 'Buildings', value: String(detail.buildings.length) },
                { label: 'Active Projects', value: String(detail.activeProjectCount) },
                { label: 'Deficiencies Found', value: String(detail.deficiencyCount) },
                { label: 'Reports Delivered', value: String(detail.reportCount) },
                { label: 'Capital Exposure', value: detail.capitalExposureFormatted },
              ]}
            />

            <Box>
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={subsectionTitleSx}>Employees</Typography>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => {
                    setInviteForm(EMPTY_INVITE);
                    setInviteOpen(true);
                  }}
                >
                  + Add Employee
                </Button>
              </Stack>
              <Stack spacing={1}>
                {detail.employees.map((e) => (
                  <Box key={e.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.25, gap: 1 }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{e.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{e.email} · {ROLE_LABEL.get(e.role) ?? e.role}</Typography>
                    </Box>
                    <StatusChip label={e.status} tone={STATUS_TONE[e.status]} />
                  </Box>
                ))}
                {detail.employees.length === 0 && (
                  <Typography variant="body2" color="text.secondary">No employees yet.</Typography>
                )}
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography sx={{ ...subsectionTitleSx, mb: 1 }}>Buildings</Typography>
              {detail.buildings.length > 0 ? (
                <Stack spacing={1}>
                  {detail.buildings.map((b) => (
                    <Box key={b.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.25 }}>
                      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{b.name}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            {b.address} · {b.regionName} · {b.clientOrganization}
                          </Typography>
                        </Box>
                        <Stack spacing={0.5} sx={{ alignItems: 'flex-end', flexShrink: 0 }}>
                          <StatusChip label={b.healthTier} tone={healthTone(b.healthTier)} />
                          <StatusChip label={`${b.riskLevel} risk`} tone={riskTone(b.riskLevel)} />
                        </Stack>
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        Health {b.healthPct}% · Capital exposure {b.capitalExposureFormatted}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">No buildings on file yet.</Typography>
              )}
            </Box>

            <Divider />

            <Box>
              <Typography sx={{ ...subsectionTitleSx, mb: 1 }}>Clients</Typography>
              {detail.clientOrganizations.length > 0 ? (
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                  {detail.clientOrganizations.map((name) => (
                    <StatusChip key={name} label={name} tone="neutral" />
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">No client buildings on file yet.</Typography>
              )}
            </Box>

            <Divider />

            <Box>
              <Typography sx={{ ...subsectionTitleSx, mb: 1 }}>Recent Activity</Typography>
              {detail.recentActivity.length > 0 ? (
                <Stack spacing={1}>
                  {detail.recentActivity.map((entry) => (
                    <Box key={entry.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.25 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{entry.action}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(entry.timestamp).toLocaleString()} · {entry.actor} — {entry.detail}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No recorded activity yet this session.
                </Typography>
              )}
            </Box>
          </Stack>
        )}
      </DetailDrawer>

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Delete {detail?.company.name}?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This permanently removes the company. It can only be deleted while it has no employees and no
            buildings — remove those first if this fails.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={submitDelete} disabled={deleteCompany.isPending}>
            Delete Company
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Edit Company</DialogTitle>
        <DialogContent>
          {editForm && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Company Name"
                fullWidth
                required
                value={editForm.name}
                onChange={(e) => setEditForm((f) => (f ? { ...f, name: e.target.value } : f))}
              />
              <TextField
                select
                label="Plan"
                fullWidth
                value={editForm.plan}
                onChange={(e) => setEditForm((f) => (f ? { ...f, plan: e.target.value as CompanyPlan } : f))}
              >
                {PLAN_OPTIONS.map((p) => (
                  <MenuItem key={p} value={p}>
                    {p}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Status"
                fullWidth
                value={editForm.status}
                onChange={(e) => setEditForm((f) => (f ? { ...f, status: e.target.value as CompanyStatus } : f))}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
              </TextField>
              <TextField
                label="Primary Contact Name"
                fullWidth
                required
                value={editForm.primaryContactName}
                onChange={(e) => setEditForm((f) => (f ? { ...f, primaryContactName: e.target.value } : f))}
              />
              <TextField
                label="Primary Contact Email"
                type="email"
                fullWidth
                required
                value={editForm.primaryContactEmail}
                onChange={(e) => setEditForm((f) => (f ? { ...f, primaryContactEmail: e.target.value } : f))}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submitEdit} disabled={updateCompany.isPending}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Add Employee — {detail?.company.name}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              fullWidth
              required
              value={inviteForm.name}
              onChange={(e) => setInviteForm((f) => ({ ...f, name: e.target.value }))}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              value={inviteForm.email}
              onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))}
            />
            <TextField
              select
              label="Role"
              fullWidth
              required
              value={inviteForm.role}
              onChange={(e) => setInviteForm((f) => ({ ...f, role: e.target.value as EmployeeRole }))}
            >
              {EMPLOYEE_ROLE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Title"
              fullWidth
              value={inviteForm.title}
              onChange={(e) => setInviteForm((f) => ({ ...f, title: e.target.value }))}
            />
            <TextField
              label="Department"
              fullWidth
              value={inviteForm.department}
              onChange={(e) => setInviteForm((f) => ({ ...f, department: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={submitInvite}
            disabled={!inviteForm.name.trim() || !inviteForm.email.trim() || inviteEmployee.isPending}
          >
            Send Invite
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>New Company</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Company Name"
              fullWidth
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <TextField
              select
              label="Plan"
              fullWidth
              value={form.plan}
              onChange={(e) => setForm((f) => ({ ...f, plan: e.target.value as CompanyPlan }))}
            >
              {PLAN_OPTIONS.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Primary Contact Name"
              fullWidth
              required
              value={form.primaryContactName}
              onChange={(e) => setForm((f) => ({ ...f, primaryContactName: e.target.value }))}
            />
            <TextField
              label="Primary Contact Email"
              type="email"
              fullWidth
              required
              value={form.primaryContactEmail}
              onChange={(e) => setForm((f) => ({ ...f, primaryContactEmail: e.target.value }))}
            />
            <TextField
              label="First Admin Name"
              fullWidth
              required
              value={form.firstAdminName}
              onChange={(e) => setForm((f) => ({ ...f, firstAdminName: e.target.value }))}
            />
            <TextField
              label="First Admin Email"
              type="email"
              fullWidth
              required
              helperText="This person is invited with the Administration role for the new company."
              value={form.firstAdminEmail}
              onChange={(e) => setForm((f) => ({ ...f, firstAdminEmail: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submit} disabled={!canSubmit || createCompany.isPending}>
            Create Company
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
