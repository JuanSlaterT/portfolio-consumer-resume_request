# Consumidor de solicitudes de CV

[English](README.md) | Español

Lambda de AWS que consume solicitudes desde SQS, las guarda en DynamoDB y envía
una notificación mediante SMTP de Gmail después de persistir cada registro.

## Responsabilidades y límites

Este consumidor se encarga de:

- deserializar los mensajes de solicitudes recibidos desde SQS;
- guardar cada solicitud de forma condicional en DynamoDB;
- generar en formato ISO-8601 la fecha de persistencia;
- notificar al destinatario configurado mediante SMTP de Gmail;
- devolver fallos parciales para que SQS reintente solamente los registros fallidos.

El productor es responsable del contrato y la validación del mensaje. La creación
de la cola, la tabla, los secretos, los permisos IAM y el event source mapping de
la Lambda pertenecen a la infraestructura y están fuera de este repositorio.

## Estructura de la aplicación

```text
.
├── .github/workflows/              # Integración continua
├── src/
│   ├── clients/
│   │   ├── aws/                    # Integración DynamoDB y errores AWS
│   │   └── gmail/                  # Integración SMTP de Gmail
│   ├── config/                     # Configuración mediante variables de entorno
│   ├── handlers/                   # Adaptador de Lambda para SQS
│   ├── messages/                   # Contrato del mensaje del productor
│   ├── services/                   # Orquestación del consumidor
│   └── templates/                  # Plantillas compatibles con clientes de correo
├── test/                           # Pruebas unitarias que reflejan src
├── .env.example                    # Plantilla de configuración local
├── index.mjs                       # Composición de la Lambda (index.handler)
└── package.json                    # Metadatos y comandos del proyecto
```

El handler raíz se limita a conectar las dependencias. La comunicación con
proveedores está en `clients`, la deserialización en `messages` y el orden del
procesamiento en `services`.

## Contrato del mensaje

```json
{
  "requestId": "UUID-v7",
  "requestedAt": "2026-08-30 15:43:35",
  "ipHash": "hash-sha-256",
  "email": "user@example.com",
  "subscribeToUpdates": true,
  "timestamp": 1788122615000
}
```

El `timestamp` numérico recibido pertenece al contrato del productor. DynamoDB
recibe un nuevo `timestamp` ISO-8601 generado por la Lambda al persistir el ítem.

## Configuración

| Variable | Requerida | Valor predeterminado | Sensible | Uso |
| --- | --- | --- | --- | --- |
| `DYNAMODB_TABLE_NAME` | Sí | Ninguno | No | Tabla DynamoDB destino |
| `GMAIL_SMTP_APP_PASSWORD` | Sí | Ninguno | Sí | Contraseña de aplicación de Google para autenticación SMTP |

Guarda `GMAIL_SMTP_APP_PASSWORD` mediante configuración cifrada de la Lambda o un
gestor de secretos. Nunca la subas al repositorio ni uses la contraseña normal de
la cuenta de Google.

El host SMTP (`smtp.gmail.com`), el puerto SSL (`465`), la cuenta, el remitente,
el destinatario y el asunto son constantes definidas en
`src/config/environment.mjs`.

## Verificación local

Requiere Node.js 20 o posterior.

```bash
npm install
npm run check
npm test
```

Las pruebas usan dobles locales y no realizan llamadas a DynamoDB ni a Gmail.

## Configuración de Lambda

Configura `index.handler` como handler de la Lambda. Activa las respuestas
parciales de SQS incluyendo `ReportBatchItemFailures` en el event source mapping.

## Despliegue

`.github/workflows/deploy.yml` prueba y empaqueta la aplicación en cada push y
pull request. Un push o ejecución manual desde `main` despliega el paquete en la
Lambda existente mediante GitHub OIDC y el environment `production`.

Configura estas variables no sensibles en el GitHub Environment `production`:

| Variable | Valor |
| --- | --- |
| `AWS_ROLE_ARN` | `arn:aws:iam::506126099559:role/portfolio-github-deploy-resume-requests-consumer` |
| `AWS_REGION` | `us-east-1` |
| `LAMBDA_FUNCTION_NAME` | `portfolio-resume-requests-consumer` |

GitHub Actions administra el paquete de despliegue y las actualizaciones de código
posteriores. Terraform continúa administrando la configuración de Lambda, IAM,
variables de entorno, el event source mapping de SQS, logs y código bootstrap.
