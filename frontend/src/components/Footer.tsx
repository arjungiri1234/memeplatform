export default function Footer() {
  return (
    <footer className="w-full border-t border-[#1e1e1e] bg-[#111111]">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-0 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-1 text-center sm:gap-0.5 sm:pb-[max(16px,env(safe-area-inset-bottom))] sm:pt-2 md:flex-row md:justify-between md:gap-2 md:px-16 md:py-8 md:text-left">
        <span className="font-display text-sm font-bold text-white sm:text-base md:text-lg">
          meme<span className="text-[#00e676]">it</span>
        </span>
        <p className="text-[12px] leading-relaxed text-[#a1a1a1] md:text-[#555555] md:transition-colors md:hover:text-[#888888]">
          &copy; 2025 memeit. All rights reserved.
        </p>
        <p className="text-[12px] leading-relaxed text-[#a1a1a1] md:text-[#555555] md:transition-colors md:hover:text-[#888888]">
          Built for the internet, in every language.
        </p>
      </div>
    </footer>
  )
}
