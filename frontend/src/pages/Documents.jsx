import { useState, useEffect } from 'react';
import API from '../api/axios';
import { PageHeader } from '../components/ui/PageHeader';
import GlassTable, { Td } from '../components/ui/GlassTable';
import StatusPill from '../components/ui/StatusPill';
import PrimaryButton from '../components/ui/PrimaryButton';
import EmptyState from '../components/ui/EmptyState';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { HiOutlinePlus, HiOutlineDocumentText } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import Modal from '../components/ui/Modal';
import TextField from '../components/ui/TextField';

export default function Documents() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [driveLink, setDriveLink] = useState('');
  const [documentType, setDocumentType] = useState('');

  useEffect(() => { fetchDocs(); }, []);

  const fetchDocs = async () => {
    try {
      const res = await API.get('/api/documents');
      setDocs(res.data.data);
    } catch {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDocument = async () => {
    if (!driveLink.trim()) {
      toast.error('Please enter a valid drive link');
      return;
    }

    setAdding(true);
    try {
      await API.post('/api/documents', {
        filePath: driveLink,
        fileType: documentType || 'Document',
      });
      toast.success('Document link added!');
      setDriveLink('');
      setDocumentType('');
      setShowModal(false);
      fetchDocs();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to add document');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <LoadingSkeleton rows={4} />;

  return (
    <>
      <PageHeader title="My Documents" subtitle="Add drive links for your documents">
        <PrimaryButton loading={adding} onClick={() => setShowModal(true)}>
          <HiOutlinePlus className="w-4 h-4" />
          Add Document
        </PrimaryButton>
      </PageHeader>

      <Modal open={showModal} onClose={() => !adding && setShowModal(false)} title="Add Document Link">
        <div className="space-y-4">
          <TextField
            label="Document Type"
            placeholder="e.g., Passport, Visa, Test Score"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
          />
          <TextField
            label="Drive Link"
            placeholder="Paste your Google Drive or OneDrive link here"
            type="url"
            value={driveLink}
            onChange={(e) => setDriveLink(e.target.value)}
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowModal(false)}
              disabled={adding}
              className="px-4 py-2 rounded-lg bg-glass hover:bg-white/10 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleAddDocument}
              disabled={adding || !driveLink.trim()}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 transition text-white"
            >
              {adding ? 'Adding...' : 'Add Document'}
            </button>
          </div>
        </div>
      </Modal>

      {docs.length === 0 ? (
        <EmptyState icon={HiOutlineDocumentText} title="No documents yet" message="Add your first document link to get started" />
      ) : (
        <GlassTable headers={['Document Type', 'Link', 'Status', 'Admin Note', 'Added']}>
          {docs.map((doc) => (
            <tr key={doc.id} className="hover:bg-white/20 transition-colors">
              <Td className="font-medium">{doc.fileType || 'Document'}</Td>
              <Td className="truncate max-w-xs">
                <a href={doc.filePath} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">
                  View Link
                </a>
              </Td>
              <Td><StatusPill status={doc.verificationStatus} /></Td>
              <Td className="text-text-muted text-sm">{doc.adminNote || '-'}</Td>
              <Td>{new Date(doc.uploadedAt).toLocaleDateString()}</Td>
            </tr>
          ))}
        </GlassTable>
      )}
    </>
  );
}
