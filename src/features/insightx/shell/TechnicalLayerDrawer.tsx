import { Box, Typography } from '@mui/material';
import DetailDrawer from '../../../shared/components/DetailDrawer';
import StatusChip from '../../../shared/components/StatusChip';
import { useBuildingSystems } from '../../client-portal/api';
import { subsectionTitleSx } from '../shared/pageStyles';
import { legacyTokens } from '../../../theme/theme';
import TechnicalLayerModal from './TechnicalLayerModal';
import { DEFAULT_REPORT_FINDING_TRACE } from '../shared/traceability';

interface TechnicalLayerDrawerProps {
  open: boolean;
  onClose: () => void;
  screenKey: string;
  buildingId: string | null;
}

const SCREEN_NOTES: Record<string, string> = {
  overview:
    'Portfolio-wide technical backbone: Uniformat system hierarchy and ASTM condition classification underpin every screen in this workspace.',
  intake: 'Scope governance is enforced through the system scope matrix — only in-scope systems flow downstream to Inspector and Analyst.',
  inspector: 'Field observations are recorded against the approved scope, with evidence linkage enforced at the component level.',
};

export default function TechnicalLayerDrawer({ open, onClose, screenKey, buildingId }: TechnicalLayerDrawerProps) {
  const { data: systems } = useBuildingSystems(open ? buildingId : null);

  if (screenKey === 'overview') {
    return <OverviewTechnicalLayer open={open} onClose={onClose} />;
  }

  if (screenKey === 'intake') {
    return <IntakeTechnicalLayer open={open} onClose={onClose} />;
  }

  if (screenKey === 'analysis') {
    return <AnalystTechnicalLayer open={open} onClose={onClose} />;
  }

  if (screenKey === 'reportqa') {
    return <ReportQaTechnicalLayer open={open} onClose={onClose} />;
  }

  return (
    <DetailDrawer open={open} onClose={onClose} title="Technical Layer" subtitle="ASTM / BCA technical backbone">
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {SCREEN_NOTES[screenKey] ?? 'Technical backbone detail for this screen.'}
      </Typography>
      <Typography sx={{ ...subsectionTitleSx, mb: 1 }}>
        System Status
      </Typography>
      {(systems ?? []).map((s) => (
        <Box
          key={s.id}
          sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}
        >
          <Typography variant="body2">{s.systemName}</Typography>
          <StatusChip label={s.status} tone={s.status === 'good' ? 'success' : s.status === 'fair' ? 'warning' : 'error'} />
        </Box>
      ))}
    </DetailDrawer>
  );
}

const ARCHITECTURE_ROWS = [
  ['Intake', 'Is the project ready?', 'Scope categories selected from Excel-backed ASTM/BCA hierarchy.'],
  ['Inspector', 'Has evidence been captured?', 'Observations must carry L1–L5 classification and media links.'],
  ['Analysis', 'Are findings defensible?', 'Deficiencies inherit code path and add severity, priority, RUL, costs.'],
  ['Report/QA', 'Is it ready to issue?', 'Traceability validates source evidence, findings, and approval state.'],
] as const;

const CODE_PATH = [
  ['L1', 'B', 'Shell'],
  ['L2', 'B30', 'Roofing'],
  ['L3', 'B3010', 'Roof Coverings'],
  ['L4', 'B3010.10', 'Membrane'],
  ['L5', 'B3010.10.02', 'Lap Seams'],
] as const;

