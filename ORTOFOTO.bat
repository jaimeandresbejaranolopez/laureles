@echo off
chcp 65001 >nul
title Preparar la ortofoto del dron
setlocal enabledelayedexpansion
cd /d "%~dp0"
echo.
echo ===========================================================
echo   PREPARAR LA ORTOFOTO PARA LA WEB
echo ===========================================================
echo.
echo  Arrastra aqui el archivo .tif y pulsa Enter,
echo  o pega la ruta completa:
set /p TIF=  ^>
set TIF=%TIF:"=%
if not exist "%TIF%" (
  echo.
  echo  No encuentro ese archivo.
  pause & exit /b 1
)

rem --- buscar gdal (QGIS u OSGeo4W) ---
set GDAL=
where gdal_translate >nul 2>nul && set GDAL=gdal_translate
if "%GDAL%"=="" for /d %%q in ("C:\Program Files\QGIS*") do (
  if exist "%%q\bin\gdal_translate.exe" set "GDAL=%%q\bin\gdal_translate.exe" & set "GINFO=%%q\bin\gdalinfo.exe"
)
if "%GDAL%"=="" if exist "C:\OSGeo4W\bin\gdal_translate.exe" (
  set "GDAL=C:\OSGeo4W\bin\gdal_translate.exe" & set "GINFO=C:\OSGeo4W\bin\gdalinfo.exe"
)
if "%GDAL%"=="" (
  echo.
  echo  No encuentro GDAL en este computador.
  echo  Se instala solo con QGIS: https://qgis.org/es/site/forusers/download.html
  echo  Instalalo y vuelve a hacer doble clic en este archivo.
  echo.
  pause & exit /b 1
)
if "%GINFO%"=="" set GINFO=gdalinfo

echo.
echo  --- Ficha del archivo (se guarda en ortofoto_ficha.txt) ---
"%GINFO%" "%TIF%" > "%~dp0ortofoto_ficha.txt" 2>&1
findstr /C:"Size is" /C:"Pixel Size" /C:"PROJCRS" /C:"GEOGCRS" /C:"Band " "%~dp0ortofoto_ficha.txt"
echo.
echo  Reduciendo a 10.000 px de ancho en JPEG...
echo  (el original no se toca)
"%GDAL%" -of JPEG -outsize 10000 0 -co QUALITY=88 -co WORLDFILE=YES "%TIF%" "%~dp0ortofoto_web.jpg"
if errorlevel 1 (
  echo.
  echo  Fallo la conversion. Mira el mensaje de arriba.
  pause & exit /b 1
)
echo.
echo  ===========================================================
echo   LISTO
echo   ortofoto_web.jpg  +  ortofoto_web.wld  +  ortofoto_ficha.txt
echo   quedaron en esta misma carpeta.
echo   Mandamelos por el chat y yo armo las teselas del mapa.
echo  ===========================================================
echo.
dir /b ortofoto_web.* ortofoto_ficha.txt
echo.
pause
