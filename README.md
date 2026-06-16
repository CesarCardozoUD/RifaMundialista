# Rifa Mundialista

Plataforma web para predicciones de partidos de la Copa Mundial de la FIFA. Los participantes pueden registrar sus pronósticos, acumular puntos según la precisión de sus resultados y competir en una clasificación general durante todo el torneo.

---

## Características

### Predicciones

* Registro de predicciones por partido.
* Modificación de predicciones antes del inicio del encuentro.
* Visualización de predicciones previamente registradas.
* Restricción automática de cambios una vez iniciado el partido.

### Sistema de Puntuación

| Resultado                 | Puntos |
| ------------------------- | ------ |
| Marcador exacto           | 2      |
| Ganador o empate acertado | 1      |

Algunos encuentros pueden incluir multiplicadores especiales de puntuación.

### Multiplicadores

La plataforma permite definir partidos destacados con bonificaciones de puntos.

Ejemplos:

| Multiplicador | Marcador Exacto | Ganador Correcto |
| ------------- | --------------- | ---------------- |
| x1            | 2               | 1                |
| x2            | 4               | 2                |
| x3            | 6               | 3                |

### Tabla de Posiciones

* Clasificación automática de participantes.
* Actualización de puntajes en tiempo real.
* Ranking global del torneo.

### Datos Curiosos

Cada jornada incluye estadísticas, récords históricos, rachas y curiosidades relacionadas con los equipos participantes.

### Administración

Los administradores pueden:

* Crear participantes.
* Activar cuentas.
* Restablecer contraseñas.
* Registrar resultados oficiales.
* Configurar multiplicadores.
* Gestionar el avance del torneo.

---

## Tecnologías Utilizadas

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router

### Backend

* Supabase
* PostgreSQL
* Funciones RPC
* Row Level Security (RLS)

---

## Arquitectura

```text
React
  │
  ▼
Supabase
  │
  ▼
PostgreSQL
  │
  ▼
Funciones RPC
```

La lógica de negocio principal se ejecuta en la base de datos mediante funciones PostgreSQL para garantizar integridad, consistencia y seguridad.

---

## Modelo de Datos

### arquitectura de tablas

![alt text](public/BD.png)

### matches

Almacena los partidos del torneo.

Información relevante:

* Equipos participantes.
* Fecha y hora del encuentro.
* Resultado oficial.
* Estado del partido.
* Multiplicador de puntuación.

### prediction

Almacena las predicciones realizadas por cada usuario.

### prediction_result

Almacena el resultado procesado de cada predicción, incluyendo:

* Resultado pronosticado.
* Resultado real.
* Puntos obtenidos.

### scores

Mantiene el puntaje acumulado de cada participante para la generación del leaderboard.

---

## Seguridad

La plataforma implementa:

* Autenticación mediante Supabase.
* Row Level Security (RLS).
* Validaciones de negocio en funciones RPC.
* Restricción de modificaciones una vez iniciado un partido.
* Operaciones sensibles protegidas desde base de datos.

---

## Instalación

### Clonar repositorio

```bash
git clone <repository-url>
```

### Instalar dependencias

```bash
npm install
```

### Ejecutar entorno local

```bash
npm run dev
```

### Generar build de producción

```bash
npm run build
```

### Visualizar build local

```bash
npm run preview
```

---

## Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

---

## Desafíos Técnicos

Este proyecto incluye varios componentes de lógica de negocio implementados directamente en PostgreSQL:

* Cálculo automático de puntajes.
* Procesamiento masivo de predicciones.
* Uso de `UPSERT` mediante `ON CONFLICT`.
* Leaderboard calculado desde resultados históricos.
* Bloqueo automático de predicciones según fecha del encuentro.
* Multiplicadores dinámicos por partido.
* Gestión de resultados mediante funciones RPC.

---

## Posibles Mejoras Futuras

* Estadísticas avanzadas de usuarios.
* Historial de torneos.
* Logros y recompensas.
* Notificaciones automáticas.
* Soporte para múltiples torneos.

---

## Licencia

Todos los derechos reservados, para más información leer LICENSE.md
