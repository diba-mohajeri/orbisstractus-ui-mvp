import { Box, Card, CardContent, Typography } from '@mui/material';
import KpiStrip, { type KpiTileData } from '../../../../shared/components/KpiStrip';
import RuleStatusList from '../../../../shared/components/RuleStatusList';
import PermissionMatrix from '../../../../shared/components/PermissionMatrix';
import { useReportQaStore } from '../../../../shared/store/reportQaStore';
import { usePortfolioSummary } from '../../../client-portal/api';
import { sectionTitleSx, subsectionTitleSx } from '../../shared/pageStyles';

const RELEASE_RULES = [
  { rule: 'Draft observations hidden until QA approved', status: 'Enforced' },
  { rule: 'P.Eng seal requires all QA flags closed', status: 'Enforced' },
  { rule: 'Final PDF blocked without applied seal', status: 'Enforced' },
  { rule: 'Client sees only released findings and reports', status: 'Enforced' },
];

const GOVERNANCE_ROLES = ['Inspector', 'Analyst', 'Report + QA / P.Eng.', 'Delivery', 'Administration', 'Client', 'Board'];
const GOVERNANCE_ACTIONS = ['View Draft', 'Edit Finding', 'Apply Seal', 'Release Final', 'Configure Platform', 'View Audit Log'];
const GOVERNANCE_GRANTS: Record<string, string[]> = {
  Inspector: ['View Draft', 'Edit Finding'],
  Analyst: ['View Draft', 'Edit Finding'],
  'Report + QA / P.Eng.': ['View Draft', 'Edit Finding', 'Apply Seal'],
  Delivery: ['View Draft', 'Release Final'],
  Administration: ['View Draft', 'Edit Finding', 'Apply Seal', 'Release Final', 'Configure Platform', 'View Audit Log'],
  Client: [],
  Board: [],
};

export default function GovernanceReleaseView() {
  const { data: summary } = usePortfolioSummary();
  const byProject = useReportQaStore((s) => s.byProject);

  const sealedCount = Object.values(byProject).filter((p) => p.sealApplied).length;
  const openFlagsTotal = Object.values(byProject).reduce((sum, p) => sum + p.flags.filter((f) => f.status === 'open').length, 0);

  const kpis: KpiTileData[] = [
    { label: 'Reports Sealed', value: String(sealedCount), tone: 'success' },
    { label: 'Open QA Flags', value: String(openFlagsTotal), tone: openFlagsTotal > 0 ? 'error' : 'success' },
    { label: 'Critical Deficiencies', value: String(summary?.highRiskItems ?? 0), tone: 'error' },
    { label: 'Enforced Rules', value: String(RELEASE_RULES.length), tone: 'success' },
  ];

  return (
    <Box>
      <Typography sx={{ ...sectionTitleSx, mb: 1.5 }}>
        Governance &amp; Release Engine
      </Typography>
      <KpiStrip items={kpis} />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1.4fr' }, gap: 2 }}>
        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Typography sx={{ ...subsectionTitleSx, mb: 1.5 }}>
              Release Rules
            </Typography>
            <RuleStatusList items={RELEASE_RULES} />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
              These are the same rules enforced live in Report + QA, Delivery, and the Embedded
              Report Viewer — not just documentation.
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Typography sx={{ ...subsectionTitleSx, mb: 1.5 }}>
              Governance Matrix
            </Typography>
            <PermissionMatrix
              rows={GOVERNANCE_ROLES}
              columns={GOVERNANCE_ACTIONS}
              isGranted={(row, col) => GOVERNANCE_GRANTS[row]?.includes(col) ?? false}
            />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
