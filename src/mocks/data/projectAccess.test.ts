import { describe, expect, it } from 'vitest';
import { PROJECTS } from './portfolioData';
import {
  computeDefaultAccess,
  getEmployeeProjectAccess,
  setProjectStepAccessGrant,
  setProjectTeamMembership,
} from './projectAccess';

describe('computeDefaultAccess', () => {
  it('grants edit for admin regardless of team membership', () => {
    expect(computeDefaultAccess('admin', false, 'inspector')).toBe('edit');
    expect(computeDefaultAccess('admin', true, 'delivery')).toBe('edit');
  });

  it('grants edit for platformAdmin regardless of team membership', () => {
    expect(computeDefaultAccess('platformAdmin', false, 'analysis')).toBe('edit');
  });

  it('grants edit on the home step and view elsewhere for a team member', () => {
    expect(computeDefaultAccess('inspector', true, 'inspector')).toBe('edit');
    expect(computeDefaultAccess('inspector', true, 'analysis')).toBe('view');
    expect(computeDefaultAccess('inspector', true, 'delivery')).toBe('view');
  });

  it('grants nothing to a non-team employee', () => {
    expect(computeDefaultAccess('inspector', false, 'inspector')).toBe('none');
    expect(computeDefaultAccess('inspector', false, 'analysis')).toBe('none');
  });
});

describe('getEmployeeProjectAccess', () => {
  const projectId = PROJECTS[0].id;

  it('reflects team + home-step defaults with no overrides', () => {
    setProjectTeamMembership(projectId, 'emp-004', true); // R. Singh, role: inspector
    const access = getEmployeeProjectAccess(projectId, 'emp-004');
    expect(access.inspector).toBe('edit');
    expect(access.analysis).toBe('view');
    expect(access.delivery).toBe('view');
  });

  it('lets an explicit override win over the computed default', () => {
    setProjectTeamMembership(projectId, 'emp-004', true);
    setProjectStepAccessGrant(projectId, 'emp-004', 'analysis', 'edit', 'emp-001');
    expect(getEmployeeProjectAccess(projectId, 'emp-004').analysis).toBe('edit');

    setProjectStepAccessGrant(projectId, 'emp-004', 'inspector', 'none', 'emp-001');
    expect(getEmployeeProjectAccess(projectId, 'emp-004').inspector).toBe('none');

    // Clearing the override (null) reverts to the computed default.
    setProjectStepAccessGrant(projectId, 'emp-004', 'inspector', null, 'emp-001');
    expect(getEmployeeProjectAccess(projectId, 'emp-004').inspector).toBe('edit');
  });

  it('lets the executive hand-grant access to a non-team employee', () => {
    setProjectTeamMembership(projectId, 'emp-005', false); // ensure off-team
    expect(getEmployeeProjectAccess(projectId, 'emp-005').reportqa).toBe('none');

    setProjectStepAccessGrant(projectId, 'emp-005', 'reportqa', 'view', 'emp-001');
    expect(getEmployeeProjectAccess(projectId, 'emp-005').reportqa).toBe('view');
    // Team membership itself is untouched by hand-granting a step.
    expect(getEmployeeProjectAccess(projectId, 'emp-005').intake).toBe('none');
  });

  it('keeps the admin/platformAdmin bypass unconditional even with a contradictory override', () => {
    setProjectStepAccessGrant(projectId, 'emp-001', 'delivery', 'none', 'emp-001'); // emp-001 is admin
    expect(getEmployeeProjectAccess(projectId, 'emp-001').delivery).toBe('edit');
  });
});
