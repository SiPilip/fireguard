"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaArrowRight,
  FaBroadcastTower,
  FaCheckCircle,
  FaFire,
  FaMapMarkedAlt,
  FaShieldAlt,
  FaUserShield,
} from "react-icons/fa";
import { isStandaloneApp } from "@/lib/app-mode";
import { hasCompletedOnboarding, markOnboardingCompleted } from "@/lib/onboarding";

type OnboardingSlide = {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  bulletA: string;
  bulletB: string;
};

const SLIDES: OnboardingSlide[] = [
  {
    id: "deteksi",
    title: "Deteksi & Lapor Cepat",
    subtitle:
      "Laporkan kejadian kebakaran atau keadaan darurat di sekitar Anda hanya dalam hitungan detik.",
    badge: "Status Laporan Terkirim",
    bulletA: "Pilih kategori insiden dengan satu sentuhan.",
    bulletB: "Kirim lokasi akurat agar tim merespons lebih cepat.",
  },
  {
    id: "pantau",
    title: "Pantau Status Real-time",
    subtitle:
      "Lacak perkembangan penanganan laporan Anda langsung dari genggaman dengan transparansi penuh.",
    badge: "Unit Aktif • 2 Menit Lagi",
    bulletA: "Timeline penanganan dari diterima hingga selesai.",
    bulletB: "Notifikasi otomatis saat status laporan berubah.",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      const standalone = isStandaloneApp();

      if (!standalone) {
        router.replace("/");
        return;
      }

      if (hasCompletedOnboarding()) {
        router.replace("/login");
        return;
      }

      try {
        const response = await fetch("/api/auth/me", { credentials: "include" });
        if (!active) {
          return;
        }

        if (response.ok) {
          const data = await response.json();
          router.replace(data?.isOperator ? "/operator/dashboard" : "/dashboard");
          return;
        }
      } catch {
        // Continue onboarding for unauthenticated users.
      }

      if (active) {
        setReady(true);
      }
    };

    initialize();

    return () => {
      active = false;
    };
  }, [router]);

  const slide = useMemo(() => SLIDES[currentIndex], [currentIndex]);
  const isLastSlide = currentIndex === SLIDES.length - 1;

  const completeAndContinue = () => {
    markOnboardingCompleted();
    router.replace("/login");
  };

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4faff] px-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#b7131a] border-r-transparent" />
          <p className="font-medium text-[#27333b]">Menyiapkan FireGuard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#ffe5e5_0%,_#f4faff_40%,_#e9f6fd_100%)] px-4 py-6 text-[#111d23]">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md flex-col overflow-hidden rounded-[32px] bg-white shadow-[0_28px_80px_-36px_rgba(21,49,76,0.45)]">
        <header className="flex items-center justify-between px-6 pt-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#e9f6fd] px-3 py-1 text-xs font-semibold text-[#27308a]">
            <FaShieldAlt />
            Fireguard
          </div>
          <button
            type="button"
            onClick={completeAndContinue}
            className="rounded-full px-3 py-1 text-sm font-medium text-[#5b403d] transition-colors hover:bg-[#fff2f1]"
          >
            Lewati
          </button>
        </header>

        <section className="relative mt-5 px-6">
          <div className="absolute -left-10 top-4 h-28 w-28 rounded-full bg-[#db322f1f] blur-2xl" />
          <div className="absolute right-0 top-14 h-24 w-24 rounded-full bg-[#4c56af1f] blur-2xl" />

          <div className="relative rounded-3xl bg-gradient-to-br from-[#fff6f5] via-[#fefefe] to-[#eef7ff] p-5">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#8c4c00]">
              <FaBroadcastTower />
              {slide.badge}
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white p-3 shadow-sm">
                <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#ffe6e4] text-[#b7131a]">
                  <FaFire />
                </div>
                <p className="text-xs font-semibold text-[#24313b]">Laporan Diterima</p>
                <p className="mt-1 text-[11px] text-[#5f707c]">09:42 WIB • Terverifikasi sistem</p>
              </div>

              <div className="rounded-2xl bg-white p-3 shadow-sm">
                <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#e5ebff] text-[#27308a]">
                  <FaUserShield />
                </div>
                <p className="text-xs font-semibold text-[#24313b]">Tim Bergerak</p>
                <p className="mt-1 text-[11px] text-[#5f707c]">Unit B-12 • Estimasi 2 menit</p>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-3 shadow-sm">
              <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#e6f8ee] text-[#188247]">
                <FaMapMarkedAlt />
              </div>
              <p className="text-xs font-semibold text-[#24313b]">Pantau Lokasi Penanganan</p>
              <p className="mt-1 text-[11px] text-[#5f707c]">Lihat progres petugas secara real-time di peta.</p>
            </div>
          </div>
        </section>

        <section className="flex-1 px-6 pb-6 pt-6">
          <h1 className="text-[30px] font-extrabold leading-[1.12] tracking-[-0.02em] text-[#111d23]">
            {slide.title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#4b616f]">{slide.subtitle}</p>

          <ul className="mt-5 space-y-2 text-sm text-[#24313b]">
            <li className="flex items-start gap-2">
              <FaCheckCircle className="mt-0.5 shrink-0 text-[#b7131a]" />
              <span>{slide.bulletA}</span>
            </li>
            <li className="flex items-start gap-2">
              <FaCheckCircle className="mt-0.5 shrink-0 text-[#b7131a]" />
              <span>{slide.bulletB}</span>
            </li>
          </ul>
        </section>

        <footer className="px-6 pb-7">
          <div className="mb-4 flex items-center justify-center gap-2">
            {SLIDES.map((item, index) => (
              <span
                key={item.id}
                className={`h-2.5 rounded-full transition-all ${
                  index === currentIndex ? "w-8 bg-[#b7131a]" : "w-2.5 bg-[#d8e6ef]"
                }`}
              />
            ))}
          </div>

          {isLastSlide ? (
            <button
              type="button"
              onClick={completeAndContinue}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#b7131a] to-[#db322f] px-4 py-3.5 font-semibold text-white shadow-[0_18px_28px_-16px_rgba(183,19,26,0.8)]"
            >
              Mulai Sekarang
              <FaArrowRight />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCurrentIndex((value) => Math.min(value + 1, SLIDES.length - 1))}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#b7131a] to-[#db322f] px-4 py-3.5 font-semibold text-white shadow-[0_18px_28px_-16px_rgba(183,19,26,0.8)]"
            >
              Lanjut
              <FaArrowRight />
            </button>
          )}
        </footer>
      </div>
    </main>
  );
}
