"use client"
import { Button } from "@/components/ui/button"
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from 'swiper/modules';
import { Badge } from "../ui/badge";
import { Star } from "lucide-react";
const AllComponents = () => {

  const data = [
    "Drive with Ease",
    "Explore More",
    "Ride in Style",
    "Go Anywhere",
    "Zoom Today",
    "Escape Now",
    "Feel the Freedom",
    "Adventure Awaits",
    "Start Your Journey",
    "Cruise the City",
    "Travel Smart",
    "Unlock the Road",
    "Move Freely",
    "Roam Far",
    "Discover More"
  ]
  return (
    <section className="relative " id="features">
      {/* <div className="max-w-[670px] mx-auto">
        <h2 className="text-center text-xl md:text-2xl lg:text-3xl leading-[46px] font-semibold text-default-900 mb-1 lg:mb-3">
          Component <span className="text-primary">Collection</span>
        </h2>
        <p className="text-base xl:leading-7 text-center text-default-700 ">
          DashTail Admin Template offers a variety of carefully designed components, perfect for creating advanced reusable components,
          pages,dashboard etc.</p>
      </div> */}
      <div className="space-y-6">
        <Swiper
          spaceBetween={8}
          slidesPerView='auto'
          centeredSlides={true}
          speed={3000}
          loop={true}
          modules={[Autoplay]}
          grabCursor={true}
          autoplay={{
            disableOnInteraction: true,
            pauseOnMouseEnter: true,
            delay: 0,
          }}


        >
          {data.map((item, index) => (
            <SwiperSlide
              key={`menu-${index}`}
              className="w-28 flex justify-center "
            >
              <Button variant="soft">{item}</Button>
            </SwiperSlide>
          ))
          }
        </Swiper>

        <Swiper
          spaceBetween={8}
          slidesPerView='auto'
          centeredSlides={true}
          speed={2000}
          loop={true}
          modules={[Autoplay]}
          grabCursor={true}
          autoplay={{
            disableOnInteraction: true,
            pauseOnMouseEnter: true,
            delay: 0,
            reverseDirection: true,
          }}


        >
          {data.map((item, index) => (
            <SwiperSlide
              key={`menu-${index}`}
              className="w-28 flex justify-center "
            >
              <Button variant="soft">{item}</Button>
            </SwiperSlide>
          ))
          }
        </Swiper>
      </div>
    </section >
  );
};

export default AllComponents;