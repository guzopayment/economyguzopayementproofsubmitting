// BackToTopButton.jsx
import { useEffect, useState } from "react";
import BackToTop from "../assets/riseUp.png";

export default function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      className={`
        fixed bottom-6 right-6 z-[999]
        w-12 h-12 md:w-10 md:h-10
        rounded-full shadow-lg
        bg-purple-700 text-white text-xl md:text-2xl font-bold
        transition-all duration-300
        hover:bg-purple-800 hover:scale-110
        ${visible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"}
      `}
    >
      <img src={BackToTop} alt="BtoTop" title="Rise to Top" />
    </button>
  );
}
