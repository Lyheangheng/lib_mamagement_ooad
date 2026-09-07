import React from 'react';
import { Card } from '../../components/ui/Card';
import { Table, Column } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Plus, Search } from 'lucide-react';

export const BookManagementPage: React.FC = () => {
  const sampleBooks = [
    { id: 1, isbn: '978-0134494166', title: 'Clean Architecture', author: 'Robert C. Martin', year: 2017, copies: '2 / 3 Available' },
    { id: 2, isbn: '978-0262033848', title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', year: 2009, copies: '1 / 2 Available' },
    { id: 3, isbn: '978-0201633610', title: 'Design Patterns', author: 'Erich Gamma et al.', year: 1994, copies: '1 / 2 Available' },
  ];

  const columns: Column[] = [
    { key: 'isbn', header: 'ISBN' },
    { key: 'title', header: 'Book Title' },
    { key: 'author', header: 'Author' },
    { key: 'year', header: 'Year' },
    { key: 'copies', header: 'Availability', render: (item) => <Badge status="AVAILABLE" label={item.copies} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: () => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button size="sm" variant="outline">Edit</Button>
          <Button size="sm" variant="secondary">+ Copy</Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f9fafb' }}>Book Catalog & Copies</h2>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Manage library inventory, physical copies, and metadata</p>
        </div>
        <Button variant="primary" icon={<Plus size={18} />}>
          Add New Book
        </Button>
      </div>

      <Card>
        <div style={{ marginBottom: '1rem', maxWidth: '350px' }}>
          <Input placeholder="Search by title, author, ISBN..." icon={<Search size={18} />} />
        </div>
        <Table columns={columns} data={sampleBooks} />
      </Card>
    </div>
  );
};
