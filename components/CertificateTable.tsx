// components/CertificateTable.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import LoadingSpinner from './ui/LoadingSpinner';
import * as XLSX from 'xlsx';

// Extend the DB interface with the Mongoose _id for client-side use
export interface ICertificateClient {
  _id: string;
  certificateNo: string;
  name: string;
  hospital: string;
  doi: string; // DD-MM-YYYY
}

interface FetchResponse {
  data: ICertificateClient[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: { hospitals: string[] };
}

interface CertificateTableProps {
  refreshKey: number; // Used to manually trigger refresh
  onRefresh: (data: ICertificateClient[]) => void;
  onAlert: (message: string, isError: boolean) => void;
}

const CertificateTable: React.FC<CertificateTableProps> = ({ refreshKey, onRefresh, onAlert }) => {
  const [certificates, setCertificates] = useState<ICertificateClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState('');
  const [uniqueHospitals, setUniqueHospitals] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<ICertificateClient>>({});
  const limit = 10; // Fixed items per page

  const fetchCertificates = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        q: searchQuery,
      });

      if (hospitalFilter) {
        params.append('hospital', hospitalFilter);
      }

      const response = await fetch(`/api/certificates?${params.toString()}`);
      const result: FetchResponse & { success: boolean, message?: string } = await response.json();

      if (response.ok && result.success) {
        setCertificates(result.data);
        setTotalItems(result.total);
        setTotalPages(result.totalPages);
        setUniqueHospitals(result.filters.hospitals);
        onRefresh(result.data);
      } else {
        onAlert(result.message || 'Failed to fetch certificates.', true);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      onAlert('Network error while fetching data.', true);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, hospitalFilter, onRefresh, onAlert]);

  // Effect to fetch data on initial load, refreshKey change, or pagination/filter/search changes
  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates, refreshKey]);

  // Effect to reset page when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, hospitalFilter]);


  // --- CRUD Operations ---

  const handleEdit = (certificate: ICertificateClient) => {
    setEditingId(certificate._id);
    setEditFormData({ ...certificate });
  };

  const handleSave = async (id: string) => {
    // Basic validation
    if (!editFormData.certificateNo || !editFormData.name || !editFormData.hospital || !editFormData.doi) {
      onAlert('All fields are required.', true);
      return;
    }
    const doiRegex = /^\d{2}-\d{2}-\d{4}$/;
    if (!doiRegex.test(editFormData.doi)) {
      onAlert('DOI must be in DD-MM-YYYY format.', true);
      return;
    }

    try {
      const response = await fetch(`/api/certificates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        onAlert('Certificate updated successfully!', false);
        setEditingId(null);
        setEditFormData({});
        fetchCertificates(); // Refresh data after successful update
      } else {
        onAlert(result.message || 'Failed to update certificate.', true);
      }
    } catch (error) {
      onAlert('Network error during update.', true);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this certificate?')) return;

    try {
      const response = await fetch(`/api/certificates/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok && result.success) {
        onAlert('Certificate deleted successfully!', false);
        fetchCertificates(); // Refresh data
      } else {
        onAlert(result.message || 'Failed to delete certificate.', true);
      }
    } catch (error) {
      onAlert('Network error during delete.', true);
    }
  };

  const handleChange = (field: keyof ICertificateClient, value: string) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  // --- Download Functionality ---

  const handleDownload = useMemo(() => {
    return (type: 'xlsx' | 'csv') => {
      if (certificates.length === 0) {
        onAlert('No data to download.', false);
        return;
      }
      
      const dataToExport = certificates.map(cert => ({
        'Certificate No.': cert.certificateNo,
        'Name': cert.name,
        'Hospital': cert.hospital,
        'DOI': cert.doi,
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Certificates');
      
      const fileName = `certificates_export.${type}`;
      XLSX.writeFile(workbook, fileName);
    };
  }, [certificates, onAlert]);


  // --- Render Logic ---

  if (isLoading && certificates.length === 0) {
    return <LoadingSpinner />;
  }

  const Pagination = () => (
    <div className="flex justify-between items-center mt-4">
      <p className="text-sm text-gray-600">
        Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, totalItems)} of {totalItems} entries
      </p>
      <div className="flex space-x-2">
        <button
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 transition"
        >
          Previous
        </button>
        <span className="px-3 py-1 text-sm bg-indigo-500 text-white rounded-md">{currentPage} / {totalPages}</span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages || totalPages === 0}
          className="px-3 py-1 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 transition"
        >
          Next
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-4 p-4 bg-white rounded-xl shadow-inner">
        
        <input
          type="text"
          placeholder="Search by any field..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-1/3 p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
        />

        <select
          value={hospitalFilter}
          onChange={(e) => setHospitalFilter(e.target.value)}
          className="w-full sm:w-1/4 p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 bg-white"
        >
          <option value="">All Hospitals (Filter)</option>
          {uniqueHospitals.map(hospital => (
            <option key={hospital} value={hospital}>{hospital}</option>
          ))}
        </select>
        
        <div className="flex space-x-2">
            <button
                onClick={() => handleDownload('xlsx')}
                className="px-3 py-2 text-sm font-medium rounded-lg bg-green-500 text-white hover:bg-green-600 transition duration-150 shadow-md"
            >
                <i className="lucide-download mr-1"></i> Excel
            </button>
            <button
                onClick={() => handleDownload('csv')}
                className="px-3 py-2 text-sm font-medium rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition duration-150 shadow-md"
            >
                <i className="lucide-download mr-1"></i> CSV
            </button>
        </div>
      </div>

      {isLoading && certificates.length > 0 ? (
        <LoadingSpinner />
      ) : certificates.length === 0 ? (
        <div className="text-center p-10 bg-white rounded-xl shadow-md">
          <p className="text-gray-500 text-lg">
            No certificates found. Upload an Excel sheet to get started or adjust your search/filters.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 bg-white">
              <thead className="bg-gray-50">
                <tr>
                  {['Certificate No.', 'Name', 'Hospital', 'DOI', 'Actions'].map(header => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {certificates.map((cert) => (
                  <tr key={cert._id} className="hover:bg-indigo-50 transition duration-150">
                    {['certificateNo', 'name', 'hospital', 'doi'].map((fieldKey) => {
                      const field = fieldKey as keyof ICertificateClient;
                      const isEditing = editingId === cert._id;
                      
                      return (
                        <td key={field} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editFormData[field] as string}
                              onChange={(e) => handleChange(field, e.target.value)}
                              className="w-full p-1 border border-indigo-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          ) : (
                            // @ts-ignore
                            cert[field]
                          )}
                        </td>
                      );
                    })}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingId === cert._id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSave(cert._id)}
                            className="text-white bg-green-500 hover:bg-green-600 p-1 rounded-full w-8 h-8 flex items-center justify-center transition"
                            title="Save"
                          >
                            <i className="lucide-save text-base"></i>
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-white bg-gray-500 hover:bg-gray-600 p-1 rounded-full w-8 h-8 flex items-center justify-center transition"
                            title="Cancel"
                          >
                            <i className="lucide-x text-base"></i>
                          </button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(cert)}
                            className="text-indigo-600 hover:text-indigo-900 bg-indigo-100 hover:bg-indigo-200 p-1 rounded-full w-8 h-8 flex items-center justify-center transition"
                            title="Edit"
                          >
                            <i className="lucide-edit text-base"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(cert._id)}
                            className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 p-1 rounded-full w-8 h-8 flex items-center justify-center transition"
                            title="Delete"
                          >
                            <i className="lucide-trash-2 text-base"></i>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination />
        </>
      )}
    </div>
  );
};

export default CertificateTable;