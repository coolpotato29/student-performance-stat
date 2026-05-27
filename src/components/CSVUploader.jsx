import { useRef, useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react';
import Papa from 'papaparse';
import './CSVUploader.css';

export default function CSVUploader({ onDataLoaded, compact = false }) {
  const [state, setState] = useState('idle'); // idle | dragging | parsing | done | error
  const [errorMsg, setErrorMsg] = useState('');
  const [fileName, setFileName] = useState('');
  const inputRef = useRef(null);

  function handleFile(file) {
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      setErrorMsg('Please upload a .csv file.');
      setState('error');
      return;
    }
    setFileName(file.name);
    setState('parsing');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (result) => {
        const { data, meta } = result;
        const fields = meta.fields || [];

        const numericFields = fields.filter((f) =>
          data.some((row) => !isNaN(parseFloat(row[f])) && row[f] !== '')
        );

        if (numericFields.length === 0) {
          setErrorMsg('No numeric columns found. Make sure each column contains marks.');
          setState('error');
          return;
        }

        setState('done');
        onDataLoaded(data, numericFields, file.name);
      },
      error: (err) => {
        setErrorMsg(`Parse error: ${err.message}`);
        setState('error');
      },
    });
  }

  function handleDrop(e) {
    e.preventDefault();
    setState('idle');
    handleFile(e.dataTransfer.files[0]);
  }

  function handleReset() {
    setState('idle');
    setErrorMsg('');
    setFileName('');
    if (inputRef.current) inputRef.current.value = '';
  }

  const isDragging = state === 'dragging';
  const iconSize   = compact ? 28 : 40;

  return (
    <div className={`uploader-shell${compact ? ' uploader-shell--compact' : ' fade-up'}`}>
      <div
        className={[
          'drop-zone',
          compact         ? 'drop-zone--compact'  : '',
          isDragging      ? 'drop-zone--active'   : '',
          state === 'error' ? 'drop-zone--error'  : '',
          state === 'done'  ? 'drop-zone--done'   : '',
        ].join(' ')}
        onDragOver={(e) => { e.preventDefault(); setState('dragging'); }}
        onDragLeave={() => setState('idle')}
        onDrop={handleDrop}
        onClick={() => state !== 'parsing' && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {(state === 'idle' || state === 'dragging') && (
          <div className="dz-content">
            <div className={`dz-icon-wrap ${isDragging ? 'dz-icon-wrap--active' : ''}`}>
              <UploadCloud size={iconSize} className="dz-icon" />
            </div>
            <p className="dz-title">
              {isDragging ? 'Drop your CSV here!' : 'Drag & drop your CSV file'}
            </p>
            <p className="dz-sub">or <span className="dz-browse">click to browse</span></p>
            {!compact && (
              <div className="dz-hint">
                <FileText size={13} />
                Columns = course names &nbsp;·&nbsp; Rows = student marks
              </div>
            )}
          </div>
        )}

        {state === 'parsing' && (
          <div className="dz-content">
            <div className="dz-spinner" />
            <p className="dz-title">Parsing <em>{fileName}</em>…</p>
          </div>
        )}

        {state === 'done' && (
          <div className="dz-content">
            <CheckCircle2 size={iconSize} className="dz-success-icon" />
            <p className="dz-title done-title">{fileName}</p>
            <p className="dz-sub">Loaded successfully</p>
            <button className="btn btn-ghost dz-reset-btn" onClick={(e) => { e.stopPropagation(); handleReset(); }}>
              <X size={14} /> Upload different file
            </button>
          </div>
        )}

        {state === 'error' && (
          <div className="dz-content">
            <AlertCircle size={iconSize} className="dz-error-icon" />
            <p className="dz-title error-title">Upload Failed</p>
            <p className="dz-sub dz-error-msg">{errorMsg}</p>
            <button className="btn btn-ghost dz-reset-btn" onClick={(e) => { e.stopPropagation(); handleReset(); }}>
              <X size={14} /> Try again
            </button>
          </div>
        )}
      </div>

      {!compact && (
        <div className="csv-format-hint card">
          <p className="hint-title"><FileText size={14} /> Expected CSV format</p>
          <pre className="hint-pre">{`Math,Science,English,History\n85,78,70,88\n92,88,65,90\n76,95,80,72`}</pre>
        </div>
      )}
    </div>
  );
}
