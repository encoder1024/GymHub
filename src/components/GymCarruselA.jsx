import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";

const GymInfiniteScroll = () => {
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
    <div className="pv4 bg-near-white">
      <Swiper
        modules={[Autoplay]}
        slidesPerView={2}
        spaceBetween={15}
        loop={true}
        speed={6000} // Velocidad del desplazamiento (5 segundos por tramo)
        autoplay={{
          delay: 0, // Sin pausa entre transiciones
          disableOnInteraction: false,
        }}
        breakpoints={{
          640: { slidesPerView: 3 },
          1024: { slidesPerView: 5 },
        }}
        className="linear-swiper"
      >
        {gyms.map((url, index) => (
          <SwiperSlide key={index}>
            <div className="br3 overflow-hidden shadow-4">
              <img
                src={`${url}?auto=format&fit=crop&w=400&h=300`}
                alt="Gym"
                className="w-100 db"
                style={{ height: "300px", objectFit: "cover" }}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* CSS Crítico para el efecto suave */}
      <style>{`
        .linear-swiper .swiper-wrapper {
          transition-timing-function: linear !important;
        }
      `}</style>
    </div>
  );
};

export default GymInfiniteScroll;