function OverviewTechnicalLayer({ open, onClose }: Pick<TechnicalLayerDrawerProps, 'open' | 'onClose'>) {
  return (
    <TechnicalLayerModal
      open={open}
      onClose={onClose}
      title="Overview Technical Layer · Workflow Backbone"
      subtitle="How the executive dashboard is supported by ASTM/BCA classification, Excel population, and role enforcement."
    >
      <Box
        role="note"
        sx={{
          bgcolor: legacyTokens.greenSoft,
          borderLeft: `4px solid ${legacyTokens.green}`,
          borderRadius: 1.5,
          color: '#185c46',
          px: 2,
          py: 1.5,
          mb: 4,
          fontWeight: 650,
        }}
      >
        Design principle: executive screen remains easy to follow; technical depth is available only when needed.
      </Box>

      <Typography component="h3" sx={{ color: legacyTokens.navy, fontSize: 22, fontWeight: 900, mb: 1.75 }}>
        System Architecture
      </Typography>
      <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden', mb: 4.5 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '0.7fr 1fr 1.7fr' },
            bgcolor: '#f3f5f8',
            px: 2,
            py: 1.35,
            gap: 2,
          }}
        >
          {['Layer', 'Executive Meaning', 'Technical Meaning'].map((heading) => (
            <Typography key={heading} variant="body2" sx={{ fontWeight: 850, color: legacyTokens.navy }}>
              {heading}
            </Typography>
          ))}
        </Box>
        {ARCHITECTURE_ROWS.map(([layer, executiveMeaning, technicalMeaning]) => (
          <Box
            key={layer}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '0.7fr 1fr 1.7fr' },
              gap: { xs: 0.5, sm: 2 },
              px: 2,
              py: 1.75,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 800 }}>{layer}</Typography>
            <Typography variant="body2">{executiveMeaning}</Typography>
            <Typography variant="body2" color="text.secondary">{technicalMeaning}</Typography>
          </Box>
        ))}
      </Box>

      <Typography component="h3" sx={{ color: legacyTokens.navy, fontSize: 22, fontWeight: 900, mb: 1.75 }}>
        Example 5-Level Code Path
      </Typography>
      <Box sx={{ display: 'grid', gap: 1 }}>
        {CODE_PATH.map(([level, code, description]) => (
          <Box
            key={level}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '42px minmax(115px, auto) 1fr', sm: '70px 190px 1fr' },
              alignItems: 'center',
              gap: 1.5,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              px: 2,
              py: 1.35,
            }}
          >
            <Typography sx={{ color: legacyTokens.blue, fontWeight: 900 }}>{level}</Typography>
            <Box
              component="code"
              sx={{
                justifySelf: 'start',
                bgcolor: '#f3f6fa',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                px: 1,
                py: 0.4,
                color: legacyTokens.navy,
                fontFamily: 'Consolas, "Courier New", monospace',
                fontSize: 14,
              }}
            >
              {code}
            </Box>
            <Typography variant="body2">{description}</Typography>
          </Box>
        ))}
      </Box>
    </TechnicalLayerModal>
  );
}

const INTAKE_SCOPE_ROWS = [
  ['L1 System Group', 'Used to group the major assessment categories.'],
  ['L2 System', 'Used for project scope and report grouping.'],
  ['L3 Assembly', 'Used for executive scope matrix and report sections.'],
  ['L4 Sub-Assembly', 'Used to define required inspection prompts.'],
  ['L5 Component / Defect Type', 'Used to populate field capture options and capital plan rows.'],
] as const;

function IntakeTechnicalLayer({ open, onClose }: Pick<TechnicalLayerDrawerProps, 'open' | 'onClose'>) {
  return (
    <TechnicalLayerModal
      open={open}
      onClose={onClose}
      heightMode="content"
      title="PM / Intake Technical Layer · Project Setup"
      subtitle="How intake selections populate the Excel-backed scope model and field prompts."
    >
      <Typography component="h3" sx={{ color: legacyTokens.navy, fontSize: 22, fontWeight: 900, mb: 1.75 }}>
        Excel-Driven Scope Setup
      </Typography>

      <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden', mb: 2.5 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '0.9fr 1.5fr' },
            bgcolor: '#f3f5f8',
            px: 2,
            py: 1.35,
            gap: 2,
          }}
        >
          {['Excel Column / Concept', 'How It Appears in Intake'].map((heading) => (
            <Typography key={heading} variant="body2" sx={{ fontWeight: 850, color: legacyTokens.navy }}>
              {heading}
            </Typography>
          ))}
        </Box>
        {INTAKE_SCOPE_ROWS.map(([concept, meaning]) => (
          <Box
            key={concept}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '0.9fr 1.5fr' },
              gap: { xs: 0.5, sm: 2 },
              px: 2,
              py: 1.55,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 800 }}>{concept}</Typography>
            <Typography variant="body2">{meaning}</Typography>
          </Box>
        ))}
      </Box>

      <Box
        role="note"
        sx={{
          bgcolor: legacyTokens.greenSoft,
          borderLeft: `4px solid ${legacyTokens.green}`,
          borderRadius: 1.5,
          color: '#185c46',
          px: 2,
          py: 1.5,
          fontWeight: 650,
        }}
      >
        Once complete, the selected L1–L5 scope package becomes the Inspector&apos;s field capture library.
      </Box>
    </TechnicalLayerModal>
  );
}

const ANALYST_DEFAULT_ROWS = [
  ['Report Group', 'B Shell → Roofing → Roof Coverings', 'No, inherited from code'],
  ['Unit Basis', 'm²', 'Yes, with reason'],
  ['Typical RUL Range', '0–5 years', 'Yes, analyst judgment'],
  ['Cost Logic', 'Repair allowance + replacement planning flag', 'Yes, with reason'],
  ['QA Trigger', 'High severity + RUL under 2 years', 'System-generated'],
] as const;

