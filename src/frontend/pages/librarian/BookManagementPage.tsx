import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Table, Column } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Alert } from '../../components/ui/Alert';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ApiClient } from '../../api/apiClient';
import { Plus, Search, Trash2, Edit, Copy as CopyIcon } from 'lucide-react';

export const BookManagementPage: React.FC = () => {
  const [books, setBooks] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);

  // Active Target Book
  const [selectedBook, setSelectedBook] = useState<any | null>(null);

  // Forms
  const [addForm, setAddForm] = useState({ isbn: '', title: '', author: '', publisher: '', publicationYear: 2026, quantity: 1, coverImage: '', description: '' });
  const [editForm, setEditForm] = useState({ isbn: '', title: '', author: '', publisher: '', publicationYear: 2026, coverImage: '', description: '' });
  const [newCopyId, setNewCopyId] = useState('');

  const fetchBooks = async (query = '') => {
    setIsLoading(true);
    setErrorMsg(null);
    const endpoint = query ? `/books?search=${encodeURIComponent(query)}` : '/books';
    const res = await ApiClient.get(endpoint);
    if (res.success && res.data) {
      setBooks(res.data);
    } else {
      setErrorMsg(res.error || 'Failed to fetch book catalog.');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBooks(searchTerm);
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);
    const res = await ApiClient.post('/books', addForm);
    setIsLoading(false);
    if (res.success) {
      setSuccessMsg(`Book '${addForm.title}' added successfully.`);
      setIsAddModalOpen(false);
      setAddForm({ isbn: '', title: '', author: '', publisher: '', publicationYear: 2026, quantity: 1, coverImage: '', description: '' });
      fetchBooks();
    } else {
      setErrorMsg(res.error || 'Failed to add book.');
    }
  };

  const handleOpenEdit = (book: any) => {
    setSelectedBook(book);
    setEditForm({
      isbn: book.isbn,
      title: book.title,
      author: book.author,
      publisher: book.publisher,
      publicationYear: book.publication_year,
      coverImage: book.cover_image || '',
      description: book.description || '',
    });
    setIsEditModalOpen(true);
  };

  const handleEditBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook) return;
    setIsLoading(true);
    const res = await ApiClient.put(`/books/${selectedBook.id}`, editForm);
    setIsLoading(false);
    if (res.success) {
      setSuccessMsg(`Book '${editForm.title}' updated successfully.`);
      setIsEditModalOpen(false);
      fetchBooks();
    } else {
      setErrorMsg(res.error || 'Failed to update book.');
    }
  };

  const handleOpenDelete = (book: any) => {
    setSelectedBook(book);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteBook = async () => {
    if (!selectedBook) return;
    setIsLoading(true);
    const res = await ApiClient.delete(`/books/${selectedBook.id}`);
    setIsLoading(false);
    if (res.success) {
      setSuccessMsg(`Book ID ${selectedBook.id} removed successfully.`);
      setIsDeleteModalOpen(false);
      fetchBooks();
    } else {
      setErrorMsg(res.error || 'Failed to delete book.');
    }
  };

  const handleOpenCopies = async (book: any) => {
    setSelectedBook(book);
    setIsCopyModalOpen(true);
    const res = await ApiClient.get(`/books/${book.id}`);
    if (res.success && res.data) {
      setSelectedBook(res.data);
    }
  };

  const handleAddCopy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook) return;
    setIsLoading(true);
    const res = await ApiClient.post(`/books/${selectedBook.id}/copies`, { copyId: newCopyId.trim() || undefined });
    setIsLoading(false);
    if (res.success) {
      setSuccessMsg(`Physical copy added to '${selectedBook.title}'.`);
      setNewCopyId('');
      handleOpenCopies(selectedBook);
      fetchBooks();
    } else {
      setErrorMsg(res.error || 'Failed to add copy.');
    }
  };

  const columns: Column[] = [
    { key: 'id', header: 'ID' },
    {
      key: 'cover_image',
      header: 'Cover',
      render: (b) => (
        <div style={{ width: '40px', height: '56px', backgroundColor: '#1f2937', borderRadius: '4px', overflow: 'hidden', border: '1px solid #374151' }}>
          <img
            src={b.cover_image || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200&q=80'}
            alt={b.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
      ),
    },
    { key: 'isbn', header: 'ISBN' },
    {
      key: 'title',
      header: 'Book Title',
      render: (b) => (
        <div>
          <div style={{ fontWeight: 600, color: '#f9fafb' }}>{b.title}</div>
          {b.description && <div style={{ fontSize: '0.75rem', color: '#9ca3af', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.description}</div>}
        </div>
      ),
    },
    { key: 'author', header: 'Author' },
    { key: 'publication_year', header: 'Year' },
    {
      key: 'availability',
      header: 'Availability',
      render: (b) => {
        const available = b.available_copies ?? 0;
        const total = b.total_copies ?? b.quantity;
        return <Badge status={available > 0 ? 'AVAILABLE' : 'BORROWED'} label={`${available} / ${total} Available`} />;
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (b) => (
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <Button size="sm" variant="secondary" onClick={() => handleOpenCopies(b)} icon={<CopyIcon size={14} />}>
            Copies
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleOpenEdit(b)} icon={<Edit size={14} />}>
            Edit
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleOpenDelete(b)} icon={<Trash2 size={14} />}>
            Remove
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f9fafb' }}>Book Catalog & Copies</h2>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Manage library inventory, physical copies, and search catalog</p>
        </div>
        <Button variant="primary" icon={<Plus size={18} />} onClick={() => setIsAddModalOpen(true)}>
          Add New Book
        </Button>
      </div>

      {errorMsg && <Alert type="error" message={errorMsg} />}
      {successMsg && <Alert type="success" message={successMsg} />}

      <Card>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', maxWidth: '500px' }}>
          <Input
            placeholder="Search by Title, Author, ISBN, or Book ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search size={18} />}
          />
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>

        {isLoading ? (
          <LoadingSpinner message="Fetching catalog..." />
        ) : (
          <Table columns={columns} data={books} emptyMessage="No books found in catalog matching query." />
        )}
      </Card>

      {/* Add Book Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Book Catalog Entry">
        <form onSubmit={handleAddBook} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input label="ISBN" placeholder="e.g. 978-0132350884" value={addForm.isbn} onChange={(e) => setAddForm({ ...addForm, isbn: e.target.value })} required />
          <Input label="Title" placeholder="e.g. Clean Code" value={addForm.title} onChange={(e) => setAddForm({ ...addForm, title: e.target.value })} required />
          <Input label="Author" placeholder="e.g. Robert C. Martin" value={addForm.author} onChange={(e) => setAddForm({ ...addForm, author: e.target.value })} required />
          <Input label="Publisher" placeholder="e.g. Prentice Hall" value={addForm.publisher} onChange={(e) => setAddForm({ ...addForm, publisher: e.target.value })} required />
          <Input label="Publication Year" type="number" value={addForm.publicationYear} onChange={(e) => setAddForm({ ...addForm, publicationYear: Number(e.target.value) })} required />
          <Input label="Initial Copy Quantity" type="number" min={1} value={addForm.quantity} onChange={(e) => setAddForm({ ...addForm, quantity: Number(e.target.value) })} required />
          <Input label="Cover Image URL (Optional)" placeholder="https://images.unsplash.com/..." value={addForm.coverImage} onChange={(e) => setAddForm({ ...addForm, coverImage: e.target.value })} />
          <Input label="Description (Optional)" placeholder="Short summary of the book content..." value={addForm.description} onChange={(e) => setAddForm({ ...addForm, description: e.target.value })} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create Book</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Book Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Book #${selectedBook?.id}`}>
        <form onSubmit={handleEditBook} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input label="ISBN" value={editForm.isbn} onChange={(e) => setEditForm({ ...editForm, isbn: e.target.value })} required />
          <Input label="Title" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} required />
          <Input label="Author" value={editForm.author} onChange={(e) => setEditForm({ ...editForm, author: e.target.value })} required />
          <Input label="Publisher" value={editForm.publisher} onChange={(e) => setEditForm({ ...editForm, publisher: e.target.value })} required />
          <Input label="Publication Year" type="number" value={editForm.publicationYear} onChange={(e) => setEditForm({ ...editForm, publicationYear: Number(e.target.value) })} required />
          <Input label="Cover Image URL" value={editForm.coverImage} onChange={(e) => setEditForm({ ...editForm, coverImage: e.target.value })} />
          <Input label="Description" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Catalog Deletion">
        <div>
          <Alert type="warning" title="Warning" message={`Are you sure you want to remove '${selectedBook?.title}' (ID: ${selectedBook?.id})? This will delete associated physical copies.`} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDeleteBook}>Confirm Remove</Button>
          </div>
        </div>
      </Modal>

      {/* Physical Copies Modal */}
      <Modal isOpen={isCopyModalOpen} onClose={() => setIsCopyModalOpen(false)} title={`Physical Copies - '${selectedBook?.title}'`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <form onSubmit={handleAddCopy} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
            <Input label="Add Custom Copy ID (Optional)" placeholder="e.g. BC-1001-04" value={newCopyId} onChange={(e) => setNewCopyId(e.target.value)} />
            <Button type="submit" variant="primary" icon={<Plus size={16} />}>Add Copy</Button>
          </form>

          <Table
            columns={[
              { key: 'copy_id', header: 'Copy ID' },
              { key: 'status', header: 'Status', render: (c) => <Badge status={c.status} /> },
            ]}
            data={selectedBook?.copies || []}
            emptyMessage="No physical copies found."
          />
        </div>
      </Modal>
    </div>
  );
};
