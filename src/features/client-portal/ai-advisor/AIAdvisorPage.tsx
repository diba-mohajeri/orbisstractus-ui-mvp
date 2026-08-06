import { useState } from 'react';
import { Box, Button, Card, CardContent, Chip, CircularProgress, Stack, TextField, Typography } from '@mui/material';
import AIDisclaimerBanner from '../../../shared/components/AIDisclaimerBanner';
import { useAskAdvisor } from './api';

const PROMPTS = [
  'What is our 5-year capital exposure?',
  'Which building has the highest risk?',
  'What is our reserve funding gap?',
  'How many critical deficiencies do we have?',
  'What is our overall portfolio health?',
  'Which system needs the most attention?',
];

interface Turn {
  question: string;
  answer: string;
}

export default function AIAdvisorPage() {
  const [input, setInput] = useState('');
  const [transcript, setTranscript] = useState<Turn[]>([]);
  const ask = useAskAdvisor();

  function submit(question: string) {
    const trimmed = question.trim();
    if (!trimmed) return;
    ask.mutate(trimmed, {
      onSuccess: (data) => {
        setTranscript((prev) => [...prev, { question: trimmed, answer: data.answer }]);
        setInput('');
      },
    });
  }

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
          <Typography variant="h6">AI Building Advisor</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Ask questions about capital risks, envelope priorities, budgets, and portfolio health.
          Answers are computed from the same live portfolio data used everywhere else in the
          platform.
        </Typography>

        <AIDisclaimerBanner />

        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1, mb: 2 }}>
          {PROMPTS.map((prompt) => (
            <Chip key={prompt} label={prompt} onClick={() => submit(prompt)} variant="outlined" />
          ))}
        </Stack>

        <Box sx={{ mb: 2 }}>
          {transcript.length === 0 && !ask.isPending && (
            <Typography variant="body2" color="text.secondary">
              Try a suggested question above, or type your own below.
            </Typography>
          )}
          <Stack spacing={1.5}>
            {transcript.map((turn, index) => (
              <Box key={index}>
                <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {turn.question}
                </Typography>
                <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5, bgcolor: '#fbfcfe' }}>
                  <Typography variant="body2">{turn.answer}</Typography>
                </Box>
              </Box>
            ))}
            {ask.isPending && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="body2" color="text.secondary">
                  Thinking…
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <TextField
            fullWidth
            size="small"
            placeholder="Ask about capital risk, reserve funding, deficiencies…"
            slotProps={{ htmlInput: { 'aria-label': 'Ask the AI Building Advisor a question' } }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit(input);
            }}
          />
          <Button variant="contained" onClick={() => submit(input)} disabled={ask.isPending}>
            Ask
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
