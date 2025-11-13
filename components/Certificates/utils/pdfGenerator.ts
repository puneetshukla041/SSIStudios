// D:\ssistudios\ssistudios\components\Certificates\utils\pdfGenerator.ts

import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb } from "pdf-lib";
import { ICertificateClient } from "./constants";

// The core PDF generation logic, now fully decoupled.
export const generateCertificatePDF = async (
    certData: ICertificateClient,
    onAlert: (message: string, isError: boolean) => void,
    template: 'certificate1.pdf' | 'certificate2.pdf', // Template selector
    setLoadingId: React.Dispatch<React.SetStateAction<string | null>> // State setter for loading
) => {
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
        onAlert('Missing essential data (Name or Certificate No) for PDF generation.', true);
        return;
    }

    setLoadingId(certData._id); // Start loading state

    try {
        // 2. Fetch Resources
        const [existingPdfBytes, soraBytes, soraSemiBoldBytes] = await Promise.all([
            fetch(`/certificates/${template}`).then((res) => { // Use the template variable
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

        // 4. Drawing Logic - Coordinates are relative to template
        const yBase = pageHeight - 180;
        const x = 55;
        const margin = 40;
        const fontSizeSmall = 7;
        const fontSizeMedium = 8;
        const fontSizeLarge = 18;
        const colorGray = rgb(0.5, 0.5, 0.5);
        const colorBlack = rgb(0, 0, 0);

        // Full Name (y: 419)
        firstPage.drawText(fullName, {
            x,
            y: yBase,
            size: fontSizeLarge,
            font: soraFont,
            color: colorBlack,
        });

        // Hospital Name (y: 399)
        firstPage.drawText(hospitalName, {
            x,
            y: yBase - 20,
            size: fontSizeMedium,
            font: soraSemiBoldFont,
            color: colorBlack,
        });

        // CONDITIONAL DRAWING LOGIC: Only draw static text for V2 template
        if (isV2Template) {
            // Static Line: "has successfully completed the" (y: 355)
            firstPage.drawText(staticLineText, {
                x,
                y: yBase - 64,
                size: fontSizeSmall,
                font: soraFont,
                color: colorGray,
                maxWidth: 350,
                lineHeight: 10,
            });

            // Program Name (y: 343)
            firstPage.drawText(programName, {
                x,
                y: yBase - 76,
                size: fontSizeSmall,
                font: soraSemiBoldFont,
                color: colorBlack,
            });

            // Provider Line: "provided by Sudhir..." (y: 331)
            firstPage.drawText(providerLineText, {
                x,
                y: yBase - 88,
                size: fontSizeSmall,
                font: soraFont,
                color: colorGray,
                maxWidth: 350,
                lineHeight: 10,
            });

            // Operation Text (y: 319)
            firstPage.drawText(operationText, {
                x,
                y: yBase - 100,
                size: fontSizeSmall,
                font: soraSemiBoldFont,
                color: colorBlack,
            });
        }

        // Date of Issue - DOI (Bottom Left - needs centering adjustment)
        const doiTextWidth = soraSemiBoldFont.widthOfTextAtSize(doi, fontSizeSmall);
        firstPage.drawText(doi, {
            x: Math.max(margin, (pageWidth - doiTextWidth) / 2) - 75,
            y: margin + 45,
            size: fontSizeSmall,
            font: soraSemiBoldFont,
            color: colorBlack,
            maxWidth: pageWidth - margin * 2,
        });

        // Certificate No. (Bottom Right)
        const certTextWidth = soraSemiBoldFont.widthOfTextAtSize(certificateNo, fontSizeSmall);
        firstPage.drawText(certificateNo, {
            x: pageWidth - certTextWidth - margin - 70,
            y: margin + 45,
            size: fontSizeSmall,
            font: soraSemiBoldFont,
            color: colorBlack,
            maxWidth: pageWidth - margin * 2,
        });

        // 5. Save and Download
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });

        // Trigger Download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        // Clean up file name for safe download
        const fileName = `${certificateNo.replace(/[^a-zA-Z0-9-]/g, '_')}-${fullName.replace(/[^a-zA-Z0-9-]/g, '_')}-${isV2Template ? 'v2' : 'v1'}.pdf`;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        onAlert(`Successfully generated and downloaded PDF: ${fileName}`, false);

    } catch (error) {
        console.error('PDF Generation Error:', error);
        onAlert(`Failed to generate PDF. Check console for details.`, true);
    } finally {
        setLoadingId(null); // End loading state
    }
};