export default function Footer() {
  return (
    <footer className="mt-16 bg-navy-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <p className="font-serif text-xl font-bold text-white">Ghana Missions</p>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-300">
            Centralized directory and verification portal for evangelical churches, mission
            agencies and ministries across the 16 regions of Ghana.
          </p>
          <p className="mt-4 text-xs uppercase tracking-widest text-ochre-300">
            Soli Deo Gloria • To Ghana and Beyond
          </p>
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-white">Explore</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li><a className="hover:text-white" href="/">Directory</a></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-white">Contact</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li>Accra, Greater Accra — Ghana</li>
            <li>info@ghanamissions.org</li>
            <li>+233 30 000 0000</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Ghana Missions Evangelical Association. All rights reserved.
      </div>
    </footer>
  );
}
