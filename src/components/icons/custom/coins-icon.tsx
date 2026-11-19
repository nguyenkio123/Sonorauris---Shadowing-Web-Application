import { forwardRef, useCallback, useImperativeHandle } from "react";
import type { AnimatedIconHandle, AnimatedIconProps } from "../itshover/types";
import { motion, useAnimate } from "motion/react";

const CoinsIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  (
    { size = 24, color = "currentColor", strokeWidth = 2, className = "" },
    ref,
  ) => {
    const [scope, animate] = useAnimate();

    const start = useCallback(async () => {
      animate(
        ".coin-front",
        { y: [0, -2.5, 0], rotate: [0, -8, 0] },
        { duration: 0.45, ease: "easeOut" },
      );
      animate(
        ".coin-back",
        { y: [0, -1.5, 0], rotate: [0, 8, 0] },
        { duration: 0.45, ease: "easeOut", delay: 0.05 },
      );
    }, [animate]);

    const stop = useCallback(() => {
      animate(".coin-front, .coin-back", { y: 0, rotate: 0 }, { duration: 0.2 });
    }, [animate]);

    useImperativeHandle(ref, () => ({
      startAnimation: start,
      stopAnimation: stop,
    }));

    return (
      <motion.svg
        ref={scope}
        onHoverStart={start}
        onHoverEnd={stop}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`cursor-pointer ${className}`}
        style={{ overflow: "visible" }}
      >
        <motion.g
          className="coin-front"
          style={{ transformOrigin: "8px 8px" }}
        >
          <circle cx="8" cy="8" r="6" />
          <path d="M7 6h1v4" />
        </motion.g>
        <motion.g
          className="coin-back"
          style={{ transformOrigin: "16px 16px" }}
        >
          <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
          <path d="m16.71 13.88.7.71-2.82 2.82" />
        </motion.g>
      </motion.svg>
    );
  },
);

CoinsIcon.displayName = "CoinsIcon";
export default CoinsIcon;
