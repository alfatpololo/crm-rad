import { redirect } from 'next/navigation'

/** Alias URL “/merch” → katalog merch di LMS (`/products`). */
export default function MerchRedirectPage() {
    redirect('/products')
}
