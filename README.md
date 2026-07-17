# Rimi — Aplicación Android Nativa 🎀

¡Hola! Hemos migrado con éxito la aplicación `Rimi-cute.html` a un proyecto modular moderno de **React + Vite** y la hemos empaquetado como una **aplicación nativa de Android** usando **Capacitor**.

La aplicación cuenta con almacenamiento local persistente a través de **Capacitor Preferences**, notificaciones locales nativas para avisarte del inicio del periodo, y bloqueo de suspensión de pantalla para mantenerla activa mientras usas el diario.

---

## 🚀 Estructura del Proyecto

El código está dividido en los siguientes módulos y componentes dentro de `src/`:

*   **`main.jsx`**: Punto de entrada del proyecto.
*   **`App.jsx`**: Orquestador principal y observador de animaciones/vibraciones.
*   **`index.css`**: Contiene todos los estilos Tailwind CSS de Rimi, animaciones "cute", y modos oscuro/claro pastel.
*   **`hooks/useStorage.js`**: Hook personalizado para leer y escribir datos de forma segura con `Capacitor Preferences` y compatibilidad con `localStorage`.
*   **`utils/audio.js`**: Generador de sonidos y feedback sonoro con la API de Web Audio.
*   **`utils/helpers.js`**: Cálculos de ciclo, predicción de menstruación, formato de moneda, y utilidades de fecha.
*   **`components/`**:
    *   `ThemeProvider.jsx`: Administrador de apariencia pastel y modos claro/oscuro.
    *   `Welcome.jsx`: Pantalla de bienvenida con burbujas flotantes.
    *   `Home.jsx`: El panel de control principal "Mi día".
    *   `Finanzas.jsx`: Control de ingresos, egresos y gastos por categoría.
    *   `Agenda.jsx`: Calendario de eventos y cumpleaños.
    *   `Ciclo.jsx`: Registro del periodo, gráfico del ciclo menstrual y estimaciones.
    *   `Diario.jsx`: Diario íntimo con selector de papel y un lienzo interactivo para dibujar/escribir.
    *   `Configuracion.jsx`: Sonidos, copias de seguridad de datos (.json) y reinicio.
    *   `Navbar.jsx`: Barra de navegación inferior adaptada a dispositivos móviles.

---

## 🛠️ Requisitos de Desarrollo

Necesitas tener instalado:
*   **Node.js** (LTS o superior)
*   **Java Development Kit (JDK)** 17
*   **Android SDK** (incluido con Android Studio)

---

## 💻 Desarrollo Local

Para correr la app localmente en tu navegador web:

1.  Instala las dependencias:
    ```bash
    npm install
    ```
2.  Inicia el servidor de desarrollo:
    ```bash
    npm run dev
    ```
3.  Abre `http://localhost:5173` en tu navegador.

---

## 📱 Compilación y Despliegue en Android

Para sincronizar los cambios de la web al proyecto Android nativo y generar el instalador `.apk`:

1.  Compila los activos web:
    ```bash
    npm run build
    ```
2.  Sincroniza los activos web compilados y los plugins con el proyecto Android nativo:
    ```bash
    npx cap sync android
    ```
3.  Genera el archivo `.apk` de depuración directamente desde la consola:
    ```bash
    cd android && ./gradlew assembleDebug
    ```
4.  El archivo APK resultante estará listo para instalarse en cualquier dispositivo en:
    `android/app/build/outputs/apk/debug/app-debug.apk`

---

## ✨ Características Nativas Integradas

1.  **Persistencia Robusta:** Los datos de tu bolsillo, agenda, diario y ciclo se guardan usando la API nativa de almacenamiento seguro de Android (`Preferences`), garantizando que tus datos nunca se pierdan si el sistema operativo limpia el caché del navegador.
2.  **Notificaciones Locales (`@capacitor/local-notifications`):** La app programará automáticamente una notificación nativa un día antes de que empiece tu periodo menstrual si activas el interruptor en "Mi Ciclo".
3.  **Mantener Pantalla Activa (`@capacitor-community/keep-awake`):** La pantalla del dispositivo móvil se mantendrá encendida automáticamente mientras usas la aplicación, para que puedas escribir o dibujar en tu diario tranquilamente sin que se apague.
4.  **Audio Nativo Exclusivo:** Los sonidos de clicks, guardados, tontos errores de entrada o borrados se generan de forma dinámica usando Web Audio de forma fluida y nativa.

¡Disfruta de Rimi en tu celular! 🌸💗
