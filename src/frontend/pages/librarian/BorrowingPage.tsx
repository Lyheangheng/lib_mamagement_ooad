import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { Modal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ApiClient } from '../../api/apiClient';
import { BookOpen, User, AlertTriangle, CheckCircle } from 'lucide-react';

export const BorrowingPage: React.FC = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [memberSummary, setMemberSummary] = useState<any | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [selectedBook, setSelectedBook] = useState<any | null>(null);
  const [selectedCopyId, setSelectedCopyId] = useState<string>('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [issuedBorrowing, setIssuedBorrowing] = useState<any | null>(null);

  // Load initial members and books
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      const [membersRes, booksRes] = await Promise.all([
        ApiClient.get('/members'),
        ApiClient.get('/books'),
      ]);
      if (membersRes.success && membersRes.data) {
        setMembers(membersRes.data);
      }
      if (booksRes.success && booksRes.data) {
        setBooks(booksRes.data);
      }
      setIsLoading(false);
    };
    initData();
  }, []);

  // When Member Selection changes, fetch member validation summary
  useEffect(() => {
    if (!selectedMemberId) {
      setMemberSummary(null);
      return;
    }
    const fetchMemberSummary = async () => {
      setIsSummaryLoading(true);
      setErrorMsg(null);
      const res = await ApiClient.get(`/members/${selectedMemberId}/summary`);
      if (res.success && res.data) {
        setMemberSummary(res.data);
      } else {
        setErrorMsg(res.error || 'Failed to fetch member eligibility summary.');
      }
      setIsSummaryLoading(false);
    };
    fetchMemberSummary();
  }, [selectedMemberId]);

  // When Book Selection changes, update selected book object
  useEffect(() => {
    if (!selectedBookId) {
      setSelectedBook(null);
      setSelectedCopyId('');
      return;
    }
    const book = books.find((b) => String(b.id) === String(selectedBookId));
    setSelectedBook(book || null);
    setSelectedCopyId('');
  }, [selectedBookId, books]);

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!memberSummary) {
      setErrorMsg('Please select a valid member.');
      return;
    }
    if (memberSummary.isBlocked) {
      setErrorMsg('Cannot issue borrowing. Member has blocking eligibility issues.');
      return;
    }
    if (!selectedCopyId) {
      setErrorMsg('Please select an available physical Book Copy.');
      return;
    }

    setIsConfirmModalOpen(true);
  };

  const handleExecuteBorrowing = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    const res = await ApiClient.post('/borrowings', {
      memberId: Number(selectedMemberId),
      copyId: selectedCopyId,
    });
    setIsLoading(false);
    setIsConfirmModalOpen(false);

    if (res.success && res.data) {
      setIssuedBorrowing(res.data);
      setSuccessMsg(`Successfully issued book borrowing transaction ${res.data.borrowing_id || ''}!`);
      
      // Refresh member summary and books inventory
      const updatedSummary = await ApiClient.get(`/members/${selectedMemberId}/summary`);
      if (updatedSummary.success && updatedSummary.data) {
        setMemberSummary(updatedSummary.data);
      }
      const updatedBooks = await ApiClient.get('/books');
      if (updatedBooks.success && updatedBooks.data) {
        setBooks(updatedBooks.data);
      }

      // Reset selection
      setSelectedBookId('');
      setSelectedCopyId('');
    } else {
      setErrorMsg(res.error || 'Failed to create borrowing transaction.');
    }
  };

  // Date Preview Calculations
  const today = new Date();
  const dueDatePreview = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const availableCopies = selectedBook?.copies?.filter((c: any) => c.status === 'AVAILABLE') || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '850px' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f9fafb' }}>Process Book Borrowing</h2>
        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Issue a physical book copy to an eligible library member (7-Day Loan Policy)</p>
      </div>

      {errorMsg && <Alert type="error" message={errorMsg} />}
      {successMsg && <Alert type="success" message={successMsg} />}

      {isLoading && <LoadingSpinner message="Processing borrowing transaction..." />}

      <form onSubmit={handleOpenConfirm} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Step 1: Member Selection & Eligibility Check */}
        <Card title="1. Select Member & Check Eligibility">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Select
              label="Select Library Member"
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              options={[
                { value: '', label: '-- Select Member (by Student ID or Name) --' },
                ...members.map((m) => ({
                  value: String(m.id),
                  label: `${m.student_id} - ${m.name} (${m.faculty})`,
                })),
              ]}
              required
            />

            {isSummaryLoading && <LoadingSpinner message="Verifying member borrowing limits & fines..." />}

            {memberSummary && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem', background: '#111827', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #374151' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={18} color="#60a5fa" />
                    <span style={{ fontWeight: 600, color: '#f3f4f6' }}>{memberSummary.member.name}</span>
                    <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>({memberSummary.member.student_id})</span>
                  </div>
                  <Badge status={memberSummary.member.status} />
                </div>

                {/* Status Badges Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <div style={{ background: '#1f2937', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #374151' }}>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Active Borrowings</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: memberSummary.activeCount >= 3 ? '#ef4444' : '#10b981' }}>
                      {memberSummary.activeCount} / {memberSummary.maxLimit} Books
                    </div>
                  </div>

                  <div style={{ background: '#1f2937', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #374151' }}>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Overdue Items</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: memberSummary.overdueCount > 0 ? '#ef4444' : '#10b981' }}>
                      {memberSummary.overdueCount} Overdue
                    </div>
                  </div>

                  <div style={{ background: '#1f2937', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #374151' }}>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Unpaid Fines</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: memberSummary.unpaidFineAmount > 0 ? '#ef4444' : '#10b981' }}>
                      {memberSummary.unpaidFineAmount} THB
                    </div>
                  </div>
                </div>

                {/* Validation Banner */}
                {memberSummary.isBlocked ? (
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '0.375rem', padding: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <AlertTriangle color="#ef4444" size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ fontWeight: 600, color: '#f87171', fontSize: '0.9rem' }}>Borrowing Blocked for this Member</div>
                      <ul style={{ margin: '0.25rem 0 0 1rem', padding: 0, color: '#fca5a5', fontSize: '0.85rem' }}>
                        {memberSummary.reasons.map((reason: string, idx: number) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '0.375rem', padding: '0.6rem 0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <CheckCircle color="#10b981" size={18} />
                    <span style={{ color: '#34d399', fontSize: '0.85rem', fontWeight: 500 }}>
                      Member is eligible to borrow books. (1 slot reserved for this transaction)
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Step 2: Book & BookCopy Selection */}
        <Card title="2. Select Book & Physical Copy">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Select
              label="Select Book Catalog Item"
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              disabled={!memberSummary || memberSummary.isBlocked}
              options={[
                { value: '', label: '-- Select Book from Catalog --' },
                ...books.map((b) => ({
                  value: String(b.id),
                  label: `${b.title} (Author: ${b.author}) - [${b.available_copies ?? 0} Available]`,
                })),
              ]}
              required
            />

            {selectedBook && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Select
                  label="Select Physical Book Copy"
                  value={selectedCopyId}
                  onChange={(e) => setSelectedCopyId(e.target.value)}
                  options={[
                    { value: '', label: '-- Select Physical BookCopy ID --' },
                    ...availableCopies.map((c: any) => ({
                      value: String(c.copy_id),
                      label: `${c.copy_id} (Status: AVAILABLE)`,
                    })),
                  ]}
                  required
                />
                {availableCopies.length === 0 && (
                  <Alert type="warning" message="No AVAILABLE physical copies remain for this book catalog item." />
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Step 3: Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <Button
            type="submit"
            variant="primary"
            disabled={!memberSummary || memberSummary.isBlocked || !selectedCopyId}
            icon={<BookOpen size={18} />}
          >
            Review & Confirm Borrowing
          </Button>
        </div>
      </form>

      {/* Confirmation Modal */}
      <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} title="Confirm Borrowing Transaction">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Alert type="info" message="Please double check member details and physical copy barcode before issuing loan." />

          <div style={{ background: '#111827', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #374151', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Member Name:</span>
              <span style={{ color: '#f3f4f6', fontWeight: 600 }}>{memberSummary?.member.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Student ID:</span>
              <span style={{ color: '#f3f4f6', fontWeight: 600 }}>{memberSummary?.member.student_id}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Book Title:</span>
              <span style={{ color: '#60a5fa', fontWeight: 600 }}>{selectedBook?.title}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Physical Copy ID:</span>
              <span style={{ color: '#f3f4f6', fontWeight: 600 }}>{selectedCopyId}</span>
            </div>
            <hr style={{ borderColor: '#374151', margin: '0.25rem 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Borrow Date (Today):</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>{today.toLocaleDateString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Due Date (Exactly 7 Days):</span>
              <span style={{ color: '#f59e0b', fontWeight: 700 }}>{dueDatePreview.toLocaleDateString()}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button variant="ghost" onClick={() => setIsConfirmModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleExecuteBorrowing}>
              Confirm & Issue Loan
            </Button>
          </div>
        </div>
      </Modal>

      {/* Issued Borrowing Receipt Summary */}
      {issuedBorrowing && (
        <Card title="Latest Borrowing Receipt">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#064e3b', color: '#ecfdf5', padding: '1rem', borderRadius: '0.5rem' }}>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>✅ Borrowing Transaction Issued</div>
            <div>Transaction Code: <strong>{issuedBorrowing.borrowing_id}</strong></div>
            <div>Due Date: <strong>{new Date(issuedBorrowing.due_date).toLocaleDateString()}</strong></div>
          </div>
        </Card>
      )}
    </div>
  );
};
