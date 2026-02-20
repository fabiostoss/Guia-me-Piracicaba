@echo off
TITLE Importador Guia-me Piracicaba
echo ======================================================
echo    INICIANDO CADASTRO AUTOMATICO DE COMERCIOS
echo ======================================================
echo.
echo Diretorio: %~dp0
cd /d "%~dp0"

echo Verificando dependencias...
if not exist node_modules (
    echo Instalando dependencias necessarias...
    call npm install
)

echo.
echo 🚀 Iniciando script de importacao...
echo (O progresso sera salvo automaticamente se voce fechar esta janela)
echo.

call npm run import-pira

echo.
echo ======================================================
echo    PROCESSO CONCLUIDO OU INTERROMPIDO
echo ======================================================
pause
