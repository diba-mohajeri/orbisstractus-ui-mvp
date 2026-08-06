import { Box, Card, CardContent, Typography } from '@mui/material';
import PermissionMatrix from '../../../../shared/components/PermissionMatrix';
import { useToast } from '../../../../shared/store/toastStore';
import { EMPLOYEE_ROLE_OPTIONS, type EmployeeRole } from '../../../../domain/auth';
import { PERMISSION_OPTIONS, type Permission } from '../../../../domain/permissions';
import { useRolePermissions, useUpdateRolePermission } from './roles/api';
import { sectionTitleSx, subsectionTitleSx } from '../../shared/pageStyles';

const ROLE_DESCRIPTION: Record<EmployeeRole, string> = {
  overview: 'Full read access, workflow oversight, no direct edits.',
  intake: 'Scope governance, readiness tracking, Inspector handoff.',
  inspector: 'Field observation capture within approved scope.',
  analysis: 'Deficiency and cost finding authorship.',
  reportqa: 'QA sign-off and professional seal authority.',
  delivery: 'Client-facing package release.',
  admin: 'Platform configuration and governance.',
  platformAdmin: 'Orbisstractus vendor-level access across all companies.',
};

const ROLE_LABEL = new Map(EMPLOYEE_ROLE_OPTIONS.map((o) => [o.value, o.label]));
const PERMISSION_LABEL = new Map(PERMISSION_OPTIONS.map((o) => [o.value, o.label]));

export default function RolesPermissionsView() {
  const toast = useToast();
  const { data: rolePermissions, isLoading } = useRolePermissions();
  const updateRolePermission = useUpdateRolePermission();

  const roleValues = EMPLOYEE_ROLE_OPTIONS.map((o) => o.value);
  const permissionValues = PERMISSION_OPTIONS.map((o) => o.value);

  function isGranted(role: string, permission: string): boolean {
    return rolePermissions?.[role as EmployeeRole]?.includes(permission as Permission) ?? false;
  }

  function toggle(role: string, permission: string) {
    const granted = !isGranted(role, permission);
    updateRolePermission.mutate(
      { role: role as EmployeeRole, permission: permission as Permission, granted },
      {
        onSuccess: () =>
          toast(
            `${granted ? 'Granted' : 'Revoked'} ${PERMISSION_LABEL.get(permission as Permission)} for ${ROLE_LABEL.get(role as EmployeeRole)}.`,
          ),
      },
    );
  }

  return (
    <Box>
      <Typography sx={{ ...sectionTitleSx, mb: 1.5 }}>
        Roles &amp; Permissions
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 1.5, mb: 2 }}>
        {EMPLOYEE_ROLE_OPTIONS.map((r) => (
          <Card key={r.value} variant="outlined">
            <CardContent sx={{ p: 2 }}>
              <Typography sx={{ fontWeight: 800, mb: 0.5 }}>{r.label}</Typography>
              <Typography variant="caption" color="text.secondary">
                {ROLE_DESCRIPTION[r.value]}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
      <Card>
        <CardContent sx={{ p: 2.5 }}>
          <Typography sx={{ ...subsectionTitleSx, mb: 0.5 }}>
            Role Permission Matrix
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Check or uncheck a permission to grant or revoke it for every employee currently assigned that
            role. Individual employees can still be granted or revoked permissions beyond their role from
            their profile in the Employees tab.
          </Typography>
          {isLoading ? (
            <Typography variant="body2" color="text.secondary">
              Loading…
            </Typography>
          ) : (
            <PermissionMatrix
              rows={roleValues}
              columns={permissionValues}
              rowLabel={(role) => ROLE_LABEL.get(role as EmployeeRole) ?? role}
              columnLabel={(permission) => PERMISSION_LABEL.get(permission as Permission) ?? permission}
              isGranted={isGranted}
              onToggle={toggle}
            />
          )}
        </CardContent>
      </Card>
    </Box>
  );
}