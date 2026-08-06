import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { ApiError } from '../../../api/client';
import DataTable from '../../../shared/components/DataTable';
import DetailDrawer from '../../../shared/components/DetailDrawer';
import KpiStrip from '../../../shared/components/KpiStrip';
import StatusChip from '../../../shared/components/StatusChip';
import { useToast } from '../../../shared/store/toastStore';
import { useAuthStore } from '../../../shared/store/authStore';
import { EMPLOYEE_ROLE_OPTIONS, type EmployeeRole } from '../../../domain/auth';
import type { EmployeeStatus } from '../../../domain/employees';
import { PERMISSION_OPTIONS, type Permission } from '../../../domain/permissions';
import {
  useDeleteEmployee,
  useEmployeeActivity,
  useEmployeeDetail,
  useEmployeeWorkload,
  useEmployees,
  useInviteEmployee,
  useUpdateEmployeePermissions,
  useUpdateEmployeeProfile,
  useUpdateEmployeeRole,
} from '../../insightx/administration/subviews/employees/api';
import { useCompanies } from '../api';
import { pageTitleSx, subsectionTitleSx } from '../../insightx/shared/pageStyles';

const ROLE_LABEL = new Map(EMPLOYEE_ROLE_OPTIONS.map((o) => [o.value, o.label]));
ROLE_LABEL.set('platformAdmin', 'Orbisstractus Platform Admin');

const STATUS_TONE: Record<EmployeeStatus, 'success' | 'warning' | 'neutral'> = {
  active: 'success',
  invited: 'warning',
  suspended: 'neutral',
};

interface InviteForm {
  name: string;
  email: string;
  role: EmployeeRole;
  companyId: string;
  title: string;
  department: string;
}

const emptyInvite = (companyId: string): InviteForm => ({ name: '', email: '', role: 'overview', companyId, title: '', department: '' });

