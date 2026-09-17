import { useState } from 'react';
import { Box, Button } from '@mui/material';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { useTransactionFilters } from '@/hooks/useTransactionFilters';
import { useTransactionsQuery } from '@/hooks/useDataQueries';
import { FiltersBar } from '@/components/FiltersBar';
import { TransactionsTable } from '@/components/TransactionsTable';
import { ExportModal } from '@/components/ExportModal';
import { SortField } from '@/types';
import { colors } from '@/theme/theme';

const KNOWN_USERS = ['user_001', 'user_002', 'user_003', 'user_004'];

export function TransactionsPage() {
  const { query, setQuery, clearFilters, activeFilterCount } = useTransactionFilters();
  const { data, isLoading, isError, isFetching } = useTransactionsQuery(query);
  const [exportOpen, setExportOpen] = useState(false);

  const handleSortChange = (field: SortField) => {
    if (query.sortBy === field) {
      setQuery({ sortOrder: query.sortOrder === 'asc' ? 'desc' : 'asc' }, false);
    } else {
      setQuery({ sortBy: field, sortOrder: 'asc' }, false);
    }
  };

  // Only the filter fields (not pagination/sort) should be sent to the export modal.
  const { page: _page, limit: _limit, sortBy: _sortBy, sortOrder: _sortOrder, ...activeFilters } = query;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <Button
          variant="contained"
          startIcon={<FileDownloadOutlinedIcon />}
          onClick={() => setExportOpen(true)}
          sx={{ bgcolor: colors.ink, '&:hover': { bgcolor: colors.inkMuted } }}
        >
          Export CSV
        </Button>
      </Box>

      <FiltersBar
        query={query}
        setQuery={setQuery}
        clearFilters={clearFilters}
        activeFilterCount={activeFilterCount}
        availableUsers={KNOWN_USERS}
      />

      <TransactionsTable
        transactions={data?.data}
        pagination={data?.pagination}
        isLoading={isLoading || (isFetching && !data)}
        isError={isError}
        sortBy={query.sortBy}
        sortOrder={query.sortOrder}
        onSortChange={handleSortChange}
        onPageChange={(page) => setQuery({ page }, false)}
        onLimitChange={(limit) => setQuery({ limit, page: 1 })}
      />

      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} filters={activeFilters} />
    </Box>
  );
}
