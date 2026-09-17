import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { generateCsv, buildExportFilename, countExportRows } from '../services/exportService';
import { ExportRequestInput } from '../validators/exportValidators';

export const exportTransactions = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as ExportRequestInput;
  const csv = await generateCsv(input);
  const filename = buildExportFilename();

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.status(200).send(csv);
});

export const previewExport = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as ExportRequestInput;
  const count = await countExportRows(input);
  res.status(200).json({
    success: true,
    data: {
      recordCount: count,
      columnCount: input.columns.length,
      estimatedBytes: count * input.columns.length * 12,
    },
  });
});
