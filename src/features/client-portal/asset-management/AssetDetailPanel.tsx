import { useEffect, useState, type ReactNode } from 'react';
import { Box, Button, Divider, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import type { AssetRecord } from '../../../domain/portfolioAssets';
import StatusChip, { conditionTone, riskTone } from '../../../shared/components/StatusChip';
import { formatCurrency } from '../../../shared/utils/format';
import { useAddLifecycleExpenditure, useLifecycleExpenditures, useUpdateAssetRecord } from './api';

interface AssetDetailPanelProps {
  asset: AssetRecord;
  buildingName: string;
  editable?: boolean;
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, py: 1 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Box>{children}</Box>
    </Box>
  );
}

export default function AssetDetailPanel({ asset, buildingName, editable = false }: AssetDetailPanelProps) {
  const { data: expenditures } = useLifecycleExpenditures(asset.id);
  const updateAssetRecord = useUpdateAssetRecord();
  const addExpenditure = useAddLifecycleExpenditure(asset.id);

  const [eulDraft, setEulDraft] = useState(String(asset.expectedUsefulLifeYears));
  const [ageDraft, setAgeDraft] = useState(String(asset.effectiveAgeYears));
  const [costDraft, setCostDraft] = useState(String(asset.replacementCost));
  const [timingDraft, setTimingDraft] = useState(String(asset.futureReplacementYear));
  const [inflationDraft, setInflationDraft] = useState(String(asset.inflationAssumptionPct));

  const [expenseDate, setExpenseDate] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseCost, setExpenseCost] = useState('');

  useEffect(() => {
    setEulDraft(String(asset.expectedUsefulLifeYears));
    setAgeDraft(String(asset.effectiveAgeYears));
    setCostDraft(String(asset.replacementCost));
    setTimingDraft(String(asset.futureReplacementYear));
    setInflationDraft(String(asset.inflationAssumptionPct));
  }, [asset]);

  const draftRul = Math.max(0, Number(eulDraft || 0) - Number(ageDraft || 0));
  const hasChanges =
    Number(eulDraft) !== asset.expectedUsefulLifeYears ||
    Number(ageDraft) !== asset.effectiveAgeYears ||
    Number(costDraft) !== asset.replacementCost ||
    Number(timingDraft) !== asset.futureReplacementYear ||
    Number(inflationDraft) !== asset.inflationAssumptionPct;

  function saveReserveFundFields() {
    updateAssetRecord.mutate({
      id: asset.id,
      patch: {
        expectedUsefulLifeYears: Number(eulDraft),
        effectiveAgeYears: Number(ageDraft),
        replacementCost: Number(costDraft),
        futureReplacementYear: Number(timingDraft),
        inflationAssumptionPct: Number(inflationDraft),
      },
    });
  }

  function addExpenditureEntry() {
    if (!expenseDate || !expenseDescription.trim() || !expenseCost) return;
    addExpenditure.mutate(
      { date: expenseDate, description: expenseDescription.trim(), cost: Number(expenseCost) },
      {
        onSuccess: () => {
          setExpenseDate('');
          setExpenseDescription('');
          setExpenseCost('');
        },
      },
    );
  }

  return (
    <Box>
      <Row label="Asset ID">
        <Typography variant="body2" sx={{ fontWeight: 800 }}>
          {asset.id}
        </Typography>
      </Row>
      <Divider />
      <Row label="Building">
        <Typography variant="body2">{buildingName}</Typography>
      </Row>
      <Divider />
      <Row label="System">
        <Typography variant="body2">{asset.systemName}</Typography>
      </Row>
      <Divider />
      <Row label="Component">
        <Typography variant="body2">{asset.component}</Typography>
      </Row>
      <Divider />
      <Row label="Condition">
        <StatusChip label={asset.condition} tone={conditionTone(asset.condition)} />
      </Row>
      <Divider />
      <Row label="Risk Level">
        <StatusChip label={asset.riskLevel} tone={riskTone(asset.riskLevel)} />
      </Row>

      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 3, mb: 0.5 }}>
        <Typography sx={{ fontWeight: 800 }}>Reserve Fund Data</Typography>
        <StatusChip label="Partially Active" tone="neutral" />
      </Stack>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
        Supporting capital-planning data for this BCA/Envelope report — not a full Reserve Fund Study.
      </Typography>

      {editable ? (
        <Stack spacing={1.5} sx={{ mt: 1 }}>
          <Stack direction="row" spacing={1.5}>
            <TextField
              label="Expected Useful Life (yrs)"
              size="small"
              type="number"
              value={eulDraft}
              onChange={(e) => setEulDraft(e.target.value)}
              fullWidth
            />
            <TextField
              label="Effective Age (yrs)"
              size="small"
              type="number"
              value={ageDraft}
              onChange={(e) => setAgeDraft(e.target.value)}
              fullWidth
            />
          </Stack>
          <TextField
            label="Remaining Useful Life (auto-calculated)"
            size="small"
            value={`${draftRul} years`}
            disabled
            fullWidth
          />
          <TextField
            label="Current Replacement Cost"
            size="small"
            type="number"
            value={costDraft}
            onChange={(e) => setCostDraft(e.target.value)}
            fullWidth
          />
          <TextField
            label="Future Replacement Timing (target year)"
            size="small"
            type="number"
            value={timingDraft}
            onChange={(e) => setTimingDraft(e.target.value)}
            fullWidth
          />
          <TextField
            label="Inflation / Escalation Assumption (%)"
            size="small"
            type="number"
            value={inflationDraft}
            onChange={(e) => setInflationDraft(e.target.value)}
            fullWidth
          />
          <Button
            variant="contained"
            disabled={!hasChanges || updateAssetRecord.isPending}
            onClick={saveReserveFundFields}
          >
            Save Reserve Fund Data
          </Button>
        </Stack>
      ) : (
        <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
          <Row label="Expected Useful Life">
            <Typography variant="body2">{asset.expectedUsefulLifeYears} years</Typography>
          </Row>
          <Divider />
          <Row label="Effective Age">
            <Typography variant="body2">{asset.effectiveAgeYears} years</Typography>
          </Row>
          <Divider />
          <Row label="Remaining Useful Life">
            <Typography variant="body2">{asset.remainingUsefulLifeYears} years</Typography>
          </Row>
          <Divider />
          <Row label="Current Replacement Cost">
            <Typography variant="body2">{formatCurrency(asset.replacementCost)}</Typography>
          </Row>
          <Divider />
          <Row label="Future Replacement Timing">
            <Typography variant="body2">{asset.futureReplacementYear}</Typography>
          </Row>
          <Divider />
          <Row label="Inflation / Escalation Assumption">
            <Typography variant="body2">{asset.inflationAssumptionPct}%</Typography>
          </Row>
        </Box>
      )}

      <Typography sx={{ fontWeight: 800, mt: 3, mb: 1 }}>Lifecycle Expenditure Records</Typography>
      {expenditures && expenditures.length > 0 ? (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ pl: 0 }}>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right" sx={{ pr: 0 }}>
                Cost
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenditures.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell sx={{ pl: 0 }}>{entry.date}</TableCell>
                <TableCell>{entry.description}</TableCell>
                <TableCell align="right" sx={{ pr: 0 }}>
                  {formatCurrency(entry.cost)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No lifecycle expenditure entries on file.
        </Typography>
      )}

      {editable && (
        <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap', rowGap: 1 }}>
          <TextField
            label="Date"
            size="small"
            type="date"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ minWidth: 150 }}
          />
          <TextField
            label="Description"
            size="small"
            value={expenseDescription}
            onChange={(e) => setExpenseDescription(e.target.value)}
            sx={{ minWidth: 200 }}
          />
          <TextField
            label="Cost"
            size="small"
            type="number"
            value={expenseCost}
            onChange={(e) => setExpenseCost(e.target.value)}
            sx={{ minWidth: 120 }}
          />
          <Button
            variant="outlined"
            disabled={addExpenditure.isPending}
            onClick={addExpenditureEntry}
          >
            Add Entry
          </Button>
        </Stack>
      )}

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3 }}>
        Full inspection-to-report traceability for this component (photos, findings, and capital
        plan linkage) ships with the Digital Twin Hub and Report Center integrations.
      </Typography>
    </Box>
  );
}
