import type { ReactNode } from 'react';
import { Box, MenuItem, TextField, Typography } from '@mui/material';
import { SCOPE_STATUS_LABEL, type SystemScopeStatus } from '../../../shared/store/intakeGovernanceStore';
import type { UniformatNode } from './uniformatTree';

interface UniformatTreeRowProps {
  node: UniformatNode;
  depth: number;
  query: string;
  expandedCodes: Set<string>;
  selectedCode: string | null;
  onToggle: (code: string) => void;
  onSelect: (node: UniformatNode) => void;
  getStatus: (code: string) => SystemScopeStatus;
  onStatusChange: (code: string, status: SystemScopeStatus) => void;
  getCategoryBadge?: (code: string) => ReactNode;
}

export function nodeMatchesQuery(node: UniformatNode, query: string): boolean {
  if (!query) return true;
  if (node.code.toLowerCase().includes(query) || node.title.toLowerCase().includes(query)) return true;
  return (node.children ?? []).some((c) => nodeMatchesQuery(c, query));
}

const LEVEL_BG = ['#eef2f7', '#f8fafc', 'transparent', 'transparent', 'transparent'];

export default function UniformatTreeRow({
  node,
  depth,
  query,
  expandedCodes,
  selectedCode,
  onToggle,
  onSelect,
  getStatus,
  onStatusChange,
  getCategoryBadge,
}: UniformatTreeRowProps) {
  const hasChildren = (node.children?.length ?? 0) > 0;
  const isOpen = Boolean(query) || expandedCodes.has(node.code);
  const isSelected = selectedCode === node.code;

  function activate() {
    if (hasChildren) onToggle(node.code);
    else onSelect(node);
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: isSelected ? '#edf5ff' : LEVEL_BG[depth] ?? 'transparent',
          pl: 1 + depth * 1.75,
          pr: 1,
          py: depth <= 1 ? 0.6 : 0.4,
        }}
      >
        <Box
          role="button"
          tabIndex={0}
          onClick={activate}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              activate();
            }
          }}
          sx={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            py: 0.25,
            '&:hover': { opacity: 0.8 },
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: isSelected ? 800 : depth === 0 ? 900 : depth === 1 ? 700 : 500,
              textTransform: depth === 0 ? 'uppercase' : 'none',
              letterSpacing: depth === 0 ? '.03em' : 'normal',
              color: isSelected ? 'primary.main' : 'text.primary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {node.code} · {node.title}
          </Typography>
          {hasChildren && (
            <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
              {isOpen ? '▼' : '▶'} L{depth + 1}
            </Typography>
          )}
        </Box>
        {getCategoryBadge?.(node.code)}
        <TextField
          select
          size="small"
          variant="standard"
          value={getStatus(node.code)}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onStatusChange(node.code, e.target.value as SystemScopeStatus)}
          sx={{
            minWidth: 108,
            flexShrink: 0,
            '& .MuiInputBase-input': { fontSize: 11, py: 0.25 },
          }}
        >
          {(Object.keys(SCOPE_STATUS_LABEL) as SystemScopeStatus[]).map((status) => (
            <MenuItem key={status} value={status} sx={{ fontSize: 12 }}>
              {SCOPE_STATUS_LABEL[status]}
            </MenuItem>
          ))}
        </TextField>
      </Box>
      {hasChildren && isOpen && (
        <Box>
          {node.children!
            .filter((child) => nodeMatchesQuery(child, query))
            .map((child) => (
              <UniformatTreeRow
                key={child.code}
                node={child}
                depth={depth + 1}
                query={query}
                expandedCodes={expandedCodes}
                selectedCode={selectedCode}
                onToggle={onToggle}
                onSelect={onSelect}
                getStatus={getStatus}
                onStatusChange={onStatusChange}
                getCategoryBadge={getCategoryBadge}
              />
            ))}
        </Box>
      )}
    </Box>
  );
}
