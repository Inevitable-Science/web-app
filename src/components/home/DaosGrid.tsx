"use client"
import React, { useEffect, useRef } from 'react';

const DaosGrid: React.FC = () => {
  // Create refs for each cloud container
  const cloudTopRef = useRef<HTMLDivElement>(null);
  const cloudMidRef = useRef<HTMLDivElement>(null);
  const cloudBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      // Apply parallax effect to each cloud container
      if (cloudTopRef.current) {
        // Top clouds: slight movement for each cloud
        const clouds = cloudTopRef.current.querySelectorAll('img');
        clouds[0].style.transform = `translateX(25%) translateY(${scrollY * 0.06}px)`; // Left cloud
        clouds[1].style.transform = `translateX(10%) translateY(${scrollY * 0.03}px)`; // Center cloud
        clouds[2].style.transform = `translateX(-25%) translateY(${scrollY * 0.08}px)`; // Right cloud
      }

      if (cloudMidRef.current) {
        // Middle cloud: moderate movement
        const cloud = cloudMidRef.current.querySelector('img');
        if (cloud) {
          cloud.style.transform = `translateX(30%) translateY(${scrollY * 0.04}px)`;
        }
      }

      if (cloudBottomRef.current) {
        // Bottom cloud: slightly faster movement
        const cloud = cloudBottomRef.current.querySelector('img');
        if (cloud) {
          cloud.style.transform = `translateX(-5%) translateY(${scrollY * 0.09}px)`;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="sectionDaosGrid">
      <div className="dGrid-1 dGrid max-w-[1400px] mx-auto">
        <div className="div1-1 bg-[url('/assets/img/daos/hydra.webp')] bg-cover bg-center">
          <h5 className="w-fit rounded-full text-sm bg-[#315659] px-[12px] py-[8px] font-semibold">LIVE</h5>
          <div>
            <h4 className="font-optima text-2xl">HydraDAO</h4>
            <p className="text-sm">Funding and incubating replacement research to extend human lifespan.</p>
          </div>
        </div>

        <div className="div2-1 bg-[url('/assets/img/daos/cryo.webp')] bg-cover bg-center">
          <h5 className="w-fit rounded-full text-sm bg-[#315659] px-[12px] py-[8px] font-semibold">LIVE</h5>
          <div>
            <h4 className="font-optima text-2xl">CryoDAO</h4>
            <p className="text-sm">Funding and incubating replacement research to extend human lifespan.</p>
          </div>
        </div>
      </div>

      <div
        ref={cloudTopRef}
        className="hiddenDaoCloud absolute z-[-10] w-screen flex justify-center items-center overflow-hidden"
        style={{ transform: 'translateY(-40%)' }}
      >
        {/* Left cloud */}
        <img
          className="z-[-10] select-none w-screen"
          src="/assets/img/clouds/cloud_bg_1.png"
          style={{ transform: 'translateX(25%)' }}
          alt=""
        />

        {/* Center cloud */}
        <img
          className="z-[-10] select-none w-screen"
          src="/assets/img/clouds/cloud_bg_2.png"
          style={{ transform: 'translateX(10%)' }}
          alt=""
        />

        {/* Right cloud */}
        <img
          className="z-[-10] select-none w-screen"
          src="/assets/img/clouds/cloud_bg_3.png"
          style={{ transform: 'translateX(-25%)' }}
          alt=""
        />
      </div>

      <div className="dGrid dGrid-mid flex items-center lg:gap-32 gap-16 max-w-[1400px] mx-auto">
        <div className="div1-mid bg-[url('/assets/img/daos/moon.webp')] bg-cover bg-center">
          <h5 className="w-fit rounded-full text-sm bg-[#315659] px-[12px] py-[8px] font-semibold">LIVE</h5>
          <div>
            <h4 className="font-optima text-2xl">MoonDAO</h4>
            <p className="text-sm">Funding and incubating replacement research to extend human lifespan.</p>
          </div>
        </div>

        <div className="div2-mid bg-[url('/assets/img/daos/erectus.webp')] bg-cover bg-center">
          <h5 className="w-fit rounded-full text-sm bg-[#315659] px-[12px] py-[8px] font-semibold">LIVE</h5>
          <div>
            <h4 className="font-optima text-2xl">ErectusDAO</h4>
            <p className="text-sm">Funding and incubating replacement research to extend human lifespan.</p>
          </div>
        </div>
      </div>

      <div
        ref={cloudMidRef}
        className="hiddenDaoCloud absolute z-[-10] w-screen flex justify-end items-center overflow-hidden"
        style={{ transform: 'translateY(-50%)' }}
      >
        <img
          className="z-[-10] select-none w-screen"
          src="/assets/img/clouds/cloud_bottom_right.png"
          style={{ transform: 'translateX(30%)' }}
          alt=""
        />
      </div>

      <div className="dGrid-2 dGrid max-w-[1400px] mx-auto">
        <div className="div1-2 bg-[url('/assets/img/daos/placeholder_1.webp')] bg-cover bg-center h-[450px]">
          <h5 className="w-fit rounded-full text-sm bg-[#315659] px-[12px] py-[8px] font-semibold">LIVE</h5>
          <div>
            <h4 className="font-optima text-2xl">DAOTitle</h4>
            <p className="text-sm">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.
            </p>
          </div>
        </div>

        <div className="div2-2 bg-[url('/assets/img/daos/placeholder_3.webp')] bg-cover bg-center">
          <h5 className="w-fit rounded-full text-sm bg-[#315659] px-[12px] py-[8px] font-semibold">LIVE</h5>
          <div>
            <h4 className="font-optima text-2xl">DAOTitle</h4>
            <p className="text-sm">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.
            </p>
          </div>
        </div>
      </div>

      <div
        ref={cloudBottomRef}
        className="hiddenDaoCloud absolute z-[-10] w-screen flex justify-end items-center overflow-hidden"
        style={{ transform: 'translateY(-50%)' }}
      >
        <img
          className="z-[-10] select-none w-screen"
          src="/assets/img/clouds/cloud_bottom_center.png"
          style={{ transform: 'translateX(-5%)' }}
          alt=""
        />
      </div>

      <style>{`
        @media (max-width:925px) {
          .sectionDaosGrid {
            padding: 0 24px;
          }

          .dGrid-1,
          .dGrid-2,
          .dGrid-mid {
            display: flex;
            flex-direction: column;
            gap: 30px;
          }

          .dGrid-mid {
            margin: 30px 0;
          }

          .div1-1 {
            grid-area: 1 / 1 / 10 / 7;
            height: 350px;
          }
          .div2-1 {
            grid-area: 2 / 9 / 11 / 13;
            height: 350px;
          }

          .div1-2 {
            grid-area: 1 / 1 / 10 / 7;
            height: 350px;
          }
          .div2-2 {
            grid-area: 2 / 9 / 11 / 13;
            height: 350px;
          }

          .div1-mid,
          .div2-mid {
            width: 100%;
            height: 350px;
          }

          .hiddenDaoCloud {
            display: none;
          }
        }

        @media (max-width:1315px) and (min-width:925px) {
          .dGrid-1 {
            padding: 0 2rem !important;
          }

          .dGrid-2 {
            padding: 0 2rem !important;
          }

          .dGrid-mid {
            padding: 0 2rem !important;
            margin: calc(var(--spacing) * 16) 0;
          }
        }

        @media (min-width:925px) {
          .dGrid-1 {
            display: grid;
            grid-template-columns: repeat(12, 1fr);
            grid-template-rows: repeat(10, 1fr);
            grid-column-gap: 0px;
            grid-row-gap: 0px;
            padding-left: 6rem;
            padding-right: 8rem;
          }

          .div1-1 {
            grid-area: 2 / 1 / 11 / 7;
            height: 450px;
          }
          .div2-1 {
            grid-area: 1 / 9 / 10 / 13;
          }

          .dGrid-2 {
            display: grid;
            grid-template-columns: repeat(12, 1fr);
            grid-template-rows: repeat(10, 1fr);
            grid-column-gap: 0px;
            grid-row-gap: 0px;
            padding-left: 6rem;
            padding-right: 8rem;
          }

          .div1-2 {
            grid-area: 1 / 1 / 10 / 7;
            height: 450px;
          }
          .div2-2 {
            grid-area: 2 / 9 / 11 / 13;
          }

          .div1-mid {
            width: 490px;
            height: 420px;
          }

          .div2-mid {
            width: 664px;
            height: 550px;
          }

          .dGrid-mid {
            padding-left: 6rem;
            padding-right: 8rem;
            margin: 88px auto;
          }
        }
      `}</style>
    </section>
  );
};

export default DaosGrid;