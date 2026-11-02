@echo off
echo ========================================================
echo   Iniciando Memoria Viva - Fundacion Legado Vivo (Palmares)
echo ========================================================

start "Memoria Viva Backend (FastAPI)" cmd /k "apps\api\venv\Scripts\python.exe -m uvicorn app.main:app --app-dir apps/api --host 0.0.0.0 --port 8000 --reload"

timeout /t 2 /nobreak > nul

start "Memoria Viva Frontend (React Vite)" cmd /k "cd apps\web && npm run dev"

echo Aplicacion iniciada:
echo - Frontend: http://localhost:5173
echo - Backend:  http://localhost:8000
echo - Swagger:  http://localhost:8000/docs
echo ========================================================
