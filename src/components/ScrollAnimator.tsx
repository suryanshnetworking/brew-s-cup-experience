import { useEffect, useRef, ReactNode } from "react";

interface Props {
  children: ReactNode;
  index: number;
}

export default function ScrollAnimator({ children, index }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`section-animate ${index % 2 !== 0 ? "from-right" : ""}`}
    >
      {children}
    </div>
  );
}
