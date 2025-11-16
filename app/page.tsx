"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Prism from "@/components/Prism";

const launchDate = new Date("2025-12-07T00:00:00Z");
const WAITLIST_ENDPOINT =
  "https://z4g0cco4ok4sw8k4sso4800k.thecircleco.xyz/waitlist";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  complete: boolean;
};

const getTimeLeft = (): TimeLeft => {
  const diff = launchDate.getTime() - Date.now();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, complete: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds, complete: false };
};

export default function Home() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => {
    if (typeof window === "undefined") {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, complete: false };
    }
    return getTimeLeft();
  });
  const [isHydrated, setIsHydrated] = useState(false);
  const [email, setEmail] = useState("");
  const [waitlistState, setWaitlistState] = useState<{
    status: "idle" | "loading" | "success" | "error";
    message: string;
  }>({ status: "idle", message: "" });

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsHydrated(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  type CountdownItem = { label: string; value: string };

  const countdownItems: CountdownItem[] = useMemo(() => {
    if (!isHydrated) {
      return [
        { label: "Days", value: "--" },
        { label: "Hours", value: "--" },
        { label: "Minutes", value: "--" },
        { label: "Seconds", value: "--" },
      ];
    }

    return [
      { label: "Days", value: timeLeft.days.toString().padStart(2, "0") },
      { label: "Hours", value: timeLeft.hours.toString().padStart(2, "0") },
      { label: "Minutes", value: timeLeft.minutes.toString().padStart(2, "0") },
      { label: "Seconds", value: timeLeft.seconds.toString().padStart(2, "0") },
    ];
  }, [isHydrated, timeLeft]);

  const handleWaitlistSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      setWaitlistState({
        status: "error",
        message: "Please enter a valid email address.",
      });
      return;
    }

    setWaitlistState({ status: "loading", message: "Joining waitlist..." });

    try {
      const response = await fetch(
        `${WAITLIST_ENDPOINT}?email=${encodeURIComponent(email.trim())}`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        setWaitlistState({
          status: "success",
          message: "Welcome aboard! You’re on the waitlist.",
        });
        setEmail("");
        return;
      }

      if (response.status === 409) {
        setWaitlistState({
          status: "error",
          message: "Looks like you’re already on the Waitlist!",
        });
        return;
      }

      setWaitlistState({
        status: "error",
        message: "Already added to the waitlist.",
      });
    } catch (error) {
      console.error("Waitlist error", error);
      setWaitlistState({
        status: "error",
        message: "Network hiccup — check your connection and try again.",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center relative bg-black">
      <Prism
        animationType="rotate"
        timeScale={0.5}
        height={3.5}
        baseWidth={5.5}
        scale={3.6}
        hueShift={0}
        colorFrequency={1}
        noise={0.5}
        glow={1}
      />
      <svg
        width="376"
        height="167"
        viewBox="0 0 376 167"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="md:h-14 h-7 absolute mx-auto top-12"
      >
        <path
          d="M308.777 135.29C310.94 135.29 312.784 135.734 314.309 136.621C315.834 137.508 317.047 138.638 317.948 140.011C318.849 141.383 319.439 142.798 319.716 144.254C319.868 144.989 319.945 145.682 319.945 146.333H316.389C316.389 145.959 316.354 145.529 316.285 145.044C316.119 143.879 315.716 142.805 315.078 141.82C314.454 140.822 313.616 140.025 312.562 139.429C311.509 138.819 310.247 138.514 308.777 138.514C307.058 138.514 305.554 138.985 304.265 139.928C302.989 140.871 301.99 142.271 301.27 144.129C300.562 145.987 300.209 148.281 300.209 151.013C300.209 153.744 300.562 156.045 301.27 157.917C301.99 159.775 302.989 161.182 304.265 162.139C305.554 163.081 307.058 163.553 308.777 163.553C310.011 163.553 311.099 163.331 312.042 162.888C312.985 162.43 313.775 161.827 314.413 161.078C315.065 160.316 315.557 159.47 315.89 158.541C316.222 157.598 316.389 156.641 316.389 155.671H319.945C319.945 156.905 319.716 158.173 319.259 159.477C318.801 160.766 318.108 161.965 317.179 163.074C316.264 164.169 315.106 165.057 313.706 165.736C312.306 166.416 310.663 166.756 308.777 166.756C306.185 166.756 303.98 166.083 302.164 164.738C300.348 163.38 298.962 161.514 298.005 159.144C297.062 156.773 296.59 154.063 296.59 151.013C296.59 147.949 297.062 145.238 298.005 142.881C298.962 140.51 300.348 138.652 302.164 137.308C303.98 135.963 306.185 135.29 308.777 135.29ZM31.6445 138.784H18.5215V149.661H29.793V152.78H18.5215V166.34H14.9863V135.665H31.6445V138.784ZM74.3008 166.34H70.8066V135.665H74.3008V166.34ZM132.985 163.706V135.665H136.438V166.34H130.552L117.887 138.43V166.34H114.435V135.665H120.237L132.985 163.706ZM197.127 166.34H193.467L191.321 158.208H180.594L178.431 166.34H174.771L183.214 135.581H188.745L197.127 166.34ZM254.002 163.706V135.665H257.454V166.34H251.568L238.903 138.43V166.34H235.451V135.665H241.254L254.002 163.706ZM375.83 138.784H362.624V149.391H373.521V152.51H362.624V163.22H375.83V166.34H359.067V135.665H375.83V138.784ZM181.424 155.089H190.498L185.979 137.967L181.424 155.089ZM47.7656 0C54.5534 1.12777e-05 60.8422 1.24773 66.6318 3.74316C72.4715 6.18885 77.5629 9.83335 81.9053 14.6748C86.2475 19.4663 89.617 25.3805 92.0127 32.418C94.4583 39.4554 95.6806 47.5411 95.6807 56.6748C95.6807 65.8085 94.4583 73.9195 92.0127 81.0068C89.5671 88.0443 86.148 94.0091 81.7559 98.9004C77.4136 103.742 72.3473 107.411 66.5576 109.906C60.7679 112.402 54.5037 113.649 47.7656 113.649C41.0775 113.649 34.8385 112.402 29.0488 109.906C23.2591 107.411 18.1676 103.742 13.7754 98.9004C9.43315 94.0091 6.0394 88.0443 3.59375 81.0068C1.19804 73.9194 0 65.8086 0 56.6748C3.31021e-05 47.5411 1.19801 39.4554 3.59375 32.418C6.03937 25.3806 9.43322 19.4663 13.7754 14.6748C18.1177 9.83335 23.1839 6.18885 28.9736 3.74316C34.8133 1.2476 41.0775 0 47.7656 0ZM154.458 1.57227C165.588 1.57227 173.949 4.11798 179.539 9.20898C185.129 14.2999 187.924 21.7867 187.924 31.6689C187.924 37.4586 186.826 42.3752 184.63 46.418C182.434 50.4607 179.763 53.5803 176.619 55.7764C173.475 57.9725 170.48 59.221 167.635 59.5205C170.53 59.7202 173.324 60.4689 176.02 61.7666C178.715 63.0643 180.911 65.1102 182.608 67.9053C184.355 70.6504 185.229 74.3689 185.229 79.0605V101.446C185.229 103.792 185.428 105.964 185.827 107.96C186.226 109.906 186.726 111.254 187.325 112.003H167.485C166.986 111.105 166.537 109.731 166.138 107.885C165.788 105.988 165.613 103.842 165.613 101.446V81.3818C165.613 76.8399 164.34 73.3957 161.795 71.0498C159.249 68.704 155.406 67.5313 150.266 67.5312H131.174V112.003H111.933V1.57227H154.458ZM233.637 53.374L254.082 1.57227H275.12L243.451 73.8203V112.003H223.687V73.8203L192.241 1.57227H213.13L233.637 53.374ZM356.051 96.5801V1.57227H375.292V112.003H343.923L306.863 17.7998V112.003H287.697V1.57227H318.617L356.051 96.5801ZM47.7656 16.3213C42.7245 16.3213 38.0824 17.6943 33.8398 20.4395C29.6475 23.1845 26.2788 27.5267 23.7334 33.4658C21.2378 39.3553 19.9893 47.0919 19.9893 56.6748C19.9893 66.2579 21.2378 74.0448 23.7334 80.0342C26.2789 86.0234 29.6474 90.4159 33.8398 93.2109C38.0824 96.006 42.7245 97.4033 47.7656 97.4033C52.9564 97.4033 57.6483 96.006 61.8408 93.2109C66.0334 90.366 69.3522 85.9484 71.7979 79.959C74.2934 73.9696 75.541 66.208 75.541 56.6748C75.541 47.0919 74.2934 39.3553 71.7979 33.4658C69.3023 27.5265 65.9581 23.1845 61.7656 20.4395C57.5731 17.6943 52.9065 16.3213 47.7656 16.3213ZM131.174 51.8086H150.415C153.659 51.8086 156.579 51.0599 159.175 49.5625C161.77 48.0153 163.816 45.8691 165.313 43.124C166.861 40.3789 167.635 37.1593 167.635 33.4658C167.635 28.0757 166.087 24.0331 162.993 21.3379C159.899 18.6427 155.506 17.295 149.816 17.2949H131.174V51.8086Z"
          fill="url(#paint0_linear_137_25)"
        />
        <defs>
          <linearGradient
            id="paint0_linear_137_25"
            x1="-7.66308"
            y1="0.0019527"
            x2="44.3916"
            y2="246.446"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#BAFF55" />
            <stop offset="0.490385" stopColor="#F6FF79" />
            <stop offset="1" stopColor="#BAFF54" />
          </linearGradient>
        </defs>
      </svg>
      <div className="relative flex flex-col items-center text-center gap-6 px-6 z-50 mt-10 sm:mt-0">
        <div className="space-y-8 max-w-2xl">
          <h1 className="text-3xl md:text-6xl leading-[100%] font-semibold text-white">
            One Bridge.
            <br /> Every Avalanche L1.
          </h1>
          <p className="text-xs sm:text-sm uppercase text-[#9CE5FF] font-semibold leading-[180%]">
            The fastest way to move across Avalanche L1s, built on a
            next-generation connectivity layer designed to expand seamlessly as
            interoperability evolves.
          </p>
        </div>
        <div className="w-full flex flex-col items-center gap-4 max-w-xl">
          <p className="text-xs sm:text-sm tracking-[0.3em] uppercase text-white/70">
            Launching Soon
          </p>
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full"
            aria-live="polite"
          >
            {countdownItems.map(({ label, value }) => (
              <div
                key={label}
                className="rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 px-3 py-2 sm:px-4 sm:py-3"
              >
                <p className="text-2xl sm:text-3xl font-semibold text-white tabular-nums">
                  {value}
                </p>
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-white/60">
                  {label}
                </p>
              </div>
            ))}
          </div>
          {timeLeft?.complete && (
            <p className="text-xs sm:text-sm text-[#C7FF6F]">
              Launch window is live — bridge access opens shortly.
            </p>
          )}
        </div>
        <form
          className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xl"
          onSubmit={handleWaitlistSubmit}
        >
          <label htmlFor="waitlist-email" className="sr-only">
            Email address
          </label>
          <input
            id="waitlist-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-full bg-white/10 border border-white/20 text-white placeholder-white/60 px-6 py-3 focus:outline-none focus:ring-2 focus:ring-[#9CE5FF]/80 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={waitlistState.status === "loading"}
          />
          <button
            type="submit"
            className="w-full sm:w-auto text-nowrap cursor-pointer rounded-full bg-linear-to-r from-[#C7FF6F] via-[#F9FF8D] to-[#C7FF6F] text-black font-semibold px-8 py-3 transition duration-300 hover:from-[#F9FF8D] hover:via-[#D7FF7F] hover:to-[#F9FF8D] hover:shadow-[0_0_55px_rgba(201,255,128,0.65)] shadow-[0_0_40px_rgba(201,255,128,0.45)] disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={waitlistState.status === "loading"}
          >
            {waitlistState.status === "loading"
              ? "Joining..."
              : "Join Waitlist"}
          </button>
        </form>
        {waitlistState.status !== "idle" && (
          <p
            aria-live="polite"
            className={`text-sm ${
              waitlistState.status === "success"
                ? "text-[#C7FF6F]"
                : "text-red-300"
            }`}
          >
            {waitlistState.message}
          </p>
        )}
      </div>
    </div>
  );
}
