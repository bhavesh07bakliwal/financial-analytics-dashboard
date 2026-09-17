import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExportModal } from '@/components/ExportModal';
import { AlertProvider } from '@/components/AlertProvider';
import * as reportsApi from '@/api/reportsApi';

vi.mock('@/api/reportsApi');

const mockedPreview = vi.mocked(reportsApi.previewExport);
const mockedExport = vi.mocked(reportsApi.exportAndDownloadCsv);

function renderModal(open = true) {
  return render(
    <AlertProvider>
      <ExportModal open={open} onClose={vi.fn()} filters={{}} />
    </AlertProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedPreview.mockResolvedValue({ recordCount: 42, columnCount: 6, estimatedBytes: 3024 });
  mockedExport.mockResolvedValue('financial-report-2024-01-01.csv');
});

describe('ExportModal', () => {
  it('shows a live preview of record/column counts', async () => {
    renderModal();
    await waitFor(() => expect(screen.getByText('42')).toBeInTheDocument());
    expect(mockedPreview).toHaveBeenCalled();
  });

  it('disables the download button when all columns are cleared', async () => {
    const user = userEvent.setup();
    renderModal();

    await waitFor(() => expect(screen.getByText('42')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /clear all/i }));

    const downloadButton = screen.getByRole('button', { name: /download csv/i });
    expect(downloadButton).toBeDisabled();
  });

  it('re-enables and triggers export after selecting all columns', async () => {
    const user = userEvent.setup();
    renderModal();

    await waitFor(() => expect(screen.getByText('42')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /select all/i }));

    const downloadButton = screen.getByRole('button', { name: /download csv/i });
    expect(downloadButton).not.toBeDisabled();

    await user.click(downloadButton);
    await waitFor(() => expect(mockedExport).toHaveBeenCalled());
  });
});
