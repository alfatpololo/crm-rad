import Slider from "react-slick"

const settings = {
    dots: false,
    infinite: true,
    speed: 600,
    autoplay: false,
    arrows: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    prevArrow: (
        <button type="button" className="slick-prev">
            <i className="fas fa-arrow-left"></i>
        </button>
    ),
    nextArrow: (
        <button type="button" className="slick-next">
            <i className="fas fa-arrow-right"></i>
        </button>
    ),
    appendArrows: '.speakers-nav',
    responsive: [
        {
            breakpoint: 1200,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                infinite: true,
            }
        },
        {
            breakpoint: 992,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1
            }
        },
        {
            breakpoint: 767,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
            }
        },
        {
            breakpoint: 575,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
            }
        },
    ]
}

export default function EventSpeakerSlider1() {
    return (
        <>
            <Slider {...settings} className="speakers-active">
                <div className="speakers-item">
                    <div className="speakers-thumb">
                        <img src="/assets/img/events/speaker_img01.jpg" alt="img" />
                    </div>
                    <div className="speakers-content">
                        <h2 className="title">Robert Smith</h2>
                        <span>Graphic Design</span>
                    </div>
                </div>
                <div className="speakers-item">
                    <div className="speakers-thumb">
                        <img src="/assets/img/events/speaker_img01.jpg" alt="img" />
                    </div>
                    <div className="speakers-content">
                        <h2 className="title">Robert Smith</h2>
                        <span>Graphic Design</span>
                    </div>
                </div>
            </Slider>
        </>
    )
}
