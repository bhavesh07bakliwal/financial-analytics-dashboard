import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
  Stack,
  Typography,
  Box,
  IconButton,
  Divider,
  CircularProgress,
} from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import ArrowUpwardOutlinedIcon from '@mui/icons-material/ArrowUpwardOutlined';
import ArrowDownwardOutlinedIcon from '@mui/icons-material/ArrowDownwardOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import { EXPORTABLE_FIELDS, ExportableField, TransactionFilters } from '@/types';
import { previewExport, exportAndDownloadCsv, ExportPreview } from '@/api/reportsApi';
import { useAlerts } from '@/components/AlertProvider';
import { ApiRequestError } from '@/api/client';
import { colors, monoFont } from '@/theme/theme';
import { formatBytes } from '@/utils/format';

const FIELD_LABELS: Record<ExportableField, string> = {
  id: 'ID',
  date: 'Date',
  amount: 'Amount',
  category: 'Category',
  status: 'Status',
  user_id: 'User ID',
  user_profile: 'User Profile',
};

const DEFAULT_COLUMNS: ExportableField[] = ['id', 'date', 'amount', 'category', 'status', 'user_id'];

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  filters: TransactionFilters;
}

export function ExportModal({ open, onClose, filters }: ExportModalProps) {
  const { notify } = useAlerts();
  const [columns, setColumns] = useState<ExportableField[]>(DEFAULT_COLUMNS);
  const [preview, setPreview] = useState<ExportPreview | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setIsPreviewing(true);
    previewExport({ columns, filters })
      .then((result) => {
        if (!cancelled) setPreview(result);
      })
      .catch(() => {
        if (!cancelled) setPreview(null);
      })
      .finally(() => {
        if (!cancelled) setIsPreviewing(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, columns, JSON.stringify(filters)]);

  const toggleColumn = (field: ExportableField) => {
    setColumns((prev) => (prev.includes(field) ? prev.filter((c) => c !== field) : [...prev, field]));
  };

  const moveColumn = (index: number, direction: -1 | 1) => {
    setColumns((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const filename = await exportAndDownloadCsv({ columns, filters });
      notify(`Downloaded ${filename}`, 'success');
      onClose();
    } catch (err) {
      const message = err instanceof ApiRequestError ? err.message : 'Export failed — please try again';
      notify(message, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const activeFilterCount = Object.values(filters).filter((v) => v !== undefined && v !== '').length;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Export transactions
        <IconButton onClick={onClose} size="small">
          <CloseOutlinedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ borderColor: colors.border }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {activeFilterCount > 0
            ? `The export respects your ${activeFilterCount} active filter${activeFilterCount > 1 ? 's' : ''}.`
            : 'No filters applied — the export will include all transactions.'}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
          <Button size="small" onClick={() => setColumns([...EXPORTABLE_FIELDS])}>
            Select all
          </Button>
          <Button size="small" onClick={() => setColumns([])} color="inherit">
            Clear all
          </Button>
        </Stack>

        <Stack spacing={0.5} sx={{ mb: 2 }}>
          {columns.map((field, index) => (
            <Box
              key={field}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 1,
                py: 0.25,
                borderRadius: 1,
                bgcolor: colors.revenueSoft,
              }}
            >
              <FormControlLabel
                control={<Checkbox checked size="small" onChange={() => toggleColumn(field)} />}
                label={FIELD_LABELS[field]}
              />
              <Stack direction="row">
                <IconButton size="small" disabled={index === 0} onClick={() => moveColumn(index, -1)} aria-label={`Move ${FIELD_LABELS[field]} up`}>
                  <ArrowUpwardOutlinedIcon fontSize="inherit" />
                </IconButton>
                <IconButton
                  size="small"
                  disabled={index === columns.length - 1}
                  onClick={() => moveColumn(index, 1)}
                  aria-label={`Move ${FIELD_LABELS[field]} down`}
                >
                  <ArrowDownwardOutlinedIcon fontSize="inherit" />
                </IconButton>
              </Stack>
            </Box>
          ))}
          {EXPORTABLE_FIELDS.filter((f) => !columns.includes(f)).map((field) => (
            <FormControlLabel
              key={field}
              control={<Checkbox checked={false} size="small" onChange={() => toggleColumn(field)} />}
              label={FIELD_LABELS[field]}
              sx={{ px: 1, color: colors.textMuted }}
            />
          ))}
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, fontFamily: monoFont }}>
          {isPreviewing ? (
            <CircularProgress size={16} />
          ) : preview ? (
            <>
              <PreviewStat label="Records" value={String(preview.recordCount)} />
              <PreviewStat label="Columns" value={String(preview.columnCount)} />
              <PreviewStat label="Est. size" value={formatBytes(preview.estimatedBytes)} />
            </>
          ) : (
            <Typography variant="caption" color="text.secondary">
              Select at least one column to preview
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={isExporting ? <CircularProgress size={16} color="inherit" /> : <DownloadOutlinedIcon />}
          disabled={columns.length === 0 || isExporting}
          onClick={handleExport}
        >
          {isExporting ? 'Preparing…' : 'Download CSV'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function PreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {value}
      </Typography>
    </Box>
  );
}
