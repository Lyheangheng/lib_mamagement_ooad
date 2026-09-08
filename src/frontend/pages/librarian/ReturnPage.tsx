import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { Modal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ApiClient } from '../../api/apiClient';
import { Search, RotateCcw, AlertTriangle, CheckCircle } from 'lucide-react';

export const ReturnPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBorrowing, setActiveBorrowing] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [returnResult, setReturnResult] = useState<any | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleSearchActiveBorrowing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setActiveBorrowing(null);
    setReturnResult(null);

    const res = await ApiClient.get(`/borrowings/active-copy/${encodeURIComponent(searchQuery.trim())}`);
    setIsLoading(false);

    if (res.success && res.data) {
      setActiveBorrowing(res.data);
    } else {
      setErrorMsg(res.error || `No active borrowing found matching '${searchQuery}'.`);
    }
  };

  const handleOpenConfirm = () => {
    if (!activeBorrowing) return;
    setIsConfirmModalOpen(true);
  };

  const handleProcessReturn = async () => {
    if (!activeBorrowing) return;
    setIsLoading(true);
    setErrorMsg(null);
    const res = await ApiClient.post(`/borrowings/${activeBorrowing.id}/return`, {});
    setIsLoading(false);
    setIsConfirmModalOpen(false);

    if (res.success && res.data) {
      setReturnResult(res.data);
      setSuccessMsg(`Book '${activeBorrowing.book_title}' (Copy: ${activeBorrowing.copy_id}) returned successfully!`);
      setActiveBorrowing(null);
    } else {
      setErrorMsg(res.error || 'Failed to process book return.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '850px' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f9fafb' }}>Process Book Return</h2>
        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Scan returned physical book copy or search active transaction code</p>
      </div>

      {errorMsg && <Alert type="error" message={errorMsg} />}
      {successMsg && <Alert type="success" message={successMsg} />}

      {isLoading && <LoadingSpinner message="Searching borrowing record..." />}

      {/* Step 1: Scan or Search Active Borrowing */}
      <Card title="1. Search Active Borrowing Transaction">
        <form onSubmit={handleSearchActiveBorrowing} style={{ display: 'flex', gap: '0.75rem', maxWidth: '600px' }}>
          <Input
            placeholder="Scan barcode or enter Copy ID (e.g. BC-1001-01) or Transaction ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search size={18} />}
            required
          />
          <Button type="submit" variant="primary" icon={<Search size={16} />}>
            Search
          </Button>
        </form>
      </Card>

      {/* Step 2: Display Borrowing & Overdue Calculator Preview */}
      {activeBorrowing && (
        <Card title="2. Active Borrowing & Overdue Preview">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: '#111827', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #374151', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Transaction ID:</span>
                <span style={{ color: '#60a5fa', fontWeight: 700 }}>{activeBorrowing.borrowing_id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Member Name / Student ID:</span>
                <span style={{ color: '#f3f4f6', fontWeight: 600 }}>{activeBorrowing.member_name} ({activeBorrowing.student_id})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Book Title:</span>
                <span style={{ color: '#f3f4f6', fontWeight: 600 }}>{activeBorrowing.book_title}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Physical Copy ID:</span>
                <span style={{ color: '#f3f4f6', fontWeight: 600 }}>{activeBorrowing.copy_id}</span>
              </div>
              <hr style={{ borderColor: '#374151', margin: '0.25rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Borrow Date:</span>
                <span style={{ color: '#f3f4f6' }}>{new Date(activeBorrowing.borrow_date).toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Due Date:</span>
                <span style={{ color: '#f59e0b', fontWeight: 600 }}>{new Date(activeBorrowing.due_date).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Overdue Calculation Banner */}
            {activeBorrowing.isOverdue ? (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '0.5rem', padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <AlertTriangle color="#ef4444" size={24} style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, color: '#f87171', fontSize: '1rem' }}>
                    OVERDUE RETURN DETECTED ({activeBorrowing.overdueDays} Days Overdue)
                  </div>
                  <div style={{ color: '#fca5a5', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                    Rate: 10 THB / overdue day. Overdue fine of <strong>{activeBorrowing.expectedFine} THB</strong> will be generated upon return confirmation.
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '0.5rem', padding: '0.85rem 1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <CheckCircle color="#10b981" size={22} />
                <div>
                  <div style={{ fontWeight: 600, color: '#34d399', fontSize: '0.95rem' }}>
                    ON-TIME RETURN (0 Days Overdue)
                  </div>
                  <div style={{ color: '#a7f3d0', fontSize: '0.85rem' }}>No fine will be generated for this return.</div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <Button variant="primary" icon={<RotateCcw size={18} />} onClick={handleOpenConfirm}>
                Confirm Return & Update Inventory
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Process Return Confirmation Modal */}
      <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} title="Confirm Book Return">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Alert type="info" message={`Are you sure you want to mark '${activeBorrowing?.book_title}' (${activeBorrowing?.copy_id}) as returned?`} />
          {activeBorrowing?.isOverdue && (
            <Alert type="warning" message={`An overdue fine of ${activeBorrowing?.expectedFine} THB will be automatically created.`} />
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button variant="ghost" onClick={() => setIsConfirmModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleProcessReturn}>
              Execute Return
            </Button>
          </div>
        </div>
      </Modal>

      {/* Return Success Receipt */}
      {returnResult && (
        <Card title="Return Receipt Summary">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#111827', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #374151' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle color="#10b981" size={20} />
              <span style={{ fontWeight: 700, color: '#f3f4f6' }}>{returnResult.message}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
              <div>Copy ID: <strong>{returnResult.copyId}</strong></div>
              <div>Return Date: <strong>{new Date(returnResult.returnDate).toLocaleString()}</strong></div>
              <div>Status: <strong>RETURNED</strong></div>
              <div>Copy Inventory: <Badge status="AVAILABLE" label="AVAILABLE" /></div>
            </div>
            {returnResult.fineGenerated && (
              <Alert type="warning" message={`Overdue Fine Generated: ${returnResult.fineAmount} THB (${returnResult.overdueDays} Days Overdue)`} />
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
