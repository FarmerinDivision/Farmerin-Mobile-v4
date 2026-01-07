# Paso a Paso: Verificar Alineación de 16 KB en tu APK

## Método 1: Usando el Script Automático (MÁS FÁCIL)

### Paso 1: Abre PowerShell
- Presiona `Windows + X` y selecciona "Windows PowerShell" o "Terminal"
- O busca "PowerShell" en el menú de inicio

### Paso 2: Navega a la carpeta del script
```powershell
cd "C:\Users\farme\Documents\FarmerinApp - 4.0\android"
```

### Paso 3: Ejecuta el script con la ruta de tu APK
```powershell
.\verificar-apk.ps1 -ApkPath "C:\Users\farme\Downloads\nombre_de_tu_app.apk"
```

**Reemplaza `nombre_de_tu_app.apk` con el nombre real de tu archivo APK**

### Paso 4: Revisa el resultado
- Si ves ✅ VERIFICACIÓN EXITOSA = Todo está bien
- Si ves ❌ VERIFICACIÓN FALLIDA = Hay problemas que revisar

---

## Método 2: Manual (Si el script no funciona)

### Paso 1: Encuentra tu APK
1. Abre el Explorador de Archivos
2. Ve a `C:\Users\farme\Downloads`
3. Busca tu archivo `.apk` (por ejemplo: `farmerinapps-preview.apk`)
4. **Copia la ruta completa** del archivo (click derecho > Propiedades > Copiar la ruta)

### Paso 2: Abre PowerShell
- Presiona `Windows + X` y selecciona "Windows PowerShell"

### Paso 3: Ejecuta el comando de verificación

Copia y pega este comando, reemplazando `RUTA_A_TU_APK` con la ruta completa que copiaste:

```powershell
& "C:\Users\farme\AppData\Local\Android\Sdk\build-tools\36.1.0\zipalign.exe" -c -P 16 -v 4 "C:\Users\farme\Downloads"
```

**Ejemplo completo:**
```powershell
& "C:\Users\farme\AppData\Local\Android\Sdk\build-tools\36.1.0\zipalign.exe" -c -P 16 -v 4 "C:\Users\farme\Downloads\farmerin-16kn.apk"
```

### Paso 4: Interpreta los resultados

#### ✅ **ÉXITO - Todo está correcto:**
```
Verifying alignment of tu_app.apk (4)...
  16384 lib/armeabi-v7a/libreactnativejni.so (16384 - OK)
  16384 lib/arm64-v8a/libhermes.so (16384 - OK)
  16384 lib/x86/libreanimated.so (16384 - OK)
  ...
Verification succeeded
```

**Significa:** Tu APK está correctamente alineado para páginas de 16 KB ✅

#### ❌ **ERROR - Hay problemas:**
```
Verification FAILED
  4096 lib/armeabi-v7a/libalguna.so (BAD - should be 16384)
```

**Significa:** Algunas librerías no están alineadas correctamente ❌

---

## Método 3: Usando el Explorador de Archivos (SIN PowerShell)

### Paso 1: Encuentra tu APK
1. Abre `C:\Users\farme\Downloads`
2. Localiza tu archivo `.apk`

### Paso 2: Abre la ubicación de zipalign
1. Abre el Explorador de Archivos
2. Ve a: `C:\Users\farme\AppData\Local\Android\Sdk\build-tools\36.1.0`
3. Busca el archivo `zipalign.exe`

### Paso 3: Ejecuta zipalign desde la línea de comandos
1. En la carpeta de build-tools, **mantén presionada la tecla Shift** y haz click derecho en un espacio vacío
2. Selecciona "Abrir ventana de PowerShell aquí" o "Abrir terminal aquí"
3. Ejecuta este comando (ajusta el nombre de tu APK):

```powershell
.\zipalign.exe -c -P 16 -v 4 "C:\Users\farme\Downloads\nombre_de_tu_app.apk"
```

---

## Solución de Problemas

### Problema 1: "zipalign no se reconoce como comando"
**Solución:** Usa la ruta completa como en el Método 2

### Problema 2: "No se puede encontrar el archivo APK"
**Solución:** 
- Verifica que la ruta esté correcta
- Usa comillas dobles alrededor de la ruta
- Asegúrate de usar barras invertidas `\` o barras normales `/`

### Problema 3: "El script no se puede ejecutar"
**Solución:** Ejecuta este comando primero en PowerShell:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Problema 4: "No encuentro mi APK"
**Solución:**
- Busca archivos `.apk` en Descargas
- Revisa la fecha de modificación (debería ser reciente)
- El nombre podría ser algo como: `farmerinapps-preview.apk` o similar

---

## ¿Qué hacer según el resultado?

### ✅ Si la verificación fue EXITOSA:
¡Felicitaciones! Tu APK está listo para subir a Google Play y es compatible con Android 15.

### ❌ Si la verificación FALLÓ:
1. Verifica que el build de EAS usó NDK r28+
2. Revisa los logs del build en EAS para ver qué versión de NDK se usó
3. Asegúrate de que `useLegacyPackaging = false` en `gradle.properties`
4. Considera usar `expo-build-properties` para forzar NDK r28+

---

## Comando de Ejemplo Completo

Si tu APK se llama `farmerinapps-preview.apk` y está en Descargas:

```powershell
& "C:\Users\farme\AppData\Local\Android\Sdk\build-tools\36.1.0\zipalign.exe" -c -P 16 -v 4 "C:\Users\farme\Downloads\farmerinapps-preview.apk"
```

Copia este comando, cámbialo con el nombre real de tu APK, pégalo en PowerShell y presiona Enter.

---

## Ayuda Adicional

Si tienes problemas, comparte:
1. El mensaje de error completo
2. El nombre exacto de tu archivo APK
3. La salida completa del comando
