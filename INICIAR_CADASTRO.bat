@echo off
TITLE Importador Guia-me
cd /d "%~dp0"

echo 🚀 Iniciando o Gerenciador...
echo.

:: Executa o node. Se falhar, o 'pause' mantera a janela aberta para lermos o erro.
:: Se funcionar, o proprio script abrira o navegador.
node import_manager.cjs || pause

exit
