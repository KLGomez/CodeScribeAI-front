# CodeScribe AI — Frontend Application

> **Single Page Application (SPA) moderna desarrollada con React 19, TypeScript, Vite y Tailwind CSS v4 para la generación y exploración interactiva de documentación técnica asistida por IA.**

---

## 🌟 Características Principales

- **Interfaz de Usuario Reactiva y Fluida:** Construida con React 19 y empaquetada con Vite para recarga en caliente instantánea (HMR).
- **Tour Interactivo con Driver.js:** Recorrido guiado paso a paso para nuevos desarrolladores en la página de demostración (`/demo`).
- **Seguimiento de Análisis en Vivo (SSE Estable):** Suscripción en tiempo real mediante Server-Sent Events con reconexión automática tolerante a micro-cortes y referencias estables con `useRef`.
- **Visor Modular y Seguro de Documentación:**
  - Descomposición automática en tarjetas por cada sección (`## `).
  - Índice lateral adhesivo (TOC) para navegación rápida.
  - **Renderizado seguro de diagramas Mermaid:** Configurado en `securityLevel: 'strict'` y sanitizado activamente con **DOMPurify** para prevenir cualquier vector de XSS vía SVG.
  - Bloques de código con resaltado y botón de copiado rápido.
  - Exportación directa a Markdown e impresión / PDF.
- **Soporte Completo de Modo Oscuro:** Selector de tema (`Claro`, `Oscuro`, `Sistema`) con persistencia en `localStorage`.
- **Autenticación Dual con Modo Demo Aislado:** Soporte para inicio de sesión con GitHub OAuth y botón de acceso rápido para Modo Demo con sesiones efímeras independientes por pestaña/navegador.

---

## 🛠️ Stack Tecnológico

- **Biblioteca Core:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Empaquetador:** [Vite](https://vitejs.dev/)
- **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/) (`@tailwindcss/vite`, `@tailwindcss/typography`)
- **Enrutamiento:** [React Router v7](https://reactrouter.com/)
- **Gestión de Estado Global:** [Zustand 5](https://zustand-demo.pmnd.rs/)
- **Gestión de Peticiones y Caché:** [TanStack React Query v5](https://tanstack.com/query/latest)
- **Renderizado de Markdown y Diagramas:** `react-markdown`, `remark-gfm`, `react-syntax-highlighter`, `mermaid`, `dompurify`
- **Tour Interactivo:** `driver.js`

---

## 📁 Estructura del Proyecto

```text
src/
├── components/         # Componentes compartidos (Layout, ErrorBoundary, Navbar)
├── features/
│   ├── auth/           # Store Zustand de autenticación y botón GitHub / Demo
│   ├── demo/           # Datos simulados y componentes del tour guiado
│   ├── documentation/  # Visores modulares, componentes Mermaid y servicios de docs
│   ├── jobs/           # Suscripción SSE y barra de progreso por etapas
│   ├── landing/        # Sección Hero y presentación de producto
│   ├── repository/     # Formulario y validación de repositorios de GitHub
│   └── theme/          # Store de tema claro/oscuro y ThemeToggle
├── hooks/              # Hooks transversales (useSSE estabilizado con useRef)
├── lib/                # Configuración de cliente Axios y TanStack Query
├── pages/              # Vistas principales (Landing, Demo, Dashboard, Analyze, Document)
├── router/             # Enrutamiento y ProtectedRoute
└── styles/             # Configuración CSS-first de Tailwind CSS v4
```

---

## ⚙️ Configuración del Entorno (`.env`)

Crea un archivo `.env` en la raíz de `documentador-frontend`:

```env
# URL base de la API del backend
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

### 4. Ejecutar Pruebas
```bash
npm test
```

### 5. Ejecutar Linter
```bash
npm run lint
```

---

## 🐳 Despliegue con Docker

El frontend cuenta con un Dockerfile multi-stage optimizado que compila la SPA con Node y sirve los archivos estáticos a través de Nginx Alpine sin privilegios (puerto 8080):

```bash
# Construir la imagen
docker build -t codescribe-frontend .

# Ejecutar el contenedor (puerto 8080 interno)
docker run -d -p 8080:8080 --name codescribe-front codescribe-frontend
```