const TRACEABILITY_ROWS = [
  ['Excel Master', 'B3010.10.02 · Lap Seams'],
  ['Inspection', 'OBS-ROOF-023 + tagged photos'],
  ['Analysis', 'DEF-ROOF-023 + severity/RUL/recommendation'],
  ['Report', 'Future FIND-ROOF-023'],
] as const;

function AnalystTechnicalLayer({ open, onClose }: Pick<TechnicalLayerDrawerProps, 'open' | 'onClose'>) {
  return (
    <TechnicalLayerModal
      open={open}
      onClose={onClose}
      title="Analyst Technical Layer · Analysis Logic"
      subtitle="How coded observations become deficiencies, RUL, recommendations, cost logic, and report-ready findings."
    >
      <Box
        role="note"
        sx={{
          bgcolor: legacyTokens.greenSoft,
          borderLeft: `4px solid ${legacyTokens.green}`,
          borderRadius: 1.5,
          color: '#185c46',
          px: 2,
          py: 1.5,
          mb: 4,
          fontWeight: 650,
        }}
      >
        The analysis layer inherits the Inspector&apos;s validated ASTM/BCA L1–L5 path and adds professional judgment.
      </Box>

      <Typography component="h3" sx={{ color: legacyTokens.navy, fontSize: 22, fontWeight: 900, mb: 1.75 }}>
        Inherited 5-Level Code Path
      </Typography>
      <Box sx={{ display: 'grid', gap: 1, mb: 4.5 }}>
        {CODE_PATH.map(([level, code, description]) => (
          <Box
            key={level}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '42px minmax(115px, auto) 1fr', sm: '70px 190px 1fr' },
              alignItems: 'center',
              gap: 1.5,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              px: 2,
              py: 1.35,
            }}
          >
            <Typography sx={{ color: legacyTokens.blue, fontWeight: 900 }}>{level}</Typography>
            <Box component="code" sx={{ justifySelf: 'start', bgcolor: '#f3f6fa', border: '1px solid', borderColor: 'divider', borderRadius: 1, px: 1, py: 0.4, color: legacyTokens.navy, fontFamily: 'Consolas, "Courier New", monospace', fontSize: 14 }}>
              {code}
            </Box>
            <Typography variant="body2">{description}</Typography>
          </Box>
        ))}
      </Box>

      <Typography component="h3" sx={{ color: legacyTokens.navy, fontSize: 22, fontWeight: 900, mb: 1.75 }}>
        Excel-Driven Defaults Used by Analyst
      </Typography>
      <ReferenceTable
        headers={['Default Field', 'Example Value', 'Editable?']}
        rows={ANALYST_DEFAULT_ROWS}
        columns={{ xs: '1fr', sm: '0.8fr 1.4fr 1fr' }}
      />

      <Typography component="h3" sx={{ color: legacyTokens.navy, fontSize: 22, fontWeight: 900, mt: 4.5, mb: 1.75 }}>
        Traceability Chain
      </Typography>
      <ReferenceTable
        headers={['Stage', 'Record']}
        rows={TRACEABILITY_ROWS}
        columns={{ xs: '1fr', sm: '0.7fr 1.8fr' }}
      />

      <Box
        role="note"
        sx={{
          bgcolor: legacyTokens.redSoft,
          borderLeft: `4px solid ${legacyTokens.red}`,
          borderRadius: 1.5,
          color: '#8a2820',
          px: 2,
          py: 1.5,
          mt: 2.5,
          fontWeight: 650,
        }}
      >
        If an analyst changes code, cost basis, or RUL outside default logic, the system should require a reason and create a QA flag.
      </Box>
    </TechnicalLayerModal>
  );
}

function ReferenceTable({ headers, rows, columns }: { headers: readonly string[]; rows: ReadonlyArray<readonly string[]>; columns: { xs: string; sm: string } }) {
  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: columns, bgcolor: '#f3f5f8', px: 2, py: 1.35, gap: 2 }}>
        {headers.map((heading) => <Typography key={heading} variant="body2" sx={{ fontWeight: 850, color: legacyTokens.navy }}>{heading}</Typography>)}
      </Box>
      {rows.map((row) => (
        <Box key={row[0]} sx={{ display: 'grid', gridTemplateColumns: columns, gap: { xs: 0.5, sm: 2 }, px: 2, py: 1.55, borderTop: '1px solid', borderColor: 'divider' }}>
          {row.map((value, index) => (
            <Typography key={`${row[0]}-${index}`} variant="body2" sx={index === 0 ? { fontWeight: 800 } : undefined}>{value}</Typography>
          ))}
        </Box>
      ))}
    </Box>
  );
}

