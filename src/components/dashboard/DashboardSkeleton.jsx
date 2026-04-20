import React from 'react'

/** Skeleton saat dashboard data masih di-fetch (Suspense / loading segment). */
export default function DashboardSkeleton() {
    return (
        <div className="row g-3" aria-busy="true">
            {[1, 2, 3].map((i) => (
                <div key={i} className="col-md-4">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="placeholder-glow">
                                <span className="placeholder col-7 mb-2" />
                                <span className="placeholder col-4 mb-3" />
                                <span className="placeholder col-12" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            <div className="col-12">
                <div className="card border-0 shadow-sm">
                    <div className="card-body py-5">
                        <div className="placeholder-glow">
                            <span className="placeholder col-6 mb-3" />
                            <span className="placeholder col-12 mb-2" />
                            <span className="placeholder col-10 mb-2" />
                            <span className="placeholder col-8" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
