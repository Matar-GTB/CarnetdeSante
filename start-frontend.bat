@echo off
echo =======================================
echo Demarrage du frontend sur le port 3000
echo =======================================
cd %~dp0\frontend
set PORT=3000
npm start
