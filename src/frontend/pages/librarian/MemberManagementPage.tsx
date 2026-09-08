import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Alert } from '../../components/ui/Alert';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ApiClient } from '../../api/apiClient';
import { Edit, ShieldAlert, ShieldCheck } from 'lucide-react';

export const MemberManagementPage: React.FC = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);

  // Edit Form
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', faculty: '', major: '' });

  const fetchMembers = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    const res = await ApiClient.get('/members');
    if (res.success && res.data) {
      setMembers(res.data);
    } else {
      setErrorMsg(res.error || 'Failed to fetch members directory.');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleOpenEdit = (m: any) => {
    setSelectedMember(m);
    setEditForm({
      name: m.name || '',
      email: m.email || '',
      phone: m.phone || '',
      faculty: m.faculty || '',
      major: m.major || '',
    });
    setIsEditModalOpen(true);
  };

  const handleEditMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    setIsLoading(true);
    const res = await ApiClient.put(`/members/${selectedMember.id}`, editForm);
    setIsLoading(false);
    if (res.success) {
      setSuccessMsg(`Member '${editForm.name}' updated successfully.`);
      setIsEditModalOpen(false);
      fetchMembers();
    } else {
      setErrorMsg(res.error || 'Failed to update member.');
    }
  };

  const handleOpenStatusModal = (m: any) => {
    setSelectedMember(m);
    setIsStatusModalOpen(true);
  };

  const handleToggleStatus = async () => {
    if (!selectedMember) return;
    const newStatus = selectedMember.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setIsLoading(true);
    const res = await ApiClient.put(`/members/${selectedMember.id}/status`, { status: newStatus });
    setIsLoading(false);
    if (res.success) {
      setSuccessMsg(`Member Student ID '${selectedMember.student_id}' status changed to ${newStatus}.`);
      setIsStatusModalOpen(false);
      fetchMembers();
    } else {
      setErrorMsg(res.error || 'Failed to update member status.');
    }
  };

  const columns: Column[] = [
    { key: 'student_id', header: 'Student ID' },
    { key: 'name', header: 'Full Name' },
    { key: 'email', header: 'Email' },
    { key: 'faculty', header: 'Faculty' },
    { key: 'major', header: 'Major' },
    { key: 'status', header: 'Status', render: (m) => <Badge status={m.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (m) => (
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <Button size="sm" variant="outline" onClick={() => handleOpenEdit(m)} icon={<Edit size={14} />}>
            Edit
          </Button>
          <Button
            size="sm"
            variant={m.status === 'ACTIVE' ? 'danger' : 'secondary'}
            onClick={() => handleOpenStatusModal(m)}
            icon={m.status === 'ACTIVE' ? <ShieldAlert size={14} /> : <ShieldCheck size={14} />}
          >
            {m.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f9fafb' }}>Member Directory</h2>
        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>View student member accounts, edit details, and toggle account activation status</p>
      </div>

      {errorMsg && <Alert type="error" message={errorMsg} />}
      {successMsg && <Alert type="success" message={successMsg} />}

      <Card>
        {isLoading ? (
          <LoadingSpinner message="Fetching members directory..." />
        ) : (
          <Table columns={columns} data={members} emptyMessage="No student members registered." />
        )}
      </Card>

      {/* Edit Member Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Member Profile - ${selectedMember?.student_id}`}>
        <form onSubmit={handleEditMember} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input label="Student ID (Immutable)" value={selectedMember?.student_id || ''} disabled />
          <Input label="Full Name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
          <Input label="Email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} required />
          <Input label="Phone" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
          <Input label="Faculty" value={editForm.faculty} onChange={(e) => setEditForm({ ...editForm, faculty: e.target.value })} required />
          <Input label="Major" value={editForm.major} onChange={(e) => setEditForm({ ...editForm, major: e.target.value })} required />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Toggle Status Confirmation Modal */}
      <Modal isOpen={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)} title="Confirm Status Change">
        <div>
          <Alert
            type="warning"
            title="Account Status Toggle"
            message={`Are you sure you want to change account status for Student ID '${selectedMember?.student_id}' to ${selectedMember?.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'}? ${selectedMember?.status === 'ACTIVE' ? 'Suspended members cannot borrow books.' : 'Active members can borrow books.'}`}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button variant="ghost" onClick={() => setIsStatusModalOpen(false)}>Cancel</Button>
            <Button variant={selectedMember?.status === 'ACTIVE' ? 'danger' : 'primary'} onClick={handleToggleStatus}>
              Confirm {selectedMember?.status === 'ACTIVE' ? 'Deactivation' : 'Activation'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
