import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb } from "pdf-lib";
import { IVisitingCardClient } from "./constants";

interface PdfFileResult {
  filename: string;
  blob: Blob;
}

export const generateVisitingCardPDF = async (
  cardData: IVisitingCardClient,
  onAlert: (message: string, isError: boolean) => void,
  theme: 'dark' | 'light', // 'dark' maps to dark.pdf, 'light' maps to light.pdf
  setLoadingId: React.Dispatch<React.SetStateAction<string | null>> | React.Dispatch<React.SetStateAction<boolean>>,
  isBulk: boolean = false
): Promise<PdfFileResult | null | void> => {

  const { firstName, lastName, designation, phone, email } = cardData;

  // Validation
  if (!firstName || !lastName) {
    if (!isBulk) onAlert('Missing Name fields for PDF generation.', true);
    return isBulk ? null : undefined;
  }

  // Start Loading
  if (!isBulk) {
    (setLoadingId as React.Dispatch<React.SetStateAction<string | null>>)(cardData._id);
  }

  try {
    // 1. Define Template Path
    const templatePath = theme === 'dark' ? "/visitingcard/dark.pdf" : "/visitingcard/light.pdf";
    
    // 2. Define Text Colors based on theme
    // Dark theme usually needs white text, Light theme needs black text
    const textColor = theme === 'dark' ? rgb(1, 1, 1) : rgb(0, 0, 0); 
    const secondaryColor = theme === 'dark' ? [0.8, 0.8, 0.8] : [0, 0, 0];

    // 3. Fetch Resources
    const [templateBytes, semiBoldBytes, mediumBytes] = await Promise.all([
        fetch(templatePath).then(res => {
            if (!res.ok) throw new Error(`Failed to load ${theme} template`);
            return res.arrayBuffer();
        }),
        fetch("/fonts/Poppins-SemiBold.ttf").then(res => res.arrayBuffer()),
        fetch("/fonts/Poppins-Medium.ttf").then(res => res.arrayBuffer())
    ]);

    // 4. Setup PDF
    const pdfDoc = await PDFDocument.load(templateBytes);
    pdfDoc.registerFontkit(fontkit);

    const poppinsSemiBold = await pdfDoc.embedFont(semiBoldBytes);
    const poppinsMedium = await pdfDoc.embedFont(mediumBytes);

    const page = pdfDoc.getPages()[0]; // Assuming single page card

    // 5. Drawing Logic (Based on your algorithm)
    // Adjust coordinates if needed based on specific dark/light template layouts
    // Assuming they share the same layout structure
    let y = page.getHeight() - 43; 
    const x = 15;

    const cap = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
    const fullName = `${cap(firstName)} ${cap(lastName)}`.trim();

    // Draw Name
    if (fullName) {
      page.drawText(fullName, {
        x, y,
        size: 11,
        font: poppinsSemiBold,
        color: textColor,
      });
      y -= 18;
    }

    // Draw Fields
    const fields = [];
    if (designation) fields.push({ text: designation, fontSize: 8, extraSpacing: 14 });
    if (phone) fields.push({ text: `+91-${phone}`, fontSize: 8, extraSpacing: 12 });
    if (email) fields.push({ text: email, fontSize: 8, extraSpacing: 11 });

    fields.forEach((field) => {
      page.drawText(field.text, {
        x, y,
        size: field.fontSize,
        font: poppinsMedium,
        color: rgb(...(secondaryColor as [number, number, number])),
      });
      y -= field.extraSpacing;
    });

    // 6. Save
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
    const filename = `Card-${firstName}-${lastName}-${theme}.pdf`;

    if (isBulk) {
      return { filename, blob };
    } else {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      onAlert(`Generated ${theme} card for ${firstName}`, false);
    }

  } catch (error) {
    console.error(`PDF Gen Error:`, error);
    if (!isBulk) onAlert("Failed to generate PDF.", true);
    return null;
  } finally {
    if (!isBulk) {
      (setLoadingId as React.Dispatch<React.SetStateAction<string | null>>)(null);
    }
  }
};