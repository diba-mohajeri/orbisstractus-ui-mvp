export interface FindingTraceability {
  excelCode: string;
  excelLabel: string;
  observationId: string;
  deficiencyId: string;
  findingId: string;
  qaId: string;
}

export const REPORT_FINDING_TRACEABILITY: Record<string, FindingTraceability> = {
  'FIND-ROOF-023': {
    excelCode: 'B3010.10.02',
    excelLabel: 'Lap Seams',
    observationId: 'OBS-ROOF-023',
    deficiencyId: 'DEF-ROOF-023',
    findingId: 'FIND-ROOF-023',
    qaId: 'QA-018',
  },
};

export const DEFAULT_REPORT_FINDING_TRACE = REPORT_FINDING_TRACEABILITY['FIND-ROOF-023'];

export function formatFindingTrace(trace: FindingTraceability): string {
  return `Excel ${trace.excelCode} → ${trace.observationId} → ${trace.deficiencyId} → ${trace.findingId} → ${trace.qaId}.`;
}
