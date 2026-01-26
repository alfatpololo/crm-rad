'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import { createProduct } from '@/actions/masterData'

const ProductCreate = () => {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.target)

        const data = {
            name: formData.get('name'),
            description: formData.get('description'),
            price: parseFloat(formData.get('price')),
            stock: parseInt(formData.get('stock')),
            category: formData.get('category'),
            status: 'active'
        }

        const result = await createProduct(data)

        if (result.success) {
            Swal.fire('Success', 'Product created successfully', 'success')
            router.push('/master-data/products')
        } else {
            Swal.fire('Error', result.error, 'error')
        }
        setLoading(false)
    }

    return (
        <div className="col-lg-12">
            <div className="card border-top-0">
                <div className="card-header p-0">
                    <ul className="nav nav-tabs flex-wrap w-100 text-center" role="tablist">
                        <li className="nav-item flex-fill border-top">
                            <a className="nav-link active">Product Details</a>
                        </li>
                    </ul>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="row mb-4">
                            <label className="col-md-4 col-form-label">Product Name</label>
                            <div className="col-md-8">
                                <input name="name" type="text" className="form-control" required />
                            </div>
                        </div>
                        <div className="row mb-4">
                            <label className="col-md-4 col-form-label">Price</label>
                            <div className="col-md-8">
                                <input name="price" type="number" className="form-control" required />
                            </div>
                        </div>
                        <div className="row mb-4">
                            <label className="col-md-4 col-form-label">Stock</label>
                            <div className="col-md-8">
                                <input name="stock" type="number" className="form-control" defaultValue="0" required />
                            </div>
                        </div>
                        <div className="row mb-4">
                            <label className="col-md-4 col-form-label">Category</label>
                            <div className="col-md-8">
                                <input name="category" type="text" className="form-control" placeholder="e.g., Merchandise" />
                            </div>
                        </div>
                        <div className="row mb-4">
                            <label className="col-md-4 col-form-label">Description</label>
                            <div className="col-md-8">
                                <textarea name="description" className="form-control" rows="4"></textarea>
                            </div>
                        </div>
                        <div className="d-flex justify-content-end gap-2">
                            <button type="button" className="btn btn-light" onClick={() => router.back()}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Product'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ProductCreate
