'use client'
import React from 'react'
import TabProfile from './TabProfile'
import TabPassword from './TabPassword'
import TabBilling from './TabBilling'
import TabNotificationsContent from '../customersView/TabNotificationsContent'
import TabConnections from '../customersView/TabConnections'
import TabBillingContent from '../customersView/TabBillingContent'

import { createParticipant } from '@/actions/participants'
import { useFormStatus } from 'react-dom'
import { useEffect, useRef } from 'react'
import Swal from 'sweetalert2'

const CustomerCreateContent = () => {
    const formRef = useRef(null)

    async function handleSubmit(formData) {
        const result = await createParticipant({
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            company: formData.get('company'),
            designation: formData.get('designation'),
            website: formData.get('website'),
            vat: formData.get('vat'),
            address: formData.get('address'),
            description: formData.get('description'),
            country: formData.get('country'),
            state: formData.get('state'),
            city: formData.get('city'),
            status: formData.get('status'),
            // ... map other fields as needed
        })

        if (result?.success) {
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Customer created successfully',
            })
            // Reset form or redirect
            // formRef.current?.reset() 
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: result?.error || 'Failed to create customer',
            })
        }
    }

    return (
        <div className="col-lg-12">
            <div className="card border-top-0">
                <form id="customer-form" action={handleSubmit} ref={formRef}>
                    <div className="card-header p-0">
                        <ul className="nav nav-tabs flex-wrap w-100 text-center customers-nav-tabs" id="myTab" role="tablist">
                            <li className="nav-item flex-fill border-top" role="presentation">
                                <a href="$" className="nav-link active" data-bs-toggle="tab" data-bs-target="#profileTab" role="tab">Profile</a>
                            </li>
                            <li className="nav-item flex-fill border-top" role="presentation">
                                <a href="$" className="nav-link" data-bs-toggle="tab" data-bs-target="#passwordTab" role="tab">Password</a>
                            </li>
                            <li className="nav-item flex-fill border-top" role="presentation">
                                <a href="$" className="nav-link" data-bs-toggle="tab" data-bs-target="#billingTab" role="tab">Billing & Shipping</a>
                            </li>
                            <li className="nav-item flex-fill border-top" role="presentation">
                                <a href="$" className="nav-link" data-bs-toggle="tab" data-bs-target="#subscriptionTab" role="tab">Subscription</a>
                            </li>
                            <li className="nav-item flex-fill border-top" role="presentation">
                                <a href="$" className="nav-link" data-bs-toggle="tab" data-bs-target="#notificationsTab" role="tab">Notifications</a>
                            </li>
                            <li className="nav-item flex-fill border-top" role="presentation">
                                <a href="$" className="nav-link" data-bs-toggle="tab" data-bs-target="#connectionTab" role="tab">Connection</a>
                            </li>
                        </ul>
                    </div>
                    <div className="tab-content">
                        <TabProfile />
                        <TabPassword />
                        <TabBilling />
                        <div className="tab-pane fade" id="subscriptionTab" role="tabpanel">
                            <TabBillingContent />
                        </div>
                        <TabNotificationsContent />
                        <TabConnections />
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CustomerCreateContent