import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import Footer from '@/components/shared/Footer'
import QRCodePage from '@/components/qrcode/QRCodePage'
// import { FiQrCode } from 'react-icons/fi'

export const dynamic = 'force-dynamic'

const QRCodeViewPage = ({ params }) => {
    return (
        <>
            <PageHeader>
                <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
                    <span className="text-primary" style={{ fontSize: '22px' }}>
                        <i className="fas fa-qrcode" aria-hidden />
                    </span>
                    <h4 className="mb-0">QR Code Kehadiran</h4>
                </div>
            </PageHeader>
            <div className='main-content'>
                <div className='row'>
                    <div className="col-lg-12">
                        <QRCodePage serviceId={params.id} />
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default QRCodeViewPage



