import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const GymCarousel = () => {
  //   const gyms =[];

  const gyms = [
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
    "https://images.unsplash.com/photo-1558611848-73f7eb4001a1",
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438",
    "https://images.unsplash.com/photo-1593079831268-3381b0db4a77",
    "https://images.unsplash.com/photo-1550345332-09e3ac987658",
    "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61",
    "https://images.unsplash.com/photo-1579758629938-03607ccdbaba",
    "https://images.unsplash.com/photo-1605296867304-46d5465a13f1",
    "https://images.unsplash.com/photo-1550345332-09e3ac987658",
    "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61",
    "https://images.unsplash.com/photo-1579758629938-03607ccdbaba",
    "https://images.unsplash.com/photo-1605296867304-46d5465a13f1",
  ];

  return (
    <section className="mw8 center pa4">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000 }}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        className="pb5"
      >
        {gyms.map((url, index) => (
          <SwiperSlide key={index}>
            <article className="bg-white br3 shadow-4 overflow-hidden grow">
              <div className="w-100">
                <img
                  src={url} // <- Ahora usa la URL directa del array
                  alt={`Gimnasio ${index + 1}`}
                  className="w-100 db"
                  style={{
                    height: "250px",
                    objectFit: "cover",
                    backgroundColor: "#eee",
                  }}
                />
              </div>
              <div className="pa3">
                <h3 className="f4 fw6 mt0 mb2 dark-gray">Gimnasio Destacado</h3>
                <p className="f6 gray mv0">Sede disponible</p>
                <button
                  className="w-100 mt3 pv2 b ph3 input-reset ba b--black-10 bg-dark-gray white hover-bg-blue pointer br2"
                  type="button"
                >
                  Ver Detalles
                </button>
              </div>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default GymCarousel;
