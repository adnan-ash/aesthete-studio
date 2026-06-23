# Premium 3D Animated E-Commerce Concept

## Project Idea & Overview
This project is an ultra-modern, highly interactive conceptual e-Commerce landing page and product showcase perfectly adapted to variable premium goods including artisan coffee, design books, high-end glasses, and luxury watches. The core idea is to deliver an immersive, sensory-rich experience that communicates the quality, precision, and craftsmanship of the featured products. The experience dynamically adapts its color theme and 3D geometric models based on the currently selected item.

Key goals:
- Create a distinctive visual identity that breaks away from generic e-Commerce templates.
- Implement a stunning 3D centerpiece that responds smoothly to scrolling and morphs to represent the selected product structure (e.g., box for book, torus for glasses, cylinder for watch, and capsule for coffee).
- Provide an engaging user experience where content, GSAP animations, metrics, and accent colors switch contextually when navigating between product types.
- Ensure the theme seamlessly swaps between light-mode and dark-mode styles globally.

## Technical Architecture & Implementation Details
This project was built from scratch using the React ecosystem, specifically leveraging Vite as the build tool, Tailwind CSS for styling, GSAP for scrolling animations, and React Three Fiber (R3F) for interactive 3D rendering.

### 1. Framework & Core Libraries
- **React 18 & Vite**: The foundation of the app, providing a fast development server and optimized build process.
- **Tailwind CSS**: Used for all styling. Custom classes and color variables were set up in `src/index.css` to allow for seamless theme toggling (Light/Dark mode) driven by the product context.
- **TypeScript**: Used throughout to ensure type safety and a robust developer experience.

### 2. 3D WebGL Canvas (HeroCanvas.tsx)
The heart of the visual experience is a 3D canvas built with `@react-three/fiber` and `@react-three/drei`.
- **ProceduralProduct**: A procedural 3D model engine that outputs different geometries based on the product `category` parameter (e.g., `capsuleGeometry` for coffee, `boxGeometry` for books, `cylinderGeometry` for watches). It leverages `useFrame` to interpolate position and rotation based on scroll depth.
- **Pedestal & FloatingTriangles**: Accentuates the 3D space by providing environmental stage elements.
- **Responsive Scroll System**: A native scroll progress calculation mapped directly within `useFrame` gives an ultra-responsive, 60fps scrolling sync.

### 3. Smooth Scrolling & Animation (MainLayout.tsx & GSAP)
- **Lenis**: Integrated for buttery-smooth kinetic scrolling. 
- **GSAP & ScrollTrigger**: Used for 2D DOM animations. Elements such as large typography, section content, and layout grids fade in, slide up, and scale down smoothly.

### 4. Interactive UI & Components
- **Dynamic Content & Theming**: Selecting a product from the bottom navigation arrays updates the `currentProductIndex`. This fetches generic variables (like `metric1Value` and `metric2Title`) from `productInfoMap`, updates the Accent Color via DOM style manipulation, and switches the global Theme class (`light` or `dark`), which cascades back down into the ThreeJS canvas to alter directional lighting!

### 5. Backend & Database Connectivity (Prisma)
- The application connects to a SQLite database via **Prisma ORM**.
- **Schema (`schema.prisma`)**: A defined `Product` model stores generic product info, category types, and pricing.
- **Database Seeding (`seed.ts`)**: Contains a script that populates dummy data across categories.

### In Summary
This app pushes the envelope of modern React frontend capabilities by marrying standard DOM elements with an immersive 3D WebGL layer, all driven by a highly orchestrated smooth-scroll experience. It is designed to impress, demonstrating how premium products can be matched with premium digital experiences.
