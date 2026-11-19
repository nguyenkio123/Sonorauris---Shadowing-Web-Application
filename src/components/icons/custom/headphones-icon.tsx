import { forwardRef, useCallback, useImperativeHandle } from "react";
import type { AnimatedIconHandle, AnimatedIconProps } from "../itshover/types";
import { motion, useAnimate } from "motion/react";

const HeadphonesIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  (
    { size = 24, color = "currentColor", strokeWidth = 2, className = "" },
    ref,
  ) => {
    const [scope, animate] = useAnimate();

    const start = useCallback(async () => {
      animate(
        ".hp-arc",
        { y: [0, -2, 0], rotate: [0, -6, 6, 0] },
        { duration: 0.55, ease: "easeInOut" },
      );
      animate(
        ".hp-cups",
        { scale: [1, 1.08, 1] },
        { duration: 0.45, ease: "easeOut" },
      );
    }, [animate]);

    const stop = useCallback(() => {
      animate(".hp-arc", { y: 0, rotate: 0 }, { duration: 0.2, ease: "easeOut" });
      animate(".hp-cups", { scale: 1 }, { duration: 0.2, ease: "easeOut" });
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
        <motion.path
          className="hp-arc"
          style={{ transformOrigin: "12px 12px" }}
          d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"
        />
        <motion.g className="hp-cups" style={{ transformOrigin: "12px 17px" }}>
          <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5z" />
          <path d="M16 16a2 2 0 0 1 2-2h3v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3z" />
        </motion.g>
      </motion.svg>
    );
  },
);

HeadphonesIcon.displayName = "HeadphonesIcon";
export default HeadphonesIcon;
