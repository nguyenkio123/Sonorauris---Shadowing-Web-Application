import { forwardRef, useCallback, useImperativeHandle } from "react";
import type { AnimatedIconHandle, AnimatedIconProps } from "../itshover/types";
import { motion, useAnimate } from "motion/react";

const MicIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  (
    { size = 24, color = "currentColor", strokeWidth = 2, className = "" },
    ref,
  ) => {
    const [scope, animate] = useAnimate();

    const start = useCallback(async () => {
      animate(
        ".mic-capsule",
        { y: [0, -2, 0], scale: [1, 1.08, 1] },
        { duration: 0.45, ease: "easeOut" },
      );
      animate(
        ".mic-cradle",
        { scale: [1, 1.04, 1] },
        { duration: 0.45, ease: "easeOut" },
      );
    }, [animate]);

    const stop = useCallback(() => {
      animate(".mic-capsule", { y: 0, scale: 1 }, { duration: 0.2 });
      animate(".mic-cradle", { scale: 1 }, { duration: 0.2 });
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
          className="mic-capsule"
          style={{ transformOrigin: "12px 8px" }}
          d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"
        />
        <motion.g
          className="mic-cradle"
          style={{ transformOrigin: "12px 15px" }}
        >
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" x2="12" y1="19" y2="22" />
        </motion.g>
      </motion.svg>
    );
  },
);

MicIcon.displayName = "MicIcon";
export default MicIcon;
