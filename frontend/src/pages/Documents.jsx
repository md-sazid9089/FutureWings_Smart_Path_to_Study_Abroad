import { useState, useEffect, useRef } from 'react';
import API from '../api/axios';
import { PageHeader } from '../components/ui/PageHeader';
import GlassTable, { Td } from '../components/ui/GlassTable';
import StatusPill from '../components/ui/StatusPill';
import PrimaryButton from '../components/ui/PrimaryButton';
import EmptyState from '../components/ui/EmptyState';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { HiOutlineCloudArrowUp, HiOutlineDocumentText } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function Documents() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  useEffect(() => { fetchDocs(); }, []);

  const fetchDocs = async () => {
    try {
      const res = await API.get('/api/documents/list');
      setDocs(res.data.data);
    } catch {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await API.post('/api/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Document uploaded!');
      fetchDocs();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  if (loading) return <LoadingSkeleton rows={4} />;

  return (
    <>
      <PageHeader title="My Documents" subtitle="Upload and track verification status">
        <label className="cursor-pointer">
          <input type="file" ref={fileRef} onChange={handleUpload} className="hidden" />
          <PrimaryButton as="span" loading={uploading} onClick={() => fileRef.current?.click()}>
            <HiOutlineCloudArrowUp className="w-4 h-4" />
            {uploading ? 'Uploading…' : 'Upload'}
          </PrimaryButton>
        </label>
      </PageHeader>

      {docs.length === 0 ? (
        <EmptyState icon={HiOutlineDocumentText} title="No documents yet" message="Upload your first document to get started" />
      ) : (
        <GlassTable headers={['File Name', 'Type', 'Status', 'Note', 'Uploaded']}>
          {docs.map((doc) => (
            <tr key={doc.id} className="hover:bg-white/20 transition-colors">
              <Td className="font-medium">{doc.fileName}</Td>
              <Td>{doc.fileType}</Td>
              <Td><StatusPill status={doc.status} /></Td>
              <Td className="text-text-muted">{doc.note || '—'}</Td>
              <Td>{new Date(doc.createdAt).toLocaleDateString()}</Td>
            </tr>
          ))}
        </GlassTable>
      )}
    </>
  );
}
