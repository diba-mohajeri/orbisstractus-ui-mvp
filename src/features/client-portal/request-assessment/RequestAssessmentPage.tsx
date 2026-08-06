import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import HeroBanner from '../../../shared/components/HeroBanner';
import OptionCardToggle from '../../../shared/components/OptionCardToggle';
import { ApiError } from '../../../api/client';
import { useSubmitAssessmentRequest } from './api';
import { legacyTokens } from '../../../theme/theme';

const TENDER_OPTIONS = [
  { id: 'direct', title: 'Without Public Tender', description: 'Direct assignment to InsightX for assessment execution.' },
  { id: 'tender', title: 'With Public Tender (RFP)', description: 'Open a formal request-for-proposal process before assignment.' },
];

const ASSESSMENT_TYPES = ['Building Condition Assessment', 'Building Envelope', 'Reserve Fund Study', 'Energy Audit', 'Forensic Engineering'];
const TIMELINES = ['ASAP', '1-3 months', '3-6 months', '6-12 months'];

const ROUTING_STEPS = [
  { step: 'Request Review', owner: 'PM / Intake' },
  { step: 'Scope Confirmation', owner: 'Orbisstractus + Client' },
  { step: 'Proposal / Tender Response', owner: 'Orbisstractus' },
  { step: 'Project Activation', owner: 'InsightX Workflow' },
];

export default function RequestAssessmentPage() {
  const [tenderType, setTenderType] = useState<'direct' | 'tender'>('direct');
  const [propertyName, setPropertyName] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [assessmentType, setAssessmentType] = useState('');
  const [requestedTimeline, setRequestedTimeline] = useState('');
  const [notes, setNotes] = useState('');
  const [tenderNumber, setTenderNumber] = useState('');
  const [tenderClosingDate, setTenderClosingDate] = useState('');
  const [tenderRequirements, setTenderRequirements] = useState('');

  const submit = useSubmitAssessmentRequest();

  const canSubmit = propertyName.trim() && propertyAddress.trim() && assessmentType;

  function handleSubmit() {
    if (!canSubmit) return;
    submit.mutate({
      tenderType,
      propertyName: propertyName.trim(),
      propertyAddress: propertyAddress.trim(),
      assessmentType,
      requestedTimeline,
      notes,
      ...(tenderType === 'tender' ? { tenderNumber, tenderClosingDate, tenderRequirements } : {}),
    });
  }

  const errorMessage =
    submit.isError && submit.error instanceof ApiError ? submit.error.message : submit.isError ? 'Something went wrong.' : null;

  return (
    <Box>
      <HeroBanner
        title="Request Assessment"
        description="Launch new assessment requests, including direct assignment or public tender."
        badges={['Direct Assignment', 'Public Tender Option', 'Guided Intake Routing']}
      />

      <Stack spacing={2.5}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            {submit.isSuccess ? (
              <Alert severity="success">
                <Typography sx={{ fontWeight: 800, mb: 0.5 }}>Request submitted</Typography>
                <Typography variant="body2">
                  Reference number <strong>{submit.data.referenceNumber}</strong>. Your PM/Intake team
                  will review this request and follow up shortly.
                </Typography>
              </Alert>
            ) : (
              <>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Request Type
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <OptionCardToggle
                    options={TENDER_OPTIONS}
                    selectedId={tenderType}
                    onSelect={(id) => setTenderType(id as 'direct' | 'tender')}
                  />
                </Box>

                {errorMessage && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {errorMessage}
                  </Alert>
                )}

                <Stack spacing={2}>
                  <TextField
                    label="Property Name"
                    value={propertyName}
                    onChange={(e) => setPropertyName(e.target.value)}
                    required
                    fullWidth
                  />
                  <TextField
                    label="Property Address"
                    value={propertyAddress}
                    onChange={(e) => setPropertyAddress(e.target.value)}
                    required
                    fullWidth
                  />
                  <TextField
                    select
                    label="Assessment Type"
                    value={assessmentType}
                    onChange={(e) => setAssessmentType(e.target.value)}
                    required
                    fullWidth
                  >
                    {ASSESSMENT_TYPES.map((t) => (
                      <MenuItem key={t} value={t}>
                        {t}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    label="Requested Timeline"
                    value={requestedTimeline}
                    onChange={(e) => setRequestedTimeline(e.target.value)}
                    fullWidth
                  >
                    {TIMELINES.map((t) => (
                      <MenuItem key={t} value={t}>
                        {t}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Notes / Known Concerns"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    multiline
                    minRows={3}
                    fullWidth
                  />

                  {tenderType === 'tender' && (
                    <>
                      <TextField
                        label="Tender / RFP Number"
                        value={tenderNumber}
                        onChange={(e) => setTenderNumber(e.target.value)}
                        fullWidth
                      />
                      <TextField
                        label="Closing Date"
                        type="date"
                        value={tenderClosingDate}
                        onChange={(e) => setTenderClosingDate(e.target.value)}
                        fullWidth
                        slotProps={{ inputLabel: { shrink: true } }}
                      />
                      <TextField
                        label="Tender Requirements"
                        value={tenderRequirements}
                        onChange={(e) => setTenderRequirements(e.target.value)}
                        multiline
                        minRows={2}
                        fullWidth
                      />
                    </>
                  )}

                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleSubmit}
                    disabled={!canSubmit || submit.isPending}
                  >
                    {submit.isPending ? 'Submitting…' : 'Submit Assessment Request'}
                  </Button>
                </Stack>
              </>
            )}
          </CardContent>
        </Card>

        <Card component="section">
          <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
            <Typography variant="h2" sx={{ fontSize: { xs: 23, md: 26 }, mb: 2.25 }}>
              What Happens Next
            </Typography>
            <Stack spacing={1.15} sx={{ mb: 4 }}>
              {[
                { text: 'Request is routed into InsightX PM / Intake for scope review.', positive: true },
                { text: 'If tender is selected, tender requirements are captured as controlled intake fields.', positive: false },
                { text: 'Client can track request status from the Undergoing Assessment view once accepted.', positive: false },
              ].map((item) => (
                <Box key={item.text} sx={{ bgcolor: item.positive ? legacyTokens.greenSoft : legacyTokens.amberSoft, borderLeft: '4px solid', borderLeftColor: item.positive ? legacyTokens.green : legacyTokens.amber, borderRadius: 2.5, px: 2, py: 1.55 }}>
                  <Typography sx={{ fontWeight: 700 }}>{item.text}</Typography>
                </Box>
              ))}
            </Stack>

            <Typography variant="h2" sx={{ fontSize: { xs: 22, md: 25 }, mb: 2 }}>
              Routing Preview
            </Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 500 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f7f9fc' }}>
                    <TableCell sx={{ color: 'text.secondary', fontWeight: 900 }}>Step</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontWeight: 900 }}>Owner</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ROUTING_STEPS.map((row) => (
                    <TableRow key={row.step}>
                      <TableCell sx={{ py: 1.6, fontWeight: 800 }}>{row.step}</TableCell>
                      <TableCell>{row.owner}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
