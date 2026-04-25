'use client';

const shimmer = "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent";

export const HeroSkeleton = () => (
  <section className="relative h-screen flex items-center justify-center bg-emerald-950">
    <div className="container mx-auto relative z-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="text-left space-y-6">
          <div className={`h-8 w-48 rounded-full bg-emerald-800/60 ${shimmer}`} />
          <div className="space-y-3">
            <div className={`h-14 w-full max-w-lg rounded-lg bg-emerald-800/50 ${shimmer}`} />
            <div className={`h-14 w-3/4 rounded-lg bg-emerald-800/50 ${shimmer}`} />
          </div>
          <div className={`h-8 w-2/3 rounded-lg bg-emerald-800/40 ${shimmer}`} />
          <div className="space-y-2">
            <div className={`h-5 w-full max-w-xl rounded bg-emerald-800/30 ${shimmer}`} />
            <div className={`h-5 w-4/5 rounded bg-emerald-800/30 ${shimmer}`} />
          </div>
          <div className="flex gap-4 pt-2">
            <div className={`h-12 w-40 rounded-full bg-emerald-700/50 ${shimmer}`} />
            <div className={`h-12 w-36 rounded-full bg-emerald-800/40 ${shimmer}`} />
          </div>
        </div>
        <div className="hidden lg:flex justify-center">
          <div className={`w-80 h-80 rounded-full bg-emerald-800/40 ${shimmer}`} />
        </div>
      </div>
    </div>
  </section>
);

export const SectionSkeleton = ({ dark = false }: { dark?: boolean }) => {
  const bg = dark ? 'bg-emerald-800/40' : 'bg-gray-200';
  const bgLight = dark ? 'bg-emerald-800/30' : 'bg-gray-100';
  
  return (
    <section className={`py-24 ${dark ? 'bg-emerald-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto">
        <div className="text-center mb-16 space-y-4">
          <div className={`h-6 w-32 rounded-full ${bgLight} mx-auto ${shimmer}`} />
          <div className={`h-10 w-64 rounded-lg ${bg} mx-auto ${shimmer}`} />
          <div className={`h-5 w-96 max-w-full rounded ${bgLight} mx-auto ${shimmer}`} />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`rounded-2xl overflow-hidden ${dark ? 'bg-emerald-800/30' : 'bg-white'} shadow-lg`}>
              <div className={`h-48 ${bg} ${shimmer}`} />
              <div className="p-6 space-y-3">
                <div className={`h-6 w-3/4 rounded ${bgLight} ${shimmer}`} />
                <div className={`h-4 w-full rounded ${bgLight} ${shimmer}`} />
                <div className={`h-4 w-2/3 rounded ${bgLight} ${shimmer}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const TefaSkeleton = () => (
  <section className="relative bg-gradient-to-b from-emerald-900 to-green-800 py-20">
    <div className="container mx-auto relative z-10">
      <div className="text-center mb-12 space-y-4">
        <div className={`h-8 w-40 rounded-full bg-white/10 mx-auto ${shimmer}`} />
        <div className={`h-12 w-80 max-w-full rounded-lg bg-white/15 mx-auto ${shimmer}`} />
        <div className={`h-1 w-32 rounded-full bg-green-400/30 mx-auto ${shimmer}`} />
        <div className={`h-5 w-96 max-w-full rounded bg-white/10 mx-auto ${shimmer}`} />
      </div>
      <div className={`rounded-3xl p-6 md:p-10 bg-white/10 border border-white/20 ${shimmer}`}>
        <div className="flex flex-col lg:flex-row gap-8 items-center">
          <div className={`lg:w-1/2 w-full aspect-[4/3] rounded-2xl bg-white/10 ${shimmer}`} />
          <div className="lg:w-1/2 w-full space-y-4">
            <div className={`h-10 w-3/4 rounded-lg bg-white/15 ${shimmer}`} />
            <div className={`h-1 w-24 rounded-full bg-green-400/30 ${shimmer}`} />
            <div className="space-y-2">
              <div className={`h-5 w-full rounded bg-white/10 ${shimmer}`} />
              <div className={`h-5 w-5/6 rounded bg-white/10 ${shimmer}`} />
              <div className={`h-5 w-4/6 rounded bg-white/10 ${shimmer}`} />
            </div>
            <div className="flex gap-3 pt-4">
              <div className={`h-12 w-36 rounded-full bg-emerald-500/30 ${shimmer}`} />
              <div className={`h-12 w-36 rounded-full bg-white/10 ${shimmer}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export const ProfileSkeleton = () => (
  <section className="py-24 bg-gradient-to-b from-white to-emerald-50">
    <div className="container mx-auto">
      <div className="text-center mb-16 space-y-4">
        <div className={`h-6 w-28 rounded-full bg-green-100 mx-auto ${shimmer}`} />
        <div className={`h-10 w-56 rounded-lg bg-gray-200 mx-auto ${shimmer}`} />
        <div className={`h-5 w-96 max-w-full rounded bg-gray-100 mx-auto ${shimmer}`} />
      </div>
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-4">
          <div className={`h-6 w-40 rounded bg-gray-200 ${shimmer}`} />
          <div className={`h-8 w-72 rounded-lg bg-gray-200 ${shimmer}`} />
          <div className="space-y-2">
            <div className={`h-4 w-full rounded bg-gray-100 ${shimmer}`} />
            <div className={`h-4 w-full rounded bg-gray-100 ${shimmer}`} />
            <div className={`h-4 w-3/4 rounded bg-gray-100 ${shimmer}`} />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`h-20 rounded-xl bg-emerald-50 ${shimmer}`} />
            ))}
          </div>
        </div>
        <div className="flex justify-center">
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4 w-full max-w-sm">
            <div className={`h-48 w-48 rounded-xl bg-gray-200 mx-auto ${shimmer}`} />
            <div className={`h-6 w-48 rounded bg-gray-200 mx-auto ${shimmer}`} />
            <div className={`h-4 w-28 rounded bg-gray-100 mx-auto ${shimmer}`} />
            <div className="space-y-2 mt-4">
              <div className={`h-4 w-full rounded bg-gray-100 ${shimmer}`} />
              <div className={`h-4 w-full rounded bg-gray-100 ${shimmer}`} />
              <div className={`h-4 w-3/4 rounded bg-gray-100 ${shimmer}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export const FooterSkeleton = () => (
  <footer className="bg-emerald-950 py-20">
    <div className="container mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-4">
            <div className={`h-6 w-40 rounded bg-emerald-800/60 ${shimmer}`} />
            <div className={`h-4 w-full rounded bg-emerald-800/40 ${shimmer}`} />
            <div className={`h-4 w-3/4 rounded bg-emerald-800/40 ${shimmer}`} />
            <div className={`h-4 w-1/2 rounded bg-emerald-800/40 ${shimmer}`} />
          </div>
        ))}
      </div>
    </div>
  </footer>
);
