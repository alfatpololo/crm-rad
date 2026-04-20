'use client'
import '@/lib/sharedAppGlobals'
import { usePathname } from "next/navigation";
import Header from "@/components/shared/header/Header";
import NavigationManu from "@/components/shared/navigationMenu/NavigationMenu";
import SupportDetails from "@/components/supportDetails";
import BottomNav from "@/components/shared/bottomNav/BottomNav";
import useBootstrapUtils from "@/hooks/useBootstrapUtils";
import { useAuth } from "@/context/AuthProvider";
import LmsMarketingShell from "@/components/landing/LmsMarketingShell";
import { radPageTitle } from "@/lib/radLandingContent";

function GeneralLayoutInner({ children }) {
    const pathName = usePathname()
    const { role } = useAuth()
    const isParticipant = role === 'participant'
    // Semua area katalog / Eduvalt public: tanpa Bootstrap JS dashboard (bentrok dengan menu template)
    const skipDashboardBootstrap =
        pathName === '/' ||
        pathName === '/services' ||
        pathName.startsWith('/services/') ||
        pathName === '/products' ||
        pathName.startsWith('/products/') ||
        (isParticipant && pathName === '/profile')
    useBootstrapUtils(skipDashboardBootstrap ? null : pathName)
    const isEduvaltProductsDetail = pathName.startsWith('/products/view')
    const isEduvaltServiceDetail = pathName.startsWith('/services/view')
    const isPublicCatalog =
        (pathName === '/services' ||
            pathName.startsWith('/services/') ||
            pathName === '/products' ||
            pathName.startsWith('/products/')) &&
        !isEduvaltProductsDetail &&
        !isEduvaltServiceDetail

    /* Homepage Eduvalt: cuma children (Eduvalt punya Layout sendiri), jangan chrome CRM */
    if (pathName === '/') {
        return <>{children}</>
    }

    // Katalog public: shell marketing LMS (navbar/footer), bukan chrome dashboard
    // Detail produk & detail kelas: Eduvalt Layout (navbar/footer sama seperti homepage)
    if (isEduvaltProductsDetail || isEduvaltServiceDetail) {
        return <>{children}</>
    }
    if (isPublicCatalog) {
        const catalogTitle = pathName.startsWith('/products')
            ? radPageTitle('Produk')
            : radPageTitle('Kelas')
        return <LmsMarketingShell headTitle={catalogTitle}>{children}</LmsMarketingShell>
    }

    /* Profil peserta: tampilan marketing Eduvalt (bukan chrome dashboard), bottom nav tetap */
    if (isParticipant && pathName === '/profile') {
        return (
            <>
                <LmsMarketingShell breadcrumbTitle="Profil" headTitle={radPageTitle('Profil')}>
                    {children}
                </LmsMarketingShell>
                <BottomNav />
            </>
        )
    }

    return (
        <>
            <Header />
            <NavigationManu />
            <div className={isParticipant ? 'layout-has-bottom-nav' : ''}>
                <main className="nxl-container">
                    <div className="nxl-content">
                        {children}
                    </div>
                </main>
            </div>
            <SupportDetails />
            {isParticipant && <BottomNav />}
        </>
    )
}

export default function Layout({ children }) {
    return <GeneralLayoutInner>{children}</GeneralLayoutInner>
}