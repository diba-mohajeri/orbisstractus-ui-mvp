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
  Tooltip,
  Typography,
} from '@mui/material';
import DataTable from '../../../../shared/components/DataTable';
import DetailDrawer from '../../../../shared/components/DetailDrawer';
import StatusChip from '../../../../shared/components/StatusChip';
import KpiStrip, { type KpiTileData } from '../../../../shared/components/KpiStrip';
import { useToast } from '../../../../shared/store/toastStore';
import { useAuthStore } from '../../../../shared/store/authStore';
import { EMPLOYEE_ROLE_OPTIONS, type EmployeeRole } from '../../../../domain/auth';
import type { EmployeeStatus } from '../../../../domain/employees';
import { PERMISSION_OPTIONS, type Permission } from '../../../../domain/permissions';
import {
  useEmployeeActivity,
  useEmployeeDetail,
  useEmployeeWorkload,
  useEmployees,
  useInviteEmployee,
  useUpdateEmployeePermissions,
  useUpdateEmployeeProfile,
  useUpdateEmployeeRole,
} from './employees/api';
import { sectionTitleSx, subsectionTitleSx } from '../../shared/pageStyles';

const ROLE_LABEL = new Map(EMPLOYEE_ROLE_OPTIONS.map((o) => [o.value, o.label]));
const STATUS_TONE: Record<EmployeeStatus, 'success' | 'warning' | 'neutral'> = {
  active: 'success',
  invited: 'warning',
  suspended: 'neutral',
};

interface InviteForm {
  name: string;
  email: string;
  role: EmployeeRole;
  title: string;
  department: string;
}

const EMPTY_INVITE: InviteForm = { name: '', email: '', role: 'overview', title: '', department: '' };

