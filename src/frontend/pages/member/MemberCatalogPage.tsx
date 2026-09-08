import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { BookDetailsModal } from '../../components/catalog/BookDetailsModal';
import { ApiClient } from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import { Search, BookOpen, User, Info } from 'lucide-react';

export const MemberCatalogPage: React.FC = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<any | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const fetchCatalog = async (query = '') => {
    setIsLoading(true);
    setErrorMsg(null);
    const endpoint = query ? `/books?search=${encodeURIComponent(query)}` : '/books';
    const res = await ApiClient.get(endpoint);
    if (res.success && res.data) {
      setBooks(res.data);
    } else {
      setErrorMsg(res.error || 'Failed to load library book catalog.');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCatalog(searchTerm);
  };

  const handleOpenDetails = (book: any) => {
    setSelectedBook(book);
    setIsDetailsOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f9fafb' }}>Library Book Catalog</h2>
        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
          Discover available books, read summaries, and borrow items directly to your personal library account
        </p>
      </div>

      {errorMsg && <Alert type="error" message={errorMsg} />}

      {/* Search Header Bar */}
      <Card style={{ padding: '1rem 1.25rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '260px' }}>
            <Input
              placeholder="Search by Title, Author, ISBN, or Book ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search size={18} />}
            />
          </div>
          <Button type="submit" variant="primary" icon={<Search size={16} />}>
            Search Catalog
          </Button>
          {searchTerm && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setSearchTerm('');
                fetchCatalog('');
              }}
            >
              Clear Filter
            </Button>
          )}
        </form>
      </Card>

      {/* Book Grid Container */}
      {isLoading ? (
        <LoadingSpinner message="Searching library catalog..." />
      ) : books.length === 0 ? (
        <EmptyState
          title="No Books Found"
          description={searchTerm ? `No books matched '${searchTerm}'. Try searching another title or author.` : 'No books in library catalog.'}
          actionLabel="Show All Books"
          onAction={() => {
            setSearchTerm('');
            fetchCatalog('');
          }}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {books.map((book) => {
            const availableCopies = book.available_copies ?? 0;
            const isAvailable = availableCopies > 0;

            return (
              <div
                key={book.id}
                className="glass-card glass-card-interactive"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: '#111827',
                  border: '1px solid #374151',
                }}
              >
                {/* Book Cover Banner */}
                <div style={{ height: '190px', position: 'relative', overflow: 'hidden', backgroundColor: '#1f2937' }}>
                  <img
                    src={book.cover_image || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&q=80'}
                    alt={book.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&q=80';
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '0.5rem',
                      right: '0.5rem',
                    }}
                  >
                    <Badge
                      status={isAvailable ? 'AVAILABLE' : 'BORROWED'}
                      label={isAvailable ? `${availableCopies} Available` : 'Out of Stock'}
                    />
                  </div>
                </div>

                {/* Card Content Body */}
                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.5rem' }}>
                  <h3
                    style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: '#f9fafb',
                      lineHeight: 1.3,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      minHeight: '2.6rem',
                    }}
                  >
                    {book.title}
                  </h3>

                  <div style={{ fontSize: '0.825rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <User size={14} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.author}</span>
                  </div>

                  <p
                    style={{
                      fontSize: '0.8rem',
                      color: '#6b7280',
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      marginTop: '0.2rem',
                    }}
                  >
                    {book.description || 'No summary available.'}
                  </p>

                  <div style={{ marginTop: 'auto', paddingTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                    <Button
                      variant="outline"
                      size="sm"
                      style={{ flex: 1 }}
                      icon={<Info size={14} />}
                      onClick={() => handleOpenDetails(book)}
                    >
                      Details
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      style={{ flex: 1 }}
                      disabled={!isAvailable}
                      icon={<BookOpen size={14} />}
                      onClick={() => handleOpenDetails(book)}
                    >
                      {isAvailable ? 'Borrow' : 'Full'}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Book Details & Borrowing Modal */}
      <BookDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        book={selectedBook}
        memberId={user?.memberId}
        onBorrowSuccess={() => {
          fetchCatalog(searchTerm);
        }}
      />
    </div>
  );
};
