@echo off
cd /d "%~dp0"
"C:\Program Files\PostgreSQL\18\bin\postgres.exe" -D ".pgdata" -p 55432
