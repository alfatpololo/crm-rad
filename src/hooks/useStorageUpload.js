'use client'
import { useState } from 'react'
import { storage } from '@/lib/firebase/config'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

/**
 * Hook for uploading images to Firebase Storage
 */
const useStorageUpload = () => {
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [uploadedUrl, setUploadedUrl] = useState(null)
    const [error, setError] = useState(null)

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

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024 // 5MB
        if (file.size > maxSize) {
            setError('Image size must be less than 5MB')
            return { success: false, error: 'Image size must be less than 5MB' }
        }

        setUploading(true)
        setError(null)
        setUploadProgress(0)

        try {
            // Generate unique filename using timestamp and random
            const fileExtension = file.name.split('.').pop()
            const timestamp = Date.now()
            const random = Math.random().toString(36).substring(2, 15)
            const fileName = `${timestamp}_${random}.${fileExtension}`
            const storageRef = ref(storage, `${folder}/${fileName}`)

            // Upload file
            const snapshot = await uploadBytes(storageRef, file)
            
            // Get download URL
            const downloadURL = await getDownloadURL(snapshot.ref)
            
            setUploadedUrl(downloadURL)
            setUploadProgress(100)
            setUploading(false)

            return { success: true, url: downloadURL }
        } catch (err) {
            console.error('Error uploading image:', err)
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
        uploading,
        uploadProgress,
        uploadedUrl,
        error,
        resetUpload
    }
}

export default useStorageUpload

