import { AppRouter } from './router/AppRouter'
import { ThemeProvider } from './components/providers/ThemeProvider'

function App() {
  return (
    <ThemeProvider>
      <AppRouter />
    </ThemeProvider>
  )
}

export default App
