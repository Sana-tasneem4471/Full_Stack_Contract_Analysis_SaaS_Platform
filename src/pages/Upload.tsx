import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Upload as UploadIcon, File, CheckCircle, AlertCircle, X } from 'lucide-react';

interface UploadFile {
  id: string;
  file: File;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
}

export default function Upload() {
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>([]);

  const allowedTypes = [
    'application/pdf',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      processFiles(selectedFiles);
    }
  };

  const processFiles = (fileList: File[]) => {
    const validFiles = fileList.filter(file => {
      const isValidType = allowedTypes.includes(file.type) || 
        file.name.toLowerCase().endsWith('.pdf') ||
        file.name.toLowerCase().endsWith('.txt') ||
        file.name.toLowerCase().endsWith('.docx');
      
      return isValidType && file.size <= 50 * 1024 * 1024; // 50MB limit
    });

    const newFiles: UploadFile[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'uploading',
      progress: 0
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // Simulate upload process
    newFiles.forEach(uploadFile => {
      simulateUpload(uploadFile.id);
    });
  };

  const simulateUpload = (fileId: string) => {
    const interval = setInterval(() => {
      setFiles(prev => prev.map(file => {
        if (file.id === fileId) {
          if (file.progress < 100) {
            return { ...file, progress: file.progress + Math.random() * 20 };
          } else {
            // Move to processing phase
            if (file.status === 'uploading') {
              setTimeout(() => {
                setFiles(prev => prev.map(f => 
                  f.id === fileId 
                    ? { ...f, status: 'processing' as const }
                    : f
                ));
                
                // Simulate processing completion
                setTimeout(() => {
                  setFiles(prev => prev.map(f => 
                    f.id === fileId 
                      ? { ...f, status: 'completed' as const }
                      : f
                  ));
                }, 2000);
              }, 500);
            }
            clearInterval(interval);
            return { ...file, progress: 100 };
          }
        }
        return file;
      }));
    }, 200);
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'uploading':
        return 'Uploading...';
      case 'processing':
        return 'Processing with AI...';
      case 'completed':
        return 'Completed';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Contracts</h1>
          <p className="text-gray-600">Upload your PDF, TXT, or DOCX files for AI-powered analysis</p>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors duration-200 ${
              dragOver 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <UploadIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Drop your contract files here
            </h3>
            <p className="text-gray-600 mb-6">
              or click to browse from your computer
            </p>
            
            <input
              type="file"
              multiple
              accept=".pdf,.txt,.docx,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition duration-200"
            >
              <UploadIcon className="w-5 h-5 mr-2" />
              Select Files
            </label>
            
            <div className="mt-6 text-sm text-gray-500">
              <p>Supported formats: PDF, TXT, DOCX</p>
              <p>Maximum file size: 50MB per file</p>
            </div>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Processing Files ({files.length})
            </h2>
            <div className="space-y-4">
              {files.map((uploadFile) => (
                <div key={uploadFile.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="flex-shrink-0">
                        <File className="w-8 h-8 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {uploadFile.file.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(uploadFile.file.size)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(uploadFile.status)}
                        <span className="text-sm text-gray-600">
                          {getStatusText(uploadFile.status)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(uploadFile.id)}
                      className="ml-4 text-gray-400 hover:text-gray-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {uploadFile.status === 'uploading' && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Uploading</span>
                        <span>{Math.round(uploadFile.progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadFile.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {uploadFile.status === 'processing' && (
                    <div className="mt-3">
                      <div className="flex items-center text-sm text-blue-600">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
                        Analyzing document with AI...
                      </div>
                    </div>
                  )}
                  
                  {uploadFile.status === 'completed' && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center text-sm text-green-700">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Successfully processed and analyzed
                      </div>
                      <div className="mt-2 text-xs text-green-600">
                        Found 8 key clauses • Identified 2 potential risks • Generated insights
                      </div>
                    </div>
                  )}
                  
                  {uploadFile.status === 'error' && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center text-sm text-red-700">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        {uploadFile.error || 'An error occurred while processing this file'}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {files.some(f => f.status === 'completed') && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200">
                  View Analysis Results
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-medium text-blue-900 mb-3">Upload Tips</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Ensure text is clear and readable for optimal AI analysis</li>
            <li>• Multiple contracts can be uploaded simultaneously</li>
            <li>• Processing time depends on document length and complexity</li>
            <li>• All uploads are encrypted and securely stored</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}