'use client';
import { useEffect, useRef } from 'react';

const SHAPE_COUNT = 8;
const COLORS = [
    'rgba(113, 75, 103, 0.08)',
    'rgba(113, 75, 103, 0.06)',
    'rgba(138, 101, 128, 0.07)',
    'rgba(160, 120, 150, 0.06)',
    'rgba(100, 65, 90, 0.05)',
    'rgba(130, 90, 120, 0.08)',
    'rgba(113, 75, 103, 0.04)',
    'rgba(145, 110, 135, 0.07)',
];

function lerp(a, b, t) { return a + (b - a) * t; }

export default function AnimatedBackground() {
    const containerRef = useRef(null);
    const shapesRef = useRef([]);
    const mouseRef = useRef({ x: 0.5, y: 0.5 });
    const scrollRef = useRef(0);
    const rafRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Create shapes
        const shapes = [];
        for (let i = 0; i < SHAPE_COUNT; i++) {
            const el = document.createElement('div');
            el.className = 'bg-shape';
            const size = 250 + Math.random() * 400;
            const x = Math.random() * 100;
            const y = Math.random() * 300;
            const hue = 300 + Math.random() * 30;
            const sat = 20 + Math.random() * 20;
            const light = 70 + Math.random() * 15;
            const opacity = 0.06 + Math.random() * 0.06;

            el.style.cssText = `
                position: absolute;
                border-radius: 50%;
                pointer-events: none;
                width: ${size}px;
                height: ${size}px;
                left: ${x}%;
                top: ${y}px;
                background: hsla(${hue}, ${sat}%, ${light}%, ${opacity});
                filter: blur(80px);
                transition: none;
                will-change: transform, background;
            `;

            container.appendChild(el);
            shapes.push({
                el,
                baseX: x,
                baseY: y,
                baseSize: size,
                currentX: x,
                currentY: y,
                currentSize: size,
                targetX: x,
                targetY: y,
                targetSize: size,
                hue,
                sat,
                light,
                opacity,
                hueDir: (Math.random() - 0.5) * 0.3,
                speed: 0.3 + Math.random() * 0.5,
                parallaxFactor: 0.2 + Math.random() * 0.6,
            });
        }
        shapesRef.current = shapes;

        // Mouse handler
        const handleMouse = (e) => {
            mouseRef.current = {
                x: e.clientX / window.innerWidth,
                y: e.clientY / window.innerHeight,
            };
        };

        // Scroll handler
        const handleScroll = () => {
            scrollRef.current = window.scrollY;
        };

        window.addEventListener('mousemove', handleMouse);
        window.addEventListener('scroll', handleScroll, { passive: true });

        let time = 0;
        const animate = () => {
            time += 0.005;
            const mx = mouseRef.current.x;
            const my = mouseRef.current.y;
            const scroll = scrollRef.current;

            shapes.forEach((s, i) => {
                // Idle: drift hue
                s.hue += s.hueDir * 0.05;
                if (s.hue > 330 || s.hue < 280) s.hueDir *= -1;

                // Mouse parallax
                const offsetX = (mx - 0.5) * 40 * s.parallaxFactor;
                const offsetY = (my - 0.5) * 30 * s.parallaxFactor;

                // Scroll follow with lag
                const scrollFollow = scroll * s.parallaxFactor * 0.4;

                // Scroll-based size change
                const sizeChange = 1 + Math.sin(scroll * 0.002 + i) * 0.06;

                s.targetX = s.baseX + offsetX + Math.sin(time * s.speed + i) * 3;
                s.targetY = s.baseY + scrollFollow + offsetY + Math.cos(time * s.speed + i * 0.7) * 5;
                s.targetSize = s.baseSize * sizeChange;

                // Smooth lerp
                s.currentX = lerp(s.currentX, s.targetX, 0.02);
                s.currentY = lerp(s.currentY, s.targetY, 0.03);
                s.currentSize = lerp(s.currentSize, s.targetSize, 0.02);

                const opacity = s.opacity + Math.sin(time * 0.5 + i * 1.2) * 0.015;

                s.el.style.left = `${s.currentX}%`;
                s.el.style.top = `${s.currentY}px`;
                s.el.style.width = `${s.currentSize}px`;
                s.el.style.height = `${s.currentSize}px`;
                s.el.style.background = `hsla(${s.hue}, ${s.sat}%, ${s.light}%, ${opacity})`;
            });

            rafRef.current = requestAnimationFrame(animate);
        };

        rafRef.current = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(rafRef.current);
            window.removeEventListener('mousemove', handleMouse);
            window.removeEventListener('scroll', handleScroll);
            shapes.forEach(s => s.el.remove());
        };
    }, []);

    return (
        <div
            ref={containerRef}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 0,
                overflow: 'hidden',
                pointerEvents: 'none',
            }}
            aria-hidden="true"
        />
    );
}
