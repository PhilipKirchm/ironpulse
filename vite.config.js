import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Hinweis: Das PWA-Plugin (Service Worker) wurde entfernt. In der Capacitor-App liegen
// alle Dateien lokal im APK. Ein Service Worker cached dort alte Versionen und ist der
// Grund, warum nach einem Update der Cache geleert werden musste.
export default defineConfig({
  base: './', // relative Pfade fuer Capacitor
  plugins: [react()],
})
