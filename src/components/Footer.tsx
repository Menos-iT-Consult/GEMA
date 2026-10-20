export default function Footer() {
  return (
    <footer
      className="mt-16 bg-navy-950 text-slate-300 overflow-hidden"
      style={{
        backgroundImage:
          'radial-gradient(circle at 50% 50%, rgba(35, 45, 105, 0.8), rgba(10, 15, 60, 0.9)), repeating-conic-gradient(from 45deg, #ec4899 0deg 15deg, #f59e0b 15deg 30deg, #10b981 30deg 45deg, #3b82f6 45deg 60deg, #8b5cf6 60deg 75deg, transparent 75deg 90deg), repeating-radial-gradient(circle at center, rgba(255, 255, 255, 0.04) 0, rgba(255, 255, 255, 0.06) 2px, transparent 2px, transparent 5px), linear-gradient(45deg, transparent 48%, rgba(255, 255, 255, 0.03) 48%, rgba(255, 255, 255, 0.03) 52%, transparent 52%), linear-gradient(-45deg, transparent 48%, rgba(255, 255, 255, 0.03) 48%, rgba(255, 255, 255, 0.03) 52%, transparent 52%)',
        backgroundSize:
          '100% 100%, 300px 300px, 150px 150px, 20px 20px, 20px 20px',
        backgroundBlendMode:
          'overlay, screen, overlay, normal, normal',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <p className="font-serif text-xl font-bold text-white">Ghana Evangelical Missions Association</p>
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
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a
                href="https://wa.me/+233246391921"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-green-400 transition"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLineCap="round"
                    strokeLineJoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 014 4v7a4 4 0 01-4 4M5 7a4 4 0 01-4-4V4a4 4 0 014-4m6 7l5 5m0 0l-5 5m5-5v7a2 2 0 01-2 2H5a2 2 0 01-2-2V4a2 2 0 012-2h7a2 2 0 012 2z"
                  />
                </svg>
                WhatsApp
              </a>
            </li>
            <li>
              <a
                href="http://www.instagram.com/gemaghana"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-pink-300 transition"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLineCap="round"
                    strokeLineJoin="round"
                    strokeWidth={2}
                    d="M17 3h5l-4 10-4-10h5V3zm0 0l4 10-4 10H5a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v10z"
                  />
                </svg>
                Instagram
              </a>
            </li>
            <li>
              <a
                href="http://www.x.com/gemaghana"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-slate-300 transition"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLineCap="round"
                    strokeLineJoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.069A1 1 0 0013.248 9h1.5a1 1 0 01.776.536l-1.74 5.332 3.866-1.1A1 1 0 0122 12h-1.172m-4.205-1.068l-3.057 7h-4.788l-3.057-7H5.71a2 2 0 01-1.986-1.823l-1.459-4H2.5a2 2 0 01-1.987-1.273l-1.459 4H.28a2 2 0 01-1.986-1.823l-1.46-4A2 2 0 001.274 3H5v7h3.683l1.197-3.075a1 1 0 01.535-.29l3.381 1.6a1 1 0 01.569.36l-1.767 5.327z"
                  />
                </svg>
                X
              </a>
            </li>
            <li>
              <a
                href="http://www.youtube.com/gemaghana"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-red-400 transition"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLineCap="round"
                    strokeLineJoin="round"
                    strokeWidth={2}
                    d="M20 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v2M20 19l-2 2m-4.588-5.412L16 12l-1.588 1.412M7 7l-2 2m-6.588 5.412L4 12l1.588 1.412M7 17l2 2m6.588-5.412L8 12l1.588-1.412"
                  />
                </svg>
                YouTube
              </a>
            </li>
            <li>
              <a
                href="http://www.facebook.com/gemaghana"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-blue-300 transition"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLineCap="round"
                    strokeLineJoin="round"
                    strokeWidth={2}
                    d="M3 13a4 4 0 014-4H7m15 0a4 4 0 014 4v3m-4-4l-4 4m0 0l-4-4m4 4V7a1 1 0 012 0v6m0 0a4 4 0 11-8 0M3 8a5 5 0 015-5h5a5 5 0 015 5 5 5 0 01-5 5H3z"
                  />
                </svg>
                Facebook
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Ghana Evangelical Missions Association. All rights reserved.
      </div>
    </footer>
  );
}
