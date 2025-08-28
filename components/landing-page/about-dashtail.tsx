import icon1 from '@/public/images/landing-page/icon-1.png';
import icon2 from '@/public/images/landing-page/icon-2.png';
import icon3 from '@/public/images/landing-page/icon-3.png';
import icon4 from '@/public/images/landing-page/icon-4.png';
import icon5 from '@/public/images/landing-page/icon-5.png';
import icon6 from '@/public/images/landing-page/icon-6.png';
import icon7 from '@/public/images/landing-page/icon-7.png';
import icon8 from '@/public/images/landing-page/icon-8.png';
import icon9 from '@/public/images/landing-page/icon-9.png';
import icon10 from '@/public/images/landing-page/icon-10.png';
import icon11 from '@/public/images/landing-page/icon-11.png';
import icon12 from '@/public/images/landing-page/icon-12.png';
import Image from 'next/image';
const AboutDashtail = () => {
  const data = [
    {
      id: 1,
      title: 'Outstanding Service',
      desc: '4 Years in a row TripAdvisor Certificate of Excellence Awardee.',
      icon: icon1,
    },
    {
      id: 2,
      title: 'Dynamic Pricing',
      desc: 'Seize the Savings by Booking Early: Your Road to Affordable Adventures',
      icon: icon2,
    },
    {
      id: 3,
      title: 'Quality Vehicles',
      desc: 'Only the best quality vehicle brands on our fleet.',
      icon: icon3,
    },
    {
      id: 4,
      title: 'Free Insurance',
      desc: 'Worry-free travel with our Free CDW, SLI and PAI.',
      icon: icon4,
    },
    {
      id: 5,
      title: 'Unlimited Mileage',
      desc: 'Unlock the road with Unlimited Mileage.',
      icon: icon5,
    },
    {
      id: 6,
      title: 'Multiple Payment Options',
      desc: 'Cash, Credit Card, and Money Transfer',
      icon: icon6,
    },
    {
      id: 7,
      title: '24/7 Customer Support',
      desc: 'Round-the-clock assistance for all your travel needs and emergencies.',
      icon: icon7,
    },
    {
      id: 8,
      title: 'Easy Booking Process',
      desc: 'Quick and hassle-free online reservation system with instant confirmation.',
      icon: icon8,
    },
    {
      id: 9,
      title: 'Flexible Rental Terms',
      desc: 'Short-term and long-term rental options to suit your travel plans.',
      icon: icon9,
    },
    {
      id: 10,
      title: 'Well Maintained Fleet',
      desc: 'Regular vehicle maintenance and safety inspections to ensure optimal performance and reliability.',
      icon: icon10,
    },
    {
      id: 11,
      title: 'Nationwide Coverage',
      desc: 'Extensive service network across the Philippines for convenient pickup and drop-off locations.',
      icon: icon11,
    },
    {
      id: 12,
      title: 'Trusted by Thousands',
      desc: 'Join thousands of satisfied customers who trust us for their transportation needs throughout the Philippines.',
      icon: icon12,
    },
  ];
  return (
    <section className="py-16 2xl:py-[120px]" id="whyNacsCarRental">
      <div className="container">
        <div className="max-w-[670px] mx-auto">
          <h2 className="text-center text-xl xl:text-3xl xl:leading-[46px] font-semibold text-default-900 mb-3">
            Why choose <span className="text-primary">Saferide</span>
          </h2>
          <p className="text-base xl:leading-7 text-center text-default-700 ">
            Saferide Car Rental is a leading car rental in the Philippines, providing top-notch
            vehicles for rent at affordable prices. Our company is dedicated to providing our
            customers with a safe, comfortable, and convenient travel experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16 mt-[90px]">
          {data.map((item, index) => (
            <div
              key={`about-dashtail-${index}`}
              className="relative text-center border border-dotted border-default-300 rounded-sm py-6 pb-8 px-6 hover:border-primary hover:border-solid"
            >
              <div className="w-[72px] h-[72px] absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <Image
                  src={item.icon}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  priority={true}
                />
              </div>
              <div className="">
                <h3 className="text-base xl:text-xl font-semibold text-default-600 mb-3 pt-6">
                  {item.title}
                </h3>
                <p className="text-sm xl:text-base text-default-700">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutDashtail;
