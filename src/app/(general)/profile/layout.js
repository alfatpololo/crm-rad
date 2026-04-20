import EduvaltPublicStylesLinks from '@/components/landing/EduvaltPublicStylesLinks'

/** Stylesheet Eduvalt untuk halaman profil (SSR, konsisten dengan katalog). */
export default function ProfileSegmentLayout({ children }) {
    return (
        <>
            <EduvaltPublicStylesLinks />
            {children}
        </>
    )
}
