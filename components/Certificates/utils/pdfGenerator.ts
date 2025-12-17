// D:\ssistudios\ssistudios\components\Certificates\utils\pdfGenerator.ts

import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb } from "pdf-lib";
import { ICertificateClient } from "./constants";

interface PdfFileResult {
  filename: string;
  blob: Blob;
}

// Kept for Hospital names if needed, but NOT used for Doctor Name anymore
const toTitleCase = (str: string) => {
  if (!str) return "";
  return str.toLowerCase().replace(/(?:^|\s)\w/g, (match) => {
    return match.toUpperCase();
  });
};

export const generateCertificatePDF = async (
  certData: ICertificateClient,
  onAlert: (message: string, isError: boolean) => void,
  template: 'certificate1.pdf' | 'certificate2.pdf' | 'certificate3.pdf',
  setLoadingId: React.Dispatch<React.SetStateAction<string | null>> | React.Dispatch<React.SetStateAction<boolean>>,
  isBulk: boolean = false
): Promise<PdfFileResult | null | void> => { 

  // ✅ FIX: Use rawName directly. 
  // We trust the Hook/UI to have formatted it correctly (Dr. H.S Nagpal)
  // We do NOT use toTitleCase() here because it breaks "H.S" by lowercasing the 'S'.
  const fullName = certData.name || "Unknown Name";
  
  // Start loading state (only for single)
  if (!isBulk) {
    (setLoadingId as React.Dispatch<React.SetStateAction<string | null>>)(certData._id);
  }

  try {
    // 1. Fetch Resources
    const [existingPdfBytes, soraBytes, soraSemiBoldBytes, poppinsMediumBytes] = await Promise.all([
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
      fetch("/fonts/Poppins-Medium.ttf").then((res) => {
        if (!res.ok) throw new Error('Failed to fetch Poppins-Medium font.');
        return res.arrayBuffer();
      }),
    ]);

    // 2. Setup PDF
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    pdfDoc.registerFontkit(fontkit);

    const soraFont = await pdfDoc.embedFont(soraBytes, { subset: true });
    const soraSemiBoldFont = await pdfDoc.embedFont(soraSemiBoldBytes, { subset: true });
    const poppinsMediumFont = await pdfDoc.embedFont(poppinsMediumBytes, { subset: true });

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const pageWidth = firstPage.getWidth();
    const pageHeight = firstPage.getHeight();

    // --- TEMPLATE 3 LOGIC (Fortis / 100+) ---
    if (template === 'certificate3.pdf') {
        const fontSizeLarge = 24;
        const colorSoftCharcoal = rgb(0.25, 0.25, 0.25); 

        // Position: Slightly above center (+30 offset)
        const yCenter = (pageHeight / 2) + 30; 
        const xLeftMargin = 80; 

        firstPage.drawText(fullName, { 
            x: xLeftMargin, 
            y: yCenter, 
            size: fontSizeLarge, 
            font: poppinsMediumFont, 
            color: colorSoftCharcoal,
        });

    } 
    // --- TEMPLATE 1 & 2 LOGIC (Standard) ---
    else {
        const rawHospital = certData.hospital || "Unknown Hospital";
        const doiDDMMYYYY = certData.doi || "01-01-2025"; 
        const certificateNo = certData.certificateNo || "NO-ID";
        
        // We still title-case the hospital as it usually doesn't have complex dots like names
        const hospitalName = toTitleCase(rawHospital);
        const doi = doiDDMMYYYY.replace(/-/g, '/');

        const yBase = pageHeight - 180;
        const x = 55;
        const margin = 40;
        const fontSizeSmall = 7;
        const fontSizeMedium = 8;
        const fontSizeLarge = 18;
        const colorGray = rgb(0.5, 0.5, 0.5);
        const colorBlack = rgb(0, 0, 0); 
        const isV2Template = template === 'certificate2.pdf';

        // Full Name
        firstPage.drawText(fullName, { x, y: yBase, size: fontSizeLarge, font: soraFont, color: colorBlack, });
        
        // Hospital Name
        firstPage.drawText(hospitalName, { x, y: yBase - 20, size: fontSizeMedium, font: soraSemiBoldFont, color: colorBlack, });
        
        if (isV2Template) {
            const programName = "Robotics Training Program";
            const operationText = "to operate the SSI Mantra Surgical Robotic System";
            const providerLineText = "provided by Sudhir Srivastava Innovations Pvt. Ltd";
            const staticLineText = "has successfully completed the";

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
    }

    // 3. Save and Return/Download
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
    
    // Clean filename for download (remove illegal chars)
    const safeName = fullName.replace(/[\\/:*?"<>|]/g, '').trim() || "Unknown";
    const safeHospital = certData.hospital ? certData.hospital.replace(/[\\/:*?"<>|]/g, '').trim() : "Hospital"; 
    
    // Filename logic
    const fileName = template === 'certificate3.pdf' 
        ? `${safeName}.pdf` 
        : `${safeName}_${safeHospital}.pdf`;

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

      onAlert(`Successfully generated: ${fileName}`, false);
    }

  } catch (error) {
    console.error(`PDF Generation Error for ${certData.certificateNo}:`, error);
    if (!isBulk) onAlert(`Failed to generate PDF. Check console.`, true);
    return null; 
  } finally {
    if (!isBulk) {
      (setLoadingId as React.Dispatch<React.SetStateAction<string | null>>)(null);
    }
  }
};