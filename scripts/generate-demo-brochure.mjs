import fs from 'node:fs';
import path from 'node:path';

const lines = [
  'Admission Times - Sample University Brochure 2026',
  'Program Title: BS Computer Science',
  'Degree Level: BS',
  'Field of Study: Computer Science',
  'Application Deadline: 2026-08-15',
  'Application Fee: 2500 PKR',
  'Location: Karachi, Pakistan',
  'Eligibility: Intermediate (Pre-Engineering or ICS) with minimum 60% marks.',
  'Description: A 4-year undergraduate program focusing on software engineering,',
  'data science, AI fundamentals, databases, web systems, and final year project.',
  'Admission Portal: https://admissions.sampleuniversity.edu.pk',
  'University Website: https://www.sampleuniversity.edu.pk',
  'Contact: admissions@sampleuniversity.edu.pk | +92-21-12345678',
  'This is a demo brochure for PDF parsing in the University module.'
];

const escapePdfText = (text) =>
  text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

const contentStream = [
  'BT',
  '/F1 12 Tf',
  '50 760 Td',
  ...lines.flatMap((line, index) => {
    const escaped = `(${escapePdfText(line)}) Tj`;
    return index === 0 ? [escaped] : ['T*', escaped];
  }),
  'ET'
].join('\n');

const objects = [
  '<< /Type /Catalog /Pages 2 0 R >>',
  '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
  '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  `<< /Length ${Buffer.byteLength(contentStream, 'utf8')} >>\nstream\n${contentStream}\nendstream`
];

let pdf = '%PDF-1.4\n';
const offsets = [0];

for (let i = 0; i < objects.length; i += 1) {
  offsets.push(Buffer.byteLength(pdf, 'utf8'));
  pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
}

const xrefOffset = Buffer.byteLength(pdf, 'utf8');
pdf += `xref\n0 ${objects.length + 1}\n`;
pdf += '0000000000 65535 f \n';
for (let i = 1; i < offsets.length; i += 1) {
  pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
}

pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

const outputDir = path.resolve('public', 'demo');
fs.mkdirSync(outputDir, { recursive: true });
const outputPath = path.join(outputDir, 'sample-university-brochure.pdf');
fs.writeFileSync(outputPath, pdf, 'binary');

console.log(`Created: ${outputPath}`);
