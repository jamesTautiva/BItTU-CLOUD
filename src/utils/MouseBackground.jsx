// src/components/MouseBackground.jsx
import React, { useEffect, useRef } from 'react';
import { useThemeStore } from '../app/store'; // Para adaptar los colores al tema si lo deseas

export const MouseBackground = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // 1. Ajustar el tamaño del canvas a la pantalla completa
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 2. Capturar la posición del mouse
    const handleMouseMove = (event) => {
      mouseRef.current.targetX = event.clientX;
      mouseRef.current.targetY = event.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 3. Bucle de renderizado (Animación suave con interpolación)
    const render = () => {
      // Limpiar el lienzo en cada frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Suavizado del movimiento (Efecto "lerp" o retraso elegante)
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.08; // Cambia 0.08 para más o menos velocidad de respuesta
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      // Solo dibujamos el resplandor si el tema es oscuro (estética BITU)
      if (isDark) {
        // Crear un gradiente radial (un círculo difuminado) centrado en el mouse
        const radius = 350; // Tamaño del resplandor rojo
        const gradient = ctx.createRadialGradient(
          mouse.x, mouse.y, 0,        // Círculo interno (origen en el mouse)
          mouse.x, mouse.y, radius    // Círculo externo (límite del difuminado)
        );

        // Colores del gradiente: Rojo translúcido en el centro, negro absoluto afuera
        gradient.addColorStop(0, 'rgba(191, 60, 60, 0.37)'); // #ff0000 con opacidad
        gradient.addColorStop(0.5, 'rgba(233, 22, 22, 0.03)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        // Dibujar el gradiente en todo el canvas
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    // Limpieza de eventos al desmontar el componente
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none', // 👈 ¡CLAVE! Permite hacer click a los botones de abajo sin estorbar
        zIndex: 0,             // Se queda al fondo de todo
      }}
    />
  );
};