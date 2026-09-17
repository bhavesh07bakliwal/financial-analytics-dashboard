import { Parser } from 'json2csv';
import { Transaction } from '../models/Transaction';
import { buildTransactionFilter } from './filterBuilder';
import { ExportRequestInput } from '../validators/exportValidators';

const COLUMN_LABELS: Record<string, string> = {
  id: 'ID',
  date: 'Date',
  amount: 'Amount',
  category: 'Category',
  status: 'Status',
  user_id: 'User ID',
  user_profile: 'User Profile',
};

// A safety ceiling so a export request can't be used to dump an unbounded
// result set; the dataset is small today but this keeps behavior sane if it grows.
const MAX_EXPORT_ROWS = 50000;

export async function countExportRows(input: ExportRequestInput): Promise<number> {
  const filter = buildTransactionFilter(input.filters ?? {});
  return Transaction.countDocuments(filter);
}

export async function generateCsv(input: ExportRequestInput): Promise<string> {
  const filter = buildTransactionFilter(input.filters ?? {});

  const rows = await Transaction.find(filter)
    .sort({ date: -1 })
    .limit(MAX_EXPORT_ROWS)
    .select(input.columns.join(' '))
    .lean();

  const formattedRows = rows.map((row) => {
    const record: Record<string, string | number> = {};
    for (const col of input.columns) {
      if (col === 'date') {
        record[col] = new Date(row.date).toISOString();
      } else if (col === 'amount') {
        record[col] = Number(row.amount).toFixed(2);
      } else {
        record[col] = (row as unknown as Record<string, string | number>)[col];
      }
    }
    return record;
  });

  const fields = input.columns.map((col) => ({ label: COLUMN_LABELS[col], value: col }));
  // json2csv correctly quotes/escapes commas, quotes, and newlines per RFC 4180.
  const parser = new Parser({ fields, header: true });
  return parser.parse(formattedRows);
}

export function buildExportFilename(): string {
  const today = new Date().toISOString().slice(0, 10);
  return `financial-report-${today}.csv`;
}
