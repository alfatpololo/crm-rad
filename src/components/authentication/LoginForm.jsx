'use client'
import Link from 'next/link'
import React, { useState } from 'react'
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import { createSession, createUserDocument } from '@/actions/auth'

const LoginForm = ({ registerPath, resetPath }) => {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)
    
    const googleProvider = new GoogleAuthProvider()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            const user = userCredential.user
            
            // Check if user is new or existing (for consistency with Google login)
            const isNewUser = user.metadata.creationTime === user.metadata.lastSignInTime
            
            if (isNewUser) {
                // Create user document in Firestore for new users
                const role = user.email === 'admin@mail.com' ? 'admin' : 'participant'
                const userDocResult = await createUserDocument(
                    user.uid,
                    user.email || '',
                    user.displayName || user.email?.split('@')[0] || 'User',
                    role
                )
                
                if (!userDocResult.success) {
                    console.error('Failed to create user document:', userDocResult.error)
                }
            }
            
            // Create session - ensure it's created before redirecting
            const idToken = await user.getIdToken()
            console.log('🔄 Creating session for user:', user.email)
            const result = await createSession(idToken)
            
            if (!result.success) {
                console.error('❌ Session creation failed:', result.error)
                throw new Error('Session creation failed. ' + result.error);
            }
            
            console.log('✅ Session created, user can proceed')

            Swal.fire({
                icon: 'success',
                title: 'Login Successful',
                text: `Welcome, ${user.displayName || user.email}!`,
                showConfirmButton: false,
                timer: 1500
            })
            router.push('/') // Redirect to dashboard
        } catch (error) {
            console.error('❌ Login error:', error)
            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: error.message || 'Failed to login'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true)
        try {
            const result = await signInWithPopup(auth, googleProvider)
            const user = result.user
            
            // Check if user is new or existing
            const isNewUser = result.user.metadata.creationTime === result.user.metadata.lastSignInTime
            
            if (isNewUser) {
                // Create user document in Firestore for new users
                const role = user.email === 'admin@mail.com' ? 'admin' : 'participant'
                const userDocResult = await createUserDocument(
                    user.uid,
                    user.email || '',
                    user.displayName || user.email?.split('@')[0] || 'User',
                    role
                )
                
                if (!userDocResult.success) {
                    console.error('Failed to create user document:', userDocResult.error)
                }
            }

            // Create session - ensure it's created before redirecting
            const idToken = await user.getIdToken()
            console.log('🔄 Creating session for user:', user.email)
            const sessionResult = await createSession(idToken)
            
            if (!sessionResult.success) {
                console.error('❌ Session creation failed:', sessionResult.error)
                throw new Error('Session creation failed. ' + sessionResult.error)
            }
            
            console.log('✅ Session created, user can proceed')

            Swal.fire({
                icon: 'success',
                title: 'Login Successful',
                text: `Welcome, ${user.displayName || user.email}!`,
                showConfirmButton: false,
                timer: 1500
            })
            
            router.push('/')
        } catch (error) {
            console.error('Google sign in error:', error)
            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: error.code === 'auth/popup-closed-by-user' 
                    ? 'Login cancelled' 
                    : error.message || 'Failed to sign in with Google'
            })
        } finally {
            setGoogleLoading(false)
        }
    }

    return (
        <>
            <h2 className="fs-20 fw-bolder mb-4">Login</h2>
            <h4 className="fs-13 fw-bold mb-2">Login to your account</h4>
            <p className="fs-12 fw-medium text-muted">Thank you for get back <strong>Nelel</strong> web applications, let's access our the best recommendation for you.</p>
            <form onSubmit={handleSubmit} className="w-100 mt-4 pt-2">
                <div className="mb-4">
                    <input
                        type="email"
                        className="form-control"
                        placeholder="Email or Username"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <input
                        type="password"
                        className="form-control"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="d-flex align-items-center justify-content-between">
                    <div>
                        <div className="custom-control custom-checkbox">
                            <input type="checkbox" className="custom-control-input" id="rememberMe" />
                            <label className="custom-control-label c-pointer" htmlFor="rememberMe">Remember Me</label>
                        </div>
                    </div>
                    <div>
                        <Link href={resetPath} className="fs-11 text-primary">Forget password?</Link>
                    </div>
                </div>
                <div className="mt-5">
                    <button type="submit" className="btn btn-lg btn-primary w-100" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </div>
            </form>
            <div className="w-100 mt-5 text-center mx-auto">
                <div className="mb-4 border-bottom position-relative"><span className="small py-1 px-3 text-uppercase text-muted bg-white position-absolute translate-middle">or</span></div>
                <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={googleLoading || loading}
                    className="btn btn-light w-100 d-flex align-items-center justify-content-center gap-2"
                >
                    {googleLoading ? (
                        <>
                            <span className="spinner-border spinner-border-sm" role="status"></span>
                            <span>Signing in...</span>
                        </>
                    ) : (
                        <>
                            <svg width="20" height="20" viewBox="0 0 24 24" className="me-1">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            <span>Continue with Google</span>
                        </>
                    )}
                </button>
            </div>
            <div className="mt-5 text-muted">
                <span> Don't have an account?</span>
                <Link href={registerPath} className="fw-bold"> Create an Account</Link>
            </div>
        </>
    )
}

export default LoginForm