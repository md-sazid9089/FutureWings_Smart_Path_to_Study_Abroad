import { useState } from 'react';

export default function FileUploadWidget({ onUpload, loading = false }) {
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) return;
    onUpload(file);
    setFile(null);
    // Reset file input
    e.target.reset();
  };

  return (
    <form onSubmit={handleSubmit} className="file-upload-widget">
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="form-input"
      />
      <button type="submit" className="btn" disabled={!file || loading}>
        {loading ? 'Uploading...' : 'Upload'}
      </button>
    </form>
  );
}
