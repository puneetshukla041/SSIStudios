import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb } from "pdf-lib";

export interface IIdCardData {
  _id?: string;
  fullName: string;
  designation: string;
  idCardNo: string;
  bloodGroup: string;
  userImage: string | null; // Base64 or URL
  imageXOffset: number;
  imageYOffset: number;
}

interface PdfResult {
  filename: string;
  blob: Blob;
}

// Helper to capitalize words
const toTitleCase = (str: string) => {
  return str
    .split(" ")
    .map((word) => {
      if (word.length === 0) return "";
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
};

export const generateIdCardPDF = async (
  data: IIdCardData,
  onAlert?: (msg: string, isError: boolean) => void
): Promise<PdfResult | null> => {
  const { fullName, designation, idCardNo, bloodGroup, userImage, imageXOffset, imageYOffset } = data;

  try {
    // 1. Fetch Resources
    const [
      existingPdfBytes,
      soraBytes,
      soraSemiBoldBytes,
      bebasNeueBytes,
      poppinsMediumBytes,
    ] = await Promise.all([
      fetch("/idcard/idcard.pdf").then((res) => {
        if (!res.ok) throw new Error("Template not found");
        return res.arrayBuffer();
      }),
      fetch("/fonts/Sora-Regular.ttf").then((res) => res.arrayBuffer()),
      fetch("/fonts/Sora-SemiBold.ttf").then((res) => res.arrayBuffer()),
      fetch("/fonts/BebasNeue-Regular.ttf").then((res) => res.arrayBuffer()),
      fetch("/fonts/Poppins-Medium.ttf").then((res) => res.arrayBuffer()),
    ]);

    // 2. Setup PDF
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    pdfDoc.registerFontkit(fontkit);

    const soraFont = await pdfDoc.embedFont(soraBytes);
    const soraSemiBoldFont = await pdfDoc.embedFont(soraSemiBoldBytes);
    const bebasNeueFont = await pdfDoc.embedFont(bebasNeueBytes);
    const poppinsMediumFont = await pdfDoc.embedFont(poppinsMediumBytes);

    if (pdfDoc.getPages().length < 2) {
      pdfDoc.addPage();
    }
    const secondPage = pdfDoc.getPages()[1];
    const { width: pageWidth, height: pageHeight } = secondPage.getSize();

    // 3. Helper for dynamic font size
    const getDynamicFontSize = (
      text: string,
      font: any,
      maxWidth: number,
      maxFontSize: number
    ) => {
      let fontSize = maxFontSize;
      let textWidth = font.widthOfTextAtSize(text, fontSize);
      while (textWidth > maxWidth && fontSize > 1) {
        fontSize -= 1;
        textWidth = font.widthOfTextAtSize(text, fontSize);
      }
      return fontSize;
    };

    const FULL_NAME_Y_POS = 65;
    const DESIGNATION_Y_POS = 53;
    const ID_CARD_NO_Y_POS = 16;

    // 4. Draw Full Name
    if (fullName) {
      const capitalizedFullName = fullName.toUpperCase();
      const MAX_FULL_NAME_WIDTH = pageWidth * 0.8;
      const dynamicFontSize = getDynamicFontSize(
        capitalizedFullName,
        bebasNeueFont,
        MAX_FULL_NAME_WIDTH,
        18
      );
      const fullNameWidth = bebasNeueFont.widthOfTextAtSize(
        capitalizedFullName,
        dynamicFontSize
      );
      const x = pageWidth / 2 - fullNameWidth / 2;
      secondPage.drawText(capitalizedFullName, {
        x,
        y: FULL_NAME_Y_POS,
        size: dynamicFontSize,
        font: bebasNeueFont,
        color: rgb(0, 0, 0),
      });
    }

    // 5. Draw Designation
    if (designation) {
      const titleCaseDesignation = toTitleCase(designation);
      const MAX_DESIGNATION_WIDTH = pageWidth * 0.7;
      const fontSize = getDynamicFontSize(
        titleCaseDesignation,
        poppinsMediumFont,
        MAX_DESIGNATION_WIDTH,
        8
      );
      const designationWidth = poppinsMediumFont.widthOfTextAtSize(
        titleCaseDesignation,
        fontSize
      );
      const x = pageWidth / 2 - designationWidth / 2;
      secondPage.drawText(titleCaseDesignation, {
        x,
        y: DESIGNATION_Y_POS,
        size: fontSize,
        font: poppinsMediumFont,
        color: rgb(0.4, 0.4, 0.4),
      });
    }

    // 6. Draw ID Card No
    if (idCardNo) {
      const formattedIdCardNo = `#${idCardNo}`;
      const fontSize = 16;
      const idCardNoWidth = soraSemiBoldFont.widthOfTextAtSize(
        formattedIdCardNo,
        fontSize
      );
      const x = pageWidth / 2 - idCardNoWidth / 2 - 10;
      secondPage.drawText(formattedIdCardNo, {
        x,
        y: ID_CARD_NO_Y_POS,
        size: fontSize,
        font: soraSemiBoldFont,
        color: rgb(80 / 255, 185 / 255, 162 / 255),
      });
    }

    // 7. Draw Blood Group
    if (bloodGroup) {
      const bloodGroupImagePath = `/bloodgroup/${bloodGroup
        .toLowerCase()
        .replace("+", "plus")
        .replace("-", "minus")}.png`;

      try {
        const response = await fetch(bloodGroupImagePath);
        if (response.ok) {
          const imageBytes = await response.arrayBuffer();
          const image = await pdfDoc.embedPng(imageBytes);

          const IMAGE_SIZE = 15;
          const imageX = pageWidth / 2 - IMAGE_SIZE / 2 + 38;
          const imageY = pageHeight / 2 - IMAGE_SIZE / 2 - 100;

          const LINE_WIDTH = 1;
          const LINE_HEIGHT = 15;
          const GAP = 6;
          const lineX = imageX - GAP - LINE_WIDTH;
          const lineY = imageY;

          secondPage.drawRectangle({
            x: lineX,
            y: lineY,
            width: LINE_WIDTH,
            height: LINE_HEIGHT,
            color: rgb(0.3, 0.3, 0.3),
          });

          secondPage.drawImage(image, {
            x: imageX,
            y: imageY,
            width: IMAGE_SIZE,
            height: IMAGE_SIZE,
          });
        }
      } catch (e) {
        console.error("Failed to load blood group image", e);
      }
    }

    // 8. Draw User Image (Sloped Clip Logic)
    if (userImage) {
      try {
        const imageBytes = await fetch(userImage).then((res) => res.arrayBuffer());
        
        // Setup Canvas for Clipping (Browser API)
        const photoWidth = 94;
        const photoHeight = 126;
        const slopeHeight = 55;
        
        const img = new Image();
        img.src = userImage;
        await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve; // Continue even if image fails
        });

        if (img.complete && img.naturalHeight !== 0) {
            const scale = 3;
            const canvas = document.createElement("canvas");
            canvas.width = photoWidth * scale;
            canvas.height = photoHeight * scale;
            const ctx = canvas.getContext("2d")!;

            ctx.scale(scale, scale);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(photoWidth, 0);
            ctx.lineTo(photoWidth, photoHeight - slopeHeight);
            ctx.lineTo(0, photoHeight);
            ctx.closePath();
            ctx.clip();

            ctx.drawImage(img, 0, 0, photoWidth, photoHeight);

            const clippedDataUrl = canvas.toDataURL("image/png");
            const clippedBytes = await fetch(clippedDataUrl).then((res) => res.arrayBuffer());
            const finalImage = await pdfDoc.embedPng(clippedBytes);

            const xPos = pageWidth / 2 - photoWidth / 2 + (imageXOffset || 0);
            const yPos = 85 + (imageYOffset || 0);

            secondPage.drawImage(finalImage, {
                x: xPos,
                y: yPos,
                width: photoWidth,
                height: photoHeight,
            });
        }
      } catch (e) {
        console.error("Failed to process user image:", e);
        if (onAlert) onAlert("Failed to process user image.", true);
      }
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
    const fileName = `ID-${idCardNo}-${fullName}.pdf`;

    return { filename: fileName, blob };

  } catch (error) {
    console.error("PDF Generation Error:", error);
    if (onAlert) onAlert("Failed to generate PDF.", true);
    return null;
  }
};