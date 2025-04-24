import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DocumentsPage from '../page';
import { useSession } from 'next-auth/react';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

const mockDocuments = [
  {
    id: '1',
    name: 'Test Document.pdf',
    type: 'identity',
    customerName: 'John Doe',
    size: '2.4 MB',
    status: 'PENDING',
    uploadedAt: '2024-03-20T10:00:00Z',
    expiryDate: null,
  },
  {
    id: '2',
    name: 'Another Document.pdf',
    type: 'address',
    customerName: 'Jane Smith',
    size: '1.2 MB',
    status: 'VERIFIED',
    uploadedAt: '2024-03-19T15:30:00Z',
    expiryDate: '2024-06-19T15:30:00Z',
  },
];

describe('DocumentsPage', () => {
  beforeEach(() => {
    // Mock session
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { id: '1' } },
      status: 'authenticated',
    });

    // Mock fetch response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockDocuments),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<DocumentsPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders documents after loading', async () => {
    render(<DocumentsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Document.pdf')).toBeInTheDocument();
      expect(screen.getByText('Another Document.pdf')).toBeInTheDocument();
    });
  });

  it('filters documents by search term', async () => {
    render(<DocumentsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Document.pdf')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search documents...');
    fireEvent.change(searchInput, { target: { value: 'Test' } });

    expect(screen.getByText('Test Document.pdf')).toBeInTheDocument();
    expect(screen.queryByText('Another Document.pdf')).not.toBeInTheDocument();
  });

  it('filters documents by status', async () => {
    render(<DocumentsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Document.pdf')).toBeInTheDocument();
    });

    const statusSelect = screen.getByLabelText('Status');
    fireEvent.change(statusSelect, { target: { value: 'VERIFIED' } });

    expect(screen.queryByText('Test Document.pdf')).not.toBeInTheDocument();
    expect(screen.getByText('Another Document.pdf')).toBeInTheDocument();
  });

  it('shows error state when fetch fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(<DocumentsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Error loading documents')).toBeInTheDocument();
    });
  });
}); 