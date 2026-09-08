import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Alert } from '../ui/Alert';
import { BookOpen, Calendar, User, Bookmark, CheckCircle } from 'lucide-react';
import { ApiClient } from '../../api/apiClient';

export interface BookDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: any | null;
  memberId?: number;
  onBorrowSuccess?: () => void;
}

export const BookDetailsModal: React.FC<BookDetailsModalProps> = ({
  isOpen,
  onClose,
  book,
  memberId,
  onBorrowSuccess,
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!book) return null;

  const availableCopies = book.available_copies ?? 0;
  const totalCopies = book.total_copies ?? book.quantity;
  const isAvailable = availableCopies > 0;

  const borrowDate = new Date();
  const dueDate = new Date(borrowDate.getTime() + 7 * 24 * 60 * 60 * 1000);

  const handleExecuteBorrow = async () => {
    setIsBorrowing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await ApiClient.post('/borrowings/borrow-book', {
        bookId: book.id,
        memberId,
      });

      if (res.success && res.data) {
        setSuccessMsg(`Successfully borrowed '${book.title}'! Due Date: ${new Date(res.data.due_date).toLocaleDateString()}`);
        setIsConfirming(false);
        if (onBorrowSuccess) {
          onBorrowSuccess();
        }
      } else {
        setErrorMsg(res.error || 'Failed to borrow book.');
      }
    } catch (err: any) {
      setErrorMsg('Network error while processing borrowing transaction.');
    } finally {
      setIsBorrowing(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Book Details & Availability">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {errorMsg && <Alert type="error" message={errorMsg} />}
        {successMsg && <Alert type="success" message={successMsg} />}

        {/* Top Header Card */}
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '120px',
              height: '170px',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              flexShrink: 0,
            }}
          >
            <img
              src={book.cover_image || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&q=80'}
              alt={book.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&q=80';
              }}
            />
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '220px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f9fafb', lineHeight: 1.3 }}>{book.title}</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9ca3af', fontSize: '0.875rem' }}>
              <User size={16} />
              <span>{book.author}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#9ca3af', fontSize: '0.8rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Bookmark size={14} /> ISBN: {book.isbn}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Calendar size={14} /> Published: {book.publication_year}
              </span>
            </div>

            <div style={{ marginTop: '0.5rem' }}>
              <Badge
                status={isAvailable ? 'AVAILABLE' : 'BORROWED'}
                label={isAvailable ? `${availableCopies} of ${totalCopies} Physical Copies Available` : 'All Copies Borrowed'}
              />
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div style={{ backgroundColor: '#111827', padding: '1rem', borderRadius: '8px', border: '1px solid #374151' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>
            Book Description & Overview
          </h4>
          <p style={{ color: '#d1d5db', fontSize: '0.9rem', lineHeight: 1.6 }}>
            {book.description || 'No detailed synopsis available for this publication in the library database.'}
          </p>
        </div>

        {/* Borrowing Confirmation Panel */}
        {isConfirming ? (
          <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '1px solid #6366f1', padding: '1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontWeight: 600, color: '#818cf8', fontSize: '0.95rem' }}>Confirm Borrowing Transaction</div>
            <div style={{ fontSize: '0.85rem', color: '#d1d5db', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div>Borrow Date: <strong>{borrowDate.toLocaleDateString()}</strong></div>
              <div>Due Date (7 Days): <strong style={{ color: '#fbbf24' }}>{dueDate.toLocaleDateString()}</strong></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.25rem' }}>
              <Button variant="ghost" size="sm" onClick={() => setIsConfirming(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" isLoading={isBorrowing} icon={<CheckCircle size={16} />} onClick={handleExecuteBorrow}>
                Confirm Borrow
              </Button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
            <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
              {isAvailable ? '7-day borrowing period applies (BR2)' : 'Check back later when a copy is returned'}
            </div>
            <Button
              variant="primary"
              disabled={!isAvailable || isBorrowing}
              icon={<BookOpen size={16} />}
              onClick={() => setIsConfirming(true)}
            >
              {isAvailable ? 'Borrow This Book' : 'Unavailable'}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};
