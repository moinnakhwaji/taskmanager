"use client";

import Image from "next/image";
import { useEffect } from "react";
import Link from "next/link";
import { renderCanvas, ShineBorder, TypeWriter } from "@/components/ui/hero-designali";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero = () => {
  const talkAbout = [
    "Task Planning",
    "Team Collaboration",
    "Deadline Tracking",
    "Productivity Boost",
    "Task Automation",
    "Time Management",
    "Project Success",
  ];

  useEffect(() => {
    renderCanvas();
  }, []);

  return (
    <main className="overflow-hidden bg-[#09090b] text-white">
      <section id="home">
        <div className="absolute inset-0 max-md:hidden top-[400px] -z-10 h-[400px] w-full bg-transparent bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-10 [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>

        <div className="flex flex-col items-center justify-center px-6 text-center">
          <div className="mb-6 mt-10 sm:justify-center md:mb-4 md:mt-40">
            <div className="relative flex items-center rounded-full border border-white/20 bg-[#0a0a0c] px-3 py-1 text-xs text-white/70">
              Introducing TaskVerse.
              <Link
                href="/dashboard"
                rel="noreferrer"
                className="ml-1 flex items-center font-semibold text-red-500"
              >
                Explore →
              </Link>
            </div>
          </div>

          <div className="mx-auto max-w-5xl">
            <div className="relative mx-auto h-full bg-[#0a0a0c] border border-white/10 py-12 p-6 rounded-xl shadow-xl [mask-image:radial-gradient(800rem_96rem_at_center,white,transparent)]">
              {/* Red Plus Icons */}
              <Plus strokeWidth={4} className="text-red-500 absolute -left-5 -top-5 h-10 w-10" />
              <Plus strokeWidth={4} className="text-red-500 absolute -bottom-5 -left-5 h-10 w-10" />
              <Plus strokeWidth={4} className="text-red-500 absolute -right-5 -top-5 h-10 w-10" />
              <Plus strokeWidth={4} className="text-red-500 absolute -bottom-5 -right-5 h-10 w-10" />

              <h1 className="flex flex-col text-center text-5xl font-semibold leading-none tracking-tight md:text-8xl">
                <span>
                  Your all-in-one platform for{" "}
                  <span className="text-red-500">Task Management</span>.
                </span>
              </h1>

              <div className="flex items-center mt-4 justify-center gap-1">
                <span className="relative flex h-3 w-3 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                </span>
                <p className="text-xs text-green-500">Live & Ready</p>
              </div>
            </div>

            <h2 className="mt-8 text-2xl md:text-2xl">
              Welcome to productivity, I&#39;m{" "}
              <span className="text-red-500 font-bold">MOIN</span>
            </h2>

            <p className="text-white/70 py-4 max-w-2xl mx-auto">
              Empowering teams to stay organized, hit deadlines, and achieve goals with ease. I'm passionate about task systems, including{" "}
              <span className="text-red-400 font-semibold">
                <TypeWriter strings={talkAbout} />
              </span>.
            </p>

            <div className="flex items-center justify-center gap-4 mt-4">
              <Link href="/dashboard">
                <ShineBorder
                  borderWidth={3}
                  className="border cursor-pointer p-2 bg-white/5 backdrop-blur-md"
                  color={["#ef4444", "#22c55e", "#3b82f6"]}
                >
                  <Button className="w-full rounded-xl text-white bg-red-600 hover:bg-red-700">
                    Get Started
                  </Button>
                </ShineBorder>
              </Link>

             
            </div>
          </div>
        </div>

        <canvas
          className="pointer-events-none absolute inset-0 mx-auto"
          id="canvas"
        ></canvas>
      </section>

      <Image
        width={1512}
        height={550}
        className="absolute left-1/2 top-0 -z-10 -translate-x-1/2"
        src="https://raw.githubusercontent.com/designali-in/designali/refs/heads/main/apps/www/public/images/gradient-background-top.png"
        alt=""
        role="presentation"
        priority
      />
    </main>
  );
};

export default Hero;
