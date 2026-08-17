---
name: ui-design
description: Aplica el sistema de diseño "dark premium" de Kleta (Next.js 16 + Tailwind v4 + Supabase) al crear, editar o revisar UI. Úsala SIEMPRE que trabajes en páginas, componentes, globals.css, login, dashboard, órdenes, nuevo pedido, cocina, reportes, menú, usuarios o navegación. Define tokens, componentes reutilizables, patrones de layout, estados (vacío/carga/error) y micro-interacciones.
---

# Sistema de diseño — Kleta (dark premium)

Este documento es la fuente de verdad visual de la app. Cualquier cambio de UI
debe respetarlo. Es una identidad **oscura, cálida y gastronómica** con
tipografía serif de display y acento ámbar.

## 1. Tokens (definidos en `@theme` de `src/app/globals.css`)

- **Fondo:** `ink-950 #0b0908` (base) → `ink-900 #14100d` (superficies) →
  `ink-800 #1d1713` (elevadas) → `ink-700 #2a211a` (bordes).
- **Acento:** `ember-500 #f59e0b` (primario), `ember-400` (hover), `ember-300`
  (texto sobre fondo). El ámbar se usa en: CTA primario, totales, texto
  resaltado y estados activos. Nunca como color de texto de cuerpo.
- **Texto:** `cream-50` (títulos), `cream-100` (texto fuerte), `cream-200`
  (texto), `cream-300` (secundario), `cream-400` (débil), `cream-500`
  (placeholder/sutil).
- **Tipografía:** `font-display` (Fraunces) solo para títulos y números
  grandes; `font-sans` (Geist) para todo lo demás; `font-mono` (Geist Mono)
  para montos, horas y cantidades con `tabular-nums`.
- **Radio:** `rounded-xl` controles, `rounded-2xl` tarjetas, `rounded-full`
  badges/chips.
- **Sombras:** `shadow-card` y `shadow-lifted` (definidas como tokens).
- **Grid de layout:** páginas en `mx-auto max-w-3xl` (o `max-w-6xl` para
  cocina/paneles); padding responsivo `p-3 sm:p-6`.

Regla de oro: **cada página tiene un eyebrow** (etiqueta en mayúsculas,
`tracking-[0.2em]`, `text-ember-500`, tamaño `text-xs`) + `page-title`.

## 2. Componentes de `@layer components` (usar SIEMPRE, no inline)

- `.card` — superficie `ink-900`, borde `ink-700`, `rounded-2xl`, `shadow-card`.
  Para tarjetas interactivas usa también `hover:border-ember-500/50` y
  `hover:bg-ink-800` con `transition`.
- `.btn-primary` (fondo ember, texto ink), `.btn-ghost` (borde),
  `.btn-danger`, `.btn-emerald`. Todos con `active:scale-[0.98]` y
  `disabled:opacity-50`.
- `.input` — fondo `ink-950`, borde `ink-700`, foco ember con `ring`.
- `.label` — etiqueta de formulario (`text-cream-300`).
- `.badge`, `.badge-rose` (pendiente), `.badge-amber` (en cocina),
  `.badge-emerald` (listo), `.badge-neutral` (entregado/cobrado).
- `.chip` — botón de categoría o filtro (píldora).
- `.empty-state` — estado vacío con icono, título y subtítulo centrados.

Si necesitas un estilo que no existe, añádelo como clase en globals.css (en
`@layer components`) en lugar de repetir clases sueltas en cada página.

## 3. Convenciones de layout por página

- **Login:** pantalla dividida en desktop (panel de marca a la izquierda,
  formulario a la derecha); en móvil, solo el formulario centrado. El
  formulario usa `.input` con iconos y botón `btn-primary` a ancho completo.
- **Dashboard:** eyebrow + saludo con `font-display`, subtítulo, grid de
  accesos (`grid gap-3 sm:grid-cols-2 lg:grid-cols-3`) con `.card` hover y
  icono en caja `rounded-xl`.
- **Órdenes / Historial:** pestañas de filtro por estado (`chip` activo),
  tarjetas por orden con badge de estado, items en lista y monto con
  `font-mono tabular-nums`.
- **Nuevo pedido:** selector de tipo (mesa/delivery) como segmento,
  chips de categoría sticky en móvil, menú en grid, carrito en panel lateral
  (desktop) / bottom sheet (móvil) con barra "Ver pedido" flotante.
- **Cocina:** tarjetas grandes por orden con barra de estado superior,
  hora de ingreso, lista de items con cantidades, nota resaltada en ámbar y
  botones de avance de estado. Nuevas órdenes hacen pulso `ring-ember` + beep.
- **Reportes:** cards de resumen (monto grande en `font-display` ember),
  barras por semana, desglose por tipo y top platillos.
- **Menú:** categorías con sección, grid de platillos, controles admin
  (`ItemForm`, `DeleteButton`) discretos a la derecha.
- **Usuarios:** filas con avatar de iniciales, email, select de rol y botón de
  borrar; botón "Nuevo usuario" abre `.modal`.

## 4. Estados (obligatorios en toda pantalla de datos)

- **Carga:** skeleton o "Cargando…" sutil, nunca dejar la pantalla en blanco.
- **Vacío:** `.empty-state` con icono (`Icon` de `@/components/ui/icons`) y
  texto claro en `text-cream-500`.
- **Error:** alerta `border-rose-500/30 bg-rose-500/10 text-rose-400`
  `rounded-xl` con el mensaje.
- **Formularios:** validación en línea, `disabled` mientras envía, label con
  `htmlFor` correcto.

## 5. Micro-interacciones y accesibilidad

- `transition` en todo hover/focus; `active:scale-[0.98]` en botones;
  `group-hover` para realzar iconos/CTAs dentro de tarjetas.
- `:focus-visible` con anillo ember definido en base (no eliminarlo).
- Iconos siempre con `aria-hidden="true"`; botones de icono con `aria-label`
  o `title`.
- Montos y horas con `tabular-nums`. Hora siempre en `timeZone:
  'America/Lima'`.
- Navegación móvil: `paddingBottom: env(safe-area-inset-bottom)`.
- Texto en español, con acentos correctos.

## 6. Iconos

Todo icono vive en `src/components/ui/icons.tsx` como componente SVG con
`strokeWidth` heredado de `<Base>`. Si falta un icono (busca, calendario,
reloj, flecha, etiqueta, moneda, etc.) añádelo ahí en el mismo estilo:
`viewBox 0 0 24 24`, trazo `currentColor`, `strokeLinecap="round"`,
`strokeWidth 1.7`. No uses librerías externas de iconos.

## 7. No romper la funcionalidad

El rediseño es visual. Conserva: la lógica de datos (RPC `create_order`,
Realtime en cocina, RLS), los contratos de props de componentes existentes y
el tipado. Si una página muta props, actualiza TODOS los callers. Después de
cambios, verifica con `pnpm lint` y `pnpm build`.
