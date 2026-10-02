export interface DemoFileItem {
  id: string
  name: string
  path: string
  type: 'file' | 'folder'
  selected?: boolean
  tokenCount?: number
  children?: DemoFileItem[]
}

/**
 * Estructura de árbol de archivos simulada para la vista interactiva Demo
 */
export const DEMO_FILE_TREE: DemoFileItem[] = [
  {
    id: 'src',
    name: 'src',
    path: 'src',
    type: 'folder',
    children: [
      {
        id: 'src-components',
        name: 'components',
        path: 'src/components',
        type: 'folder',
        children: [
          {
            id: 'auth-button',
            name: 'AuthButton.tsx',
            path: 'src/components/AuthButton.tsx',
            type: 'file',
            selected: true,
            tokenCount: 420,
          },
          {
            id: 'header',
            name: 'Header.tsx',
            path: 'src/components/Header.tsx',
            type: 'file',
            selected: true,
            tokenCount: 310,
          },
          {
            id: 'theme-toggle',
            name: 'ThemeToggle.tsx',
            path: 'src/components/ThemeToggle.tsx',
            type: 'file',
            selected: false,
            tokenCount: 260,
          },
        ],
      },
      {
        id: 'src-hooks',
        name: 'hooks',
        path: 'src/hooks',
        type: 'folder',
        children: [
          {
            id: 'use-theme-store',
            name: 'useThemeStore.ts',
            path: 'src/hooks/useThemeStore.ts',
            type: 'file',
            selected: true,
            tokenCount: 380,
          },
          {
            id: 'use-auth',
            name: 'useAuth.ts',
            path: 'src/hooks/useAuth.ts',
            type: 'file',
            selected: false,
            tokenCount: 290,
          },
        ],
      },
      {
        id: 'src-lib',
        name: 'lib',
        path: 'src/lib',
        type: 'folder',
        children: [
          {
            id: 'api-ts',
            name: 'api.ts',
            path: 'src/lib/api.ts',
            type: 'file',
            selected: true,
            tokenCount: 350,
          },
          {
            id: 'utils-ts',
            name: 'utils.ts',
            path: 'src/lib/utils.ts',
            type: 'file',
            selected: false,
            tokenCount: 180,
          },
        ],
      },
      {
        id: 'app-tsx',
        name: 'App.tsx',
        path: 'src/App.tsx',
        type: 'file',
        selected: false,
        tokenCount: 210,
      },
      {
        id: 'main-tsx',
        name: 'main.tsx',
        path: 'src/main.tsx',
        type: 'file',
        selected: false,
        tokenCount: 140,
      },
    ],
  },
  {
    id: 'package-json',
    name: 'package.json',
    path: 'package.json',
    type: 'file',
    selected: false,
    tokenCount: 190,
  },
  {
    id: 'readme-md',
    name: 'README.md',
    path: 'README.md',
    type: 'file',
    selected: false,
    tokenCount: 450,
  },
]

/**
 * Contenido Markdown técnico de demostración generado con IA
 */
export const DEMO_MARKDOWN_CONTENT = `# Documentación Técnica: AuthButton.tsx

## 1. Propósito General
Gestiona el flujo de autenticación de usuarios mediante OAuth con GitHub. Actúa como el punto de entrada principal para el inicio de sesión, proporcionando feedback visual inmediato durante los estados de carga, éxito y error.

## 2. Entradas y Salidas
* **Props:** 
  * \`onLoginSuccess\` (Callback opcional): Función que se ejecuta tras la validación del token.
  * \`variant\` (String): Define el estilo visual (\`'primary'\` | \`'outline'\`).
* **Retorno:** Componente React (JSX.Element) interactivo.

## 3. Gestión de Estado y Lógica
* Consume el estado global \`useAuthStore\` (Zustand) para invocar el método asíncrono \`authenticate()\`.
* Mantiene un estado local derivado \`isPending\` para deshabilitar el botón y renderizar un spinner, previniendo solicitudes de red duplicadas.

## 4. Dependencias y Efectos
* Interactúa con el servicio de enrutamiento nativo (\`window.location\`) para la redirección al callback de GitHub.
* Integrado con el hook \`useToast\` para emitir alertas no bloqueantes en caso de fallo de red (HTTP 401/500).
`
