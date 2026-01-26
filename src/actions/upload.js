'use server';

import { storage } from '@/lib/firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

/**
 * Upload image to Firebase Storage
 * @param {File} file - Image file to upload
 * @param {string} folder - Folder path in storage (e.g., 'services', 'events')
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export async function uploadImage(file, folder = 'services') {
    try {
        if (!file) {
            return { success: false, error: 'No file provided' };
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return { success: false, error: 'File must be an image' };
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return { success: false, error: 'Image size must be less than 5MB' };
        }

        // Convert File to Blob for server-side upload
        // Since we're in server action, we need to handle file differently
        // For now, we'll handle this on client side and pass the URL
        // Or we can use base64 and upload directly

        // For server-side, we need to receive the file as base64 or Buffer
        // Let's use a different approach - handle upload on client side

        return { success: false, error: 'Upload must be handled on client side' };
    } catch (error) {
        console.error('Error uploading image:', error);
        return { success: false, error: error.message };
    }
}






