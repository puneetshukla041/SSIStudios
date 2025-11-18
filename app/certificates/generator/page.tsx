"use client";

import React, { useEffect, useState } from "react";
// Assuming you have 'fontkit' and 'pdf-lib' installed and available
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb } from "pdf-lib";

import { Calendar, Cloud, Download, Check, AlertTriangle } from "lucide-react";

// --- InputComponent Definition ---

interface InputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  multiline?: boolean;
  rows?: number;
}

const InputComponent: React.FC<InputProps> = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon,
  multiline = false,
  rows = 6,
}) => (
  <div className="flex flex-col gap-2"> {/* Equal spacing between label and field */}
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <div className="relative">
      {multiline ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150 ease-in-out resize-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150 ease-in-out"
        />
      )}

      {/* Right-side icon (for input only) */}
      {icon && !multiline && (
        <span className="absolute inset-y-0 right-3 flex items-center text-gray-500 pointer-events-none">
          {icon}
        </span>
      )}
    </div>
  </div>
);


// --- Main Editor Component ---

export default function Editor() {
  // State from original code
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [programName, setProgramName] = useState("Proctorship & Mentorship Program");
  const [operationText, setOperationText] = useState(
    "and is hereby recognized as a Certified Proctor & Mentor authorized to perform advanced robotic surgeries, mentor surgeons, and provide clinical guidance on the SSI Mantra Surgical Robotic System."
  );
  // MODIFIED: NEW STATE VARIABLE
const [paragraphText, setParagraphText] = useState(
  "The Proctorship & Mentorship Program acknowledges exceptional surgical expertise and leadership in robotic-assisted surgery. Participants have demonstrated outstanding robotic skill, clinical judgment, and the ability to guide peers through safe and effective use of the SSI Mantra Robotic System. As Certified Proctors & Mentors, they are entrusted to represent SS Innovations by mentoring surgeons and supporting the expansion of robotic surgical excellence across institutions."
);

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  const [doi, setDoi] = useState(formatDate(new Date()));
  const [certificateNo, setCertificateNo] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [exportStatus, setExportStatus] = useState<
    "idle" | "uploading" | "downloading" | "complete" | "error"
  >("idle");



// Utility: split text into lines based on max width
const drawMultilineText = (
  page: any,
  text: string,
  x: number,
  y: number,
  font: any,
  size: number,
  color: any,
  maxWidth: number,
  lineHeight: number
) => {
  const words = text.split(" ");
  let line = "";
  let offsetY = 0;

  words.forEach((word, i) => {
    const testLine = line ? line + " " + word : word;
    const testWidth = font.widthOfTextAtSize(testLine, size);

    if (testWidth > maxWidth && line) {
      page.drawText(line, { x, y: y - offsetY, size, font, color });
      line = word;
      offsetY += lineHeight;
    } else {
      line = testLine;
    }

    // Draw the last line
    if (i === words.length - 1) {
      page.drawText(line, { x, y: y - offsetY, size, font, color });
    }
  });
};




const handleDoiChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  const input = e.target as HTMLInputElement;
  let v = input.value.replace(/\D/g, "");
  if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
  if (v.length > 5) v = v.slice(0, 5) + "/" + v.slice(5, 9);
  setDoi(v);
};

  // PDF Generation Effect
  useEffect(() => {
    let objectUrl: string | null = null;
    const generatePdf = async () => {
      setIsLoading(true);
      try {
        // NOTE: These fetch calls assume the files are available in a public folder path on the server
        const existingPdfBytes = await fetch("/certificates/certificate1.pdf").then((res) =>
          res.arrayBuffer()
        );
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        pdfDoc.registerFontkit(fontkit);

        const pages = pdfDoc.getPages();
        const firstPage = pages[0];

        const soraBytes = await fetch("/fonts/Sora-Regular.ttf").then((res) => res.arrayBuffer());
        const soraFont = await pdfDoc.embedFont(soraBytes);

        const soraSemiBoldBytes = await fetch("/fonts/Sora-SemiBold.ttf").then((res) =>
          res.arrayBuffer()
        );
        const soraSemiBoldFont = await pdfDoc.embedFont(soraSemiBoldBytes);

        // PDF Drawing logic
        let y = firstPage.getHeight() - 180;
        const x = 55;
        const cap = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
        const fullName = `${cap(firstName)} ${cap(lastName)}`.trim();

        if (fullName) {
          firstPage.drawText(fullName, {
            x,
            y,
            size: 18,
            font: soraFont,
            color: rgb(0, 0, 0),
          });
        }

        if (hospitalName) {
          firstPage.drawText(hospitalName, {
            x,
            y: y - 20,
            size: 8,
            font: soraSemiBoldFont,
            color: rgb(0, 0, 0),
          });
        }

        // --- NEW STATIC LINE DRAWING LOGIC ---
        // This line is placed above the programName text (which is at y - 76)
        const staticLineText = "Is hereby officially onboarded onto the";
        firstPage.drawText(staticLineText, {
          x,
          y: y - 64, // Adjusted placement
          size: 7,
          font: soraFont, // Use Sora-Regular.ttf
          color: rgb(0.5, 0.5, 0.5), // Gray color
          maxWidth: 350,
          lineHeight: 10,
        });
        // --- END NEW STATIC LINE DRAWING LOGIC ---


        if (programName) {
          firstPage.drawText(programName, {
            x,
            y: y - 77,
            size: 6,
            font: soraSemiBoldFont,
            color: rgb(0, 0, 0),
          });
        }
        // --- START NEW LINE REQUESTED BY USER (Below Program Name) ---
        const providerLineText = "at Sudhir Srivastava Innovations Pvt. Ltd";
        firstPage.drawText(providerLineText, {
          x,
          y: y - 91, // Positioned 12 units below programName (y - 76)
          size: 7,
          font: soraFont, // Use Sora-Regular.ttf
          color: rgb(0.5, 0.5, 0.5), // Gray color
          maxWidth: 350,
          lineHeight: 10,
        });
        // --- END NEW LINE REQUESTED BY USER ---
        
// Shorter line width for operation text
if (operationText) {
  drawMultilineText(
    firstPage,
    operationText,
    x,
    y - 105,
    soraSemiBoldFont,
    6,
    rgb(0, 0, 0),
    250, // ↓ Reduced from 350 for earlier line breaks
    10
  );
}


// Slightly wider for paragraph text (still balanced)
if (paragraphText) {
  drawMultilineText(
    firstPage,
    paragraphText,
    x,
    y - 160,
    soraFont,
    7,
    rgb(0.5, 0.5, 0.5),
    370, // ↓ Reduced a bit for better wrapping
    10
  );
}

        // END NEW PARAGRAPH DRAWING LOGIC

        if (doi) {
          const fontSize = 7;
          const margin = 40;
          const textWidth = soraSemiBoldFont.widthOfTextAtSize(doi, fontSize);
          const pageWidth = firstPage.getWidth();
          firstPage.drawText(doi, {
            x: Math.max(margin, (pageWidth - textWidth) / 2) - 65,
            y: margin + 45,
            size: fontSize,
            font: soraSemiBoldFont,
            color: rgb(0, 0, 0),
            maxWidth: pageWidth - margin * 2,
          });
        }

if (certificateNo) {
  const fontSize = 7;
  const marginLeft = 165; // fixed left position
  const marginBottom = 85; // adjust as needed

  const pageWidth = firstPage.getWidth();

  firstPage.drawText(certificateNo, {
    x: pageWidth - marginLeft, // fixed start position
    y: marginBottom,
    size: fontSize,
    font: soraSemiBoldFont,
    color: rgb(0, 0, 0),
  });
}

        
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([new Uint8Array(pdfBytes)], {
          type: "application/pdf",
        });
        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
      } catch (error) {
        console.error("Failed to generate PDF:", error);
        setPreviewUrl("");
      } finally {
        setIsLoading(false);
      }
    };

    generatePdf();

    // Cleanup function to revoke the Blob URL
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [firstName, lastName, hospitalName, programName, operationText, paragraphText, doi, certificateNo]); // paragraphText is in dependency array
const handleExport = async () => {
  if (!previewUrl || !certificateNo) return console.error("Certificate number required");

  setExportStatus("uploading");
  setIsLoading(true);

  try {
    // 1️⃣ Get the PDF blob
    const res = await fetch(previewUrl);
    const pdfBlob = await res.blob();

    // 2️⃣ Request a presigned URL from backend
    const presignRes = await fetch("/api/certificates/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ certificateNo, fileName: `${certificateNo}.pdf` }),
    });

    if (!presignRes.ok) throw new Error("Failed to get presigned URL");
    const { uploadUrl, s3Key } = await presignRes.json();

    // 3️⃣ Upload the PDF directly to S3
    const uploadRes = await fetch(uploadUrl, { method: "PUT", body: pdfBlob, headers: { "Content-Type": "application/pdf" } });
    if (!uploadRes.ok) throw new Error("Upload failed");

    console.log("File uploaded successfully to S3:", s3Key);

    // 4️⃣ Save metadata in DB (small JSON payload)
    await fetch("/api/certificates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ certificateNo, recipientName: `${firstName} ${lastName}`, programName }),
    });

    setExportStatus("downloading");

    // 5️⃣ Trigger client-side download
    const downloadUrl = window.URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `${certificateNo}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);

    setExportStatus("complete");
    setTimeout(() => setExportStatus("idle"), 2000);
  } catch (err) {
    console.error("Upload/Download error:", err);
    setExportStatus("error");
    setTimeout(() => setExportStatus("idle"), 3000);
  } finally {
    setIsLoading(false);
  }
};


  // Helper functions for button state
  const getButtonContent = () => {
    switch (exportStatus) {
      case "uploading":
        return (
          <div className="flex items-center justify-center gap-2">
            <Cloud size={18} className="animate-pulse" />
            <span className="truncate">Uploading...</span>
          </div>
        );
      case "downloading":
        return (
          <div className="flex items-center justify-center gap-2">
            <Download size={18} className="animate-bounce" />
            <span className="truncate">Preparing Download...</span>
          </div>
        );
      case "complete":
        return (
          <div className="flex items-center justify-center gap-2">
            <Check size={18} />
            <span className="truncate">Download Complete!</span>
          </div>
        );
      case "error":
        return (
          <div className="flex items-center justify-center gap-2">
            <AlertTriangle size={18} />
            <span className="truncate">Export Failed!</span>
          </div>
        );
      default:
        return isLoading ? "Generating Preview..." : "Export & Download PDF";
    }
  };

  const getButtonClass = () => {
    const base =
      "w-full text-white text-base font-bold py-3 px-4 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed";

    switch (exportStatus) {
      case "uploading":
        return `${base} bg-yellow-500 hover:bg-yellow-600`;
      case "downloading":
        return `${base} bg-blue-600 hover:bg-blue-700`;
      case "complete":
        return `${base} bg-green-500 hover:bg-green-600`;
      case "error":
        return `${base} bg-red-600 hover:bg-red-700`;
      default:
        return `${base} bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:ring-blue-300`;
    }
  };

  return (
    // Outer container: Full screen, using py-8 for vertical padding
    <div className="min-h-screen bg-gray-50 flex justify-center p-4 sm:p-6 lg:py-8 lg:px-12">
      {/* Main Content Area: Maximum width for a wider look */}
      <div className="flex flex-col w-full max-w-full xl:max-w-screen-2xl">

        {/* Editor Layout: Responsive Flex/Grid */}
        <div className="flex flex-col lg:flex-row w-full gap-6 lg:gap-8">
          
          {/* Left Column: Input Panel - Always visible, takes 1/3 on large screens */}
          <div className="w-full lg:w-1/3 bg-white rounded-xl shadow-xl p-6 lg:p-8 flex flex-col gap-6 border border-gray-100 shrink-0">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-2">
              Certificate Details
            </h2>
            <p className="mt-2 text-base text-gray-600">
              Instantly customize and generate a professional training certificate using the input fields below. The preview will update in real-time.
            </p>
            
            {/* Input fields container: Uses responsive grid for max horizontal spread */}
            <div className="flex flex-col gap-5 flex-grow overflow-y-auto pr-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputComponent
                  label="First Name"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g., Jane"
                />
                <InputComponent
                  label="Last Name"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g., Doe"
                />
              </div>

              {/* Grouped items for better vertical flow */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputComponent
                  label="Hospital/Affiliation"
                  type="text"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  placeholder="e.g., St. Jude's Hospital"
                />
                <InputComponent
                  label="Program Name"
                  type="text"
                  value={programName}
                  onChange={(e) => setProgramName(e.target.value)}
                  placeholder="e.g., Advanced Training"
                />
              </div>

<InputComponent
  label="Operation/Achievement Text"
  type="text"
  value={operationText}
  onChange={(e) => setOperationText(e.target.value)}
  placeholder="e.g., successfully completed the robotic system training"
  multiline={true} // ✅ enable multi-line
  rows={4}         // optional: height of textarea
/>

              
              {/* INPUT COMPONENT FOR PARAGRAPH */}
              <InputComponent
                label="Paragraph Text"
                type="text"
                value={paragraphText}
                onChange={(e) => setParagraphText(e.target.value)}
                placeholder="write your content" // MODIFIED: New placeholder text
              />
              {/* END NEW INPUT COMPONENT */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputComponent
                  label="Date of Issue (DD/MM/YYYY)"
                  type="text"
                  value={doi}
                  onChange={handleDoiChange}
                  placeholder="DD/MM/YYYY"
                  icon={<Calendar size={18} />}
                />
                <InputComponent
                  label="Certificate No."
                  type="text"
                  value={certificateNo}
                  onChange={(e) => setCertificateNo(e.target.value)}
                  placeholder="e.g., CERT-12345"
                />
              </div>
            </div>

            {/* Export Button */}
            <div className="pt-4 border-t border-gray-100">
              <button
                onClick={handleExport}
                className={getButtonClass()}
                disabled={
                  !previewUrl ||
                  isLoading ||
                  exportStatus === "uploading" ||
                  exportStatus === "downloading"
                }
              >
                {getButtonContent()}
              </button>
            </div>
          </div>

          {/* Right Column: Preview Area
            Hidden on mobile (hidden) and displayed as a flex container on large screens (lg:flex).
            Takes 2/3 of the width on large screens (lg:w-2/3). 
          */}
          <div className="hidden lg:flex w-full lg:w-2/3 bg-white rounded-xl shadow-xl items-center justify-center p-4 sm:p-6 lg:p-8 border border-gray-100 min-h-[60vh]">
            <div className="w-full h-full border border-gray-300 rounded-lg overflow-hidden flex items-center justify-center bg-gray-200/50">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center text-gray-500 p-8">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                  <p className="mt-4 text-lg font-medium">
                    Generating Certificate Preview...
                  </p>
                </div>
              ) : previewUrl ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-full min-h-[500px] max-w-full max-h-full border-none rounded-lg shadow-inner" 
                  title="Certificate Preview"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-500 p-8 text-center">
                  <AlertTriangle size={32} className="text-red-500 mb-2" />
                  <p className="text-lg font-medium">
                    Preview Failed to Load.
                  </p>
                  <p className="text-sm mt-1">
                    Please ensure the PDF and font files are in your `/public` folder.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}