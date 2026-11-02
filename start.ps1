Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Iniciando Memoria Viva - Fundacion Legado Vivo (Palmares)" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan

# 1. Iniciar Backend FastAPI en una ventana nueva
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PYTHONPATH='apps/api;.'; & apps\api\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

Start-Sleep -Seconds 2

# 2. Iniciar Frontend Vite en una ventana nueva
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location apps/web; npm run dev"

Write-Host "`nAplicacion levantada correctamente:" -ForegroundColor Yellow
Write-Host "- Frontend Web: http://localhost:5173" -ForegroundColor White
Write-Host "- Backend API:  http://localhost:8000" -ForegroundColor White
Write-Host "- Swagger Docs: http://localhost:8000/docs`n" -ForegroundColor White
