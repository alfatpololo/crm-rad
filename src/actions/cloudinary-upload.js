'use server';

/**
 * Upload image to Cloudinary (using base64)
 * Note: For unsigned upload preset, we don't need API Secret
 * @param {string} base64Image - Base64 encoded image string
 * @param {string} folder - Folder path in Cloudinary (e.g., 'services', 'events')
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export async function uploadImageToCloudinary(base64Image, folder = 'services') {
    try {
        if (!base64Image) {
            return { success: false, error: 'No image provided' };
        }

        // Get Cloudinary credentials (only need cloudName for unsigned upload)
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || 'ml_default';

        if (!cloudName) {
            return { success: false, error: 'Cloudinary cloud name not configured' };
        }

        // Extract base64 data (remove data:image/...;base64, prefix if present)
        const base64Data = base64Image.includes(',') 
            ? base64Image.split(',')[1] 
            : base64Image;

        // Prepare form data for Cloudinary
        const formData = new FormData();
        formData.append('file', `data:image/jpeg;base64,${base64Data}`);
        formData.append('upload_preset', uploadPreset);
        if (folder) {
            formData.append('folder', folder);
        }

        // Upload to Cloudinary
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Upload failed');
        }

        const data = await response.json();

        return {
            success: true,
            url: data.secure_url,
            publicId: data.public_id,
        };
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        return { success: false, error: error.message || 'Upload failed' };
    }
}

/**
 * Upload file to Cloudinary (using signed upload - more secure)
 * Note: For signed upload, we need to generate signature on server side
 */
export async function getCloudinaryUploadSignature(folder = 'services') {
    try {
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        if (!cloudName || !apiKey || !apiSecret) {
            return { success: false, error: 'Cloudinary credentials not configured' };
        }

        // Generate timestamp
        const timestamp = Math.round(new Date().getTime() / 1000);

        // For signed upload, you would generate signature here
        // This is a simplified version - for production, implement proper signature generation

        return {
            success: true,
            cloudName,
            apiKey,
            folder,
            timestamp,
        };
    } catch (error) {
        console.error('Error generating upload signature:', error);
        return { success: false, error: error.message };
    }
}

