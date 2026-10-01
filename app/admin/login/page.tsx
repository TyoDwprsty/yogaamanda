import type { Metadata } from "next";
import { Confetti } from "@/components/fx/confetti";
import { GoldText } from "@/components/fx/gold-text";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Masuk — Admin Yoga Amanda",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="relative isolate grid min-h-dvh place-items-center overflow-hidden px-5 py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[-200px] left-1/2 z-0 h-[900px] w-[1000px] max-w-[180vw] -translate-x-1/2 bg-[radial-gradient(ellipse_50%_60%_at_50%_0%,var(--glow)_0%,transparent_72%)]"
      />
      <Confetti />
      <div className="relative z-10 w-full max-w-[420px]">
        <div className="mb-8 text-center">
          <p className="text-[13px] font-semibold tracking-[0.2em] text-muted uppercase">Admin</p>
          <h1 className="mt-3 text-[40px] leading-none font-extrabold tracking-[-0.04em] text-ink">Yoga Amanda</h1>
          <p className="mt-2 font-serif text-2xl italic">
            <GoldText>Cerita terbaik</GoldText>
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
