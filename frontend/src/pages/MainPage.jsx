import React, { useEffect, useState } from 'react';
import UploadZone from '../components/UploadZone/UploadZone';
import { uploadFiles } from '../services/api';
import { subscribeProgress } from '../services/progress';
import ProgressBar from '../components/ProgressBar/ProgressBar';
import styles from './MainPage.module.css';

export default function MainPage() {
  const [progress, setProgress] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeProgress((data) => {
      setProgress(data);

      if (data?.stage === 'done' || data?.message?.includes('DONE')) {
        setDone(true);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const handleUpload = async (files) => {
    setLoading(true);
    setDone(false);
    setProgress(null);
    setResult(null);

    await uploadFiles(files, (data) => {
      setProgress(data);

      if (data?.stage === 'result') {
        setResult(data.ontology);
        setLoading(false);
      }
    });
  };

  const reset = () => {
    setProgress(null);
    setResult(null);
    setDone(false);
    setLoading(false);
  };

  const downloadOwl = async () => {
    const res = await fetch('http://localhost:8080/api/export/owl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    });

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'ontology.owl';
    a.click();
  };

  return (
    <div className={styles.wrapper}>
      <h1>Ontology Builder</h1>

      <UploadZone
        onUpload={handleUpload}
        loading={loading}
        disabled={loading || done}
      />

      <ProgressBar progress={progress} />

      {result && (
        <div>
          <button 
            className={styles.download}
            onClick={downloadOwl}
          >
            Download OWL
          </button>
        </div>
      )}
    </div>
  );
}
