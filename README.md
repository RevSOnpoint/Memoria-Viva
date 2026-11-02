# Memoria Viva - Fundación Legado Vivo (Palmares, Costa Rica)

Plataforma patrimonial comunitaria para la preservación, validación y narración asistida por IA de memorias de personas adultas mayores en Palmares, Costa Rica.

---

## 🏛️ Sistema de Diseño Institucional Tipo SAP (SAP Fiori / Horizon)

La interfaz de usuario ha sido concebida bajo las normas de accesibilidad y rigor corporativo empresarial de **SAP**:
- **ShellBar Institucional**: Encabezado sobrio con identidad de la Fundación Legado Vivo, selector rápido de rol de demostración (1 clic) y control de aumento de letra (zoom accesible de 18 px base hasta 200%).
- **Object Page & Master-Detail (Split Screen)**: En la pantalla **P05 (Revisión y Validación)** el Gestor de datos visualiza a la izquierda el material original inmutable con su hash SHA-256 verificado, y a la derecha el editor de curación para incorporar contenido a la base de conocimiento.
- **Badges Semánticos SAP**:
  - `Verde (Success)`: Consentimiento Acreditado / Validado
  - `Ámbar (Warning)`: Pendiente de Revisión / Visibilidad Familiar
  - `Azul (Info)`: Procesamiento IA / Público
  - `Rojo (Error)`: Sin Consentimiento / Rechazado
- **Narrador con Fuentes (P07)**: Identificado obligatoriamente como Inteligencia Artificial, con citas `[Aporte #ID - Autor, Fecha]`, botón destacado **"Ver fuente primaria"** y síntesis de voz mediante Web Speech API.

---

## 🔒 Reglas Inviolables de Privacidad y Dominio

1. **Consentimiento Obligatorio**: Sin consentimiento legal registrado con hash de evidencia, una memoria no se puede procesar, publicar ni usar en el narrador.
2. **Visibilidad**: Por defecto privada (`privado`), con opciones `familiar` y `publico`.
3. **Aislamiento Estricto**: Cada memoria posee su propia base de conocimiento; los datos de memorias distintas **nunca se mezclan**.
4. **Inmutabilidad del Original**: El material original nunca se altera y se custodia con su hash SHA-256 inmutable.
5. **Curaduría Obligatoria**: Solo el contenido validado por el **Gestor de datos** alimenta la base de conocimiento.
6. **No Alucinación**: El narrador responde exclusivamente con fragmentos validados. Ante falta de información responde `"No cuento con esa información en la base de conocimiento validada de esta memoria"`.

---

## 🚀 Inicio Rápido Local

### 1. Requisitos
- Node.js >= 20
- Python >= 3.12 (o entorno virtual `apps/api/venv`)

### 2. Ejecución del Backend (FastAPI)
```bash
# Desde la raíz del proyecto
apps\api\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Documentación OpenAPI Swagger: `http://localhost:8000/docs`

### 3. Ejecución del Frontend (React + Vite)
```bash
cd apps/web
npm run dev
```
Acceso a la interfaz web: `http://localhost:5173`

---

## 🐳 Ejecución con Docker Compose
```bash
docker-compose up --build
```
Levantará:
- `db`: PostgreSQL 16
- `api`: FastAPI en puerto `8000`
- `web`: React en puerto `5173`

---

## 🧪 Pruebas Automatizadas de Privacidad
Para ejecutar las pruebas de dominio y criterios de aceptación:
```bash
apps\api\venv\Scripts\pytest.exe apps/api/tests
```
Resultado: **8 tests pasados al 100%**.

