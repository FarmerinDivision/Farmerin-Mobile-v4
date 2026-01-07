# Solución para Error de Google Play: "La app debe admitir tamaños de página de memoria de 16 kB"

## Problema
Aunque `zipalign` verificó correctamente la alineación de 16 KB, Google Play Console aún muestra el error:
> "La app debe admitir tamaños de página de memoria de 16 kB"

## Causa
Google Play verifica más que solo la alineación ELF. El problema puede ser:
1. Dependencias pre-compiladas (librerías .so incluidas en el APK) que no están alineadas
2. El NDK usado durante el build puede no ser r28+ si Expo prebuild lo sobrescribe
3. Algunas librerías nativas pueden requerir recompilación con NDK r28+

## Solución Implementada

### 1. Instalar expo-build-properties
```bash
npm install expo-build-properties --save-dev
```

### 2. Configurar en app.json
Se agregó el plugin `expo-build-properties` en `app.json` para forzar NDK r28+:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "ndkVersion": "28.0.12674087",
            "useLegacyPackaging": false
          }
        }
      ]
    ]
  }
}
```

## Pasos Siguientes

### 1. Limpiar y Reconstruir
```bash
# Limpiar build anterior
cd android
./gradlew clean

# Volver al directorio raíz
cd ..

# Ejecutar prebuild para aplicar los cambios
npx expo prebuild --clean

# Compilar nuevo build
eas build -p android --profile preview
```

### 2. Verificar el Nuevo APK
Una vez descargado el nuevo APK:
```powershell
cd android
.\verificar-apk.ps1 -ApkPath "C:\Users\farme\Downloads\nombre_del_nuevo_apk.apk"
```

### 3. Subir a Google Play
- Sube el nuevo APK/AAB a Google Play Console
- Google Play debería verificar automáticamente y pasar la validación

## Configuraciones Adicionales (Si el problema persiste)

Si después de estos cambios Google Play aún muestra el error, considera:

### Opción 1: Forzar SDK 35 (Android 15) - Solo si es necesario
```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "ndkVersion": "28.0.12674087",
            "compileSdkVersion": 35,
            "targetSdkVersion": 35,
            "useLegacyPackaging": false
          }
        }
      ]
    ]
  }
}
```

**Nota**: Esto solo debe usarse si tu app está lista para Android 15. Expo SDK 54 puede tener limitaciones con SDK 35.

### Opción 2: Verificar Dependencias Específicas
Si el problema persiste, puede ser una dependencia específica que necesita actualización:

1. **react-native-reanimated**: Asegúrate de usar la versión más reciente
2. **Hermes**: Verifica que esté actualizado con tu versión de React Native
3. **Expo Modules**: Asegúrate de que Expo SDK 54 esté completamente actualizado

### Opción 3: Usar useLegacyPackaging (No recomendado, última opción)
Como última opción, puedes intentar con `useLegacyPackaging: true`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "ndkVersion": "28.0.12674087",
            "useLegacyPackaging": true
          }
        }
      ]
    ]
  }
}
```

**Advertencia**: Esto aumenta el tamaño del APK, pero puede resolver problemas con librerías pre-compiladas.

## Verificación de Build

Después de hacer el nuevo build, verifica en los logs de EAS Build:
1. Que se esté usando NDK r28 (busca "NDK" en los logs)
2. Que no haya errores relacionados con compilación de librerías nativas

## Referencias
- [Expo Build Properties Documentation](https://docs.expo.dev/versions/latest/sdk/build-properties/)
- [Android 16KB Page Size Requirements](https://developer.android.com/guide/practices/page-sizes)
- [Expo SDK 54 Release Notes](https://expo.dev/changelog/2024/11-07-sdk-54)
