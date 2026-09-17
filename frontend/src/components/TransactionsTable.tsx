import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Box,
  Avatar,
  Typography,
  Skeleton,
  TablePagination,
} from '@mui/material';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import { Transaction, SortField, SortOrder, PaginationMeta } from '@/types';
import { StatusChip, CategoryChip } from './StatusChip';
import { colors, monoFont } from '@/theme/theme';
import { formatCurrency, formatDate } from '@/utils/format';

interface Column {
  key: SortField;
  label: string;
  sortable: boolean;
}

const COLUMNS: Column[] = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'date', label: 'Date', sortable: true },
  { key: 'amount', label: 'Amount', sortable: true },
  { key: 'category', label: 'Category', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'user_id', label: 'User', sortable: true },
];

interface TransactionsTableProps {
  transactions?: Transaction[];
  pagination?: PaginationMeta;
  isLoading: boolean;
  isError: boolean;
  sortBy: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function TransactionsTable({
  transactions,
  pagination,
  isLoading,
  isError,
  sortBy,
  sortOrder,
  onSortChange,
  onPageChange,
  onLimitChange,
}: TransactionsTableProps) {
  return (
    <Paper sx={{ border: `1px solid ${colors.border}`, borderRadius: 2, overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 640 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {COLUMNS.map((col) => (
                <TableCell key={col.key}>
                  {col.sortable ? (
                    <TableSortLabel
                      active={sortBy === col.key}
                      direction={sortBy === col.key ? sortOrder : 'asc'}
                      onClick={() => onSortChange(col.key)}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && <LoadingRows />}

            {!isLoading && isError && (
              <TableRow>
                <TableCell colSpan={COLUMNS.length}>
                  <ErrorState />
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !isError && (!transactions || transactions.length === 0) && (
              <TableRow>
                <TableCell colSpan={COLUMNS.length}>
                  <EmptyState />
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              !isError &&
              transactions?.map((tx) => (
                <TableRow key={tx.id} hover>
                  <TableCell sx={{ fontFamily: monoFont }}>#{tx.id}</TableCell>
                  <TableCell sx={{ fontFamily: monoFont }}>{formatDate(tx.date)}</TableCell>
                  <TableCell sx={{ fontFamily: monoFont, fontWeight: 500 }}>{formatCurrency(tx.amount)}</TableCell>
                  <TableCell>
                    <CategoryChip category={tx.category} />
                  </TableCell>
                  <TableCell>
                    <StatusChip status={tx.status} />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar src={tx.user_profile} sx={{ width: 24, height: 24 }}>
                        {tx.user_id.slice(-2)}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontFamily: monoFont }}>
                        {tx.user_id}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination && (
        <TablePagination
          component="div"
          count={pagination.total}
          page={pagination.page - 1}
          rowsPerPage={pagination.limit}
          rowsPerPageOptions={[10, 20, 50, 100]}
          onPageChange={(_e, newPage) => onPageChange(newPage + 1)}
          onRowsPerPageChange={(e) => onLimitChange(Number(e.target.value))}
        />
      )}
    </Paper>
  );
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <TableRow key={i}>
          {COLUMNS.map((col) => (
            <TableCell key={col.key}>
              <Skeleton width="80%" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

function EmptyState() {
  return (
    <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      <ReceiptLongOutlinedIcon sx={{ fontSize: 32, color: colors.textMuted }} />
      <Typography variant="body1" sx={{ fontWeight: 500 }}>
        No transactions match your filters
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Try adjusting your search, date range, or filters
      </Typography>
    </Box>
  );
}

function ErrorState() {
  return (
    <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      <Typography variant="body1" sx={{ fontWeight: 500, color: colors.expense }}>
        Unable to load transactions
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Please check your connection and try again
      </Typography>
    </Box>
  );
}
