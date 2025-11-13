// D:\ssistudios\ssistudios\components\Certificates\utils\pdfGenerator.ts

import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb } from "pdf-lib";
import { ICertificateClient } from "./constants";

// The required output object for bulk operations.
interface PdfFileResult {
    filename: string;
    blob: Blob;
}

// 💡 MODIFIED SIGNATURE: Added `isBulk` flag and updated `setLoadingId` type to accept boolean dispatch.
export const generateCertificatePDF = async (
    certData: ICertificateClient,
    onAlert: (message: string, isError: boolean) => void,
    template: 'certificate1.pdf' | 'certificate2.pdf',
    setLoadingId: React.Dispatch<React.SetStateAction<string | null>> | React.Dispatch<React.SetStateAction<boolean>>,
    isBulk: boolean = false // 💡 NEW: Optional flag for bulk export
): Promise<PdfFileResult | null | void> => { // 💡 NEW RETURN TYPE: Can be object, null (bulk fail), or void (single mode success)

    const { name: fullName, certificateNo, hospital: hospitalName, doi: doiDDMMYYYY } = certData;
    // Convert DD-MM-YYYY to DD/MM/YYYY for the PDF template logic
    const doi = doiDDMMYYYY.replace(/-/g, '/');

    // Hardcoded static text (only used for V2 template)
    const programName = "Robotics Training Program";
    const operationText = "to operate the SSI Mantra Surgical Robotic System";
    const providerLineText = "provided by Sudhir Srivastava Innovations Pvt. Ltd";
    const staticLineText = "has successfully completed the";
    
    const isV2Template = template === 'certificate2.pdf';

    if (!fullName || !certificateNo) {
        // Only alert the user in single mode
        if (!isBulk) onAlert('Missing essential data (Name or Certificate No) for PDF generation.', true);
        return isBulk ? null : undefined; // Return null if bulk operation failed validation
    }

    // Start loading state: Use the appropriate setter based on mode
    if (!isBulk) {
        (setLoadingId as React.Dispatch<React.SetStateAction<string | null>>)(certData._id);
    } else {
        // Bulk mode loading is handled by the caller hook (useCertificateActions)
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

        // 4. Drawing Logic - (UNCHANGED drawing logic)
        const yBase = pageHeight - 180;
        const x = 55;
        const margin = 40;
        const fontSizeSmall = 7;
        const fontSizeMedium = 8;
        const fontSizeLarge = 18;
        const colorGray = rgb(0.5, 0.5, 0.5);
        const colorBlack = rgb(0, 0, 0);

        // ... (Drawing logic for name, hospital, static lines, DOI, Cert No.) ...

        // Full Name (y: 419)
        firstPage.drawText(fullName, { x, y: yBase, size: fontSizeLarge, font: soraFont, color: colorBlack, });
        // Hospital Name (y: 399)
        firstPage.drawText(hospitalName, { x, y: yBase - 20, size: fontSizeMedium, font: soraSemiBoldFont, color: colorBlack, });
        
        if (isV2Template) {
            // Static Line: "has successfully completed the" (y: 355)
            firstPage.drawText(staticLineText, { x, y: yBase - 64, size: fontSizeSmall, font: soraFont, color: colorGray, maxWidth: 350, lineHeight: 10, });
            // Program Name (y: 343)
            firstPage.drawText(programName, { x, y: yBase - 76, size: fontSizeSmall, font: soraSemiBoldFont, color: colorBlack, });
            // Provider Line: "provided by Sudhir..." (y: 331)
            firstPage.drawText(providerLineText, { x, y: yBase - 88, size: fontSizeSmall, font: soraFont, color: colorGray, maxWidth: 350, lineHeight: 10, });
            // Operation Text (y: 319)
            firstPage.drawText(operationText, { x, y: yBase - 100, size: fontSizeSmall, font: soraSemiBoldFont, color: colorBlack, });
        }
        
        // Date of Issue - DOI
        const doiTextWidth = soraSemiBoldFont.widthOfTextAtSize(doi, fontSizeSmall);
        firstPage.drawText(doi, { x: Math.max(margin, (pageWidth - doiTextWidth) / 2) - 75, y: margin + 45, size: fontSizeSmall, font: soraSemiBoldFont, color: colorBlack, maxWidth: pageWidth - margin * 2, });

        // Certificate No.
        const certTextWidth = soraSemiBoldFont.widthOfTextAtSize(certificateNo, fontSizeSmall);
        firstPage.drawText(certificateNo, { x: pageWidth - certTextWidth - margin - 70, y: margin + 45, size: fontSizeSmall, font: soraSemiBoldFont, color: colorBlack, maxWidth: pageWidth - margin * 2, });

        // 5. Save and Return/Download
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
        
        const fileName = `${certificateNo.replace(/[^a-zA-Z0-9-]/g, '_')}-${fullName.replace(/[^a-zA-Z0-9-]/g, '_')}-${isV2Template ? 'v2' : 'v1'}.pdf`;

        if (isBulk) {
            // 💡 RETURN OBJECT: In bulk mode, return the file data for zipping.
            return { filename: fileName, blob };
        } else {
            // Single download logic (UNCHANGED)
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
        
        // 💡 EXPLICIT NULL RETURN: Essential for the bulk logic in the hook to filter failures.
        return null; 
    } finally {
        // Only reset the string setter in single mode
        if (!isBulk) {
            (setLoadingId as React.Dispatch<React.SetStateAction<string | null>>)(null);
        }
        // Bulk loading state is managed by the hook calling the map/promise.all
    }
};