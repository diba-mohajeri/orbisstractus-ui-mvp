import { useState } from 'react';
import { Alert, Box, Card, CardContent, Checkbox, FormControlLabel, MenuItem, Stack, TextField, Typography } from '@mui/material';
import ProjectAccessMatrix from '../../../../shared/components/ProjectAccessMatrix';
import { useToast } from '../../../../shared/store/toastStore';
import { useAuthStore } from '../../../../shared/store/authStore';
import { useProjects } from '../../../client-portal/api';
import { EMPLOYEE_ROLE_OPTIONS, type EmployeeRole } from '../../../../domain/auth';
import { PROJECT_STEP_KEYS, PROJECT_STEP_LABEL, type AccessLevel, type ProjectStepKey } from '../../../../domain/projectAccess';
import { useProjectAccessOverview, useUpdateProjectStepAccess, useUpdateProjectTeam } from './projectAccess/api';
import { sectionTitleSx, subsectionTitleSx } from '../../shared/pageStyles';

const ROLE_LABEL = new Map(EMPLOYEE_ROLE_OPTIONS.map((o) => [o.value, o.label]));

export default function ProjectAccessView() {
  const toast = useToast();
  const permissions = useAuthStore((s) => s.session?.user.permissions) ?? [];
  const canConfigure = permissions.includes('configure');

  const { data: projects, isLoading: projectsLoading } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined);
  const activeProjectId = selectedProjectId ?? projects?.[0]?.id;

  const { data: rows, isLoading: accessLoading } = useProjectAccessOverview(activeProjectId);
  const updateTeam = useUpdateProjectTeam(activeProjectId);
  const updateAccess = useUpdateProjectStepAccess(activeProjectId);

  function toggleTeam(employeeId: string, employeeName: string, onTeam: boolean) {
    updateTeam.mutate(
      { employeeId, onTeam: !onTeam },
      {
        onSuccess: () => toast(`${employeeName} ${!onTeam ? 'added to' : 'removed from'} the project team.`),
      },
    );
  }

  function setAccess(employeeId: string, step: ProjectStepKey, level: AccessLevel | null) {
    const employeeName = rows?.find((r) => r.employeeId === employeeId)?.employeeName ?? employeeId;
    updateAccess.mutate(
      { employeeId, step, accessLevel: level },
      {
        onSuccess: () =>
          toast(`${employeeName} → ${PROJECT_STEP_LABEL[step]}: ${level ? level : 'reverted to default'}.`),
      },
    );
  }

  return (
    <Box>
      <Typography sx={{ ...sectionTitleSx, mb: 1.5 }}>Project Access</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 820 }}>
        Every employee on a project&apos;s team defaults to View on all five workflow steps and Edit on their own
        step. Grant a specific View or Edit override on any step for any employee — including employees not on the
        team — to fine-tune access without a full team reassignment. Administration and Orbisstractus Platform
        Admin accounts always have full edit access and aren&apos;t shown here.
      </Typography>

      <TextField
        select
        size="small"
        label="Project"
        value={activeProjectId ?? ''}
        onChange={(event) => setSelectedProjectId(event.target.value)}
        disabled={projectsLoading}
        sx={{ minWidth: 320, mb: 2.5 }}
      >
        {(projects ?? []).map((project) => (
          <MenuItem key={project.id} value={project.id}>
            {project.buildingName} — {project.serviceLine}
          </MenuItem>
        ))}
      </TextField>

      {!canConfigure && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You don&apos;t have Configure permission — Project Access is read-only for you.
        </Alert>
      )}

      {accessLoading || !activeProjectId ? (
        <Typography variant="body2" color="text.secondary">
          Loading…
        </Typography>
      ) : (
        <Stack spacing={2.5}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Typography sx={{ ...subsectionTitleSx, mb: 1.5 }}>Project Team</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 1 }}>
                {(rows ?? []).map((row) => (
                  <FormControlLabel
                    key={row.employeeId}
                    control={
                      <Checkbox
                        checked={row.onTeam}
                        disabled={!canConfigure}
                        onChange={() => toggleTeam(row.employeeId, row.employeeName, row.onTeam)}
                      />
                    }
                    label={`${row.employeeName} — ${ROLE_LABEL.get(row.employeeRole as EmployeeRole) ?? row.employeeRole}`}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Typography sx={{ ...subsectionTitleSx, mb: 1.5 }}>Step Access Matrix</Typography>
              <ProjectAccessMatrix
                rows={rows ?? []}
                steps={PROJECT_STEP_KEYS}
                stepLabel={(step) => PROJECT_STEP_LABEL[step]}
                disabled={!canConfigure}
                onSetAccess={setAccess}
              />
            </CardContent>
          </Card>
        </Stack>
      )}
    </Box>
  );
}
