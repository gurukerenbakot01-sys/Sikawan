import React, { useState } from 'react';
import { Submission, Teacher, StoredFile } from '../types';
import { 
  FolderArchive, 
  Folder, 
  FolderOpen, 
  FileText, 
  Download, 
  Eye, 
  X, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  HardDrive, 
  Calendar,
  Building2,
  FileCheck
} from 'lucide-react';
import { formatBytes, formatIndonesianDateTime } from '../utils/formatters';

interface FileExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissions: Submission[];
  teachers: Teacher[];
  initialSelectedTeacher?: string;
  onPreviewFile: (file: StoredFile, teacherName: string) => void;
}

export const FileExplorerModal: React.FC<FileExplorerModalProps> = ({
  isOpen,
  onClose,
  submissions,
  teachers,
  initialSelectedTeacher,
  onPreviewFile
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'root': true,
    'sdn_babelan': true
  });
  const [selectedTeacherFilter, setSelectedTeacherFilter] = useState<string>(initialSelectedTeacher || 'all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const handleDownloadFile = (file: StoredFile) => {
    if (file.dataUrl) {
      const link = document.createElement('a');
      link.href = file.dataUrl;
      link.download = file.storedFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const content = `BERKAS LAPORAN KINERJA SIKAWAN 2026\nSD NEGERI BABELAN KOTA 01\n\nNama File: ${file.storedFileName}\nPath: ${file.folderPath}\nWaktu Unggah: ${formatIndonesianDateTime(file.uploadDate)}`;
      const blob = new Blob([content], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.storedFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  // Build tree data sorted alphabetically by teacher name
  const sortedTeachersList = [...teachers].sort((a, b) => a.name.localeCompare(b.name, 'id'));

  const teacherTrees = sortedTeachersList
    .filter(t => selectedTeacherFilter === 'all' || t.name === selectedTeacherFilter)
    .map(teacher => {
      const teacherSubs = submissions.filter(s => s.teacherId === teacher.id);
      
      const harianFiles: StoredFile[] = [];
      const bulananFiles: StoredFile[] = [];

      teacherSubs.forEach(s => {
        s.files.forEach(f => {
          if (f.category === 'harian') {
            harianFiles.push(f);
          } else {
            bulananFiles.push(f);
          }
        });
      });

      return {
        teacher,
        harianFiles: harianFiles.filter(f => 
          f.storedFileName.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        bulananFiles: bulananFiles.filter(f => 
          f.storedFileName.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        totalFiles: harianFiles.length + bulananFiles.length
      };
    });

  const totalFilesAll = submissions.reduce((sum, s) => sum + s.files.length, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Struktur Direktori Folder Arsip Berkas</h3>
              <p className="text-xs text-emerald-300">
                Penyimpanan Laporan Kinerja Harian & Bulanan • SDN Babelan Kota 01 (2026)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari nama berkas laporan..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-600">Filter Guru:</span>
            <select
              value={selectedTeacherFilter}
              onChange={e => setSelectedTeacherFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">Semua Guru ({teachers.length})</option>
              {sortedTeachersList.map(t => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Explorer Tree Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 font-mono text-xs">
          
          {/* Root Directory */}
          <div className="border border-slate-200 rounded-xl bg-slate-50/50 p-4 space-y-3">
            
            {/* Root item */}
            <div 
              onClick={() => toggleFolder('root')}
              className="flex items-center gap-2 font-bold text-slate-900 cursor-pointer hover:text-emerald-700 select-none"
            >
              {expandedFolders['root'] ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
              <HardDrive className="w-4 h-4 text-emerald-600" />
              <span>/Arsip_2026/SDN_Babelan_Kota_01/</span>
              <span className="text-[11px] font-sans font-normal text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                {totalFilesAll} Berkas Tersimpan
              </span>
            </div>

            {/* Tree branches */}
            {expandedFolders['root'] && (
              <div className="pl-6 space-y-3 border-l-2 border-slate-200 ml-2">
                
                {teacherTrees.map(node => {
                  const teacherFolderId = `teacher-${node.teacher.id}`;
                  const isTeacherExpanded = expandedFolders[teacherFolderId] ?? true;
                  const harianFolderId = `harian-${node.teacher.id}`;
                  const isHarianExpanded = expandedFolders[harianFolderId] ?? true;
                  const bulananFolderId = `bulanan-${node.teacher.id}`;
                  const isBulananExpanded = expandedFolders[bulananFolderId] ?? true;

                  return (
                    <div key={node.teacher.id} className="space-y-2">
                      
                      {/* Teacher Folder */}
                      <div 
                        onClick={() => toggleFolder(teacherFolderId)}
                        className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-emerald-300 cursor-pointer shadow-2xs group"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          {isTeacherExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                          <Folder className="w-4 h-4 fill-amber-300 text-amber-600 flex-shrink-0" />
                          <span className="font-bold text-slate-900 truncate">
                            {node.teacher.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            (NIP. {node.teacher.nip})
                          </span>
                        </div>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-sans">
                          {node.totalFiles} File
                        </span>
                      </div>

                      {/* Subfolders: Harian & Bulanan */}
                      {isTeacherExpanded && (
                        <div className="pl-6 space-y-2 border-l border-amber-200 ml-3 font-sans">
                          
                          {/* Harian Subfolder */}
                          <div className="space-y-1.5">
                            <div 
                              onClick={() => toggleFolder(harianFolderId)}
                              className="flex items-center gap-2 text-xs font-semibold text-emerald-900 cursor-pointer hover:text-emerald-700 select-none py-1"
                            >
                              {isHarianExpanded ? <ChevronDown className="w-3.5 h-3.5 text-emerald-600" /> : <ChevronRight className="w-3.5 h-3.5 text-emerald-600" />}
                              <Folder className="w-4 h-4 fill-emerald-100 text-emerald-600" />
                              <span>📁 Harian /</span>
                              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-mono">
                                {node.harianFiles.length} File
                              </span>
                            </div>

                            {isHarianExpanded && (
                              <div className="pl-6 space-y-1">
                                {node.harianFiles.length === 0 ? (
                                  <p className="text-[11px] text-slate-400 italic py-1">
                                    (Belum ada file harian)
                                  </p>
                                ) : (
                                  node.harianFiles.map(file => (
                                    <div
                                      key={file.id}
                                      className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/50 hover:bg-emerald-100/60 border border-emerald-200/60 text-xs"
                                    >
                                      <div className="flex items-center gap-2 overflow-hidden">
                                        <FileText className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                                        <span className="font-mono font-bold text-slate-800 truncate" title={file.storedFileName}>
                                          {file.storedFileName}
                                        </span>
                                        <span className="text-[10px] text-slate-500 font-mono">
                                          ({formatBytes(file.fileSize)})
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1.5 flex-shrink-0">
                                        <button
                                          onClick={() => onPreviewFile(file, node.teacher.name)}
                                          className="p-1 text-emerald-800 hover:text-emerald-950 hover:bg-emerald-200/50 rounded"
                                          title="Lihat Pratinjau"
                                        >
                                          <Eye className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => handleDownloadFile(file)}
                                          className="p-1 text-emerald-800 hover:text-emerald-950 hover:bg-emerald-200/50 rounded"
                                          title="Unduh Berkas"
                                        >
                                          <Download className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>

                          {/* Bulanan Subfolder */}
                          <div className="space-y-1.5">
                            <div 
                              onClick={() => toggleFolder(bulananFolderId)}
                              className="flex items-center gap-2 text-xs font-semibold text-indigo-900 cursor-pointer hover:text-indigo-700 select-none py-1"
                            >
                              {isBulananExpanded ? <ChevronDown className="w-3.5 h-3.5 text-indigo-600" /> : <ChevronRight className="w-3.5 h-3.5 text-indigo-600" />}
                              <Folder className="w-4 h-4 fill-indigo-100 text-indigo-600" />
                              <span>📁 Bulanan /</span>
                              <span className="text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded font-mono">
                                {node.bulananFiles.length} File
                              </span>
                            </div>

                            {isBulananExpanded && (
                              <div className="pl-6 space-y-1">
                                {node.bulananFiles.length === 0 ? (
                                  <p className="text-[11px] text-slate-400 italic py-1">
                                    (Belum ada file bulanan)
                                  </p>
                                ) : (
                                  node.bulananFiles.map(file => (
                                    <div
                                      key={file.id}
                                      className="flex items-center justify-between p-2 rounded-lg bg-indigo-50/50 hover:bg-indigo-100/60 border border-indigo-200/60 text-xs"
                                    >
                                      <div className="flex items-center gap-2 overflow-hidden">
                                        <FileText className="w-3.5 h-3.5 text-indigo-700 flex-shrink-0" />
                                        <span className="font-mono font-bold text-slate-800 truncate" title={file.storedFileName}>
                                          {file.storedFileName}
                                        </span>
                                        <span className="text-[10px] text-slate-500 font-mono">
                                          ({formatBytes(file.fileSize)})
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1.5 flex-shrink-0">
                                        <button
                                          onClick={() => onPreviewFile(file, node.teacher.name)}
                                          className="p-1 text-indigo-800 hover:text-indigo-950 hover:bg-indigo-200/50 rounded"
                                          title="Lihat Pratinjau"
                                        >
                                          <Eye className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => handleDownloadFile(file)}
                                          className="p-1 text-indigo-800 hover:text-indigo-950 hover:bg-indigo-200/50 rounded"
                                          title="Unduh Berkas"
                                        >
                                          <Download className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>

                        </div>
                      )}

                    </div>
                  );
                })}

              </div>
            )}

          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Struktur Folder Resmi Sikawan • SDN Babelan Kota 01</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-900"
          >
            Tutup Explorer
          </button>
        </div>

      </div>
    </div>
  );
};
