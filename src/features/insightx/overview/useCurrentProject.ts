import { useInsightXShellStore } from '../../../shared/store/insightXShellStore';
import { useProjects } from '../../client-portal/api';

export function useCurrentProject() {
  const currentProjectId = useInsightXShellStore((s) => s.currentProjectId);
  const { data: projects } = useProjects();
  const activeProjects = (projects ?? []).filter((p) => p.status !== 'complete');
  const currentProject = activeProjects.find((p) => p.id === currentProjectId) ?? activeProjects[0];
  return { currentProject, activeProjects, projects };
}