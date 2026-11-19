import { forwardRef, useCallback, useImperativeHandle } from "react";
import type { AnimatedIconHandle, AnimatedIconProps } from "../itshover/types";
import { motion, useAnimate } from "motion/react";

const ZapIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  (
    { size = 24, color = "currentColor", strokeWidth = 2, className = "" },
    ref,
  ) => {
    const [scope, animate] = useAnimate();

    const start = useCallback(async () => {
      await animate(
        ".zap-bolt",
        { scale: [1, 1.2, 0.95, 1.08, 1], rotate: [0, -6, 4, 0] },
        { duration: 0.5, ease: "easeOut" },
      );
    }, [animate]);

    const stop = useCallback(() => {
      animate(".zap-bolt", { scale: 1, rotate: 0 }, { duration: 0.2 });
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
          className="zap-bolt"
          style={{ transformOrigin: "12px 12px" }}
          d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"
        />
      </motion.svg>
    );
  },
);

ZapIcon.displayName = "ZapIcon";
export default ZapIcon;
