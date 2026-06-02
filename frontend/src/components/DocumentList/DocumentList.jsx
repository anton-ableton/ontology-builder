import React from 'react';
import DocumentItem from '../DocumentItem/DocumentItem';
import styles from './DocumentList.module.css';

export default function DocumentList({ files, onRemove }) {
  if (!files.length) return null;

  return (
    <section aria-label="Selected files">
      <div className={styles.grid}>
        {files.map((file) => (
          <DocumentItem
            key={file.id}
            file={file}
            onRemove={onRemove}
          />
        ))}
      </div>
    </section>
  );
}
