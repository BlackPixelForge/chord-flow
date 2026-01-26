/**
 * UploadZone Component
 *
 * Drag-and-drop file upload area for audio files.
 */

import { useState, useCallback, useRef } from 'react';
import { AUDIO_CONSTRAINTS } from '../../types/audioAnalysis';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function UploadZone({ onFileSelect, disabled = false }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSelect = useCallback(
    (file: File) => {
      setError(null);

      // Check file size
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > AUDIO_CONSTRAINTS.maxFileSizeMB) {
        setError(`File must be under ${AUDIO_CONSTRAINTS.maxFileSizeMB}MB`);
        return;
      }

      // Check file type
      const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}` as typeof AUDIO_CONSTRAINTS.supportedExtensions[number];
      const isValidExtension = (AUDIO_CONSTRAINTS.supportedExtensions as readonly string[]).includes(fileExtension);
      const isValidMimeType = (AUDIO_CONSTRAINTS.supportedFormats as readonly string[]).includes(file.type);

      if (!isValidExtension && !isValidMimeType) {
        setError('Please upload MP3, WAV, or M4A');
        return;
      }

      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (file) {
        validateAndSelect(file);
      }
    },
    [disabled, validateAndSelect]
  );

  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        validateAndSelect(file);
      }
      // Reset input so same file can be selected again
      e.target.value = '';
    },
    [validateAndSelect]
  );

  return (
    <div className="w-full">
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative flex flex-col items-center justify-center
          p-8 border-2 border-dashed rounded-xl
          transition-all cursor-pointer
          ${disabled
            ? 'border-slate-700 bg-slate-800/30 cursor-not-allowed opacity-50'
            : isDragging
              ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]'
              : 'border-slate-600 bg-slate-800/50 hover:border-indigo-500/50 hover:bg-slate-800/70'
          }
        `}
      >
        {/* Upload icon */}
        <div
          className={`
            w-16 h-16 rounded-full flex items-center justify-center mb-4
            transition-colors
            ${isDragging ? 'bg-indigo-500/20' : 'bg-slate-700/50'}
          `}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-colors ${isDragging ? 'text-indigo-400' : 'text-slate-400'}`}
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>

        {/* Text */}
        <p className="text-slate-200 font-medium mb-2">
          {isDragging ? 'Drop your audio file here' : 'Drag & drop or click to upload'}
        </p>
        <p className="text-sm text-slate-400">
          Supports: MP3, WAV, M4A (max {AUDIO_CONSTRAINTS.maxFileSizeMB}MB)
        </p>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={AUDIO_CONSTRAINTS.supportedFormats.join(',')}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}

export default UploadZone;
