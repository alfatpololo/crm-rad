import EduvaltPublicStylesLinks from '@/components/landing/EduvaltPublicStylesLinks'

export default function ProductsSegmentLayout({ children }) {
    return (
        <>
            <EduvaltPublicStylesLinks />
            {children}
        </>
    )
}
