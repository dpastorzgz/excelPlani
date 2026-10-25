@echo off
setlocal
where node.exe >nul 2>nul
if errorlevel 1 (
  echo [ERROR] No se ha encontrado Node.js.
  echo Instale Node.js 22 o superior y vuelva a ejecutar este archivo.
  pause
  exit /b 1
)

node.exe "%~dp0start-dashboard.mjs" %*
set "exit_code=%errorlevel%"
if not "%exit_code%"=="0" (
  echo.
  echo [ERROR] No se pudo iniciar el cuadro de mando.
  echo Revise el mensaje anterior. No es necesario modificar la politica de PowerShell.
  pause
)
endlocal & exit /b %exit_code%
