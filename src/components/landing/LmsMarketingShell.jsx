'use client'

import Layout from '@/eduvalt/components/layout/Layout'

/**
 * Shell katalog publik (/services, /products): navbar + footer sama seperti home.
 * CSS Eduvalt dimuat lewat layout segment `(general)/services` & `products` (SSR) — tanpa FOUC / bentrok urutan load.
 */
export default function LmsMarketingShell({ children }) {
    return (
        <Layout headerStyle={1} footerStyle={1} headerTransparent={false}>
            {children}
        </Layout>
    )
}
