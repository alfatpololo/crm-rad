'use client'
import React, { useState, useEffect } from 'react'
import { FiStar, FiUser, FiEdit3, FiTrash2, FiMoreHorizontal } from 'react-icons/fi'
import { useAuth } from '@/context/AuthProvider'
import { getServiceReviews, getUserReview, saveReview, deleteReview } from '@/actions/reviews'
import Swal from 'sweetalert2'
import { useRouter } from 'next/navigation'
import Dropdown from '@/components/shared/Dropdown'

const ServiceReviews = ({ serviceId }) => {
    const { user } = useAuth()
    const router = useRouter()
    const [reviews, setReviews] = useState([])
    const [userReview, setUserReview] = useState(null)
    const [averageRating, setAverageRating] = useState(0)
    const [ratingCount, setRatingCount] = useState(0)
    const [ratingDistribution, setRatingDistribution] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 })
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({ rating: 0, comment: '' })
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        loadReviews()
    }, [serviceId, user])

    const loadReviews = async () => {
        setLoading(true)
        try {
            const [reviewsData, userReviewData] = await Promise.all([
                getServiceReviews(serviceId),
                user ? getUserReview(serviceId) : Promise.resolve(null)
            ])

            setReviews(reviewsData.reviews || [])
            setAverageRating(reviewsData.averageRating || 0)
            setRatingCount(reviewsData.ratingCount || 0)
            setRatingDistribution(reviewsData.ratingDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 })
            setUserReview(userReviewData)
            
            if (userReviewData) {
                setFormData({
                    rating: userReviewData.rating || 0,
                    comment: userReviewData.comment || ''
                })
            }
        } catch (error) {
            console.error('Error loading reviews:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmitReview = async (e) => {
        e.preventDefault()
        
        if (!user) {
            Swal.fire({
                icon: 'warning',
                title: 'Login Diperlukan',
                text: 'Silakan login terlebih dahulu untuk memberikan review',
                confirmButtonColor: '#198754',
            })
            return
        }

        if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
            Swal.fire({
                icon: 'error',
                title: 'Rating Diperlukan',
                text: 'Silakan pilih rating terlebih dahulu',
                confirmButtonColor: '#dc3545',
            })
            return
        }

        setSubmitting(true)
        try {
            const result = await saveReview(serviceId, formData.rating, formData.comment)
            
            if (result.success) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: userReview ? 'Review berhasil diupdate' : 'Review berhasil ditambahkan',
                    confirmButtonColor: '#198754',
                })
                setShowForm(false)
                loadReviews()
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal',
                    text: result.error || 'Gagal menyimpan review',
                    confirmButtonColor: '#dc3545',
                })
            }
        } catch (error) {
            console.error('Error submitting review:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Terjadi kesalahan saat menyimpan review',
                confirmButtonColor: '#dc3545',
            })
        } finally {
            setSubmitting(false)
        }
    }

    const handleDeleteReview = async (reviewId) => {
        const result = await Swal.fire({
            title: 'Hapus Review?',
            text: 'Anda yakin ingin menghapus review ini?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
        })

        if (result.isConfirmed) {
            try {
                const deleteResult = await deleteReview(reviewId)
                if (deleteResult.success) {
                    await Swal.fire({
                        icon: 'success',
                        title: 'Berhasil!',
                        text: 'Review berhasil dihapus',
                        confirmButtonColor: '#198754',
                    })
                    loadReviews()
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Gagal',
                        text: deleteResult.error || 'Gagal menghapus review',
                        confirmButtonColor: '#dc3545',
                    })
                }
            } catch (error) {
                console.error('Error deleting review:', error)
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Terjadi kesalahan saat menghapus review',
                    confirmButtonColor: '#dc3545',
                })
            }
        }
    }

    const renderStars = (rating, interactive = false, onRatingChange = null) => {
        return (
            <div className="d-flex align-items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        onClick={() => interactive && onRatingChange && onRatingChange(star)}
                        style={{ 
                            cursor: interactive ? 'pointer' : 'default',
                            color: star <= rating ? '#ffc107' : '#e0e0e0',
                            fontSize: '20px'
                        }}
                    >
                        <FiStar fill={star <= rating ? '#ffc107' : 'none'} />
                    </span>
                ))}
            </div>
        )
    }

    if (loading) {
        return (
            <div className="card">
                <div className="card-body text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Rating & Ulasan</h5>
                {user && !userReview && (
                    <button
                        className="btn btn-sm btn-primary"
                        onClick={() => setShowForm(true)}
                    >
                        Tulis Review
                    </button>
                )}
            </div>
            <div className="card-body">
                {/* Rating Summary */}
                <div className="row mb-4">
                    <div className="col-md-4 text-center mb-3 mb-md-0">
                        <div className="mb-2">
                            <h2 className="fw-bold mb-0">{averageRating.toFixed(1)}</h2>
                            <div className="d-flex justify-content-center">
                                {renderStars(Math.round(averageRating))}
                            </div>
                            <p className="text-muted small mb-0 mt-2">Dari {ratingCount} ulasan</p>
                        </div>
                    </div>
                    <div className="col-md-8">
                        {[5, 4, 3, 2, 1].map((star) => {
                            const count = ratingDistribution[star] || 0
                            const percentage = ratingCount > 0 ? (count / ratingCount) * 100 : 0
                            return (
                                <div key={star} className="d-flex align-items-center mb-2">
                                    <div className="d-flex align-items-center" style={{ width: '60px' }}>
                                        <span className="small me-2">{star}</span>
                                        <FiStar size={14} className="text-warning" />
                                    </div>
                                    <div className="flex-grow-1 mx-2">
                                        <div className="progress" style={{ height: '8px' }}>
                                            <div 
                                                className="progress-bar bg-warning" 
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                    <span className="small text-muted" style={{ width: '40px', textAlign: 'right' }}>
                                        {count}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Review Form */}
                {showForm && (
                    <div className="border rounded p-3 mb-4 bg-light">
                        <h6 className="mb-3">{userReview ? 'Edit Review' : 'Tulis Review'}</h6>
                        <form onSubmit={handleSubmitReview}>
                            <div className="mb-3">
                                <label className="form-label">Rating</label>
                                <div>
                                    {renderStars(formData.rating, true, (rating) => {
                                        setFormData({ ...formData, rating })
                                    })}
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Komentar</label>
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    placeholder="Bagikan pengalaman Anda..."
                                    value={formData.comment}
                                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                />
                            </div>
                            <div className="d-flex gap-2">
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={submitting || !formData.rating}
                                >
                                    {submitting ? 'Menyimpan...' : (userReview ? 'Update Review' : 'Kirim Review')}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-light"
                                    onClick={() => {
                                        setShowForm(false)
                                        if (userReview) {
                                            setFormData({
                                                rating: userReview.rating || 0,
                                                comment: userReview.comment || ''
                                            })
                                        } else {
                                            setFormData({ rating: 0, comment: '' })
                                        }
                                    }}
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* User's Review (if exists and form not shown) */}
                {userReview && !showForm && (
                    <div className="border rounded p-3 mb-4 bg-soft-primary">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                                <h6 className="mb-1">Review Anda</h6>
                                {renderStars(userReview.rating)}
                            </div>
                            <div className="d-flex gap-2">
                                <button
                                    className="btn btn-sm btn-light"
                                    onClick={() => setShowForm(true)}
                                >
                                    <FiEdit3 size={14} />
                                </button>
                                <button
                                    className="btn btn-sm btn-light text-danger"
                                    onClick={() => handleDeleteReview(userReview.id)}
                                >
                                    <FiTrash2 size={14} />
                                </button>
                            </div>
                        </div>
                        {userReview.comment && (
                            <p className="mb-0 text-muted">{userReview.comment}</p>
                        )}
                        <small className="text-muted">
                            {new Date(userReview.createdAt).toLocaleDateString('id-ID')}
                            {userReview.updatedAt !== userReview.createdAt && ' (Diupdate)'}
                        </small>
                    </div>
                )}

                {/* Reviews List */}
                <div>
                    <h6 className="mb-3">Semua Ulasan ({reviews.length})</h6>
                    {reviews.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="text-muted mb-0">Belum ada ulasan</p>
                        </div>
                    ) : (
                        <div className="list-unstyled">
                            {reviews.map((review) => (
                                <div key={review.id} className="border-bottom pb-3 mb-3">
                                    <div className="d-flex align-items-start gap-3">
                                        <div className="flex-shrink-0">
                                            {review.participant?.photoURL ? (
                                                <img
                                                    src={review.participant.photoURL}
                                                    alt={review.participant.name}
                                                    width={40}
                                                    height={40}
                                                    className="rounded-circle"
                                                    style={{ objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div className="avatar-text avatar-md bg-soft-primary text-primary rounded-circle" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <FiUser size={20} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <div>
                                                    <h6 className="mb-1">{review.participant?.name || 'Anonymous'}</h6>
                                                    {renderStars(review.rating)}
                                                </div>
                                                {user && user.uid === review.participantId && (
                                                    <Dropdown
                                                        dropdownItems={[
                                                            { label: 'Edit', icon: <FiEdit3 /> },
                                                            { type: 'divider' },
                                                            { label: 'Delete', icon: <FiTrash2 /> }
                                                        ]}
                                                        triggerIcon={<FiMoreHorizontal />}
                                                        triggerClass="btn btn-sm btn-light"
                                                        onClick={(label) => {
                                                            if (label === 'Edit') {
                                                                setFormData({
                                                                    rating: review.rating,
                                                                    comment: review.comment
                                                                })
                                                                setShowForm(true)
                                                            } else if (label === 'Delete') {
                                                                handleDeleteReview(review.id)
                                                            }
                                                        }}
                                                        id={review.id}
                                                    />
                                                )}
                                            </div>
                                            {review.comment && (
                                                <p className="mb-2 text-muted">{review.comment}</p>
                                            )}
                                            <small className="text-muted">
                                                {new Date(review.createdAt).toLocaleDateString('id-ID', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ServiceReviews

