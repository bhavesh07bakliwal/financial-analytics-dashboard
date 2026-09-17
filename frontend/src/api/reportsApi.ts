import { apiClient } from './client';
import { ExportConfig } from '@/types';

export interface ExportPreview {
  recordCount: number;
  columnCount: number;
  estimatedBytes: number;
}

export async function previewExport(config: ExportConfig): Promise<ExportPreview> {
  const res = await apiClient.post('/reports/export/preview', config);
  return res.data.data;
}

/**
 * Requests the CSV, then triggers a browser download using a Blob + temporary
 * anchor element. The filename is read from the Content-Disposition header
 * that the backend sets, falling back to a sensible default.
 */
export async function exportAndDownloadCsv(config: ExportConfig): Promise<string> {
  const res = await apiClient.post('/reports/export', config, { responseType: 'blob' });

  const disposition: string | undefined = res.headers['content-disposition'];
  const match = disposition?.match(/filename="?([^"]+)"?/);
  const filename = match?.[1] ?? `financial-report-${new Date().toISOString().slice(0, 10)}.csv`;

  const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);

  return filename;
}
