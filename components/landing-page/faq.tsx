import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Link from 'next/link';

// FAQ data structure
const faqData = [
  {
    id: 'item-1',
    question: 'How can I book a car?',
    answer: (
      <>
        You can book directly through our website, by phone, or by messaging us on our{' '}
        <Link href="https://facebook.com/nacscarrental" target="_blank" className="text-primary">
          Facebook page
        </Link>
        . Our online booking system is available 24/7 for your convenience.
      </>
    ),
  },
  {
    id: 'item-2',
    question: 'What documents do I need to rent a car?',
    answer: `You'll need a valid driver's license and partial or full payment to confirm your booking. Foreign renters may also need an International Driving Permit (IDP). For faster and easier booking, you can create an account on our website and complete your account verification.`,
  },
  {
    id: 'item-3',
    question: 'How far in advance should I book?',
    answer: `We recommend booking at least 24 hours in advance, especially during peak seasons, to guarantee availability and ensure we have the perfect vehicle ready for your needs.`,
  },
  {
    id: 'item-4',
    question: 'Is fuel included in the rental fee?',
    answer: `No, fuel is not included in the rental fee. Cars are provided with a set fuel level and must be returned at the same level. We'll show you the fuel gauge level during pickup for your reference.`,
  },
  {
    id: 'item-5',
    question: 'Do your vehicles have GPS?',
    answer: `Some units may have built-in navigation, but we recommend using mobile navigation apps like Google Maps or Waze for the most up-to-date traffic and route information.`,
  },
  {
    id: 'item-6',
    question: 'What payment methods do you accept?',
    answer: `We accept multiple payment methods for your convenience: cash, credit/debit cards, GCash, and bank transfers. Choose the method that works best for you.`,
  },
  {
    id: 'item-7',
    question: 'Is a deposit required?',
    answer: `No, a deposit is not required. However, partial or full payment is required to confirm your booking and secure your chosen vehicle for the rental period.`,
  },
  {
    id: 'item-8',
    question: 'Are there any hidden charges?',
    answer: `No, our pricing is completely transparent. Any additional charges, such as for damage or late returns, will be clearly explained before you confirm your booking.`,
  },
  {
    id: 'item-9',
    question: 'Do you offer discounts?',
    answer: `Yes! We offer seasonal promos, long-term rental discounts, and group rates. Follow our social media pages for the latest deals and special offers.`,
  },
  {
    id: 'item-10',
    question: 'What happens if I get into an accident?',
    answer: `Contact us immediately if you're involved in an accident. We'll assist you with roadside support and guide you through all necessary steps. Your safety is our top priority.`,
  },
  {
    id: 'item-11',
    question: 'Is smoking or eating allowed inside the vehicle?',
    answer: `Smoking is strictly prohibited in all our vehicles. Eating is allowed, but customers are responsible for keeping the vehicle clean and may incur cleaning fees if necessary.`,
  },
  {
    id: 'item-12',
    question: 'Do you offer door-to-door delivery and pick-up?',
    answer: `Yes, we provide convenient pickup and drop-off services within our service areas. This service is perfect for airport transfers and hotel deliveries.`,
  },
  {
    id: 'item-13',
    question: 'What if my flight or schedule changes?',
    answer: `Just let us know as soon as possible. We'll adjust pickup and drop-off times whenever possible to accommodate your schedule changes.`,
  },
  {
    id: 'item-14',
    question: 'What happens if the car breaks down?',
    answer: `We offer 24/7 roadside assistance for all our rental vehicles. If needed, a replacement vehicle will be provided to ensure your trip continues smoothly.`,
  },
  {
    id: 'item-15',
    question: 'What if I return the car late?',
    answer: `Late returns may incur extra charges based on our hourly rates. Please inform us if you expect delays so we can assist you and potentially minimize additional costs.`,
  },
];

const Faq = () => {
  // Split FAQ data into two columns
  const midPoint = Math.ceil(faqData.length / 2);
  const leftColumnFaqs = faqData.slice(0, midPoint);
  const rightColumnFaqs = faqData.slice(midPoint);

  const renderFaqItem = (faq: (typeof faqData)[0]) => (
    <AccordionItem
      key={faq.id}
      value={faq.id}
      className="bg-background dark:bg-default-800 border border-default-200 dark:border-default-700 rounded-lg"
    >
      <AccordionTrigger className="text-base xl:text-lg text-left font-medium text-default-900 dark:text-default-100 hover:text-primary dark:hover:text-primary">
        {faq.question}
      </AccordionTrigger>
      <AccordionContent className="text-sm xl:text-base text-default-700 dark:text-default-300">
        {faq.answer}
      </AccordionContent>
    </AccordionItem>
  );

  return (
    <section className="py-16 2xl:py-[120px] bg-default-100">
      <div className="container">
        <div className="max-w-[670px] mx-auto mb-14">
          <h2 className="text-center text-xl xl:text-3xl xl:leading-[46px] font-semibold text-default-900 mb-3">
            <span className="text-primary">FAQs</span>
          </h2>
          <p className="text-base xl:leading-7 text-center text-default-700">
            <strong>Got Questions?</strong> We've compiled a list of answers to your frequently
            asked questions. If you can't find what you're looking for here, don't hesitate to reach
            out to us.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
          <div>
            <Accordion type="single" collapsible className="space-y-6">
              {leftColumnFaqs.map(renderFaqItem)}
            </Accordion>
          </div>
          <div>
            <Accordion type="single" collapsible className="space-y-6">
              {rightColumnFaqs.map(renderFaqItem)}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Faq;
