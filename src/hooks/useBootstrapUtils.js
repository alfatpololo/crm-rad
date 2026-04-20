'use client'
import { useEffect } from 'react'

const bootstrapLoadedRef = { current: false }

/**
 * @param {string | null | undefined} pathName - Pass `null` pada halaman full Eduvalt (landing/detail) supaya tidak load Bootstrap JS yang bentrok dengan menu template.
 */
const useBootstrapUtils = (pathName) => {
    const enabled = pathName != null && pathName !== ''

    // Sekali saat mount: load Bootstrap + tooltip. Jangan hook per pathName — dulu tiap klik navigasi
    // import ulang + nambah listener tanpa cleanup → aplikasi makin berat sampai klik tidak respons.
    useEffect(() => {
        if (!enabled) return

        let cancelled = false

        const initBootstrap = async () => {
            try {
                if (!bootstrapLoadedRef.current) {
                    await import('bootstrap/dist/js/bootstrap.bundle.min')
                    if (cancelled) return
                    bootstrapLoadedRef.current = true
                }

                if (typeof window === 'undefined' || typeof document === 'undefined') return

                tooltip()
                fixBootstrapComponents()
            } catch (error) {
                console.error('Error initializing Bootstrap:', error)
            }
        }

        initBootstrap()

        return () => {
            cancelled = true
        }
    }, [enabled])

    // Hanya refresh attribute modal/offcanvas saat route berubah (tanpa nambah listener baru berkali-kali)
    useEffect(() => {
        if (!enabled) return
        fixBootstrapComponents()
    }, [enabled, pathName])
}

export default useBootstrapUtils

function fixBootstrapComponents() {
    try {
        const modals = document.querySelectorAll('[data-bs-toggle="modal"]')
        modals.forEach((modal) => {
            const target = modal.getAttribute('data-bs-target')
            if (target) {
                const modalElement = document.querySelector(target)
                if (modalElement && !modalElement.hasAttribute('data-bs-backdrop')) {
                    modalElement.setAttribute('data-bs-backdrop', 'true')
                }
            }
        })

        const offcanvas = document.querySelectorAll('[data-bs-toggle="offcanvas"]')
        offcanvas.forEach((canvas) => {
            const target = canvas.getAttribute('data-bs-target')
            if (target) {
                const canvasElement = document.querySelector(target)
                if (canvasElement && !canvasElement.hasAttribute('data-bs-backdrop')) {
                    canvasElement.setAttribute('data-bs-backdrop', 'true')
                }
            }
        })
    } catch (error) {
        console.error('Error fixing Bootstrap components:', error)
    }
}

function tooltip() {
    let el = document.querySelector('.custom-tooltip')
    if (!el) {
        el = document.createElement('div')
        el.className = 'custom-tooltip'
        document.body.appendChild(el)
    }

    document.querySelectorAll('[data-toggle="tooltip"]').forEach((element) => {
        const onMove = (e) => {
            positionTooltip(element, el)
            const title = element.getAttribute('data-title')
            if (title) {
                el.textContent = title
                el.style.opacity = '1'
                el.style.display = 'block'
            }
        }
        const onLeave = () => {
            el.style.opacity = '0'
            el.style.display = 'none'
        }
        element.addEventListener('mousemove', onMove)
        element.addEventListener('mouseleave', onLeave)
    })
}

function positionTooltip(element, tooltip) {
    const rect = element.getBoundingClientRect()
    const tooltipRect = tooltip.getBoundingClientRect()
    const viewportWidth = window.innerWidth

    let top = rect.top - tooltipRect.height - 10
    let left = rect.left + rect.width / 2 - tooltipRect.width / 2

    if (top < 0) top = rect.bottom + 10
    if (left + tooltipRect.width > viewportWidth) left = rect.left - tooltipRect.width - 10
    if (left < 0) left = rect.right + 10

    tooltip.style.top = `${top}px`
    tooltip.style.left = `${left}px`
}
