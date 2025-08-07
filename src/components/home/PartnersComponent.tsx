import Image from "next/image";

const PartnersComponent: React.FC = () => {
  return (
    <div className="ctWrapper mt-32 hidden">
      <div className="flex flex-col items-center gap-2">
        <p className="font-optima text-xl uppercase">Inevitable</p>
        <h3 className="sm:text-6xl text-4xl font-light text-primary mb-12">
          Partners
        </h3>

        <div className="flex items-center justify-center flex-wrap gap-6">
          <div className="text-center">
            <Image
              src="/assets/img/partner.webp"
              className="md:w-48 w-32 opacity-60 mb-4"
              height={200}
              width={200}
              alt="Partner Image"
            />
            <p className="text-xl">Partner Title</p>
          </div>

          <div className="text-center">
            <Image
              src="/assets/img/partner.webp"
              className="md:w-48 w-32 opacity-60 mb-4"
              height={200}
              width={200}
              alt="Partner Image"
            />
            <p className="text-xl">Partner Title</p>
          </div>

          <div className="text-center">
            <Image
              src="/assets/img/partner.webp"
              className="md:w-48 w-32 opacity-60 mb-4"
              height={200}
              width={200}
              alt="Partner Image"
            />
            <p className="text-xl">Partner Title</p>
          </div>

          <div className="text-center">
            <Image
              src="/assets/img/partner.webp"
              className="md:w-48 w-32 opacity-60 mb-4"
              height={200}
              width={200}
              alt="Partner Image"
            />
            <p className="text-xl">Partner Title</p>
          </div>

          <div className="text-center">
            <Image
              src="/assets/img/partner.webp"
              className="md:w-48 w-32 opacity-60 mb-4"
              height={200}
              width={200}
              alt="Partner Image"
            />
            <p className="text-xl">Partner Title</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnersComponent;