"use client";

import React, { useEffect, useState } from "react";
// Assuming you have 'fontkit' and 'pdf-lib' installed and available
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb } from "pdf-lib";

import { Calendar, Download, Building, User } from "lucide-react";

// --- Minimal InputComponent Definition ---

interface InputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}

const InputComponent: React.FC<InputProps> = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon,
}) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150 ease-in-out"
      />
      {icon && (
        <span className="absolute inset-y-0 right-3 flex items-center text-gray-500 pointer-events-none">
          {icon}
        </span>
      )}
    </div>
  </div>
);


// --- Minimal Editor Component ---

export default function Editor() {
  // State for required fields (Keeping initial values for demo functionality)
  // MERGED: firstName and lastName into doctorName
  const [doctorName, setDoctorName] = useState("");
  const [hospitalName, setHospitalName] = useState("");

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  const [doi, setDoi] = useState(formatDate(new Date()));
  const [certificateNo, setCertificateNo] = useState(""); 

  // General UI state
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const handleDoiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
    if (v.length > 5) v = v.slice(0, 5) + "/" + v.slice(5, 9);
    setDoi(v);
  };

  // PDF Generation Effect (Minimal Logic)
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

        // Fetch and embed fonts
        const soraBytes = await fetch("/fonts/Sora-Regular.ttf").then((res) => res.arrayBuffer());
        const soraFont = await pdfDoc.embedFont(soraBytes);

        const soraSemiBoldBytes = await fetch("/fonts/Sora-SemiBold.ttf").then((res) =>
          res.arrayBuffer()
        );
        const soraSemiBoldFont = await pdfDoc.embedFont(soraSemiBoldBytes);

        // PDF Drawing logic
        const cap = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
        // UPDATED: Use doctorName directly
        const fullName = doctorName.trim().split(/\s+/).map(cap).join(' ');

        const x = 55;
        const y_name = firstPage.getHeight() - 180; // Name position
        const y_hospital = y_name - 25; // Hospital Name position
        
        // Coordinates for Date and Cert No. at bottom right/center-left
        const margin = 40;
        const pageWidth = firstPage.getWidth();
        const y_bottom = margin + 45;
        const fontSize = 7;

        // 1. Draw Name
        if (fullName) {
          firstPage.drawText(fullName, {
            x,
            y: y_name,
            size: 18,
            font: soraFont,
            color: rgb(0, 0, 0),
          });
        }
        
        // 2. Draw Hospital Name
        if (hospitalName) {
            firstPage.drawText(hospitalName, {
                x,
                y: y_hospital,
                size: 14,
                font: soraFont,
                color: rgb(0.3, 0.3, 0.3), 
            });
        }

        // 3. Draw Date of Issue (DOI)
        if (doi) {
          const textWidth = soraSemiBoldFont.widthOfTextAtSize(doi, fontSize);
          // Centered-left position for DOI
          firstPage.drawText(doi, {
            x: Math.max(margin, (pageWidth - textWidth) / 2) - 65,
            y: y_bottom,
            size: fontSize,
            font: soraSemiBoldFont,
            color: rgb(0, 0, 0),
            maxWidth: pageWidth - margin * 2,
          });
        }

        // 4. Draw Certificate Number (Conditional: Only draw if the number is provided)
        if (certificateNo) {
          const marginLeft = 165;
          // Fixed right position for Certificate Number
          firstPage.drawText(certificateNo, {
            x: pageWidth - marginLeft,
            y: y_bottom,
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
  }, [doctorName, doi, certificateNo, hospitalName]); // Dependencies updated

  // Simplified Download Handler
  const handleDownload = () => {
    if (previewUrl) {
      const link = document.createElement("a");
      // UPDATED: Use doctorName for fallback filename
      const filenameBase = certificateNo || doctorName;
      link.href = previewUrl;
      link.download = `${filenameBase.replace(/\s/g, '_')}_${doi.replace(/\//g, '-')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 flex justify-center p-4 sm:p-8">
      <div className="flex flex-col w-full max-w-full xl:max-w-screen-xl">
        <div className="flex flex-col lg:flex-row w-full gap-6">
          
          {/* Input Panel */}
          <div className="w-full lg:w-1/3 bg-white rounded-xl shadow-2xl p-6 flex flex-col gap-6 border border-gray-100 shrink-0">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">
              Certificate Data Entry
            </h2>
            
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
<InputComponent
  label="Doctor Name (First and Last)"
  value={doctorName}
  onChange={(e) => setDoctorName(e.target.value)}
  placeholder="e.g., Dr. Jane Doe"
  icon={<User size={18} />}
/>

<div className="col-span-1 md:col-span-2"> 
    <InputComponent
        label="Hospital/Institution Name"
        value={hospitalName}
        onChange={(e) => setHospitalName(e.target.value)}
        placeholder=""
        icon={<Building size={18} />}
    />
</div>

<InputComponent
  label="Date of Issue (DD/MM/YYYY)"
  value={doi}
  onChange={handleDoiChange as any}
  placeholder=""
  icon={<Calendar size={18} />}
/>

<InputComponent
  label="Certificate No. (Optional)"
  value={certificateNo}
  onChange={(e) => setCertificateNo(e.target.value)}
  placeholder=""
/>

              </div>
            </div>

            {/* Download Button */}
            <div className="pt-4 border-t border-gray-100">
              <button
                onClick={handleDownload}
                className="w-full text-white text-base font-bold py-3 px-4 rounded-xl shadow-lg transition-all duration-300 bg-emerald-500 hover:bg-emerald-600 focus:ring-4 focus:ring-emerald-300 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={!previewUrl || isLoading}
              >
                <div className="flex items-center justify-center gap-2">
                  <Download size={18} />
                  <span className="truncate">Download PDF</span>
                </div>
              </button>
            </div>
          </div>

          {/* Preview Area */}
          <div className="hidden lg:flex w-full lg:w-2/3 bg-white rounded-xl shadow-2xl items-center justify-center p-4 border border-gray-100 min-h-[600px]">
            <div className="w-full h-full border border-gray-300 rounded-lg overflow-hidden flex items-center justify-center bg-gray-100">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500"></div>
                    <p className="mt-4 text-gray-600">Generating PDF...</p>
                </div>
              ) : previewUrl ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-full min-h-[600px] border-none rounded-lg shadow-inner"
                  title="Certificate Preview"
                />
              ) : (
                <p className="text-lg font-medium text-red-500">Preview Failed to Load. Ensure font and PDF assets are accessible.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}