export default function UsersView() {
  const toast = useToast();
  const permissions = useAuthStore((s) => s.session?.user.permissions) ?? [];
  const canConfigure = permissions.includes('configure');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<'profile' | 'access' | 'activity'>('profile');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState<InviteForm>(EMPTY_INVITE);

  const { data: employees, isLoading } = useEmployees();
  const { data: detail } = useEmployeeDetail(selectedId);
  const { data: activity } = useEmployeeActivity(selectedId);
  const { data: workload } = useEmployeeWorkload(selectedId);

  const updateProfile = useUpdateEmployeeProfile();
  const updateRole = useUpdateEmployeeRole();
  const updatePermissions = useUpdateEmployeePermissions();
  const inviteEmployee = useInviteEmployee();

  const [profileForm, setProfileForm] = useState({ name: '', title: '', department: '', phone: '', status: 'active' as EmployeeStatus });
  const [roleForm, setRoleForm] = useState<EmployeeRole>('overview');
  const [permissionsForm, setPermissionsForm] = useState<Permission[]>([]);

  useEffect(() => {
    if (detail) {
      setProfileForm({
        name: detail.name,
        title: detail.title,
        department: detail.department,
        phone: detail.phone,
        status: detail.status,
      });
      setRoleForm(detail.role);
      setPermissionsForm(detail.permissions);
    }
  }, [detail]);

  const kpis: KpiTileData[] = [
    { label: 'Total Employees', value: String(employees?.length ?? 0), tone: 'neutral' },
    { label: 'Active', value: String(employees?.filter((e) => e.status === 'active').length ?? 0), tone: 'success' },
    { label: 'Pending Invites', value: String(employees?.filter((e) => e.status === 'invited').length ?? 0), tone: 'warning' },
    { label: 'Administrators', value: String(employees?.filter((e) => e.role === 'admin').length ?? 0), tone: 'neutral' },
  ];

  function closeDrawer() {
    setSelectedId(null);
    setDetailTab('profile');
  }

  function saveProfile() {
    if (!selectedId) return;
    updateProfile.mutate(
      { id: selectedId, ...profileForm },
      { onSuccess: () => toast('Profile updated.') },
    );
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
    setPermissionsForm((prev) =>
      prev.includes(permission) ? prev.filter((p) => p !== permission) : [...prev, permission],
    );
  }

  function savePermissions() {
    if (!selectedId) return;
    updatePermissions.mutate(
      { id: selectedId, permissions: permissionsForm },
      { onSuccess: () => toast('Permissions updated.') },
    );
  }

  function submitInvite() {
    inviteEmployee.mutate(inviteForm, {
      onSuccess: () => {
        toast(`Invited ${inviteForm.name} as ${ROLE_LABEL.get(inviteForm.role)}.`);
        setInviteOpen(false);
        setInviteForm(EMPTY_INVITE);
      },
    });
  }

  return (
    <Box>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography sx={sectionTitleSx}>Employees</Typography>
        <Tooltip title={canConfigure ? '' : "You don't have Configure permission."} disableHoverListener={canConfigure}>
          <span>
            <Button variant="contained" size="small" onClick={() => setInviteOpen(true)} disabled={!canConfigure}>
              Invite Employee
            </Button>
          </span>
        </Tooltip>
      </Stack>

      <KpiStrip items={kpis} />

      <Card>
        <CardContent sx={{ p: 2.5 }}>
          <DataTable
            loading={isLoading}
            columns={[
              { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
              { field: 'email', headerName: 'Email', flex: 1, minWidth: 180 },
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
            rows={employees ?? []}
            height={380}
            onRowClick={(row) => setSelectedId(row.id)}
          />
        </CardContent>
      </Card>

      <DetailDrawer
        open={Boolean(selectedId)}
        onClose={closeDrawer}
        title={detail?.name ?? 'Employee'}
        subtitle={detail?.email}
      >
        {detail && (
          <>
            <Tabs value={detailTab} onChange={(_, v) => setDetailTab(v)} sx={{ mb: 2 }}>
              <Tab value="profile" label="Profile" />
              <Tab value="access" label="Access" />
              <Tab value="activity" label="Activity & Workload" />
            </Tabs>

            {detailTab === 'profile' && (
              <Stack spacing={2}>
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
                <Button variant="contained" onClick={saveProfile} disabled={updateProfile.isPending || !canConfigure}>
                  Save Profile
                </Button>
              </Stack>
            )}

            {detailTab === 'access' && (
              <Stack spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  Changing this employee&apos;s role changes what they can access the next time they sign
                  in, and resets their permissions to that role&apos;s defaults below.
                </Typography>
                <TextField
                  select
                  label="Role"
                  fullWidth
                  value={roleForm}
                  onChange={(e) => setRoleForm(e.target.value as EmployeeRole)}
                >
                  {EMPLOYEE_ROLE_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
                <Button variant="contained" onClick={saveRole} disabled={updateRole.isPending || !canConfigure}>
                  Save Role
                </Button>

                <Divider />

                <Box>
                  <Typography sx={{ ...subsectionTitleSx, mb: 0.5 }}>
                    Permissions
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Check any permission this employee should individually have, beyond — or instead of —
                    their role&apos;s defaults. Takes effect the next time they sign in.
                  </Typography>
                  <FormGroup>
                    {PERMISSION_OPTIONS.map((option) => (
                      <FormControlLabel
                        key={option.value}
                        control={
                          <Checkbox
                            checked={permissionsForm.includes(option.value)}
                            onChange={() => togglePermission(option.value)}
                          />
                        }
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
                  <Button
                    variant="contained"
                    onClick={savePermissions}
                    disabled={updatePermissions.isPending || !canConfigure}
                    sx={{ mt: 1 }}
                  >
                    Save Permissions
                  </Button>
                  {!canConfigure && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      You don&apos;t have Configure permission, so changes here are disabled.
                    </Typography>
                  )}
                </Box>
              </Stack>
            )}

            {detailTab === 'activity' && (
              <Stack spacing={2.5}>
                <Box>
                  <Typography sx={{ ...subsectionTitleSx, mb: 1 }}>
                    Workload
                  </Typography>
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
                  <Typography sx={{ ...subsectionTitleSx, mb: 1 }}>
                    Recent Activity
                  </Typography>
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

      <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Invite Employee</DialogTitle>
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
            disabled={!inviteForm.name || !inviteForm.email || inviteEmployee.isPending || !canConfigure}
          >
            Send Invite
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}