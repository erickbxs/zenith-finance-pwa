import React, { useState, useRef } from 'react';
import { X, Download, Upload, ShieldCheck, AlertCircle, CheckCircle2, Lock, KeyRound } from 'lucide-react';
import { exportBackupData, importBackupData } from '../utils/storage';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose, onDataRestored }) => {
  const [statusMessage, setStatusMessage] = useState<{ text: string; success: boolean } | null>(null);
  const [encryptExport, setEncryptExport] = useState(true);
  const [exportPassword, setExportPassword] = useState('');
  const [importPassword, setImportPassword] = useState('');
  const [pendingFileContent, setPendingFileContent] = useState<string | null>(null);
  const [requiresPasswordModal, setRequiresPasswordModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    try {
      setLoading(true);
      if (encryptExport && (!exportPassword || exportPassword.length < 6)) {
        setStatusMessage({ text: 'A senha mestra para criptografia deve conter no mínimo 6 caracteres.', success: false });
        return;
      }
      await exportBackupData(encryptExport ? exportPassword : undefined);
      setStatusMessage({
        text: encryptExport
          ? 'Backup criptografado (AES-GCM 256 bits) exportado com sucesso!'
          : 'Backup JSON padrão exportado com sucesso!',
        success: true,
      });
    } catch (e: any) {
      setStatusMessage({ text: e.message || 'Erro ao exportar backup', success: false });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      try {
        const parsed = JSON.parse(content);
        if (parsed.algorithm === 'AES-GCM-256') {
          // Requires password
          setPendingFileContent(content);
          setRequiresPasswordModal(true);
          return;
        }

        // Standard import
        const res = await importBackupData(content);
        if (res.success) {
          setStatusMessage({ text: 'Backup restaurado com sucesso!', success: true });
          setTimeout(() => {
            onDataRestored();
            onClose();
          }, 1200);
        } else {
          setStatusMessage({ text: res.message || 'Erro ao importar backup.', success: false });
        }
      } catch (err: any) {
        setStatusMessage({ text: 'Arquivo inválido. Certifique-se de selecionar um backup válido.', success: false });
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmEncryptedImport = async () => {
    if (!pendingFileContent || !importPassword) return;
    setLoading(true);
    const res = await importBackupData(pendingFileContent, importPassword);
    setLoading(false);

    if (res.success) {
      setStatusMessage({ text: 'Backup descriptografado e restaurado com sucesso!', success: true });
      setRequiresPasswordModal(false);
      setTimeout(() => {
        onDataRestored();
        onClose();
      }, 1200);
    } else {
      setStatusMessage({ text: res.message || 'Senha incorreta ou dados corrompidos.', success: false });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-lg rounded-t-[28px] sm:rounded-[28px] bg-[var(--modal-bg)] p-6 shadow-2xl hairline-border text-[var(--text-primary)] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b hairline-border mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#34C759]/10 text-[#34C759] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Privacidade, Backup &amp; Criptografia</h3>
              <p className="text-xs text-[var(--text-secondary)]">Zero-Knowledge Local-First • AES-GCM 256-bit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-secondary)]"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security badges */}
        <div className="p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] hairline-border space-y-1.5 mb-4 text-xs">
          <div className="flex items-center gap-2 text-[#34C759] font-bold text-[11px]">
            <Lock className="w-3.5 h-3.5" />
            <span>Arquitetura Air-Gapped: Zero Exfiltração de Dados</span>
          </div>
          <p className="text-[var(--text-secondary)] leading-relaxed text-[11px]">
            Nenhuma informação financeira, transação ou cartão é transmitida para servidores externos. Tudo reside 100% no seu dispositivo.
          </p>
        </div>

        {statusMessage && (
          <div
            className={`p-3 rounded-xl flex items-center gap-2 font-medium mb-4 text-xs ${
              statusMessage.success
                ? 'bg-[#34C759]/10 text-[#34C759]'
                : 'bg-[#FF3B30]/10 text-[#FF3B30]'
            }`}
          >
            {statusMessage.success ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Password Prompt for Decryption */}
        {requiresPasswordModal ? (
          <div className="p-4 rounded-2xl bg-[#007AFF]/10 hairline-border space-y-3 mb-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#007AFF]">
              <KeyRound className="w-4 h-4" />
              <span>Arquivo Criptografado Detectado</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Este backup está protegido com criptografia militar AES-256. Digite a senha mestre utilizada na exportação para desbloquear:
            </p>
            <input
              type="password"
              placeholder="Digite a senha mestre..."
              value={importPassword}
              onChange={(e) => setImportPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] text-[var(--text-primary)] border hairline-border text-xs focus:outline-hidden"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setRequiresPasswordModal(false);
                  setPendingFileContent(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/10 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmEncryptedImport}
                disabled={loading || !importPassword}
                className="flex-1 py-1.5 rounded-xl bg-[#007AFF] text-white text-xs font-bold shadow-sm hover:opacity-90 disabled:opacity-50"
              >
                {loading ? 'Descriptografando...' : 'Descriptografar & Restaurar'}
              </button>
            </div>
          </div>
        ) : null}

        {/* Export Section */}
        <div className="space-y-3 mb-5">
          <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
            Exportar Dados do Dispositivo
          </h4>

          <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] hairline-border space-y-3">
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={encryptExport}
                onChange={(e) => setEncryptExport(e.target.checked)}
                className="w-4 h-4 rounded text-[#007AFF] focus:ring-0"
              />
              <span>Proteger backup com Criptografia AES-GCM (256 bits)</span>
            </label>

            {encryptExport && (
              <div className="space-y-1 pl-6">
                <input
                  type="password"
                  placeholder="Defina uma senha mestre (mínimo 6 dígitos)..."
                  value={exportPassword}
                  onChange={(e) => setExportPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] text-[var(--text-primary)] border hairline-border text-xs focus:outline-hidden"
                />
                <span className="text-[10px] text-[var(--text-secondary)] block">
                  A chave é derivada localmente via PBKDF2 com 100.000 iterações. Não esqueça esta senha!
                </span>
              </div>
            )}

            <button
              onClick={handleExport}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[#007AFF] dark:bg-[#0A84FF] text-white font-bold text-xs flex items-center justify-center gap-2 ios-tap-active shadow-sm hover:opacity-95 transition"
            >
              <Download className="w-4 h-4" />
              <span>{encryptExport ? 'Exportar Backup Criptografado (.aes.json)' : 'Exportar Backup JSON'}</span>
            </button>
          </div>
        </div>

        {/* Import Section */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
            Restaurar Backup Anterior
          </h4>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 rounded-xl bg-black/5 dark:bg-white/10 text-[var(--text-primary)] font-bold text-xs flex items-center justify-center gap-2 ios-tap-active hover:bg-black/10 dark:hover:bg-white/15 transition border hairline-border"
          >
            <Upload className="w-4 h-4 text-[#34C759]" />
            <span>Selecionar Arquivo de Backup (.json ou .aes.json)</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};
