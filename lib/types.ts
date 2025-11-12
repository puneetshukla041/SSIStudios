// lib/types.ts
export interface ICertificate {
  _id: string; // MongoDB ID for CRUD operations
  certificateNo: string;
  name: string;
  hospital: string;
  doi: string; // DD-MM-YYYY
  createdAt: string;
  updatedAt: string;
}

export interface IApiCertificateResponse {
  success: boolean;
  data: ICertificate[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: {
    hospitals: string[];
  };
}

export interface IUploadSummary {
  totalRows: number;
  successfullyInserted: number;
  failedToProcess: number;
  uniqueErrors: number;
}