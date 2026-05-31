import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main>
        {/* NAVBAR */}
        <nav className="bg-neutral-primary fixed w-full z-20 top-0 start-0 border-b border-white/30">
          <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
            <a
              href="https://flowbite.com/"
              className="flex items-center space-x-3 rtl:space-x-reverse"
            >
              <img
                src="https://flowbite.com/docs/images/logo.svg"
                className="h-7"
                alt="Flowbite Logo"
              />
              <span className="self-center text-xl text-heading font-semibold whitespace-nowrap">
                SnapShot
              </span>
            </a>
            <div className="flex gap-3">
              <button
                type="button"
                className="text-white bg-black hover:bg-white/20 box-border border-white/30 border-[0.5px] focus:ring-4 focus:ring-blue-300 shadow-xs font-medium cursor-pointer leading-5 rounded-md text-sm px-3 py-2 focus:outline-none"
              >
                Share
              </button>
              <button
                type="button"
                className="text-white bg-blue-600 hover:bg-blue-700 box-border border border-transparent focus:ring-4 focus:ring-blue-300 shadow-xs font-medium cursor-pointer leading-5 rounded-md text-sm px-3 py-2 focus:outline-none"
              >
                Save / Export
              </button>
            </div>
          </div>
        </nav>

      </main>
    </div>
  );
}
