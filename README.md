# Lottery Tracker

Aplicación web para el seguimiento de resultados de loterías dominicanas, estadísticas y predicciones.

## Características

- Visualización de sorteos recientes
- Estadísticas detalladas
- Predicciones basadas en análisis histórico
- Interfaz moderna y responsiva
- Tema claro/oscuro

## Tecnologías

- Next.js 14
- React
- TypeScript
- Tailwind CSS
- Shadcn/ui
- Prisma
- PostgreSQL

## Requisitos

- Node.js 18.x o superior
- PostgreSQL 12.x o superior

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/Wwb-Daniel/lottery-tracker.git
cd lottery-tracker
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```
Editar `.env` con tus credenciales de base de datos.

4. Inicializar la base de datos:
```bash
npx prisma migrate dev
```

5. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

## Despliegue

El proyecto está configurado para desplegarse en Vercel. Cada push a la rama `main` activará un nuevo despliegue.

## Estructura del Proyecto

```
lottery-tracker/
├── app/                # Rutas y páginas de la aplicación
├── components/         # Componentes reutilizables
├── lib/               # Utilidades y configuraciones
├── prisma/            # Esquema y migraciones de la base de datos
└── public/            # Archivos estáticos
```

## Contribuir

1. Fork el repositorio
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles. 