import Link from 'next/link';

const NotFound = () => {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-lg w-full rounded-3xl border border-slate-700/60 bg-slate-900/80 p-10 text-center shadow-2xl shadow-slate-950/30">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">
          404
        </p>
        <h1 className="mt-4 text-4xl font-bold text-slate-100">
          Page Not Found
        </h1>
        <p className="mt-4 text-slate-300 leading-relaxed">
          This route does not exist in Mappil’s current map game and quiz set.
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href="/"
            className="inline-block px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-full font-bold text-lg shadow-lg shadow-amber-500/25 transition-transform hover:scale-105 active:scale-95"
          >
            Return Home
          </Link>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
