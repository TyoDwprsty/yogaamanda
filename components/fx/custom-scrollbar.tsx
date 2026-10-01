"use client";

import { useEffect, useRef } from "react";
import { scrollToY } from "./smooth-scroll";

const MIN_THUMB = 56;
const IDLE_MS = 1400;

/**
 * Replaces the hidden native scrollbar with a slim rail (gold while hovered or dragged). It wakes up while
 * scrolling or when the pointer nears the right edge, and can be dragged or clicked.
 */
export function CustomScrollbar() {
  const railRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rail = railRef.current!;
    const thumb = thumbRef.current!;
    const doc = document.documentElement;
    let thumbH = 0;
    let idle = 0;
    let dragging = false;
    let hovering = false;

    const layout = () => {
      const vh = window.innerHeight;
      const total = doc.scrollHeight;
      const scrollable = total - vh;
      rail.dataset.hidden = scrollable <= 4 ? "true" : "false";
      thumbH = Math.max(MIN_THUMB, (vh / total) * vh);
      thumb.style.height = `${thumbH}px`;
      const p = scrollable > 0 ? window.scrollY / scrollable : 0;
      thumb.style.transform = `translate3d(0, ${p * (vh - thumbH)}px, 0)`;
    };

    const wake = () => {
      rail.dataset.active = "true";
      window.clearTimeout(idle);
      idle = window.setTimeout(() => {
        if (!dragging && !hovering) rail.dataset.active = "false";
      }, IDLE_MS);
    };

    const onScroll = () => {
      layout();
      wake();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const near = window.innerWidth - e.clientX < 28;
      if (near !== hovering) {
        hovering = near;
        rail.dataset.hover = near ? "true" : "false";
        if (near) wake();
      }
    };

    let startY = 0;
    let startScroll = 0;
    const onThumbDown = (e: PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragging = true;
      rail.dataset.dragging = "true";
      startY = e.clientY;
      startScroll = window.scrollY;
      thumb.setPointerCapture(e.pointerId);
    };
    const onThumbMove = (e: PointerEvent) => {
      if (!dragging) return;
      const vh = window.innerHeight;
      const scrollable = doc.scrollHeight - vh;
      const ratio = scrollable / (vh - thumbH);
      scrollToY(startScroll + (e.clientY - startY) * ratio, true);
    };
    const onThumbUp = (e: PointerEvent) => {
      dragging = false;
      rail.dataset.dragging = "false";
      if (thumb.hasPointerCapture(e.pointerId)) thumb.releasePointerCapture(e.pointerId);
      wake();
    };
    const onRailDown = (e: PointerEvent) => {
      if (e.target !== rail) return;
      const vh = window.innerHeight;
      const p = (e.clientY - thumbH / 2) / (vh - thumbH);
      scrollToY(Math.max(0, Math.min(1, p)) * (doc.scrollHeight - vh));
    };

    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(document.body);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", layout);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    thumb.addEventListener("pointerdown", onThumbDown);
    thumb.addEventListener("pointermove", onThumbMove);
    thumb.addEventListener("pointerup", onThumbUp);
    thumb.addEventListener("pointercancel", onThumbUp);
    rail.addEventListener("pointerdown", onRailDown);

    return () => {
      ro.disconnect();
      window.clearTimeout(idle);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", layout);
      window.removeEventListener("pointermove", onPointerMove);
      thumb.removeEventListener("pointerdown", onThumbDown);
      thumb.removeEventListener("pointermove", onThumbMove);
      thumb.removeEventListener("pointerup", onThumbUp);
      thumb.removeEventListener("pointercancel", onThumbUp);
      rail.removeEventListener("pointerdown", onRailDown);
    };
  }, []);

  return (
    <div
      ref={railRef}
      aria-hidden="true"
      data-active="false"
      data-hidden="true"
      className="group fixed top-0 right-0 bottom-0 z-[70] w-3.5 opacity-0 transition-opacity duration-500 data-[active=true]:opacity-100 data-[hover=true]:opacity-100 data-[hidden=true]:hidden pointer-coarse:pointer-events-none"
    >
      <div className="pointer-events-none absolute inset-y-2 right-1 w-px bg-line opacity-0 transition-opacity duration-500 group-data-[hover=true]:opacity-100 group-data-[dragging=true]:opacity-100" />
      <div
        ref={thumbRef}
        className="absolute top-0 right-[3px] w-[5px] cursor-grab touch-none rounded-full bg-muted/45 transition-[width,right,background-color] duration-300 ease-out will-change-transform group-data-[hover=true]:right-[2px] group-data-[hover=true]:w-[8px] group-data-[hover=true]:bg-gold group-data-[dragging=true]:cursor-grabbing group-data-[dragging=true]:bg-gold"
      />
    </div>
  );
}
