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

// 💡 MODIFIED: Generates PDF even if data is missing
export const generateCertificatePDF = async (
  certData: ICertificateClient,
  onAlert: (message: string, isError: boolean) => void,
  template: 'certificate1.pdf' | 'certificate2.pdf',
  setLoadingId: React.Dispatch<React.SetStateAction<string | null>> | React.Dispatch<React.SetStateAction<boolean>>,
  isBulk: boolean = false
): Promise<PdfFileResult | null | void> => { 

  // 1. SAFE DESTRUCTURING: Default to strings if values are missing
  const rawName = certData.name || "Unknown Name";
  const certificateNo = certData.certificateNo || "NO-ID";
  const rawHospital = certData.hospital || "Unknown Hospital";
  const doiDDMMYYYY = certData.doi || "01-01-2025"; 

  // 2. FORMATTING
  const fullName = toTitleCase(rawName);
  const hospitalName = toTitleCase(rawHospital);
  const doi = doiDDMMYYYY.replace(/-/g, '/');

  // Hardcoded static text (only used for V2 template)
  const programName = "Robotics Training Program";
  const operationText = "to operate the SSI Mantra Surgical Robotic System";
  const providerLineText = "provided by Sudhir Srivastava Innovations Pvt. Ltd";
  const staticLineText = "has successfully completed the";
  
  const isV2Template = template === 'certificate2.pdf';

  // ❌ REMOVED THE BLOCKING VALIDATION CHECK
  // We now allow generation to proceed even if specific fields were missing in DB

  // Start loading state (only for single)
  if (!isBulk) {
    (setLoadingId as React.Dispatch<React.SetStateAction<string | null>>)(certData._id);
  }

  try {
    // 3. Fetch Resources
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

    // 4. Setup PDF
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    // @ts-ignore
    pdfDoc.registerFontkit(fontkit);

    const soraFont = await pdfDoc.embedFont(soraBytes);
    const soraSemiBoldFont = await pdfDoc.embedFont(soraSemiBoldBytes);

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const pageWidth = firstPage.getWidth();
    const pageHeight = firstPage.getHeight();

    // 5. Drawing Logic
    const yBase = pageHeight - 180;
    const x = 55;
    const margin = 40;
    const fontSizeSmall = 7;
    const fontSizeMedium = 8;
    const fontSizeLarge = 18;
    const colorGray = rgb(0.5, 0.5, 0.5);
    const colorBlack = rgb(0, 0, 0);

    // Full Name
    firstPage.drawText(fullName, { x, y: yBase, size: fontSizeLarge, font: soraFont, color: colorBlack, });
    
    // Hospital Name
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

    // 6. Save and Return/Download
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
    
    // Filename Formatting
    const safeName = fullName.trim() || "Unknown";
    const safeHospital = hospitalName.trim() || "Hospital";
    const fileName = `${safeName}_${safeHospital}.pdf`;

    if (isBulk) {
      return { filename: fileName, blob };
    } else {
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