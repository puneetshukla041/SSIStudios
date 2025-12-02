// D:\ssistudios\ssistudios\components\Certificates\utils\pdfGenerator.ts

import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb } from "pdf-lib";
import { ICertificateClient } from "./constants";

// The required output object for bulk operations.
interface PdfFileResult {
  filename: string;
  blob: Blob;
}

// --- HELPER: Title Case (Capitalize First Letter, Keep Spaces) ---
const toTitleCase = (str: string) => {
  if (!str) return "";
  return str.toLowerCase().replace(/(?:^|\s)\w/g, (match) => {
    return match.toUpperCase();
  });
};

// 💡 MODIFIED SIGNATURE: Added `isBulk` flag and updated `setLoadingId` type.
export const generateCertificatePDF = async (
  certData: ICertificateClient,
  onAlert: (message: string, isError: boolean) => void,
  template: 'certificate1.pdf' | 'certificate2.pdf',
  setLoadingId: React.Dispatch<React.SetStateAction<string | null>> | React.Dispatch<React.SetStateAction<boolean>>,
  isBulk: boolean = false
): Promise<PdfFileResult | null | void> => { 

  const { name: rawName, certificateNo, hospital: rawHospital, doi: doiDDMMYYYY } = certData;

  // 1. FORMATTING: Apply Title Case to Name and Hospital
  // This ensures "john doe" becomes "John Doe" on the PDF and Filename
  const fullName = toTitleCase(rawName);
  const hospitalName = toTitleCase(rawHospital);

  // Convert DD-MM-YYYY to DD/MM/YYYY for the PDF template logic
  const doi = doiDDMMYYYY.replace(/-/g, '/');

  // Hardcoded static text (only used for V2 template)
  const programName = "Robotics Training Program";
  const operationText = "to operate the SSI Mantra Surgical Robotic System";
  const providerLineText = "provided by Sudhir Srivastava Innovations Pvt. Ltd";
  const staticLineText = "has successfully completed the";
  
  const isV2Template = template === 'certificate2.pdf';

  if (!fullName || !certificateNo) {
    if (!isBulk) onAlert('Missing essential data (Name or Certificate No) for PDF generation.', true);
    return isBulk ? null : undefined;
  }

  // Start loading state
  if (!isBulk) {
    (setLoadingId as React.Dispatch<React.SetStateAction<string | null>>)(certData._id);
  }

  try {
    // 2. Fetch Resources
    const [existingPdfBytes, soraBytes, soraSemiBoldBytes] = await Promise.all([
      fetch(`/certificates/${template}`).then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch certificate template: ${template}.`);
        return res.arrayBuffer();
      }),
      fetch("/fonts/Sora-Regular.ttf").then((res) => {
        if (!res.ok) throw new Error('Failed to fetch Sora-Regular font.');
        return res.arrayBuffer();
      }),
      fetch("/fonts/Sora-SemiBold.ttf").then((res) => {
        if (!res.ok) throw new Error('Failed to fetch Sora-SemiBold font.');
        return res.arrayBuffer();
      }),
    ]);

    // 3. Setup PDF
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    // @ts-ignore
    pdfDoc.registerFontkit(fontkit);

    const soraFont = await pdfDoc.embedFont(soraBytes);
    const soraSemiBoldFont = await pdfDoc.embedFont(soraSemiBoldBytes);

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const pageWidth = firstPage.getWidth();
    const pageHeight = firstPage.getHeight();

    // 4. Drawing Logic
    const yBase = pageHeight - 180;
    const x = 55;
    const margin = 40;
    const fontSizeSmall = 7;
    const fontSizeMedium = 8;
    const fontSizeLarge = 18;
    const colorGray = rgb(0.5, 0.5, 0.5);
    const colorBlack = rgb(0, 0, 0);

    // Full Name (Title Cased)
    firstPage.drawText(fullName, { x, y: yBase, size: fontSizeLarge, font: soraFont, color: colorBlack, });
    
    // Hospital Name (Title Cased)
    firstPage.drawText(hospitalName, { x, y: yBase - 20, size: fontSizeMedium, font: soraSemiBoldFont, color: colorBlack, });
    
    if (isV2Template) {
      firstPage.drawText(staticLineText, { x, y: yBase - 64, size: fontSizeSmall, font: soraFont, color: colorGray, maxWidth: 350, lineHeight: 10, });
      firstPage.drawText(programName, { x, y: yBase - 76, size: fontSizeSmall, font: soraSemiBoldFont, color: colorBlack, });
      firstPage.drawText(providerLineText, { x, y: yBase - 88, size: fontSizeSmall, font: soraFont, color: colorGray, maxWidth: 350, lineHeight: 10, });
      firstPage.drawText(operationText, { x, y: yBase - 100, size: fontSizeSmall, font: soraSemiBoldFont, color: colorBlack, });
    }
    
    // DOI
    const doiTextWidth = soraSemiBoldFont.widthOfTextAtSize(doi, fontSizeSmall);
    firstPage.drawText(doi, { x: Math.max(margin, (pageWidth - doiTextWidth) / 2) - 75, y: margin + 45, size: fontSizeSmall, font: soraSemiBoldFont, color: colorBlack, maxWidth: pageWidth - margin * 2, });

    // Certificate No.
    const certTextWidth = soraSemiBoldFont.widthOfTextAtSize(certificateNo, fontSizeSmall);
    firstPage.drawText(certificateNo, { x: pageWidth - certTextWidth - margin - 70, y: margin + 45, size: fontSizeSmall, font: soraSemiBoldFont, color: colorBlack, maxWidth: pageWidth - margin * 2, });

    // 5. Save and Return/Download
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
    
    // 💡 FILENAME FORMAT: Name_Hospital.pdf
    // We use the Title Cased variables. We do NOT replace spaces with underscores inside the name.
    // We only put an underscore BETWEEN the name and the hospital.
    const safeName = fullName.trim();
    const safeHospital = hospitalName.trim();
    const fileName = `${safeName}_${safeHospital}.pdf`;

    if (isBulk) {
      // Return object for bulk zipping/processing
      return { filename: fileName, blob };
    } else {
      // Single download logic
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      onAlert(`Successfully generated and downloaded PDF: ${fileName}`, false);
    }

  } catch (error) {
    console.error(`PDF Generation Error for ${certData.certificateNo}:`, error);
    
    if (!isBulk) {
       onAlert(`Failed to generate PDF. Check console for details.`, true);
    }
    
    return null; 
  } finally {
    if (!isBulk) {
      (setLoadingId as React.Dispatch<React.SetStateAction<string | null>>)(null);
    }
  }
};