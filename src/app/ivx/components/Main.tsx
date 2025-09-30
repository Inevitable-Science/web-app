"use client";
import { IvxPageHeader } from "./layout/Header";
import { IvxTreasuryAnalytics } from "./layout/TreasuryAnalytics";
import { PortfolioPeformance } from "./layout/PortfolioPeformance";
import { HoldersTable } from "./layout/HoldersTable";
import { Footer } from "./layout/Footer";
import { TransactionTable } from "./layout/TransactionTable";
import { AccordionComponent } from "./layout/AccordionComponent";
import { RulesTable } from "./layout/RulesTable";

export default function MainIvxLayout() {

  return (
    <>
      <div>
        <div className="absolute z-[-1] h-[70vh] w-full bg-[url('/assets/img/layout/ivx/ivx_backdrop.png')] bg-cover bg-center"></div>
        <div className="ctWrapper pt-[140px]">
          <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[420px_1fr]">
            <h1 className="text-5xl font-extralight">
              This Is Where the <span className="text-primary">Impossible</span>{" "}
              Begins.
            </h1>
            <p className="text-md font-light md:text-xl">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          </div>

          <div className="my-[82px]">
            <IvxPageHeader />

            <div className="flex flex-col gap-[12px]">
              <IvxTreasuryAnalytics />

              <div className="
                flex flex-col-reverse gap-[12px]
                lg:grid lg:grid-cols-2
              ">
                <RulesTable />

                <PortfolioPeformance />
              </div>

              <div className="
                flex flex-col gap-[12px]
                lg:grid lg:h-[400px] lg:grid-cols-2
              ">
                <HoldersTable />

                <TransactionTable />
              </div>
            </div>

            <AccordionComponent />
          </div>
        </div>

        <Footer />
      </div>
      <style>{`
      /* Hide Base Navbar - Only Show ConnectKit Button */
      .navMinMD > * {
        display: none;
      }

      .navMinMD > button {
        display: block;
      }

      footer{
        display: none !important;
      }
      `}</style>
    </>
  );
}
