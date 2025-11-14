import React, { useState, useRef } from 'react';
import { Upload, X, File, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * Secure File Upload Component with validation
 *
 * @param {Object} props
 * @param {Function} props.onFilesChange - Callback when files change
 * @param {Array} props.acceptedTypes - Array of accepted MIME types (e.g., ['image/jpeg', 'image/png'])
 * @param {number} props.maxSizeInMB - Maximum file size in MB (default: 5MB)
 * @param {number} props.maxFiles - Maximum number of files (default: 5)
 * @param {boolean} props.multiple - Allow multiple files (default: true)
 * @param {string} props.label - Label for the upload area
 */
function FileUpload({
  onFilesChange,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
  maxSizeInMB = 5,
  maxFiles = 5,
  multiple = true,
  label = 'Upload Files'
}) {
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  // Validate file type
  const isValidFileType = (file) => {
    return acceptedTypes.includes(file.type);
  };

  // Validate file size
  const isValidFileSize = (file) => {
    return file.size <= maxSizeInBytes;
  };

  // Sanitize filename
  const sanitizeFilename = (filename) => {
    // Remove any path components and special characters
    return filename
      .replace(/^.*[\\/]/, '') // Remove path
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars
      .substring(0, 255); // Limit length
  };

  // Validate and process files
  const processFiles = (fileList) => {
    const newErrors = [];
    const validFiles = [];

    // Check total number of files
    if (files.length + fileList.length > maxFiles) {
      newErrors.push(`Maximum ${maxFiles} files allowed`);
      setErrors(newErrors);
      return;
    }

    Array.from(fileList).forEach((file) => {
      // Validate file type
      if (!isValidFileType(file)) {
        newErrors.push(`${file.name}: Invalid file type. Allowed: ${acceptedTypes.join(', ')}`);
        return;
      }

      // Validate file size
      if (!isValidFileSize(file)) {
        newErrors.push(`${file.name}: File too large. Max size: ${maxSizeInMB}MB`);
        return;
      }

      // Sanitize filename
      const sanitizedName = sanitizeFilename(file.name);

      // Create a new File object with sanitized name
      const sanitizedFile = new File([file], sanitizedName, { type: file.type });

      // Check for duplicates
      if (files.some(f => f.name === sanitizedName)) {
        newErrors.push(`${sanitizedName}: File already added`);
        return;
      }

      validFiles.push({
        file: sanitizedFile,
        name: sanitizedName,
        size: file.size,
        type: file.type,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
      });
    });

    if (validFiles.length > 0) {
      const updatedFiles = [...files, ...validFiles];
      setFiles(updatedFiles);
      onFilesChange?.(updatedFiles.map(f => f.file));
    }

    setErrors(newErrors);
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      processFiles(fileList);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const fileList = e.dataTransfer.files;
    if (fileList && fileList.length > 0) {
      processFiles(fileList);
    }
  };

  // Remove file
  const removeFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);

    // Revoke preview URL if exists
    if (files[index].preview) {
      URL.revokeObjectURL(files[index].preview);
    }

    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles.map(f => f.file));
  };

  // Clear all files
  const clearAll = () => {
    files.forEach(f => {
      if (f.preview) {
        URL.revokeObjectURL(f.preview);
      }
    });
    setFiles([]);
    setErrors([]);
    onFilesChange?.([]);
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-teal-400 bg-teal-400/10'
            : 'border-white/20 hover:border-teal-400/50 hover:bg-white/5'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          accept={acceptedTypes.join(',')}
          multiple={multiple}
          className="hidden"
          aria-label={label}
        />

        <div className="flex flex-col items-center gap-3">
          <div className={`p-3 rounded-full ${isDragging ? 'bg-teal-400/20' : 'bg-white/10'}`}>
            <Upload className={`w-8 h-8 ${isDragging ? 'text-teal-400' : 'text-gray-400'}`} />
          </div>

          <div>
            <p className="text-white font-semibold mb-1">{label}</p>
            <p className="text-sm text-gray-400">
              Drag & drop files here or click to browse
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Accepted: {acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}
              {' '}• Max size: {maxSizeInMB}MB • Max files: {maxFiles}
            </p>
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, index) => (
            <div key={index} className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          ))}
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white">
              {files.length} file{files.length !== 1 ? 's' : ''} selected
            </p>
            <button
              onClick={clearAll}
              className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
            >
              Clear all
            </button>
          </div>

          <div className="space-y-2">
            {files.map((fileObj, index) => (
              <div
                key={index}
                className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
              >
                <div className="flex items-start gap-3">
                  {/* Preview or Icon */}
                  {fileObj.preview ? (
                    <img
                      src={fileObj.preview}
                      alt={fileObj.name}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <File className="w-6 h-6 text-blue-400" />
                    </div>
                  )}

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{fileObj.name}</p>
                    <p className="text-xs text-gray-400">{formatFileSize(fileObj.size)}</p>
                  </div>

                  {/* Success Icon & Remove Button */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 hover:bg-red-500/20 rounded-lg transition-colors group"
                      aria-label={`Remove ${fileObj.name}`}
                    >
                      <X className="w-5 h-5 text-gray-400 group-hover:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FileUpload;
