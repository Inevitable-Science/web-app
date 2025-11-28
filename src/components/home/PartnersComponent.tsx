import Image from "next/image";

export default function PartnersComponent() {
  return (
    <div className="ctWrapper mt-32 hidden">
      <div className="flex flex-col items-center gap-2">
        <p className="font-optima text-xl uppercase">Inevitable</p>
        <h3 className="mb-12 text-4xl font-light text-primary sm:text-6xl">
          Partners
        </h3>

        <div className="flex flex-wrap items-center justify-center gap-6">
          <div className="text-center">
            <Image
              src="https://cdn.inevitable.science/static/img/partner.webp"
              className="mb-4 w-32 opacity-60 md:w-48"
              height={200}
              width={200}
              alt="Partner Image"
            />
            <p className="text-xl">Partner Title</p>
          </div>

          <div className="text-center">
            <Image
              src="https://cdn.inevitable.science/static/img/partner.webp"
              className="mb-4 w-32 opacity-60 md:w-48"
              height={200}
              width={200}
              alt="Partner Image"
            />
            <p className="text-xl">Partner Title</p>
          </div>

          <div className="text-center">
            <Image
              src="https://cdn.inevitable.science/static/img/partner.webp"
              className="mb-4 w-32 opacity-60 md:w-48"
              height={200}
              width={200}
              alt="Partner Image"
            />
            <p className="text-xl">Partner Title</p>
          </div>

          <div className="text-center">
            <Image
              src="https://cdn.inevitable.science/static/img/partner.webp"
              className="mb-4 w-32 opacity-60 md:w-48"
              height={200}
              width={200}
              alt="Partner Image"
            />
            <p className="text-xl">Partner Title</p>
          </div>

          <div className="text-center">
            <Image
              src="https://cdn.inevitable.science/static/img/partner.webp"
              className="mb-4 w-32 opacity-60 md:w-48"
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
}
