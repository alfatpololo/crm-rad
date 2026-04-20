import { useState } from 'react'
import ModalVideo from 'react-modal-video'
import 'react-modal-video/css/modal-video.css'

export default function VideoPopup() {
    const [isOpen, setOpen] = useState(false)
    return (
        <>
            <a onClick={() => setOpen(true)} className="popup-video"><i className="fas fa-play" /></a>
            <ModalVideo channel='youtube' autoplay isOpen={isOpen} videoId="vfhzo499OeA" onClose={() => setOpen(false)} />
        </>
    )
}