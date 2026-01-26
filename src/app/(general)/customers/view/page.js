'use client'
import React, { useEffect, useState, Suspense } from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import CustomersViewHeader from '@/components/customersView/CustomersViewHeader'
import CustomerContent from '@/components/customersView/CustomerContent'
import { useSearchParams } from 'next/navigation'
import { getParticipantDetailForAdmin } from '@/actions/admin'
import { useAuth } from '@/context/AuthProvider'

const CustomerViewContent = () => {
  const searchParams = useSearchParams()
  const participantId = searchParams.get('id')
  const { role } = useAuth()
  const [participantDetail, setParticipantDetail] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDetail = async () => {
      if (!participantId) {
        setLoading(false)
        return
      }

      try {
        // If admin, fetch detailed data
        if (role === 'admin') {
          const result = await getParticipantDetailForAdmin(participantId)
          if (result && !result.error) {
            setParticipantDetail(result)
          }
        }
      } catch (error) {
        console.error('Error fetching participant detail:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDetail()
  }, [participantId, role])

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <PageHeader>
        <CustomersViewHeader />
      </PageHeader>
      <div className='main-content'>
        <div className='row'>
          {role === 'admin' && participantDetail ? (
            <AdminParticipantDetail data={participantDetail} />
          ) : (
            <CustomerContent />
          )}
        </div>
      </div>
    </>
  )
}

const page = () => {
  return (
    <Suspense fallback={
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    }>
      <CustomerViewContent />
    </Suspense>
  )
}

// Admin view with detailed participant info
const AdminParticipantDetail = ({ data }) => {
  const { participant, enrolledClasses, completedClasses, invoices, certificates, attendanceHistory } = data

  return (
    <>
      <div className="col-xxl-12">
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-transparent border-bottom pb-3">
            <h5 className="card-title mb-0 fw-bold">Detail Peserta</h5>
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-md-6 mb-3">
                <p className="text-muted small mb-1">Nama</p>
                <p className="fw-bold mb-0">{participant.name}</p>
              </div>
              <div className="col-md-6 mb-3">
                <p className="text-muted small mb-1">Email</p>
                <p className="fw-bold mb-0">{participant.email}</p>
              </div>
              <div className="col-md-6 mb-3">
                <p className="text-muted small mb-1">Phone</p>
                <p className="fw-bold mb-0">{participant.phone || '-'}</p>
              </div>
              <div className="col-md-6 mb-3">
                <p className="text-muted small mb-1">Alamat</p>
                <p className="fw-bold mb-0">{participant.address || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enrolled Classes */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-transparent border-bottom pb-3">
            <h5 className="card-title mb-0 fw-bold">Kelas yang Dibeli ({enrolledClasses.length})</h5>
          </div>
          <div className="card-body p-4">
            {enrolledClasses.length === 0 ? (
              <p className="text-muted mb-0">Belum ada kelas yang dibeli</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Nama Kelas</th>
                      <th>Tanggal Beli</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrolledClasses.map((cls, index) => (
                      <tr key={index}>
                        <td>{cls.name || cls.title || cls.id}</td>
                        <td>{cls.purchaseDate ? new Date(cls.purchaseDate).toLocaleDateString() : '-'}</td>
                        <td>
                          <span className="badge bg-soft-primary text-primary">Terdaftar</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Completed Classes */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-transparent border-bottom pb-3">
            <h5 className="card-title mb-0 fw-bold">Kelas yang Diikuti ({completedClasses.length})</h5>
          </div>
          <div className="card-body p-4">
            {completedClasses.length === 0 ? (
              <p className="text-muted mb-0">Belum ada kelas yang selesai</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Nama Kelas</th>
                      <th>Tanggal Selesai</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedClasses.map((cls, index) => (
                      <tr key={index}>
                        <td>{cls.name || cls.title || cls.id}</td>
                        <td>{cls.completedDate ? new Date(cls.completedDate).toLocaleDateString() : '-'}</td>
                        <td>
                          <span className="badge bg-soft-success text-success">Selesai</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Invoices/Purchases */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-transparent border-bottom pb-3">
            <h5 className="card-title mb-0 fw-bold">Riwayat Pembelian ({invoices.length})</h5>
          </div>
          <div className="card-body p-4">
            {invoices.length === 0 ? (
              <p className="text-muted mb-0">Belum ada riwayat pembelian</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Invoice #</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td className="fw-medium">{invoice.invoiceNumber}</td>
                        <td>
                          {invoice.items && invoice.items.length > 0 ? (
                            <div>
                              {invoice.items.slice(0, 2).map((item, idx) => (
                                <span key={idx} className="badge bg-soft-info me-1">
                                  {item.name || item.title} (x{item.qty || 1})
                                </span>
                              ))}
                              {invoice.items.length > 2 && (
                                <span className="text-muted small">+{invoice.items.length - 2} lainnya</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td className="fw-bold">{invoice.grandTotal ? `Rp ${parseFloat(invoice.grandTotal).toLocaleString('id-ID')}` : '-'}</td>
                        <td>
                          <span className={`badge ${
                            invoice.status === 'paid' ? 'bg-soft-success text-success' :
                            invoice.status === 'pending' ? 'bg-soft-warning text-warning' :
                            'bg-soft-danger text-danger'
                          }`}>
                            {invoice.status || 'pending'}
                          </span>
                        </td>
                        <td>{invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default page
