# CodeScribe AI — Frontend Application (`CodeScribeAI-front`)

> **Single Page Application (SPA) moderna desarrollada con React 19, TypeScript, Vite y Tailwind CSS v4 para la generación, exploración interactiva y exportación de documentación técnica asistida por IA.**

---

## 🌟 Características Principales

- **Interfaz de Usuario Reactiva y Fluida:** Construida con React 19 y empaquetada con Vite con división de código por rutas (`React.lazy`) para optimizar el bundle de producción.
- **Flujo de Autenticación por Código de Un Solo Uso:** Canje seguro de código efímero (`POST /auth/exchange`) tras el callback de GitHub OAuth, garantizando que los tokens JWT nunca queden expuestos en URLs, historial de navegación o logs.
- **Suscripción SSE Segura:** Conexión continua a `/jobs/:id/stream` utilizando `@microsoft/fetch-event-source` con cabecera `Authorization: Bearer <token>` (sin pasar tokens por query string) y límite de reconexión de 5 intentos.
- **Integración Nativa con Notion:** Selector dinámico de páginas compartidas en el workspace del usuario y exportación en un solo clic, delegando la gestión de credenciales en el backend.
- **Visor Seguro de Documentación:**
  - Descomposición automática en tarjetas por cada sección arquitectónica (`## `).
  - Índice lateral adhesivo (TOC) para navegación rápida.
  - **Renderizado seguro de diagramas Mermaid:** Configurado con `securityLevel: 'strict'` y sanitizado activamente con **DOMPurify** para mitigar cualquier vector de XSS vía SVG inyectado.
  - Bloques de código con resaltado de sintaxis y copiado rápido.
  - Exportación directa a Markdown descargable e impresión / PDF.
- **Soporte Completo de Modo Oscuro:** Selector de tema (`Claro`, `Oscuro`, `Sistema`) con persistencia en `localStorage`.
- **Tour Interactivo con Driver.js:** Recorrido guiado paso a paso para nuevos desarrolladores en la página de demostración (`/demo`).
- **Modo Demo Aislado:** Acceso instantáneo con sesión efímera independiente por pestaña/navegador y cuota visual de 2 análisis.

---

## 🛠️ Stack Tecnológico

- **Biblioteca Core:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Empaquetador:** [Vite](https://vitejs.dev/)
- **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/) (`@tailwindcss/vite`, `@tailwindcss/typography`)
- **Enrutamiento:** [React Router v7](https://reactrouter.com/)
- **Gestión de Estado Global:** [Zustand 5](https://zustand-demo.pmnd.rs/)
- **Peticiones y Caché:** [TanStack React Query v5](https://tanstack.com/query/latest) + [Axios](https://axios-http.com/)
- **Streaming SSE:** `@microsoft/fetch-event-source`
- **Renderizado de Markdown y Diagramas:** `react-markdown`, `remark-gfm`, `react-syntax-highlighter`, `mermaid`, `dompurify`
- **Tour Interactivo:** `driver.js`
- **Pruebas y Calidad:** Vitest 5.0, Testing Library, Oxlint

---

## ⚙️ Variables de Entorno

| Variable | Tipo / Valor | Obligatoria en Prod | Descripción |
|---|---|:---:|---|
| `VITE_API_URL` | URL (ej: `https://api.codescribe.ejemplo.com/api`) | **Sí** | URL base de la API del backend. Debe apuntar al prefijo `/api`. |
| `VITE_GITHUB_OAUTH_URL` | URL | No | URL opcional directa de inicio de GitHub OAuth (default: `${VITE_API_URL}/auth/github`). |

---

## 🔍 Alcance y Limitaciones

- **Capacidad de Análisis:** Cada solicitud analiza hasta **20 archivos principales** con un límite de **6.000 caracteres por archivo** y un tamaño de paquete agregado de **80.000 caracteres**. Repositorios que superen estas dimensiones mostrarán un aviso de cobertura parcial en la documentación generada.
- **Modo Demo:** Dispone de un límite de **2 análisis** gratuitos por sesión efímera. La exportación a Notion se deshabilita para usuarios demo.

---

## 🚀 Puesta en Marcha Local

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Iniciar Servidor de Desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`.

### 3. Compilar para Producción
```bash
npm run build
```

---

## 🧪 Pruebas y Calidad de Código

```bash
# Ejecutar suite de pruebas con Vitest
npm test

# Linter ultrarrápido con Oxlint (0 errores, 0 advertencias)
npm run lint
```

---

## 🐳 Despliegue con Docker

El frontend incluye un Dockerfile multi-stage que compila la SPA y la sirve a través de Nginx Alpine sin privilegios en el puerto **8080**:

```bash
# Construir la imagen inyectando la URL de la API
docker build --build-arg VITE_API_URL=https://api.codescribe.ejemplo.com/api -t codescribe-frontend .

# Ejecutar el contenedor
docker run -d -p 8080:8080 --name codescribe-front codescribe-frontend
```
