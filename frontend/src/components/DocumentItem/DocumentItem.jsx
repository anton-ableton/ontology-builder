import React from 'react';
import styles from './DocumentItem.module.css';

export default function DocumentItem({ file, onRemove }) {
  return (
    <article className={styles.card}>
      
      <button
        className={styles.remove}
        onClick={() => onRemove(file.id)}
        aria-label={`Remove ${file.name}`}
      >
        ✕
      </button>

      <div className={styles.icon} />

      <div className={styles.name}>{file.name}</div>

      <div className={styles.size}>
        {(file.size / 1024).toFixed(1)} KB
      </div>
    </article>
  );
}
