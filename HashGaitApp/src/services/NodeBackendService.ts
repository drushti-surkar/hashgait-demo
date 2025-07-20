import { HashResult, HashHistory } from '../types';

const NODE_BACKEND_URL = 'http://localhost:3000';

export class NodeBackendService {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string = NODE_BACKEND_URL, timeout: number = 10000) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  async healthCheck(): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('Backend health check failed:', error);
      return {
        message: 'Backend unavailable - using mock mode',
        status: 'mock',
        timestamp: new Date().toISOString(),
        version: '1.0.0-mock'
      };
    }
  }

  async generateHash(gaitData: string): Promise<HashResult> {
    try {
      const response = await fetch(`${this.baseURL}/hash`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gaitData }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('Hash generation failed, using mock:', error);
      // Mock response when backend is unavailable
      const mockHash = this.generateMockHash(gaitData);
      return {
        success: true,
        hash: mockHash,
        originalData: gaitData,
        timestamp: new Date().toISOString(),
        historyCount: 1,
        message: 'Hash generated successfully (mock mode)'
      };
    }
  }

  async getHashHistory(): Promise<HashHistory> {
    try {
      const response = await fetch(`${this.baseURL}/history`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('Failed to fetch history, using mock:', error);
      // Mock response when backend is unavailable
      return {
        success: true,
        history: [
          {
            hash: 'a1b2c3d4e5f6789...mock',
            gaitData: 'mock-gait-data-1',
            timestamp: new Date(Date.now() - 60000).toISOString(),
            id: 1
          },
          {
            hash: 'f6e5d4c3b2a1987...mock',
            gaitData: 'mock-gait-data-2',
            timestamp: new Date(Date.now() - 120000).toISOString(),
            id: 2
          }
        ],
        count: 2,
        maxCount: 5
      };
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const result = await this.healthCheck();
      return result.status !== 'mock';
    } catch {
      return false;
    }
  }

  private generateMockHash(data: string): string {
    // Simple mock hash generation for demo purposes
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).padStart(16, '0') + 'mock';
  }
}