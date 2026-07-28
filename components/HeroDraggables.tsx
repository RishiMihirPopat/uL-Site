'use client';

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import styles from './HeroDraggables.module.css';

/* ── Data ──────────────────────────────────────────────────── */

interface ScatterObj {
  id: string;
  label: string;
  icon: string;
  src?: string;    // real image from public/moveable/; falls back to icon if absent
  xPct: number;    // initial left as % of hero width
  yPct: number;    // initial top  as % of hero height
  rotation: number;
}

/*
  Positions are tuned to cluster in corners + edges,
  leaving the hero center (wordmark left / postcard right) clear.
  Replace icons + labels when real images are ready.
*/
const OBJECTS: ScatterObj[] = [
  { id: 'camera',   label: 'Vintage Camera',      icon: '⊙', src: '/moveable/camera.png',      xPct:   3,   yPct:  2,  rotation:  -8 },
  { id: 'cassette', label: 'Cassette Tape',       icon: '◈', src: '/moveable/cassette.png',     xPct:  14,   yPct:  8,  rotation: -11 },
  { id: 'flower',   label: 'Pressed Flower',      icon: '✿', src: '/moveable/flowerstampt.png', xPct:   2,   yPct: 19,  rotation:   7 },
  { id: 'notebook', label: 'unLecture Notebook',  icon: '⋮', src: '/moveable/notebook.png',     xPct:  -4,   yPct: 83,  rotation:   5 },
  { id: 'zines',    label: 'Stack of Zines',      icon: '≡', src: '/moveable/zine.png',         xPct:  64.5, yPct: -12, rotation:   5 },
  { id: 'coffee',   label: 'Coffee Cup',          icon: '○', src: '/moveable/mug.png',          xPct:  77,   yPct: 65,  rotation:   9 },
  { id: 'polaroid', label: 'Polaroid Photo',      icon: '▭', src: '/moveable/ulbill.png',       xPct:  38,   yPct: 70,  rotation:  -7 },
];

/* ── Drag hook ─────────────────────────────────────────────── */

interface Pos { x: number; y: number }

function useDrag(
  initX: number,
  initY: number,
  rotation: number,
  containerRef: React.RefObject<HTMLDivElement | null>
) {
  const itemRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const isDraggingRef   = useRef(false);
  const posRef          = useRef<Pos>({ x: initX, y: initY });
  const mouseOffsetRef  = useRef<Pos>({ x: 0, y: 0 });
  const containerRect   = useRef<DOMRect | null>(null);
  const velRef          = useRef<Pos>({ x: 0, y: 0 });
  const prevMouseRef    = useRef<Pos>({ x: 0, y: 0 });
  const rafRef          = useRef(0);

  /* Set CSS custom properties directly — avoids style={} prop and skips React re-renders for position updates */
  const applyPos = useCallback((p: Pos) => {
    posRef.current = p;
    const el = itemRef.current;
    if (!el) return;
    el.style.setProperty('--ix', `${p.x}px`);
    el.style.setProperty('--iy', `${p.y}px`);
  }, []);

  /* Sync initial values synchronously before first paint */
  useLayoutEffect(() => {
    const el = itemRef.current;
    if (!el) return;
    posRef.current = { x: initX, y: initY };
    el.style.setProperty('--ix', `${initX}px`);
    el.style.setProperty('--iy', `${initY}px`);
    el.style.setProperty('--irot', `${rotation}deg`);
  }, [initX, initY, rotation]);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      cancelAnimationFrame(rafRef.current);

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      containerRect.current = rect;
      mouseOffsetRef.current = {
        x: e.clientX - rect.left - posRef.current.x,
        y: e.clientY - rect.top  - posRef.current.y,
      };
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
      velRef.current = { x: 0, y: 0 };

      isDraggingRef.current = true;
      setIsDragging(true);
    },
    [containerRef]
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !containerRect.current) return;

      velRef.current = {
        x: e.clientX - prevMouseRef.current.x,
        y: e.clientY - prevMouseRef.current.y,
      };
      prevMouseRef.current = { x: e.clientX, y: e.clientY };

      applyPos({
        x: e.clientX - containerRect.current.left - mouseOffsetRef.current.x,
        y: e.clientY - containerRect.current.top  - mouseOffsetRef.current.y,
      });
    };

    const onUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      setIsDragging(false);

      /* Inertia: 82% friction gives a weighty, non-floaty feel */
      let v = { ...velRef.current };
      const tick = () => {
        v = { x: v.x * 0.82, y: v.y * 0.82 };
        applyPos({ x: posRef.current.x + v.x, y: posRef.current.y + v.y });
        if (Math.abs(v.x) > 0.3 || Math.abs(v.y) > 0.3) {
          rafRef.current = requestAnimationFrame(tick);
        }
      };
      if (Math.abs(v.x) > 0.8 || Math.abs(v.y) > 0.8) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      cancelAnimationFrame(rafRef.current);
    };
  }, [applyPos]);

  return { itemRef, isDragging, onMouseDown };
}

/* ── Single draggable object ───────────────────────────────── */

function DraggableItem({
  obj,
  initX,
  initY,
  containerRef,
}: {
  obj: ScatterObj;
  initX: number;
  initY: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { itemRef, isDragging, onMouseDown } = useDrag(
    initX,
    initY,
    obj.rotation,
    containerRef
  );

  return (
    <div
      ref={itemRef}
      className={`${styles.item} ${isDragging ? styles.itemDragging : ''}`}
      data-obj-id={obj.id}
      onMouseDown={onMouseDown}
      role="img"
      aria-label={obj.label}
      data-has-image={obj.src ? 'true' : undefined}
    >
      {obj.src ? (
        <div className={styles.itemImgWrap}>
          <Image
            src={obj.src}
            alt={obj.label}
            fill
            className={styles.itemImg}
            draggable={false}
          />
        </div>
      ) : (
        <>
          <span className={styles.itemIcon} aria-hidden="true">{obj.icon}</span>
          <span className={styles.itemLabel}>{obj.label}</span>
        </>
      )}
    </div>
  );
}

/* ── Container ─────────────────────────────────────────────── */

export default function HeroDraggables() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [initPositions, setInitPositions] = useState<
    Record<string, { x: number; y: number }>
  >({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const pos: Record<string, { x: number; y: number }> = {};
    OBJECTS.forEach((obj) => {
      pos[obj.id] = {
        x: (obj.xPct / 100) * width,
        y: (obj.yPct / 100) * height,
      };
    });
    setInitPositions(pos);
    setReady(true);
  }, []);

  return (
    /* Covers the hero section; pointer-events:none so hero content stays interactive */
    <div ref={containerRef} className={styles.wrapper} aria-hidden="true">
      {ready &&
        OBJECTS.map((obj) => (
          <DraggableItem
            key={obj.id}
            obj={obj}
            initX={initPositions[obj.id].x}
            initY={initPositions[obj.id].y}
            containerRef={containerRef}
          />
        ))}
    </div>
  );
}
