import ServiceButtonsPremium from "../service-buttons-premium";

const ShowCase = () => {
  return (
    <section className="py-16 2xl:py-[100px] bg-default-100" id="services">
      <div className="container">
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-xl lg:text-xl 2xl:text-3xl 2xl:leading-[46px] font-semibold text-default-900 text-center mb-3">
            Car Rental <span className="text-primary">Services</span>
          </h2>
          <p className="text-base leading-7 text-center text-default-700">
            Discover the freedom of travel with Nacs Car Rental — offering a wide range of vehicles 
            for every journey. From self-drive adventures to chauffeured convenience, we&apos;ve 
            got the perfect ride for you anywhere in the Philippines.
          </p>
        </div>
        
        {/* Service Buttons with Hover Cards - Full Width */}
        <div className="max-w-7xl mx-auto px-4">
          <ServiceButtonsPremium />
        </div>
      </div>
    </section>
  );
};

export default ShowCase;
