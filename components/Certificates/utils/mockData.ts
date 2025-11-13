// D:\ssistudios\ssistudios\components\Certificates\utils\mockData.ts (NEW FILE)

import { ICertificateClient } from "./constants";

// Extended interface with email for mock purposes
export interface ICertificateClientWithEmail extends ICertificateClient {
    // 💡 Mock Email for testing: Assume this field exists in your DB model
    email: string; 
    // Additional fields for email template use
    firstName: string;
    lastName: string;
}

export const mockCertificateData: ICertificateClientWithEmail[] = [
    {
        _id: '6686979203923d06283b9c8b',
        certificateNo: 'SSI-1001',
        name: 'John Doe',
        hospital: 'City General Hospital',
        doi: '01-07-2024',
        email: 'john.doe@example.com', // Mocked recipient email
        firstName: 'John',
        lastName: 'Doe',
    },
    // ... add more mock data as needed
];