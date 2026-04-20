import { EDUVALT_PUBLIC_STYLESHEET_HREFS } from '@/lib/eduvaltPublicStylesheetHrefs'

/**
 * Stylesheet Eduvalt untuk katalog/dedetail — sama seperti `(general)/page.js`.
 * Dipakai di layout segment supaya SSR (tanpa FOUC). Marker untuk skip inject client.
 */
export default function EduvaltPublicStylesLinks() {
    return (
        <>
            {EDUVALT_PUBLIC_STYLESHEET_HREFS.map((href) => (
                <link key={href} rel="stylesheet" href={href} data-eduvalt-public-styles="1" />
            ))}
        </>
    )
}
