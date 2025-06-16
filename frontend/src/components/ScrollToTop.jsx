import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop({ children }) {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      // No hash: scroll to top
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    } else {
      // With hash: scroll to the element with that id
      const el = document.getElementById(hash.replace("#", ""));
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [pathname, hash]);

  return children;
}
