import React from 'react'
import { FiFacebook, FiGithub, FiGlobe, FiLinkedin, FiLock, FiSettings, FiTwitter, FiUserCheck, FiUsers, FiYoutube } from 'react-icons/fi'
import Dropdown from '@/components/shared/Dropdown'
export const customerProfileOption = [
    { label: "Only Me", icon: <FiLock /> },
    { label: "Everyone", icon: <FiGlobe /> },
    { label: "Anonymous", icon: <FiUsers /> },
    { label: "People I Follow", icon: <FiUserCheck /> },
    { label: "Custom Selections Ever", icon: <FiSettings /> },
]
const CustomerSocalMedia = () => {
    return (
        <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent border-bottom pb-3">
                <div className="d-flex align-items-center justify-content-between">
                    <h5 className="card-title mb-0 fw-bold">Social Media</h5>
                    <Dropdown dropdownItems={customerProfileOption} triggerPosition='25,25' dropdownMenuStyle={"wd-250"} />
                </div>
            </div>
            <div className="card-body p-4">
                <div className="d-flex align-items-center mb-3 p-3 rounded-3 border border-gray-200 hover-shadow-sm transition-sm">
                    <div className="avatar-text bg-soft-primary text-primary rounded-circle me-3" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FiFacebook size={18} />
                    </div>
                    <div className="flex-grow-1">
                        <p className="mb-0 small fw-medium">Facebook</p>
                        <a href="https://www.facebook.com/wrapcoders" target="_blank" className="small text-muted text-decoration-none">facebook.com/wrapcoders</a>
                    </div>
                </div>
                <div className="d-flex align-items-center mb-3 p-3 rounded-3 border border-gray-200 hover-shadow-sm transition-sm">
                    <div className="avatar-text bg-soft-info text-info rounded-circle me-3" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FiTwitter size={18} />
                    </div>
                    <div className="flex-grow-1">
                        <p className="mb-0 small fw-medium">Twitter</p>
                        <a href="https://www.twitter.com/wrapcoders" target="_blank" className="small text-muted text-decoration-none">twitter.com/wrapcoders</a>
                    </div>
                </div>
                <div className="d-flex align-items-center mb-3 p-3 rounded-3 border border-gray-200 hover-shadow-sm transition-sm">
                    <div className="avatar-text bg-dark text-white rounded-circle me-3" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FiGithub size={18} />
                    </div>
                    <div className="flex-grow-1">
                        <p className="mb-0 small fw-medium">GitHub</p>
                        <a href="https://www.github.com/wrapcoders" target="_blank" className="small text-muted text-decoration-none">github.com/wrapcoders</a>
                    </div>
                </div>
                <div className="d-flex align-items-center mb-3 p-3 rounded-3 border border-gray-200 hover-shadow-sm transition-sm">
                    <div className="avatar-text bg-soft-primary text-primary rounded-circle me-3" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FiLinkedin size={18} />
                    </div>
                    <div className="flex-grow-1">
                        <p className="mb-0 small fw-medium">LinkedIn</p>
                        <a href="https://www.linkedin.com/wrapcoders" target="_blank" className="small text-muted text-decoration-none">linkedin.com/wrapcoders</a>
                    </div>
                </div>
                <div className="d-flex align-items-center p-3 rounded-3 border border-gray-200 hover-shadow-sm transition-sm">
                    <div className="avatar-text bg-soft-danger text-danger rounded-circle me-3" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FiYoutube size={18} />
                    </div>
                    <div className="flex-grow-1">
                        <p className="mb-0 small fw-medium">YouTube</p>
                        <a href="https://www.youtube.com/wrapcoders" target="_blank" className="small text-muted text-decoration-none">youtube.com/wrapcoders</a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CustomerSocalMedia