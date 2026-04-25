import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Github, Globe, Linkedin } from "lucide-react";

export const metadata: Metadata = {
  title: "Tim Pengembang",
  description:
    "Informasi tim pengembang website SMK Negeri 2 Batusangkar dari fase pengembangan awal hingga pengembangan lanjutan.",
  alternates: {
    canonical: "/pengembang",
  },
};

type Developer = {
  name: string;
  note?: string;
  photo?: string;
  linkedin?: string;
  github?: string;
  website?: string;
};

const team2025: Developer[] = [
  {
    name: "Firman Ardiyansyah",
    photo: "/pengembang/firman.webp",
    linkedin: "https://www.linkedin.com/in/firman-ardiansyah04/",
    github: "",
    website: "",
  },
  {
    name: "Redho Septa Yudien",
    photo: "/pengembang/redho.webp",
    linkedin: "https://www.linkedin.com/in/redhoseptayudien/",
    github: "",
    website: "",
  },
  {
    name: "Baghaztra Van Ril",
    photo: "/pengembang/Baghaztra.webp",
    linkedin: "https://www.linkedin.com/in/baghaztra-van-ril-8011b0294/",
    github: "",
    website: "",
  },
  {
    name: "Pito Desri Pauzi",
    photo: "/pengembang/pito.webp",
    linkedin: "https://www.linkedin.com/in/pito-desri-pauzi-181052314/",
    github: "",
    website: "",
  },
  {
    name: "Azmi Ali",
    linkedin: "",
    github: "",
    website: "",
  },
];

const team2026: Developer[] = [
  {
    name: "Anla Harpanda",
    note: "Pengembang lanjutan (April - Mei 2026)",
    photo: "/pengembang/anla.webp",
    linkedin: "https://www.linkedin.com/in/anlaharpanda/",
    github: "https://github.com/itsanla",
    website: "https://anla.my.id/",
  },
  {
    name: "Furqon August Seventeen",
    note: "Pengembang lanjutan (April - Mei 2026)",
    photo: "/pengembang/furqon.webp",
    linkedin: "https://www.linkedin.com/in/furqon-august-seventeenth-3b6a282a4/",
    github: "https://github.com/furqonaugust17",
    website: "",
  },
];

function ProfileLink({ href, label, icon }: { href?: string; label: string; icon: React.ReactNode }) {
  if (!href) {
    return <span className="text-emerald-200/60">{label}: belum ditambahkan</span>;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="inline-flex items-center gap-2 text-emerald-100 hover:text-white hover:underline"
    >
      {icon}
      <span>{label}</span>
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}

function TeamSection({
  title,
  period,
  description,
  members,
}: {
  title: string;
  period: string;
  description: string;
  members: Developer[];
}) {
  return (
    <section className="rounded-2xl border border-emerald-200/30 bg-white/10 p-6 backdrop-blur-sm sm:p-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">{period}</p>
        <h2 className="mt-2 text-2xl font-bold text-white">{title}</h2>
        <p className="mt-2 text-emerald-100/85">{description}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {members.map((member) => (
          <article
            key={member.name}
            className="rounded-xl border border-emerald-100/20 bg-emerald-900/35 p-4"
          >
            <div className="flex items-start gap-4">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-emerald-200/20 bg-emerald-950/40 sm:h-28 sm:w-28">
                {member.photo ? (
                  <div className="relative h-full w-full">
                    <Image
                      src={member.photo}
                      alt={`Foto ${member.name}`}
                      fill
                      sizes="(max-width: 640px) 96px, 112px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-full w-full items-center justify-center p-2 text-center">
                    <span className="text-xs text-emerald-200/70">Foto belum tersedia</span>
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-white">{member.name}</h3>
                {member.note ? <p className="mt-1 text-sm text-emerald-200/90">{member.note}</p> : null}

                <div className="mt-4 flex flex-col gap-2 text-sm">
                  <ProfileLink
                    href={member.linkedin}
                    label="LinkedIn"
                    icon={<Linkedin className="h-4 w-4" />}
                  />
                  <ProfileLink
                    href={member.github}
                    label="GitHub"
                    icon={<Github className="h-4 w-4" />}
                  />
                  <ProfileLink
                    href={member.website}
                    label="Website"
                    icon={<Globe className="h-4 w-4" />}
                  />
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function PengembangPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-800 px-4 py-14 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
              Kontributor Website
            </p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Tim Pengembang</h1>
            <p className="mt-3 max-w-3xl text-emerald-100/90">
              Halaman ini mencatat perjalanan pengembangan website SMK Negeri 2 Batusangkar dari
              fase awal hingga pengembangan lanjutan.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center rounded-full bg-emerald-300 px-5 py-2.5 text-sm font-semibold text-emerald-950 hover:bg-emerald-200"
          >
            Kembali ke Beranda
          </Link>
        </div>

        <div className="space-y-6">
          <TeamSection
            title="Tim Pengembangan Awal"
            period="Mei - Juli 2025"
            description="Pondasi awal sistem dikembangkan oleh tim beranggotakan lima orang."
            members={team2025}
          />

          <TeamSection
            title="Tim Pengembangan Lanjutan"
            period="April - Mei 2026"
            description="Pengembangan dilanjutkan oleh dua pengembang untuk peningkatan fitur, UI, SEO, dan stabilitas sistem."
            members={team2026}
          />
        </div>
      </div>
    </main>
  );
}
