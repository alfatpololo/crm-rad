'use client'
import { useState } from 'react'

/**
 * Hook for uploading images to Cloudinary
 * Alternative to Firebase Storage - FREE tier: 25GB storage, 25GB bandwidth/month
 * Upload langsung dari client ke Cloudinary (lebih efisien)
 */
const useCloudinaryUpload = () => {
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [uploadedUrl, setUploadedUrl] = useState(null)
    const [error, setError] = useState(null)

    /**
     * Upload file langsung ke Cloudinary dari client
     * Menggunakan unsigned upload preset (tidak perlu API Secret)
     */
    const uploadImage = async (file, folder = 'services') => {
        if (!file) {
            setError('No file selected')
            return { success: false, error: 'No file selected' }
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('File must be an image')
            return { success: false, error: 'File must be an image' }
        }

        // Validate file size (max 10MB - Cloudinary free tier allows up to 10MB)
        const maxSize = 10 * 1024 * 1024 // 10MB
        if (file.size > maxSize) {
            setError('Image size must be less than 10MB')
            return { success: false, error: 'Image size must be less than 10MB' }
        }

        // Get Cloudinary config from environment (client-side accessible)
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default'

        if (!cloudName) {
            setError('Cloudinary not configured. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME')
            return { success: false, error: 'Cloudinary cloud name not configured' }
        }

        setUploading(true)
        setError(null)
        setUploadProgress(0)

        try {
            // Prepare form data
            setUploadProgress(10)
            const formData = new FormData()
            formData.append('file', file)
            formData.append('upload_preset', uploadPreset)
            if (folder) {
                formData.append('folder', folder)
            }

            // Upload directly to Cloudinary
            setUploadProgress(30)
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            )

            setUploadProgress(70)

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error?.message || 'Upload failed')
            }

            const data = await response.json()
            
            setUploadedUrl(data.secure_url)
            setUploadProgress(100)
            setUploading(false)

            return { 
                success: true, 
                url: data.secure_url,
                publicId: data.public_id,
            }
        } catch (err) {
            console.error('Error uploading image:', err)
            setError(err.message)
            setUploading(false)
            return { success: false, error: err.message }
        }
    }

    /**
     * Upload PDF (e.g. CV, Ijazah) to Cloudinary - uses raw upload
     */
    const uploadPdf = async (file, folder = 'participant-docs') => {
        if (!file) {
            setError('No file selected')
            return { success: false, error: 'No file selected' }
        }
        if (file.type !== 'application/pdf') {
            setError('File harus format PDF')
            return { success: false, error: 'File harus format PDF' }
        }
        const maxSize = 10 * 1024 * 1024 // 10MB
        if (file.size > maxSize) {
            setError('Ukuran file maksimal 10MB')
            return { success: false, error: 'Ukuran file maksimal 10MB' }
        }
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default'
        if (!cloudName) {
            setError('Cloudinary not configured')
            return { success: false, error: 'Cloudinary not configured' }
        }
        setUploading(true)
        setError(null)
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('upload_preset', uploadPreset)
            if (folder) formData.append('folder', folder)
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
                { method: 'POST', body: formData }
            )
            if (!response.ok) {
                const errData = await response.json()
                throw new Error(errData.error?.message || 'Upload gagal')
            }
            const data = await response.json()
            setUploading(false)
            return { success: true, url: data.secure_url, publicId: data.public_id }
        } catch (err) {
            setError(err.message)
            setUploading(false)
            return { success: false, error: err.message }
        }
    }

    const resetUpload = () => {
        setUploading(false)
        setUploadProgress(0)
        setUploadedUrl(null)
        setError(null)
    }

    return {
        uploadImage,
        uploadPdf,
        uploading,
        uploadProgress,
        uploadedUrl,
        error,
        resetUpload
    }
}

export default useCloudinaryUpload

