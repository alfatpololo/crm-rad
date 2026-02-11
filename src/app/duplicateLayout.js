'use client'
import { usePathname } from "next/navigation";
import Header from "@/components/shared/header/Header";
import NavigationManu from "@/components/shared/navigationMenu/NavigationMenu";
import SupportDetails from "@/components/supportDetails";
import BottomNav from "@/components/shared/bottomNav/BottomNav";
import useBootstrapUtils from "@/hooks/useBootstrapUtils";
import { useAuth } from "@/context/AuthProvider";

export default function DuplicateLayout({ children }) {
    const pathName = usePathname()
    const { role } = useAuth()
    useBootstrapUtils(pathName)

    const isParticipant = role === 'participant'

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
    );
}
