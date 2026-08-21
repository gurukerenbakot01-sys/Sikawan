import { Teacher, StatusKepegawaian } from '../types';

/**
 * Contoh data guru untuk format template Excel SD Negeri Babelan Kota 01
 */
export const TEMPLATE_SAMPLE_TEACHERS = [
  {
    no: 1,
    nama: 'Hj. Rohanah, M.Pd.',
    nip: '197005121993032004',
    status: 'PNS',
    jabatan: 'Kepala Sekolah',
    pangkat: 'Pembina Tk. I / IV/b',
    jk: 'P',
    mapel: 'Manajerial & Supervisi'
  },
  {
    no: 2,
    nama: 'Samsudin, S.Pd.SD',
    nip: '198402152009021003',
    status: 'PNS',
    jabatan: 'Guru Kelas VI',
    pangkat: 'Penata Tk. I / III/d',
    jk: 'L',
    mapel: 'Guru Kelas VI'
  },
  {
    no: 3,
    nama: 'Nurhasanah, S.Pd.I',
    nip: '198807202022212015',
    status: 'PPPK',
    jabatan: 'Guru PAI',
    pangkat: 'Ahli Pertama / IX',
    jk: 'P',
    mapel: 'Pendidikan Agama Islam'
  },
  {
    no: 4,
    nama: 'Ahmad Fauzi, S.Pd.',
    nip: '199203102023211008',
    status: 'PPPK',
    jabatan: 'Guru PJOK',
    pangkat: 'Ahli Pertama / IX',
    jk: 'L',
    mapel: 'Pendidikan Jasmani & Olahraga'
  },
  {
    no: 5,
    nama: 'Siti Aminah, S.Pd.',
    nip: '198611052014032002',
    status: 'PNS',
    jabatan: 'Guru Kelas I',
    pangkat: 'Penata / III/c',
    jk: 'P',
    mapel: 'Guru Kelas I'
  },
  {
    no: 6,
    nama: 'Budi Santoso, S.Kom.',
    nip: '-',
    status: 'Tenaga Kependidikan',
    jabatan: 'Operator Sekolah / Administrasi',
    pangkat: '-',
    jk: 'L',
    mapel: 'Tata Usaha & Dapodik'
  }
];

/**
 * Generate official CSV Template with UTF-8 BOM
 */
export function generateTeacherTemplateCSV(): string {
  const headers = [
    'NO',
    'NAMA LENGKAP & GELAR',
    'NIP',
    'STATUS KEPEGAWAIAN',
    'JABATAN / TUGAS POKOK',
    'PANGKAT & GOLONGAN',
    'JENIS KELAMIN (L/P)',
    'MATA PELAJARAN / KELAS'
  ];

  const rows = TEMPLATE_SAMPLE_TEACHERS.map(t => [
    t.no,
    `"${t.nama.replace(/"/g, '""')}"`,
    `"${t.nip}"`,
    `"${t.status}"`,
    `"${t.jabatan.replace(/"/g, '""')}"`,
    `"${t.pangkat.replace(/"/g, '""')}"`,
    `"${t.jk}"`,
    `"${t.mapel.replace(/"/g, '""')}"`
  ]);

  // Use semicolon which is standard for Indonesian/European Excel defaults, while preserving quotes
  const csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
  return '\uFEFF' + csvContent;
}

/**
 * Generate Excel XML (.xls) formatted template with styling
 */
