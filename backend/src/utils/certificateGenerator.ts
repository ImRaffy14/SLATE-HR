import PDFDocument from 'pdfkit';
import { uploadFile } from '../services/fileUpload.service';

interface CertificateData {
  employeeName: string;
  courseTitle: string;
  courseId: string;
  completionDate: Date;
  certificateNumber: string;
  finalGrade?: number;
}

/**
 * Generate a PDF certificate for course completion
 * @param data Certificate data
 * @returns Buffer containing the PDF
 */
export async function generateCertificatePDF(data: CertificateData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50,
        },
      });

      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Certificate Header
      doc.y = 100;
      doc.fontSize(28)
        .font('Helvetica-Bold')
        .fillColor('#1a1a1a')
        .text('CERTIFICATE OF COMPLETION', {
          align: 'center',
        });

      // Decorative line
      doc.moveTo(50, 150)
        .lineTo(562, 150)
        .strokeColor('#2563eb')
        .lineWidth(2)
        .stroke();

      // Certificate Body
      doc.y = 200;
      doc.fontSize(16)
        .font('Helvetica')
        .fillColor('#4b5563')
        .text('This is to certify that', {
          align: 'center',
        });

      // Employee Name
      doc.y = 240;
      doc.fontSize(24)
        .font('Helvetica-Bold')
        .fillColor('#1a1a1a')
        .text(data.employeeName, {
          align: 'center',
        });

      // Course Information
      doc.y = 300;
      doc.fontSize(16)
        .font('Helvetica')
        .fillColor('#4b5563')
        .text('has successfully completed the course', {
          align: 'center',
        });

      doc.y = 340;
      doc.fontSize(20)
        .font('Helvetica-Bold')
        .fillColor('#2563eb')
        .text(data.courseTitle, {
          align: 'center',
        });

      // Course ID
      doc.y = 380;
      doc.fontSize(12)
        .font('Helvetica')
        .fillColor('#6b7280')
        .text(`Course ID: ${data.courseId}`, {
          align: 'center',
        });

      // Final Grade (if available)
      if (data.finalGrade !== undefined) {
        doc.y = 410;
        doc.fontSize(14)
          .font('Helvetica')
          .fillColor('#4b5563')
          .text(`Final Grade: ${data.finalGrade.toFixed(1)}%`, {
            align: 'center',
          });
      }

      // Completion Date
      doc.y = 450;
      doc.fontSize(12)
        .font('Helvetica')
        .fillColor('#6b7280')
        .text(
          `Completed on: ${data.completionDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}`,
          {
            align: 'center',
          }
        );

      // Certificate Number
      doc.y = 500;
      doc.fontSize(10)
        .font('Helvetica-Oblique')
        .fillColor('#9ca3af')
        .text(`Certificate Number: ${data.certificateNumber}`, {
          align: 'center',
        });

      // Footer
      doc.y = 650;
      doc.fontSize(10)
        .font('Helvetica')
        .fillColor('#9ca3af')
        .text('This certificate is issued as proof of course completion.', {
          align: 'center',
        });

      // Decorative line at bottom
      doc.moveTo(50, 700)
        .lineTo(562, 700)
        .strokeColor('#2563eb')
        .lineWidth(1)
        .stroke();

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generate certificate PDF and upload to Cloudinary
 * @param data Certificate data
 * @returns URL of the uploaded certificate PDF
 */
export async function generateAndUploadCertificate(data: CertificateData): Promise<string> {
  // Generate PDF buffer
  const pdfBuffer = await generateCertificatePDF(data);

  // Upload to Cloudinary
  const uploadResult = await uploadFile(
    pdfBuffer,
    'certificates',
    'application/pdf'
  );

  return uploadResult.url;
}

