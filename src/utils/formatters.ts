export const MONTH_NAMES_2026 = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember'
];

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  if (parts.length > 1) {
    return parts.pop() || 'pdf';
  }
  return 'pdf';
}

/**
 * Format file name strictly based on user instructions:
 * "(Nama Guru_Laporan -kinerja-pegawai-harian dan bulanan)"
 */
export function generateStoredFileName(
  teacherName: string,
  category: 'harian' | 'bulanan' | 'keduanya',
  dateOrMonth: string,
  originalFilename: string
): string {
  const ext = getFileExtension(originalFilename);
  // Clean name without excessive whitespace
  const cleanTeacher = teacherName.trim();

  if (category === 'harian') {
    // Format date DD-MM-YYYY if YYYY-MM-DD
    let formattedDate = dateOrMonth;
    if (dateOrMonth.includes('-')) {
      const [y, m, d] = dateOrMonth.split('-');
      if (y && m && d) {
        formattedDate = `${d}-${m}-${y}`;
      }
    }
    return `${cleanTeacher}_Laporan -kinerja-pegawai-harian_${formattedDate}.${ext}`;
  } else if (category === 'bulanan') {
    return `${cleanTeacher}_Laporan -kinerja-pegawai-bulanan_${dateOrMonth}-2026.${ext}`;
  } else {
    return `${cleanTeacher}_Laporan -kinerja-pegawai-harian dan bulanan_${dateOrMonth}-2026.${ext}`;
  }
}

/**
 * Generate virtual archive folder path for organized document repository
 */
export function generateFolderPath(teacherName: string, category: 'harian' | 'bulanan'): string {
  const cleanTeacher = teacherName.trim().replace(/[/\\?%*:|"<>]/g, '');
  const subFolder = category === 'harian' ? 'Harian' : 'Bulanan';
  return `/Arsip_2026/SDN_Babelan_Kota_01/${cleanTeacher}/${subFolder}/`;
}

export function formatIndonesianDate(dateString: string): string {
  if (!dateString) return '-';
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const monthName = MONTH_NAMES_2026[monthIdx] || parts[1];
      return `${day} ${monthName} ${year}`;
    }
    const d = new Date(dateString);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
    return dateString;
  } catch {
    return dateString;
  }
}

export function formatIndonesianDateTime(isoString: string): string {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const dateFormatted = d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    const timeFormatted = d.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${dateFormatted}, ${timeFormatted} WIB`;
  } catch {
    return isoString;
  }
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
