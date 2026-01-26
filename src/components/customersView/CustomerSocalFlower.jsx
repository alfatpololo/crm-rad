import React from 'react'
import { customerProfileOption } from './CustomerSocalMedia'
import Dropdown from '@/components/shared/Dropdown'
import { FiUserPlus } from 'react-icons/fi'
import { teamMembersList } from '@/utils/fackData/teamMembersList'

const CustomerSocalFlower = () => {
    return (
        <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent border-bottom pb-3">
                <div className="d-flex align-items-center justify-content-between">
                    <h5 className="card-title mb-0 fw-bold">Suggestions</h5>
                    <Dropdown dropdownItems={customerProfileOption} triggerPosition='25,25' dropdownMenuStyle={"wd-250"} />
                </div>
            </div>
            <div className="card-body p-4">
                {
                    teamMembersList.map(({ id, name, position, thumbnail }, index) => (
                        <div key={id} className={`d-flex align-items-center ${index !== teamMembersList.length - 1 ? 'mb-3 pb-3 border-bottom' : ''}`}>
                            <div className="avatar-image flex-shrink-0 me-3" style={{ width: '48px', height: '48px' }}>
                                <img src={thumbnail} className="img-fluid rounded-circle" alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div className="flex-grow-1">
                                <h6 className="fs-14 fw-bold mb-1">{name}</h6>
                                <p className="fs-12 text-muted mb-0">{position}</p>
                            </div>
                            <div className="flex-shrink-0 ms-2">
                                <a href="#" className="btn btn-sm btn-light-primary btn-icon rounded-circle" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FiUserPlus size={14} />
                                </a>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default CustomerSocalFlower