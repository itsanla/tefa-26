'use client'
import Image from "next/image";

// ─── Icons ────────────────────────────────────────────────────────────────────

const ExternalArrow = () => (
  <span className="inline-flex items-center justify-center w-3.5 h-3.5 bg-[#6b6e10] rounded-[3px] flex-shrink-0">
    <svg width={8} height={8} viewBox="0 0 10 10" fill="none">
      <path d="M2 8L8 2M8 2H3M8 2V7" stroke="#f6fb17" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  </span>
);

const BtnArrow = () => (
  <span className="w-[22px] h-[22px] rounded-full bg-[#f6fb17] flex items-center justify-center flex-shrink-0">
    <svg width={11} height={11} viewBox="0 0 12 12" fill="none">
      <path
        d="M2 6h8M7 3l3 3-3 3"
        stroke="#3a3c06"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);

const GolfLogo = () => (
  <Image
    src="/icon.webp"
    alt="SMK 2 Logo"
    width={150}
    height={150}
    className="drop-shadow-lg"
  />
);

// ─── Flag SVGs ────────────────────────────────────────────────────────────────

const FlagNL = () => (
  <svg width={20} height={13} viewBox="0 0 20 13" className="rounded-sm overflow-hidden">
    <rect width="20" height="4.5" fill="#AE1C28" />
    <rect y="4.5" width="20" height="4" fill="#fff" />
    <rect y="9" width="20" height="4" fill="#003082" />
  </svg>
);

const FlagDE = () => (
  <svg width={20} height={13} viewBox="0 0 20 13" className="rounded-sm overflow-hidden">
    <rect width="20" height="4.5" fill="#000" />
    <rect y="4.5" width="20" height="4" fill="#D90000" />
    <rect y="9" width="20" height="4" fill="#FFCE00" />
  </svg>
);

const FlagBe = () => (
  <svg width={20} height={13} viewBox="0 0 20 13" className="rounded-sm overflow-hidden">
    <rect width="7" height="13" fill="#1C1C1C" />
    <rect x="7" width="6" height="13" fill="#FFCE00" />
    <rect x="13" width="7" height="13" fill="#AE1C28" />
  </svg>
);

// ─── Contact Column ───────────────────────────────────────────────────────────

const ContactColumn = () => (
    <div className="pr-4 flex flex-col lg:flex-row gap-x-16">
      <div className="flex flex-col">
      <p className="text-[15px] font-medium text-[#F0EAD2] mb-2.5 tracking-wide">Contact</p>

      <p className="text-[13px] text-[#8A8679] leading-relaxed mb-0.5">
        Woelwijk 101,<br />
        8926 XD Leeuwarden<br />
        0511 - 43 22 99
      </p>

      <a
        href="mailto:info@leeuwardergolfclub.nl"
        className="text-[13px] text-[#8A8679] no-underline hover:text-[#F0EAD2] transition-colors duration-200"
      >
        info@leeuwardergolfclub.nl
      </a>
    </div>

    <div className="mt-5 flex flex-col gap-1">
      {["Facebook", "Instagram", "LinkedIn"].map((name) => (
        <a
          key={name}
          href="#"
          className="flex items-center gap-1.5 text-[13.5px] text-[#F0EAD2] no-underline leading-[1.8] hover:text-[#f6fb17] transition-colors duration-200"
        >
          {name}
          <ExternalArrow />
        </a>
      ))}
    </div>
  </div>
);

// ─── CTA Column ──────────────────────────────────────────────────────────────

const CTAColumn = () => (
  <div className="flex flex-row items-center gap-3">
    {["Starttijd reserveren", "Direct lid worden"].map((label) => (
      <button
        key={label}
        className="flex items-center gap-2 px-5 py-[13px] rounded-full border border-[#6b6e10] bg-[#3a3c06] text-[#f6fb17] text-[14px] font-medium cursor-pointer whitespace-nowrap hover:bg-[#454708] transition-colors duration-200"
      >
        {label}
        <BtnArrow />
      </button>
    ))}
  </div>
);

// ─── Nav Column ───────────────────────────────────────────────────────────────

const navLinks = [
  "Onze club",
  "De baan",
  "Voor gasten",
  "Onze evenementen",
  "Beginnen met Golf",
  "Contact",
];

const NavColumn = () => (
  <div>
    <p className="text-[15px] font-medium text-[#F0EAD2] mb-2.5 tracking-wide">Snel naar</p>
    <div className="grid grid-cols-2 gap-x-6 gap-y-0">
      {navLinks.map((link) => (
        <a
          key={link}
          href="#"
          className="text-[13px] text-[#8A8679] no-underline leading-[1.9] hover:text-[#F0EAD2] transition-colors duration-200"
        >
          {link}
        </a>
      ))}
    </div>
  </div>
);

// ─── Footer Bottom Bar ────────────────────────────────────────────────────────

const FooterBottom = () => (
  <div className="border-t border-[#2A2A2A] py-3.5 flex items-center justify-between relative z-10">
    {/* Left: Leadingcourses badge + flags */}
    <div className="flex items-center gap-2">
      <span className="bg-[#6b6e10] text-[#fafc6a] text-[12px] font-medium px-[7px] py-[3px] rounded-[5px] leading-none">
        7.9
      </span>
      <span className="text-[11.5px] text-[#6B6760]">Leadingcourses score</span>
      <div className="flex items-center gap-1 ml-1.5">
        <FlagNL />
        <FlagDE />
        <FlagBe />
      </div>
    </div>

    {/* Right: Legal links + copyright */}
    <div className="flex items-center gap-3">
      {["Cookies policy", "Privacy policy"].map((label) => (
        <a
          key={label}
          href="#"
          className="text-[12px] text-[#6B6760] no-underline bg-[#252525] px-3 py-[5px] rounded-full border border-[#333] hover:text-[#F0EAD2] transition-colors duration-200"
        >
          {label}
        </a>
      ))}
      <span className="text-[12px] text-[#6B6760]">©2025</span>
    </div>
  </div>
);

// ─── Main Footer Component ────────────────────────────────────────────────────

export default function Footer() {
  return (
    <footer className="font-sans">
      {/* Logo */}
      <div className="flex justify-center relative z-10 pt-14 -mb-16">
        <GolfLogo />
      </div>

      {/* Dark panel */}
      <div
        className="rounded-t-3xl px-4 lg:px-16 pt-14 relative overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bg-footer.webp')" }}
      >
{/* Brand heading */}
        <div className="text-center mt-10 relative z-10">
          <h2
            className="text-[36px] font-bold text-[#F0EAD2] leading-tight mb-2 tracking-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            SMK Negeri 2
            <br />
            Barusangkar
          </h2>
          <p
            className="text-base text-[#9E9A8C] italic"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Waar golfgeluk begint
          </p>
        </div>

        {/* Three-column body */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 items-center relative z-10 pb-8">
          <ContactColumn />
          <div className="hidden lg:block">
          <CTAColumn />
          </div>
          <NavColumn />
        </div>

        {/* Bottom bar */}
        <FooterBottom />
      </div>
    </footer>
  );
}