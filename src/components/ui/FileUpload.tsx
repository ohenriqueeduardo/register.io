"use client";

import React, { useRef, useState } from "react";
import {
  AlertCircle,
  Download,
  Eye,
  FileText,
  FileUp,
  RefreshCw,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  catalogoUploadService,
  CatalogoFileInfo,
} from "@/lib/services/catalogoUploadService";
import {
  ALLOWED_CATALOG_MIME_TYPES,
  MAX_CATALOG_SIZE,
} from "@/lib/validators/upload";

type SelectedCatalogo = CatalogoFileInfo & {
  uploadedInSession?: boolean;
};

interface FileUploadProps {
  onFileSelect: (fileInfo: CatalogoFileInfo | null) => void;
  initialFileName?: string;
  initialFileSize?: number;
  initialFileUrl?: string;
}

export function FileUpload({
  onFileSelect,
  initialFileName,
  initialFileSize,
  initialFileUrl,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<SelectedCatalogo | null>(
    initialFileName
      ? {
          nome: initialFileName,
          mimeType: "application/pdf",
          tamanho: initialFileSize || 0,
          url: initialFileUrl || "",
        }
      : null,
  );
  const [progress, setProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isRemoving, setIsRemoving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const validateClientFile = (file: File) => {
    if (!ALLOWED_CATALOG_MIME_TYPES.includes(file.type as never)) {
      return "Tipo de arquivo nao permitido.";
    }

    if (file.size > MAX_CATALOG_SIZE) {
      return "O arquivo excede o limite maximo de 10MB.";
    }

    return null;
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationMessage = validateClientFile(file);

    if (validationMessage) {
      setError(validationMessage);
      event.target.value = "";
      return;
    }

    setError(null);
    setIsUploading(true);
    setProgress(20);

    try {
      const previousFile = selectedFile;
      setProgress(60);
      const uploadedFile = await catalogoUploadService.upload(file);
      setProgress(100);

      if (previousFile?.uploadedInSession) {
        await catalogoUploadService.remove({
          path: previousFile.path,
          url: previousFile.url,
        });
      }

      const nextFile = {
        ...uploadedFile,
        uploadedInSession: true,
      };
      setSelectedFile(nextFile);
      onFileSelect(uploadedFile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar catalogo.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!selectedFile) {
      return;
    }

    setIsRemoving(true);
    setError(null);

    try {
      if (selectedFile.uploadedInSession) {
        await catalogoUploadService.remove({
          path: selectedFile.path,
          url: selectedFile.url,
        });
      }

      setSelectedFile(null);
      setProgress(0);
      onFileSelect(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao remover catalogo.");
    } finally {
      setIsRemoving(false);
    }
  };

  const handleView = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (selectedFile?.url) {
      window.open(selectedFile.url, "_blank", "noopener,noreferrer");
    }
  };

  const handleDownload = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!selectedFile?.url) return;

    const link = document.createElement("a");
    link.href = selectedFile.url;
    link.download = selectedFile.nome;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-3">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
        onChange={handleFileChange}
        disabled={isUploading || isRemoving}
      />

      {!selectedFile ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 ${
            isUploading
              ? "border-primary bg-slate-50/50 dark:bg-slate-900/50 pointer-events-none"
              : "border-slate-200 dark:border-slate-800 hover:border-primary hover:bg-slate-50/50 dark:hover:bg-slate-900/30 bg-white dark:bg-slate-950"
          }`}
        >
          {isUploading ? (
            <div className="w-full max-w-[240px] space-y-3">
              <LoaderIcon className="h-8 w-8 text-primary mx-auto animate-spin" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Enviando catalogo...
              </p>
              <Progress value={progress} className="h-1.5 w-full rounded-full" />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-500">
                <FileUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Clique para fazer upload do catalogo
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  PDF, DOC, DOCX, PNG, JPG ou WEBP (Max. 10MB)
                </p>
              </div>
            </div>
          )}
        </button>
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary border border-primary/10">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">
                  {selectedFile.nome}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {formatSize(selectedFile.tamanho)}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              disabled={isUploading || isRemoving}
              className="h-8 w-8 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
              title="Remover catalogo"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleView}
              disabled={!selectedFile.url || isUploading || isRemoving}
              className="rounded-xl gap-1"
            >
              <Eye size={14} />
              Ver
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={!selectedFile.url || isUploading || isRemoving}
              className="rounded-xl gap-1"
            >
              <Download size={14} />
              Baixar
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isRemoving}
              className="rounded-xl gap-1"
            >
              <RefreshCw size={14} />
              Trocar
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/15 p-3 rounded-xl border border-rose-100 dark:border-rose-900/30">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

function LoaderIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export default FileUpload;
