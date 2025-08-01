import ServiceButtonsPremium from "../service-buttons-premium";

const ShowCase = () => {
  return (
    <section className="py-16 2xl:py-[100px] bg-default-100" id="elements">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl lg:text-xl 2xl:text-3xl 2xl:leading-[46px] font-semibold text-default-900 text-center mb-3">
            Car Rental <span className="text-primary">Services</span>
          </h2>
          <p className="text-base leading-7 text-center text-default-700 mb-8">
            Nacs Car Rental offers a comprehensive range of services to cater to all your transportation 
            needs in the Philippines. Whether you prefer the freedom of self-drive exploration or 
            the convenience of having a driver, we have the perfect option for you:
          </p>
          
          {/* Service Buttons with Hover Cards */}
          <ServiceButtonsPremium />
        </div>
      </div>
    </section>
  );
};

export default ShowCase;
