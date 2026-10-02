# CodeScribe AI — Frontend Application

> **Single Page Application (SPA) moderna desarrollada con React 19, TypeScript, Vite 8 y Tailwind CSS v4 para la generación y exploración interactiva de documentación técnica asistida por IA.**

---

## 🌟 Características Principales

- **Interfaz de Usuario Reactiva y Fluida:** Construida con React 19 y empaquetada con Vite 8 para recarga en caliente instantánea (HMR).
- **Tour Interactivo con Driver.js:** Recorrido guiado paso a paso para nuevos desarrolladores en la página de demostración (`/demo`).
- **Seguimiento de Análisis en Vivo (SSE):** Barra de progreso conectada en tiempo real mediante Server-Sent Events con el backend.
- **Visor Modular de Documentación Técnica:**
  - Descomposición automática en tarjetas por cada sección (`## `).
  - Índice lateral adhesivo (TOC) para navegación rápida.
  - Renderizado nativo de diagramas de arquitectura en sintaxis **Mermaid**.
  - Bloques de código con resaltado y botón de copiado rápido.
  - Exportación directa a Markdown e impresión / PDF.
- **Soporte Completo de Modo Oscuro:** Selector de tema (`Claro`, `Oscuro`, `Sistema`) con persistencia en `localStorage`.
- **Autenticación Dual:** Soporte para inicio de sesión con GitHub OAuth y botón de acceso rápido para **Modo Demo**.

---

## 🛠️ Stack Tecnológico

- **Biblioteca Core:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Empaquetador:** [Vite 8](https://vitejs.dev/)
- **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/) (`@tailwindcss/vite`, `@tailwindcss/typography`)
- **Enrutamiento:** [React Router v7](https://reactrouter.com/)
- **Gestión de Estado Global:** [Zustand 5](https://zustand-demo.pmnd.rs/)
- **Gestión de Peticiones y Caché:** [TanStack React Query v5](https://tanstack.com/query/latest)
- **Renderizado de Markdown y Diagramas:** `react-markdown`, `remark-gfm`, `react-syntax-highlighter`, `mermaid`
- **Tour Interactivo:** `driver.js`

---

## 📁 Estructura del Proyecto

```text
src/
├── components/         # Visores de documentación, Mermaid, ThemeToggle y Hero
├── features/
│   ├── auth/           # Store Zustand de autenticación y botón GitHub
│   ├── demo/           # Datos simulados y componentes del tour
│   ├── documentation/  # Servicios API de documentos y hooks
│   ├── jobs/           # Suscripción SSE y store de progreso
│   ├── repository/     # API de validación de repositorios
│   └── theme/          # Store de tema claro/oscuro
├── hooks/              # Hooks transversales (useSSE)
├── lib/                # Configuración de Axios y TanStack Query
├── pages/              # Landing, Demo, Dashboard, Analyze, Document, AuthCallback
├── router/             # Definición de rutas y componente ProtectedRoute
└── styles/             # Variables y directivas de Tailwind CSS
```

---

## ⚙️ Configuración del Entorno (`.env`)

Crea un archivo `.env` en la raíz de `documentador-frontend`:

```env
VITE_API_URL=http://localhost:3001/api
```

---

## 🚀 Puesta en Marcha

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Iniciar Servidor de Desarrollo
```bash
npm run dev
```
La aplicación iniciará en `http://localhost:5173`.

### 3. Compilar para Producción
```bash
npm run build
```

### 4. Ejecutar Linter
```bash
npm run lint
```
