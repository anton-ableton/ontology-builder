import React, { useState, useRef } from 'react';
import styles from './UploadZone.module.css';
import DocumentList from '../DocumentList/DocumentList';

export default function UploadZone({ onUpload, loading, disabled }) {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const processFiles = (fileList) => {
    const newFiles = [];

    for (const file of fileList) {
      if (file.type !== 'application/pdf') {
        alert(`"${file.name}" is not a PDF`);
        continue;
      }

      newFiles.push({
        id: crypto.randomUUID(),
        file,
        name: file.name,
        size: file.size
      });
    }

    setFiles((prev) => {
      const existingNames = new Set(prev.map(f => f.name));
      const filtered = newFiles.filter(f => !existingNames.has(f.name));
      return [...prev, ...filtered];
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles?.length) {
      processFiles(droppedFiles);
    }
  };

  const handleSelect = (e) => {
    processFiles(e.target.files);
    e.target.value = '';
  };

  const handleRemove = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSend = () => {
    if (!files.length || loading) return;
    onUpload(files.map((f) => f.file));
    setFiles([]);
  };

  return (
    <section aria-labelledby="upload-title">
      <h2 id="upload-title" style={{ display: 'none' }}>
        Upload PDFs
      </h2>

      <div className={styles.container}>
        
        <div
            className={`${styles.dropzone} ${dragActive ? styles.active : ''} ${disabled ? styles.disabled : ''}`}
            onDragOver={(e) => {
              if (disabled) return;
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => !disabled && setDragActive(false)}
            onDrop={(e) => {
              if (disabled) return;
              handleDrop(e);
            }}
            role="button"
            aria-label="Upload PDF files by drag and drop"
            >
            <p>Drag & drop PDF files</p>

            <button
              type="button"
              className={styles.button}
              onClick={() => !disabled && inputRef.current.click()}
              disabled={disabled}
            >
              Choose files
            </button>

            <input
              ref={inputRef}
              type="file"
              multiple
              accept="application/pdf"
              onChange={handleSelect}
              disabled={disabled}
              hidden
            />
        </div>

        <DocumentList files={files} onRemove={handleRemove} />

        <button
          className={styles.submit}
          onClick={handleSend}
          disabled={loading || files.length === 0 || disabled}
        >
          {loading ? 'Converting...' : 'Convert to OWL'}
        </button>
      </div>
    </section>
  );
}
