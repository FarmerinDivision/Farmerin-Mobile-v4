# Compatibilidad con Páginas de 16 KB (Android 15)

Este documento describe los cambios realizados para asegurar la compatibilidad con dispositivos Android que usan páginas de 16 KB, un requisito de Google Play para Android 15.

## Cambios Realizados

### 1. Android Gradle Plugin (AGP)
- **Estado**: ✅ Actualizado a AGP 8.5.1
- **Ubicación**: `android/build.gradle`
- **Versión mínima requerida**: 8.5.1 o superior
- AGP 8.5.1+ incluye soporte nativo para alineación de 16 KB

### 2. NDK (Native Development Kit)
- **Estado**: ✅ Configurado para usar NDK r28+ 
- **Ubicación**: `android/app/build.gradle`
- **Versión mínima requerida**: r28.0.12674087 o superior
- NDK r28+ compila automáticamente con alineación ELF de 16 KB

**Nota importante**: Si ejecutas `expo prebuild`, verifica que el NDK configurado sea r28 o superior. Puedes usar el plugin `expo-build-properties` para forzar la versión del NDK:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "ndkVersion": "28.0.12674087"
          }
        }
      ]
    ]
  }
}
```

### 3. Configuración de Empaquetado
- **Estado**: ✅ Configurado correctamente
- **Ubicación**: `android/app/build.gradle` y `android/gradle.properties`
- `useLegacyPackaging = false` - Esto asegura que el empaquetado sea compatible con zipalign de 16 KB

### 4. Código Nativo
- **Estado**: ✅ Sin código nativo personalizado encontrado
- No se encontraron archivos C/C++ en el proyecto
- No se encontraron referencias hardcodeadas a PAGE_SIZE o 4096
- Los archivos Kotlin/Java no contienen referencias a tamaños de página codificados

### 5. Banderas de Compilación
- **Estado**: ✅ No necesarias con NDK r28+
- Con NDK r28+, la alineación ELF de 16 KB se aplica automáticamente
- Si necesitas usar una versión anterior del NDK, puedes agregar la siguiente bandera en `CMakeLists.txt` o `build.gradle`:
  ```
  -Wl,-z,max-page-size=16384
  ```

## Dependencias Nativas que Podrían Necesitar Actualización

Las siguientes dependencias nativas están en uso y deberían actualizarse si sus proveedores publican versiones compatibles con 16 KB:

1. **React Native 0.81.0** - Verificar que la versión utilizada esté compilada con NDK r28+
2. **Hermes** (motor JavaScript) - Incluido en React Native, verificar compatibilidad
3. **react-native-reanimated** - Verificar que la versión instalada soporte 16 KB
4. **Expo Modules** - Expo SDK 54 debería incluir soporte, pero verificar actualizaciones
5. **react-native-gesture-handler** - Verificar actualizaciones del proveedor
6. **react-native-screens** - Verificar actualizaciones del proveedor

### Verificación de Dependencias

Para verificar que las dependencias nativas están correctamente alineadas, puedes:

1. Compilar tu APK/AAB
2. Verificar la alineación usando:
   ```bash
   zipalign -c -P 16 -v 4 tu_app.apk
   ```
   
   Si todas las librerías están correctamente alineadas, deberías ver mensajes de confirmación para cada `.so` file.

## Recomendaciones Adicionales

1. **Después de ejecutar `expo prebuild`**: Verifica que el NDK configurado sea r28 o superior en `android/app/build.gradle`

2. **Pruebas**: Prueba tu aplicación en dispositivos físicos con Android 15 o emuladores configurados para páginas de 16 KB

3. **Google Play Console**: Google Play verificará automáticamente la compatibilidad antes de permitir la publicación

4. **Monitoreo**: Mantén las dependencias actualizadas, especialmente React Native y Expo SDK, para asegurar compatibilidad continua

## Referencias

- [Android Developers - 16 KB page size](https://developer.android.com/guide/practices/page-sizes)
- [Android NDK r28 Release Notes](https://developer.android.com/ndk/downloads/revision_history)
- [Expo Build Properties Plugin](https://docs.expo.dev/versions/latest/sdk/build-properties/)
