import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Alert } from '../../components/ui/Alert';
import { Modal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ApiClient } from '../../api/apiClient';
import { Search, DollarSign, History, CheckCircle } from 'lucide-react';

export const FineManagementPage: React.FC = () => {
  const [fines, setFines] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Payment Modal States
  const [selectedFine, setSelectedFine] = useState<any | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentReceipt, setPaymentReceipt] = useState<any | null>(null);

  // Payment History Modal States
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const fetchFines = async (search = '', status = '') => {
    setIsLoading(true);
    setErrorMsg(null);
    let query = '/fines?';
    if (search) query += `search=${encodeURIComponent(search)}&`;
    if (status) query += `status=${encodeURIComponent(status)}&`;

    const res = await ApiClient.get(query);
    if (res.success && res.data) {
      setFines(res.data);
    } else {
      setErrorMsg(res.error || 'Failed to fetch fine records.');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchFines();
  }, []);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFines(searchTerm, statusFilter);
  };

  const handleOpenPayModal = (fine: any) => {
    setSelectedFine(fine);
    setIsPayModalOpen(true);
  };

  const handleExecutePayment = async () => {
    if (!selectedFine) return;
    setIsProcessingPayment(true);
    setErrorMsg(null);

    const res = await ApiClient.post(`/fines/${selectedFine.id}/pay`, {});
    setIsProcessingPayment(false);
    setIsPayModalOpen(false);

    if (res.success && res.data) {
      setPaymentReceipt(res.data);
      setSuccessMsg(`Payment of ${selectedFine.amount} THB for Fine '${selectedFine.fine_id}' recorded successfully!`);
      fetchFines(searchTerm, statusFilter);
    } else {
      setErrorMsg(res.error || 'Failed to record fine payment.');
    }
  };

  const handleOpenHistoryModal = async () => {
    setIsHistoryModalOpen(true);
    setIsHistoryLoading(true);
    const res = await ApiClient.get('/fines/payments');
    if (res.success && res.data) {
      setPaymentHistory(res.data);
    } else {
      setErrorMsg(res.error || 'Failed to fetch fine payment history log.');
    }
    setIsHistoryLoading(false);
  };

  // KPI calculations
  const totalUnpaidAmount = fines.filter((f) => f.status === 'UNPAID').reduce((sum, f) => sum + f.amount, 0);
  const totalPaidAmount = fines.filter((f) => f.status === 'PAID').reduce((sum, f) => sum + f.amount, 0);

  const fineColumns: Column[] = [
    { key: 'fine_id', header: 'Fine ID' },
    {
      key: 'member',
      header: 'Member',
      render: (f) => (
        <div>
          <div style={{ fontWeight: 600, color: '#f3f4f6' }}>{f.member_name}</div>
          <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{f.student_id}</div>
        </div>
      ),
    },
    { key: 'book_title', header: 'Book Title' },
    { key: 'overdue_days', header: 'Overdue Days', render: (f) => <span>{f.overdue_days} Days</span> },
    {
      key: 'amount',
      header: 'Fine Amount',
      render: (f) => <span style={{ fontWeight: 700, color: '#fbbf24' }}>{f.amount.toFixed(2)} THB</span>,
    },
    { key: 'status', header: 'Status', render: (f) => <Badge status={f.status} /> },
    {
      key: 'payment_date',
      header: 'Payment Date',
      render: (f) => (f.payment_date ? new Date(f.payment_date).toLocaleDateString() : '-'),
    },
    {
      key: 'actions',
      header: 'Action',
      render: (f) =>
        f.status === 'UNPAID' ? (
          <Button size="sm" variant="primary" icon={<DollarSign size={14} />} onClick={() => handleOpenPayModal(f)}>
            Record Payment
          </Button>
        ) : (
          <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>Paid</span>
        ),
    },
  ];

  const historyColumns: Column[] = [
    { key: 'payment_id', header: 'Payment ID' },
    { key: 'fine_id', header: 'Fine Reference' },
    {
      key: 'member',
      header: 'Member',
      render: (p) => `${p.member_name} (${p.student_id})`,
    },
    {
      key: 'amount',
      header: 'Amount Paid',
      render: (p) => <span style={{ fontWeight: 700, color: '#10b981' }}>{p.amount.toFixed(2)} THB</span>,
    },
    {
      key: 'payment_date',
      header: 'Payment Date',
      render: (p) => new Date(p.payment_date).toLocaleString(),
    },
    {
      key: 'librarian',
      header: 'Processed By',
      render: (p) => p.librarian_name || 'System Admin',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f9fafb' }}>Fine Management & Payments</h2>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Record member fine payments and inspect payment logs</p>
        </div>
        <Button variant="secondary" icon={<History size={18} />} onClick={handleOpenHistoryModal}>
          View Payment Logs
        </Button>
      </div>

      {errorMsg && <Alert type="error" message={errorMsg} />}
      {successMsg && <Alert type="success" message={successMsg} />}

      {/* KPI Cards Header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        <div style={{ background: '#1f2937', padding: '1.25rem', borderRadius: '0.5rem', border: '1px solid #374151' }}>
          <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Pending Unpaid Fines Owed</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ef4444', marginTop: '0.25rem' }}>
            {totalUnpaidAmount.toFixed(2)} THB
          </div>
        </div>

        <div style={{ background: '#1f2937', padding: '1.25rem', borderRadius: '0.5rem', border: '1px solid #374151' }}>
          <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Total Collected Fine Payments</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>
            {totalPaidAmount.toFixed(2)} THB
          </div>
        </div>
      </div>

      {/* Main Fine Records Table & Search */}
      <Card>
        <form onSubmit={handleFilterSubmit} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <Input
              placeholder="Search Student ID, Member Name, Book Title, Fine ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search size={18} />}
            />
          </div>
          <div style={{ width: '180px' }}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'UNPAID', label: 'UNPAID Only' },
                { value: 'PAID', label: 'PAID Only' },
              ]}
            />
          </div>
          <Button type="submit" variant="secondary" icon={<Search size={16} />}>
            Filter Fines
          </Button>
        </form>

        {isLoading ? (
          <LoadingSpinner message="Fetching fine records..." />
        ) : (
          <Table columns={fineColumns} data={fines} emptyMessage="No fine records match your filter criteria." />
        )}
      </Card>

      {/* Process Fine Payment Confirmation Modal */}
      <Modal isOpen={isPayModalOpen} onClose={() => setIsPayModalOpen(false)} title="Confirm Fine Payment Record">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Alert type="info" message="Confirming this payment will mark the fine status as PAID and lift member borrowing restrictions." />

          <div style={{ background: '#111827', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #374151', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Fine Reference:</span>
              <span style={{ color: '#60a5fa', fontWeight: 600 }}>{selectedFine?.fine_id}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Member Name:</span>
              <span style={{ color: '#f3f4f6', fontWeight: 600 }}>{selectedFine?.member_name} ({selectedFine?.student_id})</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Book Title:</span>
              <span style={{ color: '#f3f4f6' }}>{selectedFine?.book_title}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Overdue Duration:</span>
              <span style={{ color: '#f59e0b' }}>{selectedFine?.overdue_days} Days</span>
            </div>
            <hr style={{ borderColor: '#374151', margin: '0.25rem 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#9ca3af', fontSize: '1rem' }}>Total Fine Amount Owed:</span>
              <span style={{ color: '#10b981', fontWeight: 800, fontSize: '1.25rem' }}>
                {selectedFine?.amount.toFixed(2)} THB
              </span>
            </div>
          </div>

          {isProcessingPayment && <LoadingSpinner message="Recording fine payment transaction..." />}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button variant="ghost" onClick={() => setIsPayModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" icon={<CheckCircle size={16} />} onClick={handleExecutePayment}>
              Confirm Payment & Issue Receipt
            </Button>
          </div>
        </div>
      </Modal>

      {/* Payment Receipt Modal/Card */}
      {paymentReceipt && (
        <Card title="Payment Receipt Confirmation">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#064e3b', color: '#ecfdf5', padding: '1rem', borderRadius: '0.5rem' }}>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>✅ Payment Processed Successfully</div>
            <div>Payment Reference Code: <strong>{paymentReceipt.paymentId}</strong></div>
            <div>Amount Paid: <strong>{paymentReceipt.amount} THB</strong></div>
            <div>Status: <strong>PAID</strong></div>
          </div>
        </Card>
      )}

      {/* Payment History Modal */}
      <Modal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} title="Historical Fine Payment Logs">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {isHistoryLoading ? (
            <LoadingSpinner message="Fetching payment history..." />
          ) : (
            <Table columns={historyColumns} data={paymentHistory} emptyMessage="No historical payment records found." />
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <Button variant="ghost" onClick={() => setIsHistoryModalOpen(false)}>
              Close Log
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
