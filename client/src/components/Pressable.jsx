import { motion } from "framer-motion";

const tapTransition = {
  type: "spring",
  stiffness: 420,
  damping: 22
};

export function Pressable({
  as = "button",
  className = "",
  children,
  whileTap,
  whileHover,
  transition,
  ...props
}) {
  const Component = motion[as] ?? motion.button;

  return (
    <Component
      className={className}
      whileTap={whileTap ?? { scale: 0.97, y: 1 }}
      whileHover={whileHover ?? { y: -1 }}
      transition={transition ?? tapTransition}
      {...props}
    >
      {children}
    </Component>
  );
}
