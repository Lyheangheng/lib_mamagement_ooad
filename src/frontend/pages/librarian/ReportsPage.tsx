import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Alert } from '../../components/ui/Alert';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ApiClient } from '../../api/apiClient';
import { Search, RotateCcw, Printer, Calendar, Filter } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'current' | 'overdue' | 'unpaid' | 'transactions'>('current');
  
  // Filter States
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Data States
  const [reportData, setReportData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchReport = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setReportData(null);

    let endpoint = '';
    const queryParams = new URLSearchParams();

    if (fromDate) queryParams.append('fromDate', fromDate);
    if (toDate) queryParams.append('toDate', toDate);
    if (fromDate) queryParams.append('startDate', fromDate);
    if (toDate) queryParams.append('endDate', toDate);
    if (memberSearch.trim()) queryParams.append('memberSearch', memberSearch.trim());
    if (bookSearch.trim()) queryParams.append('bookSearch', bookSearch.trim());
    if (statusFilter) queryParams.append('status', statusFilter);

    switch (activeTab) {
      case 'current':
        endpoint = `/reports/current-borrowings?${queryParams.toString()}`;
        break;
      case 'overdue':
        endpoint = `/reports/overdue?${queryParams.toString()}`;
        break;
      case 'unpaid':
        endpoint = `/reports/unpaid-fines?${queryParams.toString()}`;
        break;
      case 'transactions':
        endpoint = `/reports/transactions?${queryParams.toString()}`;
        break;
    }

    const res = await ApiClient.get(endpoint);
    if (res.success && res.data) {
      setReportData(res.data);
    } else {
      setErrorMsg(res.error || 'Failed to fetch report data.');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchReport();
  }, [activeTab]);

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReport();
  };

  const handleResetFilters = () => {
    setFromDate('');
    setToDate('');
    setMemberSearch('');
    setBookSearch('');
    setStatusFilter('');
    fetchReport();
  };

  // Table Column Definitions
  const currentColumns: Column[] = [
    { key: 'book_id', header: 'Book ID' },
    { key: 'title', header: 'Book Title' },
    { key: 'copy_id', header: 'Copy ID' },
    {
      key: 'member',
      header: 'Member',
      render: (r) => (
        <div>
          <div style={{ fontWeight: 600, color: '#f3f4f6' }}>{r.member_name}</div>
          <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{r.student_id}</div>
        </div>
      ),
    },
    { key: 'borrow_date', header: 'Borrow Date', render: (r) => new Date(r.borrow_date).toLocaleDateString() },
    { key: 'due_date', header: 'Due Date', render: (r) => new Date(r.due_date).toLocaleDateString() },
    { key: 'status', header: 'Status', render: (r) => <Badge status={r.status} /> },
  ];

  const overdueColumns: Column[] = [
    { key: 'borrowing_id', header: 'Transaction Code' },
    { key: 'title', header: 'Book Title' },
    { key: 'copy_id', header: 'Copy ID' },
    {
      key: 'member',
      header: 'Member',
      render: (r) => `${r.member_name} (${r.student_id})`,
    },
    { key: 'borrow_date', header: 'Borrow Date', render: (r) => new Date(r.borrow_date).toLocaleDateString() },
    { key: 'due_date', header: 'Due Date', render: (r) => new Date(r.due_date).toLocaleDateString() },
    { key: 'overdue_days', header: 'Overdue Days', render: (r) => <span style={{ color: '#ef4444', fontWeight: 600 }}>{r.overdue_days} Days</span> },
    { key: 'fine_amount', header: 'Fine Amount', render: (r) => <span style={{ color: '#fbbf24', fontWeight: 700 }}>{r.fine_amount.toFixed(2)} THB</span> },
  ];

  const unpaidColumns: Column[] = [
    { key: 'fine_id', header: 'Fine ID' },
    { key: 'borrowing_code', header: 'Borrowing Code' },
    { key: 'book_title', header: 'Book Title' },
    {
      key: 'member',
      header: 'Member',
      render: (r) => `${r.member_name} (${r.student_id})`,
    },
    { key: 'overdue_days', header: 'Overdue Days', render: (r) => `${r.overdue_days} Days` },
    { key: 'amount', header: 'Unpaid Amount', render: (r) => <span style={{ color: '#ef4444', fontWeight: 700 }}>{r.amount.toFixed(2)} THB</span> },
    { key: 'status', header: 'Status', render: (r) => <Badge status={r.status} /> },
  ];

  const transactionColumns: Column[] = [
    { key: 'borrowing_id', header: 'Transaction ID' },
    {
      key: 'member',
      header: 'Member',
      render: (r) => `${r.member_name} (${r.student_id})`,
    },
    { key: 'book_title', header: 'Book Title' },
    { key: 'copy_id', header: 'Copy ID' },
    { key: 'borrow_date', header: 'Borrow Date', render: (r) => new Date(r.borrow_date).toLocaleDateString() },
    { key: 'due_date', header: 'Due Date', render: (r) => new Date(r.due_date).toLocaleDateString() },
    { key: 'return_date', header: 'Return Date', render: (r) => (r.return_date ? new Date(r.return_date).toLocaleDateString() : '-') },
    { key: 'status', header: 'Status', render: (r) => <Badge status={r.status} /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f9fafb' }}>Library Operations Reports</h2>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Official library system reporting, statistics, and audit logs</p>
        </div>
        <Button variant="secondary" icon={<Printer size={16} />} onClick={() => window.print()}>
          Print Report
        </Button>
      </div>

      {errorMsg && <Alert type="error" message={errorMsg} />}

      {/* Report Type Navigation Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #374151', gap: '0.5rem' }}>
        {[
          { key: 'current', label: '1. Current Borrowing Report' },
          { key: 'overdue', label: '2. Overdue Report' },
          { key: 'unpaid', label: '3. Unpaid Fine Report' },
          { key: 'transactions', label: '4. Transaction Log Report' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.key ? '2px solid #6366f1' : '2px solid transparent',
              color: activeTab === tab.key ? '#818cf8' : '#9ca3af',
              fontWeight: activeTab === tab.key ? 700 : 500,
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report Multi-Criteria Filter Panel */}
      <Card title="Report Filters & Audit Search">
        <form onSubmit={handleApplyFilters} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
            <Input
              label="From Date"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              icon={<Calendar size={16} />}
            />
            <Input
              label="To Date"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              icon={<Calendar size={16} />}
            />
            <Input
              label="Member Search"
              placeholder="Name or Student ID..."
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              icon={<Search size={16} />}
            />
            <Input
              label="Book / Copy Search"
              placeholder="Title or Copy ID..."
              value={bookSearch}
              onChange={(e) => setBookSearch(e.target.value)}
              icon={<Search size={16} />}
            />
            <Select
              label="Status Filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'ACTIVE', label: 'ACTIVE' },
                { value: 'RETURNED', label: 'RETURNED' },
                { value: 'OVERDUE', label: 'OVERDUE' },
              ]}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button type="button" variant="ghost" icon={<RotateCcw size={16} />} onClick={handleResetFilters}>
              Reset Filters
            </Button>
            <Button type="submit" variant="primary" icon={<Filter size={16} />}>
              Apply Filters
            </Button>
          </div>
        </form>
      </Card>

      {/* Report Content Table & Summaries */}
      <Card
        title={
          activeTab === 'current'
            ? 'Current Active Borrowings Report'
            : activeTab === 'overdue'
            ? 'Overdue Loans & Calculated Fines Report'
            : activeTab === 'unpaid'
            ? 'Unpaid Member Fines Audit Report'
            : 'Complete Borrowing & Returning Transaction Audit'
        }
      >
        {isLoading ? (
          <LoadingSpinner message="Generating report data from database..." />
        ) : (
          reportData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Tab Specific KPI Header */}
              {activeTab === 'unpaid' && reportData.totalUnpaidAmount !== undefined && (
                <div style={{ display: 'flex', gap: '1.5rem', background: '#111827', padding: '0.85rem 1rem', borderRadius: '0.375rem', border: '1px solid #374151' }}>
                  <div>Total Unpaid Fines Count: <strong style={{ color: '#ef4444' }}>{reportData.totalUnpaidCount}</strong></div>
                  <div>Total Pending Amount: <strong style={{ color: '#ef4444' }}>{reportData.totalUnpaidAmount.toFixed(2)} THB</strong></div>
                </div>
              )}

              {activeTab === 'current' && (
                <div style={{ background: '#111827', padding: '0.75rem 1rem', borderRadius: '0.375rem', border: '1px solid #374151', color: '#9ca3af', fontSize: '0.9rem' }}>
                  Total Active Loans in Scope: <strong style={{ color: '#60a5fa' }}>{Array.isArray(reportData) ? reportData.length : 0}</strong>
                </div>
              )}

              {activeTab === 'overdue' && (
                <div style={{ background: '#111827', padding: '0.75rem 1rem', borderRadius: '0.375rem', border: '1px solid #374151', color: '#9ca3af', fontSize: '0.9rem' }}>
                  Total Overdue Items: <strong style={{ color: '#ef4444' }}>{Array.isArray(reportData) ? reportData.length : 0}</strong>
                </div>
              )}

              {/* Render Table */}
              <Table
                columns={
                  activeTab === 'current'
                    ? currentColumns
                    : activeTab === 'overdue'
                    ? overdueColumns
                    : activeTab === 'unpaid'
                    ? unpaidColumns
                    : transactionColumns
                }
                data={activeTab === 'unpaid' ? reportData.rows || [] : Array.isArray(reportData) ? reportData : []}
                emptyMessage="No records found matching report criteria."
              />
            </div>
          )
        )}
      </Card>
    </div>
  );
};
