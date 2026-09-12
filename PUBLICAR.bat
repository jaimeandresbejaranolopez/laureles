@echo off
chcp 65001 >nul
title Publicar Laureles Campestre
cd /d "%~dp0"
echo.
echo ===========================================================
echo   PUBLICAR www.laurelescampestre.co
echo ===========================================================
echo.
where git >nul 2>nul
if errorlevel 1 (
  echo  No encuentro git en este computador.
  echo  Instalalo desde https://git-scm.com/download/win y vuelve a
  echo  hacer doble clic en este archivo.
  echo.
  pause
  exit /b 1
)
echo  Carpeta: %cd%
echo.
git rev-parse --is-inside-work-tree >nul 2>nul
if errorlevel 1 (
  echo  Esta carpeta no es un repositorio de git.
  echo.
  pause
  exit /b 1
)
echo  --- Archivos que van a subir ---
git status --short
echo.
git add -A
git diff --cached --quiet
if not errorlevel 1 (
  echo  No hay nada nuevo que publicar: la pagina ya esta al dia.
  echo.
  pause
  exit /b 0
)
for /f "tokens=1-3 delims=/ " %%a in ("%date%") do set FECHA=%%a-%%b-%%c
git commit -m "Actualizacion del plano y el analisis de lote - %FECHA%"
if errorlevel 1 (
  echo.
  echo  No se pudo crear el commit. Revisa el mensaje de arriba.
  echo.
  pause
  exit /b 1
)
echo.
echo  Subiendo a GitHub...
git push
if errorlevel 1 (
  echo.
  echo  El envio fallo. Lo mas comun es que GitHub pida usuario y clave:
  echo  si aparecio una ventana, acepta e intenta de nuevo.
  echo.
  pause
  exit /b 1
)
echo.
echo  ===========================================================
echo   LISTO. GitHub tarda entre 1 y 3 minutos en refrescar.
echo   Abre www.laurelescampestre.co y recarga con Ctrl+F5.
echo  ===========================================================
echo.
pause
