import LoginForm from '@/components/authentication/LoginForm'
import Image from 'next/image'
import React, { Suspense } from 'react'

const page = () => {
    return (
        <main className="auth-cover-wrapper">
            <div className="auth-cover-content-inner">
                <div className="auth-cover-content-wrapper">
                    <div className="auth-img">
                        <Image width={600} height={600} sizes='100vw' src="/images/auth/auth-cover-login-bg.svg" alt="img" className="img-fluid" />
                    </div>
                </div>
            </div>
            <div className="auth-cover-sidebar-inner">
                <div className="auth-cover-card-wrapper">
                    <div className="auth-cover-card p-sm-5">
                        <div className="wd-50 mb-5">
                            <img src="/images/logo/logo-rad-e1768539218966.webp" alt='img' className="img-fluid" />
                        </div>
                        <Suspense fallback={<div className="text-center py-4"><span className="spinner-border spinner-border-sm" /></div>}>
                            <LoginForm registerPath={"/authentication/register/cover"} resetPath={"/authentication/reset/cover"} />
                        </Suspense>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default page