export function generateTeacherTemplateXML(teachersList = TEMPLATE_SAMPLE_TEACHERS): string {
  const rowsXml = teachersList
    .map(
      (t, idx) => `
    <Row>
      <Cell ss:StyleID="DataRow"><Data ss:Type="Number">${idx + 1}</Data></Cell>
      <Cell ss:StyleID="DataRowLeft"><Data ss:Type="String">${escapeXml(t.nama)}</Data></Cell>
      <Cell ss:StyleID="DataRowCenter"><Data ss:Type="String">${escapeXml(t.nip)}</Data></Cell>
      <Cell ss:StyleID="DataRowCenter"><Data ss:Type="String">${escapeXml(t.status)}</Data></Cell>
      <Cell ss:StyleID="DataRowLeft"><Data ss:Type="String">${escapeXml(t.jabatan)}</Data></Cell>
      <Cell ss:StyleID="DataRowLeft"><Data ss:Type="String">${escapeXml(t.pangkat)}</Data></Cell>
      <Cell ss:StyleID="DataRowCenter"><Data ss:Type="String">${escapeXml(t.jk)}</Data></Cell>
      <Cell ss:StyleID="DataRowLeft"><Data ss:Type="String">${escapeXml(t.mapel)}</Data></Cell>
    </Row>`
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#000000"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="TitleHeader">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="14" ss:Bold="1" ss:Color="#064E3B"/>
  </Style>
  <Style ss:ID="SubHeader">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Italic="1" ss:Color="#4B5563"/>
  </Style>
  <Style ss:ID="ColHeader">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#047857"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#047857"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#047857"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#047857"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#059669" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="DataRow">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10"/>
  </Style>
  <Style ss:ID="DataRowLeft">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10"/>
  </Style>
  <Style ss:ID="DataRowCenter">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Database_Guru_SIKAWAN">
  <Table ss:ExpandedColumnCount="8" x:FullColumns="1" x:FullRows="1" ss:DefaultRowHeight="20">
   <Column ss:Width="35"/>
   <Column ss:Width="190"/>
   <Column ss:Width="150"/>
   <Column ss:Width="110"/>
   <Column ss:Width="150"/>
   <Column ss:Width="140"/>
   <Column ss:Width="50"/>
   <Column ss:Width="160"/>
   
   <Row ss:Height="25">
    <Cell ss:MergeAcross="7" ss:StyleID="TitleHeader">
     <Data ss:Type="String">FORMAT DATABASE MASTER GURU &amp; TENAGA KEPENDIDIKAN</Data>
    </Cell>
   </Row>
   <Row ss:Height="18">
    <Cell ss:MergeAcross="7" ss:StyleID="SubHeader">
     <Data ss:Type="String">SD NEGERI BABELAN KOTA 01 • TAHUN 2026</Data>
    </Cell>
   </Row>
   <Row ss:Height="10"/>
   
   <Row ss:Height="26">
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">NO</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">NAMA LENGKAP &amp; GELAR</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">NIP</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">STATUS KEPEGAWAIAN</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">JABATAN</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">PANGKAT &amp; GOLONGAN</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">L/P</Data></Cell>
    <Cell ss:StyleID="ColHeader"><Data ss:Type="String">TUGAS / MAPEL</Data></Cell>
   </Row>
   ${rowsXml}
  </Table>
 </Worksheet>
</Workbook>`;
}

function escapeXml(unsafe: string = ''): string {
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Trigger file download in browser
 */
export function downloadFile(content: string, fileName: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download the official Excel (.xls) template
 */
export function downloadTeacherExcelTemplate() {
  const xml = generateTeacherTemplateXML();
  downloadFile(
    xml,
    'FORMAT_DATABASE_GURU_SDN_BABELAN_KOTA_01_2026.xls',
    'application/vnd.ms-excel;charset=utf-8'
  );
}

/**
 * Download the CSV format template
 */
export function downloadTeacherCSVTemplate() {
  const csv = generateTeacherTemplateCSV();
  downloadFile(
    csv,
    'FORMAT_DATABASE_GURU_SDN_BABELAN_KOTA_01_2026.csv',
    'text/csv;charset=utf-8'
  );
}

/**
 * Export current active teachers to Excel format
 */
export function exportTeachersToExcel(teachers: Teacher[]) {
  const mapped = teachers.map((t, idx) => ({
    no: idx + 1,
    nama: t.name,
    nip: t.nip,
    status: t.statusKepegawaian,
    jabatan: t.jabatan,
    pangkat: t.pangkatGolongan || '-',
    jk: t.jenisKelamin || 'P',
    mapel: t.mataPelajaranAtauKelas || t.jabatan
  }));

  const xml = generateTeacherTemplateXML(mapped);
  downloadFile(
    xml,
    `DATA_GURU_SDN_BABELAN_KOTA_01_${new Date().toISOString().slice(0, 10)}.xls`,
    'application/vnd.ms-excel;charset=utf-8'
  );
}

/**
 * Parse lines or CSV text uploaded by user or pasted from Excel
 */
export function parseTeachersFromText(text: string): {
  teachers: Teacher[];
  errors: string[];
  totalParsed: number;
} {
  const errors: string[] = [];
  const teachers: Teacher[] = [];

  if (!text || !text.trim()) {
    return { teachers: [], errors: ['Teks atau berkas kosong.'], totalParsed: 0 };
  }

  // Remove BOM if present
  let cleanText = text.replace(/^\uFEFF/, '').trim();

  // If text is XML spreadsheet
  if (cleanText.includes('<Workbook') || cleanText.includes('<Table')) {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(cleanText, 'text/xml');
      const rows = xmlDoc.getElementsByTagName('Row');

      let headerFound = false;
      for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('Cell');
        if (cells.length < 2) continue;

        const cellTexts: string[] = [];
        for (let j = 0; j < cells.length; j++) {
          const dataElem = cells[j].getElementsByTagName('Data')[0];
          cellTexts.push(dataElem ? (dataElem.textContent || '').trim() : '');
        }

        const rowStr = cellTexts.join(' ').toLowerCase();
        if (rowStr.includes('nama') || rowStr.includes('nip') || rowStr.includes('jabatan')) {
          headerFound = true;
          continue;
        }

        // If it's a title header spanning row, skip
        if (rowStr.includes('format database') || rowStr.includes('babelan')) {
          continue;
        }

        if (cellTexts.length >= 2) {
          // Detect columns
          // Schema: [No, Nama, NIP, Status, Jabatan, Pangkat, JK, Mapel]
          let name = '';
          let nip = '-';
          let status: StatusKepegawaian = 'PNS';
          let jabatan = 'Guru Kelas';
          let pangkat = '-';
          let jk: 'L' | 'P' = 'P';
          let mapel = '';

          if (cellTexts.length >= 4) {
            // Standard multi-column
            const col1IsNum = /^\d+$/.test(cellTexts[0]);
            const offset = col1IsNum ? 1 : 0;

            name = cellTexts[offset] || '';
            nip = cellTexts[offset + 1] || '-';
            status = normalizeStatus(cellTexts[offset + 2]);
            jabatan = cellTexts[offset + 3] || 'Guru';
            pangkat = cellTexts[offset + 4] || '-';
            jk = (cellTexts[offset + 5] || '').toUpperCase().startsWith('L') ? 'L' : 'P';
            mapel = cellTexts[offset + 6] || jabatan;
          }

          if (name && name.length >= 2) {
            teachers.push({
              id: `guru-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              name: name.trim(),
              nip: nip.trim() || '-',
              statusKepegawaian: status,
              jabatan: jabatan.trim() || 'Guru',
              pangkatGolongan: pangkat.trim() || '-',
              jenisKelamin: jk,
              mataPelajaranAtauKelas: mapel.trim() || jabatan.trim()
            });
          }
        }
      }

      if (teachers.length > 0) {
        return { teachers, errors, totalParsed: teachers.length };
      }
    } catch (e) {
      console.error('XML parse error, falling back to line parsing', e);
    }
  }

  // Split lines
  const lines = cleanText.split(/\r\n|\n|\r/);

  // Detect delimiter: semicolon, tab, or comma
  let sampleLine = lines.find(l => l.trim().length > 5 && !l.toLowerCase().includes('format database')) || lines[0] || '';
  let delimiter = ';';
  const countSemi = (sampleLine.match(/;/g) || []).length;
  const countTab = (sampleLine.match(/\t/g) || []).length;
  const countComma = (sampleLine.match(/,/g) || []).length;

  if (countTab > countSemi && countTab > countComma) {
    delimiter = '\t';
  } else if (countSemi >= countComma) {
    delimiter = ';';
  } else {
    delimiter = ',';
  }

  let isHeaderPassed = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    // Skip school title line
    if (rawLine.toLowerCase().includes('format database') || rawLine.toLowerCase().includes('babelan kota 01')) {
      continue;
    }

    const columns = parseCSVRow(rawLine, delimiter);

    // Detect if this is the header row
    const lineLower = columns.join(' ').toLowerCase();
    if (lineLower.includes('nama') || lineLower.includes('nip') || lineLower.includes('jabatan')) {
      isHeaderPassed = true;
      continue;
    }

    if (columns.length === 0) continue;

    // Extract columns
    // Common orders:
    // Format A (Template): No | Nama | NIP | Status | Jabatan | Pangkat | JK | Mapel
    // Format B: Nama | NIP | Jabatan | Status
    let name = '';
    let nip = '-';
    let status: StatusKepegawaian = 'PNS';
    let jabatan = 'Guru Kelas';
    let pangkat = '-';
    let jk: 'L' | 'P' = 'P';
    let mapel = '';

    const firstIsNo = /^\d+$/.test(columns[0].trim());
    const startIndex = firstIsNo ? 1 : 0;

    if (columns.length > startIndex) {
      name = columns[startIndex]?.trim() || '';
      nip = columns[startIndex + 1]?.trim() || '-';
      status = normalizeStatus(columns[startIndex + 2]);
      jabatan = columns[startIndex + 3]?.trim() || 'Guru';
      pangkat = columns[startIndex + 4]?.trim() || '-';
      jk = (columns[startIndex + 5]?.trim() || '').toUpperCase().startsWith('L') ? 'L' : 'P';
      mapel = columns[startIndex + 6]?.trim() || jabatan;
    }

    // Basic cleanup
    if (name && name !== 'NAMA LENGKAP & GELAR' && name.length >= 2) {
      teachers.push({
        id: `guru-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        name,
        nip: nip || '-',
        statusKepegawaian: status,
        jabatan: jabatan || 'Guru',
        pangkatGolongan: pangkat || '-',
        jenisKelamin: jk,
        mataPelajaranAtauKelas: mapel || jabatan
      });
    }
  }

  if (teachers.length === 0) {
    errors.push('Tidak ada baris data guru yang dapat dikenali. Pastikan file sesuai format template.');
  }

  return {
    teachers,
    errors,
    totalParsed: teachers.length
  };
}

/**
 * Split CSV row respecting quotes
 */
function parseCSVRow(rowStr: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < rowStr.length; i++) {
    const char = rowStr[i];

    if (char === '"') {
      if (inQuotes && rowStr[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Normalize status kepegawaian strings
 */
function normalizeStatus(raw: string = ''): StatusKepegawaian {
  const upper = raw.toUpperCase().trim();
  if (upper.includes('PPPK PW')) return 'PPPK PW';
  if (upper.includes('PPPK') || upper.includes('P3K')) return 'PPPK';
  if (upper.includes('PNS')) return 'PNS';
  if (upper.includes('ASN')) return 'ASN';
  if (upper.includes('HONORER') || upper.includes('GTT') || upper.includes('GTY')) return 'Honorer / GTT';
  if (upper.includes('TENDIK') || upper.includes('TENAGA KEPENDIDIKAN') || upper.includes('TU') || upper.includes('OPERATOR')) {
    return 'Tenaga Kependidikan';
  }
  return 'PNS';
}
