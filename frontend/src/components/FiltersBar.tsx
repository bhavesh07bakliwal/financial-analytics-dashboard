import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Stack,
  Chip,
  Button,
  InputAdornment,
  Popover,
  Typography,
} from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { TransactionQuery } from '@/types';
import { QUICK_FILTERS } from '@/hooks/useTransactionFilters';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { colors } from '@/theme/theme';

interface FiltersBarProps {
  query: TransactionQuery;
  setQuery: (patch: Partial<TransactionQuery>) => void;
  clearFilters: () => void;
  activeFilterCount: number;
  availableUsers: string[];
}

export function FiltersBar({ query, setQuery, clearFilters, activeFilterCount, availableUsers }: FiltersBarProps) {
  const [searchInput, setSearchInput] = useState(query.search ?? '');
  const debouncedSearch = useDebouncedValue(searchInput, 400);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    if (debouncedSearch !== (query.search ?? '')) {
      setQuery({ search: debouncedSearch || undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  return (
    <Box sx={{ mb: 2.5 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 1.5 }}>
        <TextField
          placeholder="Search by ID, category, status, or user…"
          size="small"
          fullWidth
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlinedIcon fontSize="small" sx={{ color: colors.textMuted }} />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: { sm: 380 } }}
        />
        <Button
          variant="outlined"
          startIcon={<TuneOutlinedIcon fontSize="small" />}
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{ borderColor: colors.border, color: colors.text, flexShrink: 0 }}
        >
          Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </Button>
        {activeFilterCount > 0 && (
          <Button
            variant="text"
            startIcon={<CloseOutlinedIcon fontSize="small" />}
            onClick={() => {
              setSearchInput('');
              clearFilters();
            }}
            sx={{ color: colors.textMuted, flexShrink: 0 }}
          >
            Clear filters
          </Button>
        )}
      </Stack>

      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
        {QUICK_FILTERS.map((preset) => {
          const isActive =
            preset.label === 'All'
              ? !query.category && !query.status && !query.minAmount
              : Object.entries(preset.patch).every(
                  ([k, v]) => v !== undefined && (query as unknown as Record<string, unknown>)[k] === v
                );
          return (
            <Chip
              key={preset.label}
              label={preset.label}
              size="small"
              onClick={() => setQuery(preset.patch)}
              sx={{
                bgcolor: isActive ? colors.ink : colors.card,
                color: isActive ? '#fff' : colors.text,
                border: `1px solid ${isActive ? colors.ink : colors.border}`,
                fontWeight: 500,
              }}
            />
          );
        })}
      </Stack>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 2.5, width: 320 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            Advanced filters
          </Typography>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1.5}>
              <TextField
                label="From"
                type="date"
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={query.startDate ?? ''}
                onChange={(e) => setQuery({ startDate: e.target.value || undefined })}
              />
              <TextField
                label="To"
                type="date"
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={query.endDate ?? ''}
                onChange={(e) => setQuery({ endDate: e.target.value || undefined })}
              />
            </Stack>
            <Stack direction="row" spacing={1.5}>
              <TextField
                label="Min amount"
                type="number"
                size="small"
                fullWidth
                value={query.minAmount ?? ''}
                onChange={(e) => setQuery({ minAmount: e.target.value ? Number(e.target.value) : undefined })}
              />
              <TextField
                label="Max amount"
                type="number"
                size="small"
                fullWidth
                value={query.maxAmount ?? ''}
                onChange={(e) => setQuery({ maxAmount: e.target.value ? Number(e.target.value) : undefined })}
              />
            </Stack>
            <TextField
              select
              label="Category"
              size="small"
              fullWidth
              value={query.category ?? ''}
              onChange={(e) => setQuery({ category: (e.target.value || undefined) as TransactionQuery['category'] })}
            >
              <MenuItem value="">All categories</MenuItem>
              <MenuItem value="Revenue">Revenue</MenuItem>
              <MenuItem value="Expense">Expense</MenuItem>
            </TextField>
            <TextField
              select
              label="Status"
              size="small"
              fullWidth
              value={query.status ?? ''}
              onChange={(e) => setQuery({ status: (e.target.value || undefined) as TransactionQuery['status'] })}
            >
              <MenuItem value="">All statuses</MenuItem>
              <MenuItem value="Paid">Paid</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
            </TextField>
            <TextField
              select
              label="User"
              size="small"
              fullWidth
              value={query.userId ?? ''}
              onChange={(e) => setQuery({ userId: e.target.value || undefined })}
            >
              <MenuItem value="">All users</MenuItem>
              {availableUsers.map((u) => (
                <MenuItem key={u} value={u}>
                  {u}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Box>
      </Popover>
    </Box>
  );
}
