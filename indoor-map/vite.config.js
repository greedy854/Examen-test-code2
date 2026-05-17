import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      // Produces human-readable class names like "IndoorMap__routeBox"
      // instead of hashed names like "routeBox_x7y2". Easy to find in DevTools.
      generateScopedName: '[name]__[local]',
    },
  },
})
