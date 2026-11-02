@echo off
echo ========================================================
echo   Iniciando Memoria Viva - Fundacion Legado Vivo (Palmares)
echo ========================================================

start "Memoria Viva Backend (FastAPI)" cmd /k "set PYTHONPATH=apps\api;.&& apps\api\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 /nobreak > nul

start "Memoria Viva Frontend (React Vite)" cmd /k "cd apps\web && npm run dev"

echo ========================================================
echo   Aplicacion lista:
echo   - Frontend: http://localhost:5173
echo   - Backend:  http://localhost:8000
echo   - Swagger:  http://localhost:8000/docs
echo ========================================================
