
import axios from 'axios';
import FormData from 'form-data';

const BUNNY_STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE || 'xoopost';
const BUNNY_API_KEY = process.env.BUNNY_API_KEY || 'b350ebbd-0842-4dbf-a8fd172137a0-708c-49e8';
const BUNNY_CDN_HOSTNAME = process.env.BUNNY_CDN_HOSTNAME || 'xoopost.b-cdn.net';
const BUNNY_STORAGE_API = `https://storage.bunnycdn.com/${BUNNY_STORAGE_ZONE}`;

export class BunnyService {
  private headers = {
    'AccessKey': BUNNY_API_KEY,
  };

  async uploadFile(fileName: string, fileBuffer: Buffer, contentType: string): Promise<string> {
    try {
      const uploadUrl = `${BUNNY_STORAGE_API}/${fileName}`;
      
      console.log('Uploading to BunnyCDN:', uploadUrl);
      console.log('File size:', fileBuffer.length, 'bytes');
      
      const response = await axios.put(uploadUrl, fileBuffer, {
        headers: {
          'AccessKey': BUNNY_API_KEY,
          'Content-Type': contentType,
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      });

      console.log('BunnyCDN upload successful:', response.status);
      return `https://${BUNNY_CDN_HOSTNAME}/${fileName}`;
    } catch (error: any) {
      console.error('BunnyCDN upload error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      let errorMessage = 'Failed to upload file to BunnyCDN';
      if (error.response?.status === 401) {
        errorMessage = 'Invalid BunnyCDN API Key - Please check your credentials';
      } else if (error.response?.status === 404) {
        errorMessage = 'Storage zone not found - Please verify zone name';
      } else if (error.response?.data) {
        errorMessage = `BunnyCDN Error: ${JSON.stringify(error.response.data)}`;
      }
      
      throw new Error(errorMessage);
    }
  }

  async deleteFile(fileName: string): Promise<boolean> {
    try {
      const deleteUrl = `${BUNNY_STORAGE_API}/${fileName}`;
      
      await axios.delete(deleteUrl, {
        headers: this.headers,
      });

      return true;
    } catch (error) {
      console.error('BunnyCDN delete error:', error);
      return false;
    }
  }

  getCdnUrl(fileName: string): string {
    return `https://${BUNNY_CDN_HOSTNAME}/${fileName}`;
  }

  async listFiles(path: string = ''): Promise<any[]> {
    try {
      const listUrl = `${BUNNY_STORAGE_API}/${path}`;
      
      const response = await axios.get(listUrl, {
        headers: {
          'AccessKey': BUNNY_API_KEY,
        },
      });

      return response.data;
    } catch (error) {
      console.error('BunnyCDN list error:', error);
      return [];
    }
  }
}

export const bunnyService = new BunnyService();
