import axios from 'axios';

// Configuration
const NODE_BACKEND_URL = 'http://localhost:3000'; // For demo/development

export class NodeBackendService {
    private baseURL: string;
    private timeout: number;

    constructor(baseURL: string = NODE_BACKEND_URL, timeout: number = 10000) {
        this.baseURL = baseURL;
        this.timeout = timeout;
    }

    /**
     * Check if the Node.js backend is healthy
     */
    async healthCheck(): Promise<any> {
        try {
            const response = await axios.get(`${this.baseURL}/`, {
                timeout: this.timeout
            });
            return response.data;
        } catch (error) {
            console.error('Node backend health check failed:', error);
            throw new Error(`Backend unavailable: ${error}`);
        }
    }

    /**
     * Generate SHA-256 hash from gait data
     */
    async generateHash(gaitData: string): Promise<any> {
        try {
            const response = await axios.post(`${this.baseURL}/hash`, {
                gaitData
            }, {
                timeout: this.timeout,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Hash generation failed:', error);
            if (axios.isAxiosError(error) && error.response) {
                throw new Error(`Hash generation failed: ${error.response.data.error || error.message}`);
            }
            throw new Error(`Network error: ${error}`);
        }
    }

    /**
     * Get hash history from backend
     */
    async getHashHistory(): Promise<any> {
        try {
            const response = await axios.get(`${this.baseURL}/history`, {
                timeout: this.timeout
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch hash history:', error);
            throw new Error(`Failed to fetch history: ${error}`);
        }
    }

    /**
     * Get backend statistics
     */
    async getStats(): Promise<any> {
        try {
            const response = await axios.get(`${this.baseURL}/stats`, {
                timeout: this.timeout
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch backend stats:', error);
            throw new Error(`Failed to fetch stats: ${error}`);
        }
    }

    /**
     * Test connection to backend
     */
    async testConnection(): Promise<boolean> {
        try {
            await this.healthCheck();
            return true;
        } catch {
            return false;
        }
    }
}