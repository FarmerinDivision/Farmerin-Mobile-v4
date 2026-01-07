# Script para verificar que el APK está alineado para páginas de 16 KB
# Uso: .\verificar-apk.ps1 -ApkPath "ruta\a\tu_app.apk"

param(
    [Parameter(Mandatory=$true)]
    [string]$ApkPath
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verificación de Alineación 16 KB" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que el archivo existe
if (-not (Test-Path $ApkPath)) {
    Write-Host "ERROR: No se encontró el archivo: $ApkPath" -ForegroundColor Red
    exit 1
}

Write-Host "APK a verificar: $ApkPath" -ForegroundColor Yellow
Write-Host ""

# Buscar zipalign en Android SDK
$androidHome = $env:ANDROID_HOME
if (-not $androidHome) {
    $androidHome = $env:LOCALAPPDATA + "\Android\Sdk"
}

$zipalignPath = $null
if (Test-Path $androidHome) {
    $zipalignPattern = Join-Path $androidHome "build-tools\*\zipalign.exe"
    $zipalignFiles = Get-ChildItem -Path $zipalignPattern -ErrorAction SilentlyContinue | Sort-Object FullName -Descending
    
    if ($zipalignFiles.Count -gt 0) {
        $zipalignPath = $zipalignFiles[0].FullName
    }
}

if (-not $zipalignPath -or -not (Test-Path $zipalignPath)) {
    Write-Host "ERROR: zipalign no encontrado." -ForegroundColor Red
    Write-Host "Por favor, asegúrate de tener Android SDK instalado y ANDROID_HOME configurado." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Ubicación esperada: $androidHome\build-tools\[versión]\zipalign.exe" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "O puedes descargar el SDK desde: https://developer.android.com/studio" -ForegroundColor Yellow
    exit 1
}

Write-Host "Usando zipalign: $zipalignPath" -ForegroundColor Green
Write-Host ""
Write-Host "Ejecutando verificación..." -ForegroundColor Yellow
Write-Host ""

# Ejecutar zipalign
& $zipalignPath -c -P 16 -v 4 $ApkPath

$exitCode = $LASTEXITCODE

Write-Host ""

if ($exitCode -eq 0) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ VERIFICACIÓN EXITOSA" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "El APK está correctamente alineado para páginas de 16 KB." -ForegroundColor Green
    Write-Host "Es compatible con los requisitos de Google Play para Android 15." -ForegroundColor Green
} else {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "❌ VERIFICACIÓN FALLIDA" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "El APK NO está correctamente alineado para páginas de 16 KB." -ForegroundColor Red
    Write-Host ""
    Write-Host "Posibles soluciones:" -ForegroundColor Yellow
    Write-Host "1. Verifica que el NDK usado sea r28 o superior" -ForegroundColor Yellow
    Write-Host "2. Revisa que useLegacyPackaging = false en gradle.properties" -ForegroundColor Yellow
    Write-Host "3. Asegúrate de que AGP sea 8.5.1 o superior" -ForegroundColor Yellow
    Write-Host "4. Verifica que las dependencias nativas estén actualizadas" -ForegroundColor Yellow
    exit 1
}

