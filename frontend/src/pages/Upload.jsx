import { useState, useCallback } from 'react';
import { UploadCloud, File as FileIcon, X, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../utils/api';

export default function Upload() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [errorMessage, setErrorMessage] = useState('');

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        setUploadStatus('idle');
      } else {
        setUploadStatus('error');
        setErrorMessage('Please upload a PDF file.');
      }
    }
  }, []);

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setUploadStatus('idle');
      } else {
        setUploadStatus('error');
        setErrorMessage('Please upload a PDF file.');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploadStatus('uploading');
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await api.post('/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Upload successful:', response.data);
      setUploadStatus('success');
      
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('error');
      setErrorMessage(error.response?.data?.message || 'Failed to upload resume. Please try again.');
    }
  };

  const resetUpload = () => {
    setFile(null);
    setUploadStatus('idle');
    setErrorMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Upload Resume</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Upload your PDF resume for AI-powered analysis.</p>
      </div>

      <div className="glass rounded-2xl p-8">
        {!file ? (
          <div 
            className={`relative border-2 border-dashed rounded-2xl p-12 transition-all duration-200 ease-in-out flex flex-col items-center justify-center text-center cursor-pointer
              ${dragActive ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 scale-[1.02]' : 'border-slate-300 dark:border-slate-700 hover:border-brand-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              accept=".pdf" 
              onChange={handleChange} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="bg-white dark:bg-slate-800 p-4 rounded-full shadow-sm mb-4">
              <UploadCloud size={32} className="text-brand-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Drag & Drop your resume here
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              or click to browse from your computer (PDF only, max 10MB)
            </p>
            <button className="bg-slate-900 dark:bg-brand-600 text-white px-6 py-2.5 rounded-xl font-medium transition-transform hover:scale-105 pointer-events-none">
              Select File
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-4">
                <div className="bg-brand-100 dark:bg-brand-900/30 p-3 rounded-lg text-brand-600 dark:text-brand-400">
                  <FileIcon size={24} />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white truncate max-w-xs">{file.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
              {uploadStatus === 'idle' && (
                <button onClick={resetUpload} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                  <X size={20} />
                </button>
              )}
            </div>

            {uploadStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-500/10 p-4 rounded-xl text-sm">
                <AlertCircle size={16} />
                {errorMessage}
              </div>
            )}

            {uploadStatus === 'success' && (
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-xl text-sm border border-emerald-200 dark:border-emerald-500/20">
                <CheckCircle size={16} />
                Resume uploaded successfully! Extracting text and queuing for ML Analysis...
              </div>
            )}

            <div className="flex gap-4">
              <button 
                onClick={resetUpload}
                disabled={uploadStatus === 'uploading'}
                className="flex-1 py-3 px-4 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {uploadStatus === 'success' ? 'Upload Another' : 'Cancel'}
              </button>
              
              {uploadStatus !== 'success' && (
                <button 
                  onClick={handleUpload}
                  disabled={uploadStatus === 'uploading'}
                  className="flex-1 py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium shadow-lg shadow-brand-500/30 transition-all disabled:opacity-70 flex justify-center items-center gap-2"
                >
                  {uploadStatus === 'uploading' ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Analyze Resume'
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      
      {uploadStatus === 'success' && (
         <div className="glass rounded-2xl p-6 border-l-4 border-l-emerald-500">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <CheckCircle className="text-emerald-500" size={20} />
              Analysis Complete
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              The AI/ML scoring algorithm has analyzed your resume. You can view the detailed report in your <strong>History</strong>.
            </p>
         </div>
      )}
    </div>
  );
}
