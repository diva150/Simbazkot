/**
 * Barrel export for motion primitives.
 *
 * Import via:
 *   import { FadeUp, Stagger, StaggerItem, GlassCard, GhostNumber,
 *           Lift, AnimatedNumber, PageTransition, Pressable } from "@/components/motion";
 *
 * All exports are client components. Server components can still compose
 * them as children — only the consumer needs `"use client"`.
 */

export {
  EASE_SOFT,
  fadeUpVariants,
  staggerContainerVariants,
  staggerItemVariants,
  scaleInVariants,
  FadeUp,
  Stagger,
  StaggerItem,
  Lift,
  AnimatedNumber,
  GlassCard,
  GhostNumber,
  PageTransition,
  Pressable,
} from "./primitives";
