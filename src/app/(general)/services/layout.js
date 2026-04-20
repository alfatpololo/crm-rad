import EduvaltPublicStylesLinks from '@/components/landing/EduvaltPublicStylesLinks'

export default function ServicesSegmentLayout({ children }) {
    return (
        <>
            <EduvaltPublicStylesLinks />
            {children}
        </>
    )
}