export default function PlatformEmployeesPage() {
  const toast = useToast();
  const myEmployeeId = useAuthStore((s) => s.session?.user.employeeId);
  const { data: employees, isLoading } = useEmployees();
  const { data: companies } = useCompanies();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<'profile' | 'access' | 'activity'>('profile');
  const { data: detail } = useEmployeeDetail(selectedId);
  const { data: activity } = useEmployeeActivity(selectedId);
  const { data: workload } = useEmployeeWorkload(selectedId);

  const updateRole = useUpdateEmployeeRole();
  const updatePermissions = useUpdateEmployeePermissions();
  const updateProfile = useUpdateEmployeeProfile();
  const deleteEmployee = useDeleteEmployee();
  const inviteEmployee = useInviteEmployee();

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [roleForm, setRoleForm] = useState<EmployeeRole>('overview');
  const [permissionsForm, setPermissionsForm] = useState<Permission[]>([]);
  const [profileForm, setProfileForm] = useState({ name: '', title: '', department: '', phone: '', status: 'active' as EmployeeStatus });

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState<InviteForm>(emptyInvite(companies?.[0]?.id ?? ''));

  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState<EmployeeRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<EmployeeStatus | 'all'>('all');

  useEffect(() => {
    if (detail) {
      setRoleForm(detail.role);
      setPermissionsForm(detail.permissions);
      setProfileForm({
        name: detail.name,
        title: detail.title,
        department: detail.department,
        phone: detail.phone,
        status: detail.status,
      });
    }
  }, [detail]);

  const companyName = new Map((companies ?? []).map((c) => [c.id, c.name]));
  const rows = (employees ?? [])
    .map((e) => ({
      ...e,
      companyLabel: e.companyId ? companyName.get(e.companyId) ?? e.companyId : 'Orbisstractus',
    }))
    .filter((e) => {
      const term = search.trim().toLowerCase();
      const matchesSearch = !term || e.name.toLowerCase().includes(term) || e.email.toLowerCase().includes(term);
      const matchesCompany = companyFilter === 'all' || (companyFilter === 'orbisstractus' ? !e.companyId : e.companyId === companyFilter);
      const matchesRole = roleFilter === 'all' || e.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
      return matchesSearch && matchesCompany && matchesRole && matchesStatus;
    });

  function closeDrawer() {
    setSelectedId(null);
    setDetailTab('profile');
  }

  function saveRole() {
    if (!selectedId) return;
    updateRole.mutate(
      { id: selectedId, role: roleForm },
      {
        onSuccess: (employee) => {
          setPermissionsForm(employee.permissions);
          toast(`Role changed to ${ROLE_LABEL.get(roleForm)}. Permissions reset to role defaults.`);
        },
      },
    );
  }

  function togglePermission(permission: Permission) {
    setPermissionsForm((prev) => (prev.includes(permission) ? prev.filter((p) => p !== permission) : [...prev, permission]));
  }

  function savePermissions() {
    if (!selectedId) return;
    updatePermissions.mutate({ id: selectedId, permissions: permissionsForm }, { onSuccess: () => toast('Permissions updated.') });
  }

  function saveProfile() {
    if (!selectedId) return;
    updateProfile.mutate({ id: selectedId, ...profileForm }, { onSuccess: () => toast('Profile updated.') });
  }

  function submitDelete() {
    if (!selectedId || !detail) return;
    deleteEmployee.mutate(selectedId, {
      onSuccess: () => {
        toast(`${detail.name} deleted.`);
        setDeleteConfirmOpen(false);
        closeDrawer();
      },
      onError: (error) => {
        toast(error instanceof ApiError ? error.message : 'Could not delete employee.');
      },
    });
  }

  function openInvite() {
    setInviteForm(emptyInvite(companies?.[0]?.id ?? ''));
    setInviteOpen(true);
  }

  function submitInvite() {
    inviteEmployee.mutate(inviteForm, {
      onSuccess: () => {
        toast(`Invited ${inviteForm.name} as ${ROLE_LABEL.get(inviteForm.role)} at ${companyName.get(inviteForm.companyId) ?? 'the company'}.`);
        setInviteOpen(false);
      },
    });
  }

  return (
    <Box>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography component="h1" sx={pageTitleSx}>
          All Employees
        </Typography>
        <Button variant="contained" onClick={openInvite} disabled={!companies || companies.length === 0}>
          + Invite Employee
        </Button>
      </Stack>

      <Stack direction="row" spacing={1.5} sx={{ mb: 2, flexWrap: 'wrap', rowGap: 1 }}>
        <TextField
          size="small"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 220 }}
        />
        <TextField
          select
          size="small"
          label="Company"
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
          sx={{ minWidth: 170 }}
        >
          <MenuItem value="all">All Companies</MenuItem>
          <MenuItem value="orbisstractus">Orbisstractus</MenuItem>
          {(companies ?? []).map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Role"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as EmployeeRole | 'all')}
          sx={{ minWidth: 170 }}
        >
          <MenuItem value="all">All Roles</MenuItem>
          {EMPLOYEE_ROLE_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
          <MenuItem value="platformAdmin">Orbisstractus Platform Admin</MenuItem>
        </TextField>
        <TextField
          select
          size="small"
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as EmployeeStatus | 'all')}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="all">All Statuses</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="invited">Invited</MenuItem>
          <MenuItem value="suspended">Suspended</MenuItem>
        </TextField>
        <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
          {rows.length} of {employees?.length ?? 0} employees
        </Typography>
      </Stack>

      <Card>
        <CardContent sx={{ p: 2.5 }}>
          <DataTable
            loading={isLoading}
            columns={[
              { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
              { field: 'email', headerName: 'Email', flex: 1, minWidth: 190 },
              { field: 'companyLabel', headerName: 'Company', width: 190 },
              {
                field: 'role',
                headerName: 'Role',
                width: 190,
                renderCell: (params) => ROLE_LABEL.get(params.value as EmployeeRole) ?? params.value,
              },
              {
                field: 'status',
                headerName: 'Status',
                width: 120,
                renderCell: (params) => (
                  <StatusChip label={params.value} tone={STATUS_TONE[params.value as EmployeeStatus]} />
                ),
              },
            ]}
            rows={rows}
            height={480}
            onRowClick={(row) => setSelectedId(row.id)}
          />
        </CardContent>
      </Card>

      <DetailDrawer open={Boolean(selectedId)} onClose={closeDrawer} title={detail?.name ?? 'Employee'} subtitle={detail?.email}>
        {detail && (
          <>
            <Tabs value={detailTab} onChange={(_, v) => setDetailTab(v)} sx={{ mb: 2 }}>
              <Tab value="profile" label="Profile" />
              <Tab value="access" label="Access" />
              <Tab value="activity" label="Activity & Workload" />
            </Tabs>

            {detailTab === 'profile' && (
              <Stack spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  Company: {detail.companyId ? companyName.get(detail.companyId) ?? detail.companyId : 'Orbisstractus'} · Role: {ROLE_LABEL.get(detail.role) ?? detail.role}
                </Typography>
                <TextField
                  label="Name"
                  fullWidth
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
                />
                <TextField label="Email" fullWidth value={detail.email} disabled />
                <TextField
                  label="Title"
                  fullWidth
                  value={profileForm.title}
                  onChange={(e) => setProfileForm((f) => ({ ...f, title: e.target.value }))}
                />
                <TextField
                  label="Department"
                  fullWidth
                  value={profileForm.department}
                  onChange={(e) => setProfileForm((f) => ({ ...f, department: e.target.value }))}
                />
                <TextField
                  label="Phone"
                  fullWidth
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
                />
                <TextField
                  select
                  label="Status"
                  fullWidth
                  value={profileForm.status}
                  onChange={(e) => setProfileForm((f) => ({ ...f, status: e.target.value as EmployeeStatus }))}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="invited">Invited</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                </TextField>
                <Button variant="contained" onClick={saveProfile} disabled={updateProfile.isPending}>
                  Save Profile
                </Button>
                <Divider />
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setDeleteConfirmOpen(true)}
                  disabled={selectedId === myEmployeeId}
                >
                  Delete Employee
                </Button>
                {selectedId === myEmployeeId && (
                  <Typography variant="caption" color="text.secondary">
                    You can&apos;t delete your own account while signed in.
                  </Typography>
                )}
              </Stack>
            )}

            {detailTab === 'access' && (
              <Stack spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  Changing this employee&apos;s role changes what they can access the next time they sign in, and
                  resets their permissions to that role&apos;s defaults below.
                </Typography>
                <TextField select label="Role" fullWidth value={roleForm} onChange={(e) => setRoleForm(e.target.value as EmployeeRole)}>
                  {EMPLOYEE_ROLE_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
                <Button variant="contained" onClick={saveRole} disabled={updateRole.isPending}>
                  Save Role
                </Button>

                <Divider />

                <Box>
                  <Typography sx={{ ...subsectionTitleSx, mb: 0.5 }}>Permissions</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Check any permission this employee should individually have, beyond — or instead of — their
                    role&apos;s defaults. Takes effect the next time they sign in.
                  </Typography>
                  <FormGroup>
                    {PERMISSION_OPTIONS.map((option) => (
                      <FormControlLabel
                        key={option.value}
                        control={<Checkbox checked={permissionsForm.includes(option.value)} onChange={() => togglePermission(option.value)} />}
                        label={
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {option.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {option.description}
                            </Typography>
                          </Box>
                        }
                      />
                    ))}
                  </FormGroup>
                  <Button variant="contained" onClick={savePermissions} disabled={updatePermissions.isPending} sx={{ mt: 1 }}>
                    Save Permissions
                  </Button>
                </Box>
              </Stack>
            )}

            {detailTab === 'activity' && (
              <Stack spacing={2.5}>
                <Box>
                  <Typography sx={{ ...subsectionTitleSx, mb: 1 }}>Workload</Typography>
                  <KpiStrip
                    items={[
                      { label: 'Active', value: String(workload?.activeCount ?? 0), tone: 'success' },
                      { label: 'Planned', value: String(workload?.plannedCount ?? 0), tone: 'neutral' },
                      { label: 'Complete', value: String(workload?.completeCount ?? 0), tone: 'neutral' },
                    ]}
                  />
                  {workload && workload.projects.length > 0 ? (
                    <Stack spacing={1}>
                      {workload.projects.map((p) => (
                        <Box key={p.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.25 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {p.buildingName} — {p.serviceLine}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {p.currentStage} ({p.status})
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No assigned projects.
                    </Typography>
                  )}
                </Box>

                <Divider />

                <Box>
                  <Typography sx={{ ...subsectionTitleSx, mb: 1 }}>Recent Activity</Typography>
                  {activity && activity.length > 0 ? (
                    <Stack spacing={1}>
                      {activity.map((entry) => (
                        <Box key={entry.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.25 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {entry.action}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(entry.timestamp).toLocaleString()} — {entry.detail}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No recorded activity yet.
                    </Typography>
                  )}
                </Box>
              </Stack>
            )}
          </>
        )}
      </DetailDrawer>

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Delete {detail?.name}?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This permanently removes the employee&apos;s account and access across every project. This can&apos;t be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={submitDelete} disabled={deleteEmployee.isPending}>
            Delete Employee
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Invite Employee</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="Company"
              fullWidth
              required
              value={inviteForm.companyId}
              onChange={(e) => setInviteForm((f) => ({ ...f, companyId: e.target.value }))}
            >
              {(companies ?? []).map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
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
            disabled={!inviteForm.name.trim() || !inviteForm.email.trim() || !inviteForm.companyId || inviteEmployee.isPending}
          >
            Send Invite
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
