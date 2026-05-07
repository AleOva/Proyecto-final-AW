# Sistema de Eventos en Tiempo Real
## PostgreSQL → Node.js (SSE) → Angular
Sistema que permite detectar cambios en una base de datos PostgreSQL y mostrarlos en tiempo real en una aplicación Angular, utilizando Server-Sent Events (SSE) como tecnología de comunicación.
## Objetivo del Proyecto
Invertir el flujo tradicional de comunicación cliente-servidor. En lugar de que el frontend consulte constantemente al backend por cambios, es la base de datos quien notifica automáticamente cuando ocurre una modificación, y el backend retransmite esta información al frontend en tiempo real.

## Arquitectura
PostgreSQL (Trigger + NOTIFY)
↓
Node.js (LISTEN + SSE)
↓
Angular (EventSource + Angular Material)
### Flujo de datos:

1. **Usuario** ejecuta INSERT o UPDATE en PostgreSQL
2. **Trigger** se activa y envía NOTIFY al canal `friends_update`
3. **Node.js** recibe la notificación y la retransmite vía SSE
4. **Angular** recibe el evento y actualiza la interfaz automáticamente
## 🛠️ Tecnologías Utilizadas
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| PostgreSQL | 17+ | Base de datos + Triggers + NOTIFY |
| Node.js | 18+ | Backend con Express |
| Server-Sent Events (SSE) | - | Comunicación en tiempo real |
| Angular | 18+ | Frontend standalone |
| Angular Material | 18+ | Componentes UI y tabla |
| TypeScript | 5+ | Lenguaje principal |
| pg | 8+ | Conexión Node.js → PostgreSQL |

## Requisitos Previos
- Node.js (v18 o superior)
- PostgreSQL (v14 o superior)
- Angular CLI (v18 o superior)
- Navegador web moderno (Chrome, Edge, Firefox)
## Instalación y Ejecución
### 1. Clonar el repositorio
git clone https://github.com/TU_USUARIO/eventos-tiempo-real-postgres-angular.git
cd eventos-tiempo-real-postgres-angular

2. Configurar la base de datos (PostgreSQL)

Accede a pgAdmin o psql y ejecuta:
-- Crear la base de datos
CREATE DATABASE eventosbd;

-- Conectarse a la base de datos
\c eventosbd;

-- Crear la tabla
CREATE TABLE my_friends (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    gender VARCHAR(20)
);

-- Insertar datos de ejemplo
INSERT INTO my_friends (name, gender) VALUES 
('Rigoberto', 'Masculino'),
('Ana', 'Femenino'),
('Carlos', 'Masculino'),
('Raúl', 'Masculino');

-- Crear la función para notificaciones
CREATE OR REPLACE FUNCTION notify_friends_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM pg_notify('friends_update', json_build_object(
            'new_name', NEW.name,
            'gender', NEW.gender,
            'table_name', TG_TABLE_NAME,
            'changed_at', NOW(),
            'operation', 'INSERT'
        )::text);
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM pg_notify('friends_update', json_build_object(
            'old_name', OLD.name,
            'new_name', NEW.name,
            'gender', NEW.gender,
            'table_name', TG_TABLE_NAME,
            'changed_at', NOW(),
            'operation', 'UPDATE'
        )::text);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger
CREATE TRIGGER trigger_friends_change
AFTER INSERT OR UPDATE ON my_friends
FOR EACH ROW
EXECUTE FUNCTION notify_friends_change();

3. Configurar y ejecutar el Backend (Node.js)
cd backend
npm install express pg cors
node server.js

4. Configurar y ejecutar el Frontend (Angular)
cd frontend-eventos
npm install
ng serve

5. Estructura del Proyecto
evento-bd-tiempo-real/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── node_modules/
└── frontend-eventos/
    ├── src/
    │   └── app/
    │       ├── app.ts
    │       ├── app.html
    │       ├── app.css
    │       └── services/
    │           └── event.service.ts
    ├── angular.json
    └── package.json
