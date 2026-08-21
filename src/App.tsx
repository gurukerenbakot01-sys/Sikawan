import React, { useState, useEffect } from 'react';
import { Teacher, Submission, StoredFile } from './types';
import { DatabaseService } from './services/db';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { LeftPanel } from './components/LeftPanel';
import { RightPanel } from './components/RightPanel';
import { TeacherDatabaseModal } from './components/TeacherDatabaseModal';
import { FileExplorerModal } from './components/FileExplorerModal';
import { ReceiptModal } from './components/ReceiptModal';
import { FilePreviewModal } from './components/FilePreviewModal';
import { ExportModal } from './components/ExportModal';
import { SuccessPopupModal } from './components/SuccessPopupModal';
import { 
  Building2, 
  Sparkles, 
  HelpCircle, 
  CheckCircle, 
  Layers, 
  ShieldCheck,
  FolderArchive,
  Info,
  Clock
} from 'lucide-react';

export default function App() {
  // Database States
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  // Modals Visibility
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState<boolean>(false);
  const [isFileExplorerOpen, setIsFileExplorerOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [isFilePreviewOpen, setIsFilePreviewOpen] = useState<boolean>(false);
  const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState<boolean>(false);

  // Active Selected State for Modals
  const [selectedSubmissionForReceipt, setSelectedSubmissionForReceipt] = useState<Submission | null>(null);
  const [selectedFileForPreview, setSelectedFileForPreview] = useState<StoredFile | null>(null);
  const [successSubmission, setSuccessSubmission] = useState<Submission | null>(null);
  const [previewTeacherName, setPreviewTeacherName] = useState<string>('');
  const [explorerInitialTeacher, setExplorerInitialTeacher] = useState<string | undefined>(undefined);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Load Data on Mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const loadedTeachers = DatabaseService.getTeachers();
    const loadedSubmissions = DatabaseService.getSubmissions();
    setTeachers(loadedTeachers);
    setSubmissions(loadedSubmissions);
  };

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Submission Handlers
  const handleSubmissionSuccess = (newSubmission: Submission) => {
    const updated = DatabaseService.addSubmission(newSubmission);
    setSubmissions(updated);
    setSuccessSubmission(newSubmission);
    setIsSuccessPopupOpen(true);
    showToast('BERHASIL DI SIMPAN');
  };

  const handleDeleteSubmission = (id: string) => {
    const updated = DatabaseService.deleteSubmission(id);
    setSubmissions(updated);
    showToast('Laporan kinerja berhasil dihapus dari riwayat.', 'info');
  };

  const handleUpdateStatus = (id: string, status: Submission['status']) => {
    const updated = DatabaseService.updateSubmissionStatus(id, status);
    setSubmissions(updated);
    showToast(`Status laporan diperbarui menjadi "${status}".`);
  };

  // Teacher Handlers
  const handleSaveTeacher = (teacher: Teacher) => {
    const updated = DatabaseService.saveTeacher(teacher);
    setTeachers(updated);
    showToast(`Data guru ${teacher.name} berhasil disimpan.`);
  };

  const handleSaveBulkTeachers = (newTeachers: Teacher[], replaceAll = false) => {
    const updated = DatabaseService.saveBulkTeachers(newTeachers, replaceAll);
    setTeachers(updated);
    showToast(`Berhasil menyimpan ${newTeachers.length} data guru ke database.`);
  };

  const handleDeleteTeacher = (id: string) => {
    const updated = DatabaseService.deleteTeacher(id);
    setTeachers(updated);
    showToast('Data guru berhasil dihapus.', 'info');
  };

  const handleClearAllTeachers = () => {
    const updated = DatabaseService.clearAllTeachers();
    setTeachers(updated);
    showToast('Database guru berhasil dikosongkan.', 'info');
  };

  // Preview & Print Handlers
  const handlePreviewFile = (file: StoredFile, teacherName: string) => {
    setSelectedFileForPreview(file);
    setPreviewTeacherName(teacherName);
    setIsFilePreviewOpen(true);
  };

  const handlePrintReceipt = (submission: Submission) => {
    setSelectedSubmissionForReceipt(submission);
    setIsReceiptModalOpen(true);
  };

  const handleOpenFileExplorer = (teacherName?: string) => {
    setExplorerInitialTeacher(teacherName);
    setIsFileExplorerOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-emerald-500/40 flex items-center gap-3 text-xs sm:text-sm font-medium">
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* 1. Official Header */}
      <Header
        onOpenTeacherModal={() => setIsTeacherModalOpen(true)}
        onOpenFileExplorer={() => handleOpenFileExplorer()}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        totalTeachers={teachers.length}
        totalSubmissions={submissions.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5">
        
        {/* 2. Top Stats Overview Bar */}
        <StatsBar
          submissions={submissions}
          teachers={teachers}
        />

        {/* 3. The 2-Panel Layout (Sisi Kiri & Sisi Kanan) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* SISI KIRI: Form Input Data Guru & Berkas Kinerja */}
          <section id="section-left-panel" className="lg:col-span-5 w-full">
            <LeftPanel
              teachers={teachers}
              onSubmitSuccess={handleSubmissionSuccess}
              onOpenTeacherModal={() => setIsTeacherModalOpen(true)}
            />
          </section>

          {/* SISI KANAN: Riwayat Pengiriman & Folder Berkas */}
          <section id="section-right-panel" className="lg:col-span-7 w-full">
            <RightPanel
              submissions={submissions}
              teachers={teachers}
              onDeleteSubmission={handleDeleteSubmission}
              onUpdateStatus={handleUpdateStatus}
              onPreviewFile={handlePreviewFile}
              onPrintReceipt={handlePrintReceipt}
              onOpenFileExplorer={handleOpenFileExplorer}
            />
          </section>

        </div>

      </main>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 text-xs border-t border-slate-800 py-4 px-4 sm:px-6 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            © 2026 <strong>SD NEGERI BABELAN KOTA 01</strong> • Sistem Informasi Kinerja Pegawai (SIKAWAN)
          </p>
          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
            <span>Dinas Pendidikan Kab. Bekasi</span>
            <span>•</span>
            <span>Versi 2026.1-PRO</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Teacher Database Manager Modal */}
      <TeacherDatabaseModal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        teachers={teachers}
        onSaveTeacher={handleSaveTeacher}
        onSaveBulkTeachers={handleSaveBulkTeachers}
        onDeleteTeacher={handleDeleteTeacher}
        onClearAllTeachers={handleClearAllTeachers}
      />

      {/* 2. Virtual File Explorer Modal */}
      <FileExplorerModal
        isOpen={isFileExplorerOpen}
        onClose={() => {
          setIsFileExplorerOpen(false);
          setExplorerInitialTeacher(undefined);
        }}
        submissions={submissions}
        teachers={teachers}
        initialSelectedTeacher={explorerInitialTeacher}
        onPreviewFile={handlePreviewFile}
      />

      {/* 3. Printable Official Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setSelectedSubmissionForReceipt(null);
        }}
        submission={selectedSubmissionForReceipt}
      />

      {/* 4. Document File Preview Modal */}
      <FilePreviewModal
        isOpen={isFilePreviewOpen}
        onClose={() => {
          setIsFilePreviewOpen(false);
          setSelectedFileForPreview(null);
        }}
        file={selectedFileForPreview}
        teacherName={previewTeacherName}
      />

      {/* 5. Export & Backup Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        submissions={submissions}
        teachers={teachers}
        onDataImported={loadData}
      />

      {/* 6. Success Popup Modal (BERHASIL DI SIMPAN) */}
      <SuccessPopupModal
        isOpen={isSuccessPopupOpen}
        onClose={() => {
          setIsSuccessPopupOpen(false);
          setSuccessSubmission(null);
        }}
        submission={successSubmission}
        onPrintReceipt={handlePrintReceipt}
      />

    </div>
  );
}
