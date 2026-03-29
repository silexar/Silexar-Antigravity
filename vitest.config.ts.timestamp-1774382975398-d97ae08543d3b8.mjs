// vitest.config.ts
import { defineConfig } from "file:///C:/Users/Jhonson/Desktop/Silexar%20Pulse%20Antygravity/node_modules/vitest/dist/config.js";
import react from "file:///C:/Users/Jhonson/Desktop/Silexar%20Pulse%20Antygravity/node_modules/@vitejs/plugin-react/dist/index.js";
import tsconfigPaths from "file:///C:/Users/Jhonson/Desktop/Silexar%20Pulse%20Antygravity/node_modules/vite-tsconfig-paths/dist/index.js";
import path from "path";
var __vite_injected_original_dirname = "C:\\Users\\Jhonson\\Desktop\\Silexar Pulse Antygravity";
var vitest_config_default = defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/**",
        "src/test/**",
        "**/*.d.ts",
        "**/*.config.{js,ts}",
        "**/mockData/**",
        "**/__tests__/**",
        "**/*.test.{js,jsx,ts,tsx}",
        "**/*.spec.{js,jsx,ts,tsx}"
      ],
      include: ["src/**/*.{js,jsx,ts,tsx}"],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        },
        // Umbrales específicos para componentes críticos
        "./src/components/ui/": {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        },
        "./src/hooks/": {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95
        },
        "./src/lib/": {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85
        },
        "./src/utils/": {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85
        }
      }
    },
    include: ["src/**/*.{test,spec}.{js,jsx,ts,tsx}"],
    exclude: ["node_modules/**", "dist/**", ".next/**"]
  },
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
});
export {
  vitest_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZXN0LmNvbmZpZy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXEpob25zb25cXFxcRGVza3RvcFxcXFxTaWxleGFyIFB1bHNlIEFudHlncmF2aXR5XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxKaG9uc29uXFxcXERlc2t0b3BcXFxcU2lsZXhhciBQdWxzZSBBbnR5Z3Jhdml0eVxcXFx2aXRlc3QuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9KaG9uc29uL0Rlc2t0b3AvU2lsZXhhciUyMFB1bHNlJTIwQW50eWdyYXZpdHkvdml0ZXN0LmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGVzdC9jb25maWcnXHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcclxuaW1wb3J0IHRzY29uZmlnUGF0aHMgZnJvbSAndml0ZS10c2NvbmZpZy1wYXRocydcclxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgcGx1Z2luczogW3JlYWN0KCksIHRzY29uZmlnUGF0aHMoKV0sXHJcbiAgdGVzdDoge1xyXG4gICAgZ2xvYmFsczogdHJ1ZSxcclxuICAgIGVudmlyb25tZW50OiAnanNkb20nLFxyXG4gICAgc2V0dXBGaWxlczogWycuL3NyYy90ZXN0L3NldHVwLnRzJ10sXHJcbiAgICBjb3ZlcmFnZToge1xyXG4gICAgICBwcm92aWRlcjogJ3Y4JyxcclxuICAgICAgcmVwb3J0ZXI6IFsndGV4dCcsICdqc29uJywgJ2h0bWwnLCAnbGNvdiddLFxyXG4gICAgICBleGNsdWRlOiBbXHJcbiAgICAgICAgJ25vZGVfbW9kdWxlcy8qKicsXHJcbiAgICAgICAgJ3NyYy90ZXN0LyoqJyxcclxuICAgICAgICAnKiovKi5kLnRzJyxcclxuICAgICAgICAnKiovKi5jb25maWcue2pzLHRzfScsXHJcbiAgICAgICAgJyoqL21vY2tEYXRhLyoqJyxcclxuICAgICAgICAnKiovX190ZXN0c19fLyoqJyxcclxuICAgICAgICAnKiovKi50ZXN0Lntqcyxqc3gsdHMsdHN4fScsXHJcbiAgICAgICAgJyoqLyouc3BlYy57anMsanN4LHRzLHRzeH0nLFxyXG4gICAgICBdLFxyXG4gICAgICBpbmNsdWRlOiBbJ3NyYy8qKi8qLntqcyxqc3gsdHMsdHN4fSddLFxyXG4gICAgICB0aHJlc2hvbGRzOiB7XHJcbiAgICAgICAgZ2xvYmFsOiB7XHJcbiAgICAgICAgICBicmFuY2hlczogODAsXHJcbiAgICAgICAgICBmdW5jdGlvbnM6IDgwLFxyXG4gICAgICAgICAgbGluZXM6IDgwLFxyXG4gICAgICAgICAgc3RhdGVtZW50czogODAsXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyBVbWJyYWxlcyBlc3BlY1x1MDBFRGZpY29zIHBhcmEgY29tcG9uZW50ZXMgY3JcdTAwRUR0aWNvc1xyXG4gICAgICAgICcuL3NyYy9jb21wb25lbnRzL3VpLyc6IHtcclxuICAgICAgICAgIGJyYW5jaGVzOiA5MCxcclxuICAgICAgICAgIGZ1bmN0aW9uczogOTAsXHJcbiAgICAgICAgICBsaW5lczogOTAsXHJcbiAgICAgICAgICBzdGF0ZW1lbnRzOiA5MCxcclxuICAgICAgICB9LFxyXG4gICAgICAgICcuL3NyYy9ob29rcy8nOiB7XHJcbiAgICAgICAgICBicmFuY2hlczogOTUsXHJcbiAgICAgICAgICBmdW5jdGlvbnM6IDk1LFxyXG4gICAgICAgICAgbGluZXM6IDk1LFxyXG4gICAgICAgICAgc3RhdGVtZW50czogOTUsXHJcbiAgICAgICAgfSxcclxuICAgICAgICAnLi9zcmMvbGliLyc6IHtcclxuICAgICAgICAgIGJyYW5jaGVzOiA4NSxcclxuICAgICAgICAgIGZ1bmN0aW9uczogODUsXHJcbiAgICAgICAgICBsaW5lczogODUsXHJcbiAgICAgICAgICBzdGF0ZW1lbnRzOiA4NSxcclxuICAgICAgICB9LFxyXG4gICAgICAgICcuL3NyYy91dGlscy8nOiB7XHJcbiAgICAgICAgICBicmFuY2hlczogODUsXHJcbiAgICAgICAgICBmdW5jdGlvbnM6IDg1LFxyXG4gICAgICAgICAgbGluZXM6IDg1LFxyXG4gICAgICAgICAgc3RhdGVtZW50czogODUsXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICBpbmNsdWRlOiBbJ3NyYy8qKi8qLnt0ZXN0LHNwZWN9Lntqcyxqc3gsdHMsdHN4fSddLFxyXG4gICAgZXhjbHVkZTogWydub2RlX21vZHVsZXMvKionLCAnZGlzdC8qKicsICcubmV4dC8qKiddLFxyXG4gIH0sXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKSxcclxuICAgIH0sXHJcbiAgfSxcclxufSkiXSwKICAibWFwcGluZ3MiOiAiO0FBQTBWLFNBQVMsb0JBQW9CO0FBQ3ZYLE9BQU8sV0FBVztBQUNsQixPQUFPLG1CQUFtQjtBQUMxQixPQUFPLFVBQVU7QUFIakIsSUFBTSxtQ0FBbUM7QUFLekMsSUFBTyx3QkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sR0FBRyxjQUFjLENBQUM7QUFBQSxFQUNsQyxNQUFNO0FBQUEsSUFDSixTQUFTO0FBQUEsSUFDVCxhQUFhO0FBQUEsSUFDYixZQUFZLENBQUMscUJBQXFCO0FBQUEsSUFDbEMsVUFBVTtBQUFBLE1BQ1IsVUFBVTtBQUFBLE1BQ1YsVUFBVSxDQUFDLFFBQVEsUUFBUSxRQUFRLE1BQU07QUFBQSxNQUN6QyxTQUFTO0FBQUEsUUFDUDtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsTUFDQSxTQUFTLENBQUMsMEJBQTBCO0FBQUEsTUFDcEMsWUFBWTtBQUFBLFFBQ1YsUUFBUTtBQUFBLFVBQ04sVUFBVTtBQUFBLFVBQ1YsV0FBVztBQUFBLFVBQ1gsT0FBTztBQUFBLFVBQ1AsWUFBWTtBQUFBLFFBQ2Q7QUFBQTtBQUFBLFFBRUEsd0JBQXdCO0FBQUEsVUFDdEIsVUFBVTtBQUFBLFVBQ1YsV0FBVztBQUFBLFVBQ1gsT0FBTztBQUFBLFVBQ1AsWUFBWTtBQUFBLFFBQ2Q7QUFBQSxRQUNBLGdCQUFnQjtBQUFBLFVBQ2QsVUFBVTtBQUFBLFVBQ1YsV0FBVztBQUFBLFVBQ1gsT0FBTztBQUFBLFVBQ1AsWUFBWTtBQUFBLFFBQ2Q7QUFBQSxRQUNBLGNBQWM7QUFBQSxVQUNaLFVBQVU7QUFBQSxVQUNWLFdBQVc7QUFBQSxVQUNYLE9BQU87QUFBQSxVQUNQLFlBQVk7QUFBQSxRQUNkO0FBQUEsUUFDQSxnQkFBZ0I7QUFBQSxVQUNkLFVBQVU7QUFBQSxVQUNWLFdBQVc7QUFBQSxVQUNYLE9BQU87QUFBQSxVQUNQLFlBQVk7QUFBQSxRQUNkO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVMsQ0FBQyxzQ0FBc0M7QUFBQSxJQUNoRCxTQUFTLENBQUMsbUJBQW1CLFdBQVcsVUFBVTtBQUFBLEVBQ3BEO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDdEM7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