const REPORT_QA_POPULATION_ROWS = [
  ['L1–L5', 'Inherited from inspection and analysis', 'Locked unless recoding is approved'],
  ['Finding Statement', 'Analyst deficiency statement', 'Must be supported by observation evidence'],
  ['Recommendation', 'Analyst recommendation', 'Reviewed for wording and actionability'],
  ['RUL / Priority', 'Analyst decision fields', 'High-risk combinations trigger QA'],
  ['Capital Plan Cost', 'Excel default + analyst adjustment', 'Deviation requires reason'],
  ['Appendix Media', 'Inspector photos and notes', 'Must remain linked before issue'],
] as const;

const REPORT_QA_TRACE_ROWS = [
  ['Excel Master', `${DEFAULT_REPORT_FINDING_TRACE.excelCode} · ${DEFAULT_REPORT_FINDING_TRACE.excelLabel}`, 'Controls classification and default logic'],
  ['Inspection', DEFAULT_REPORT_FINDING_TRACE.observationId, 'Source evidence and media'],
  ['Analysis', DEFAULT_REPORT_FINDING_TRACE.deficiencyId, 'Professional judgment and recommendation'],
  ['Report', DEFAULT_REPORT_FINDING_TRACE.findingId, 'Client-facing finding'],
  ['QA', DEFAULT_REPORT_FINDING_TRACE.qaId, 'Reviewer approval and issue readiness'],
] as const;

function ReportQaTechnicalLayer({ open, onClose }: Pick<TechnicalLayerDrawerProps, 'open' | 'onClose'>) {
  return (
    <TechnicalLayerModal
      open={open}
      onClose={onClose}
      title="Report + QA Technical Layer · Publishing + QA Controls"
      subtitle="How approved analysis records become controlled report findings, QA flags, and Excel-ready capital plan outputs."
    >
      <Box role="note" sx={{ bgcolor: legacyTokens.greenSoft, borderLeft: `4px solid ${legacyTokens.green}`, borderRadius: 1.5, color: '#185c46', px: 2, py: 1.5, mb: 4, fontWeight: 650 }}>
        Report + QA does not rewrite the record from scratch. It assembles approved analysis objects into the report while preserving ASTM/BCA hierarchy and source traceability.
      </Box>

      <Typography component="h3" sx={{ color: legacyTokens.navy, fontSize: 22, fontWeight: 900, mb: 1.75 }}>
        Inherited 5-Level Code Path
      </Typography>
      <CodePathRows />

      <Typography component="h3" sx={{ color: legacyTokens.navy, fontSize: 22, fontWeight: 900, mt: 4.5, mb: 1.75 }}>
        Report + QA Excel Population
      </Typography>
      <ReferenceTable
        headers={['Excel / Report Field', 'Source', 'QA Rule']}
        rows={REPORT_QA_POPULATION_ROWS}
        columns={{ xs: '1fr', sm: '0.9fr 1.25fr 1.35fr' }}
      />

      <Typography component="h3" sx={{ color: legacyTokens.navy, fontSize: 22, fontWeight: 900, mt: 4.5, mb: 1.75 }}>
        Traceability Chain
      </Typography>
      <ReferenceTable
        headers={['Stage', 'Record', 'Purpose']}
        rows={REPORT_QA_TRACE_ROWS}
        columns={{ xs: '1fr', sm: '0.65fr 1fr 1.65fr' }}
      />

      <Box role="note" sx={{ bgcolor: legacyTokens.redSoft, borderLeft: `4px solid ${legacyTokens.red}`, borderRadius: 1.5, color: '#8a2820', px: 2, py: 1.5, mt: 2.5, fontWeight: 650 }}>
        Unsupported narrative, missing evidence, changed cost basis, or changed RUL logic should block final issue or require reviewer override.
      </Box>
    </TechnicalLayerModal>
  );
}

function CodePathRows() {
  return (
    <Box sx={{ display: 'grid', gap: 1 }}>
      {CODE_PATH.map(([level, code, description]) => (
        <Box key={level} sx={{ display: 'grid', gridTemplateColumns: { xs: '42px minmax(115px, auto) 1fr', sm: '70px 190px 1fr' }, alignItems: 'center', gap: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, px: 2, py: 1.35 }}>
          <Typography sx={{ color: legacyTokens.blue, fontWeight: 900 }}>{level}</Typography>
          <Box component="code" sx={{ justifySelf: 'start', bgcolor: '#f3f6fa', border: '1px solid', borderColor: 'divider', borderRadius: 1, px: 1, py: 0.4, color: legacyTokens.navy, fontFamily: 'Consolas, "Courier New", monospace', fontSize: 14 }}>{code}</Box>
          <Typography variant="body2">{description}</Typography>
        </Box>
      ))}
    </Box>
  );
}
