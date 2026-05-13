# IdentityHubNFC

Aplicación móvil en React Native para Android con soporte NFC.

## Requisitos

- Node.js y dependencias del proyecto instaladas.
- Android Studio, SDK de Android y un emulador o dispositivo conectado.

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
npm install
```

## Ejecutar en Android

Con el emulador abierto o un dispositivo conectado:

```sh
npx react-native run-android
```

Si prefieres usar el script del proyecto:

```sh
npm run android
```

## Generar bundle para Android

Antes de crear una versión de despliegue, genera el bundle JavaScript y los assets con:

```sh
npx react-native bundle \
	--platform android \
	--dev false \
	--entry-file index.js \
	--bundle-output android/app/src/main/assets/index.android.bundle \
	--assets-dest android/app/src/main/res
```

Después instala o ejecuta la app en Android:

```sh
npx react-native run-android
```

## Despliegue

Para un despliegue Android, genera primero el bundle anterior y luego compila la variante que necesites desde Android Studio o con Gradle.

## Presentación

Enlace de la presentación: [agregar enlace aquí]

## Notas

- La carpeta `android/app/src/main/assets` y los recursos generados en `android/app/src/main/res` se crean durante el bundle de Android.
- Si cambias dependencias nativas, vuelve a compilar la app antes de probar.
