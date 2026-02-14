# 🚀 System Back-Office API - Documentación Completa

Bienvenido a la documentación técnica exhaustiva del backend de System Back-Office. 

---

## 🔑 Autenticación (`AuthRouter`)
| Endpoint | Método | Descripción | Permisos | Datos |
| :--- | :---: | :--- | :--- | :--- |
| `/usuario/login` | `POST` | Inicia sesión y devuelve un token JWT. | Público | `{ user: { email, password } }` |
| `/usuario/register` | `POST` | Registra un nuevo usuario. | `SUPERADMIN` | `{ user: { ... } }` |
| `/usuario/verify` | `GET` | Verifica si el token actual es válido. | Público | `Bearer <token>` |
| `/usuario/refresh` | `POST` | Refresca el token de acceso. | Público (Cookie) | N/A |
| `/usuarios/:id/password` | `PATCH` | Cambia la contraseña de un usuario. | Dueño o Admin | `{ passwordData }` |
| `/usuario/logout` | `POST` | Cierra la sesión y elimina la cookie. | Público | N/A |

---

## 👥 Usuarios (`UsuarioRouter`)
| Endpoint | Método | Descripción | Permisos |
| :--- | :---: | :--- | :--- |
| `/usuarios` | `GET` | Lista todos los usuarios con paginación. | `MANAGEMENT` |
| `/usuarios/stats` | `GET` | Obtiene estadísticas generales de usuarios. | `ADMIN` |
| `/usuarios/search/email` | `GET` | Busca usuario por email. | `MANAGEMENT` |
| `/usuarios/search/legajo` | `GET` | Busca usuario por legajo. | `MANAGEMENT` |
| `/usuarios/search/exa` | `GET` | Busca usuario por código EXA. | `MANAGEMENT` |
| `/usuarios/:id` | `GET` | Obtiene detalles de un usuario. | `MANAGEMENT` |
| `/usuarios/:id` | `PUT` | Actualiza la información de un usuario. | `ADMIN` |
| `/usuarios/:id/status` | `PATCH` | Cambia estado (ACTIVO/INACTIVO). | `ADMIN` |
| `/usuarios/:id` | `DELETE` | Elimina permanentemente un usuario. | `SUPERADMIN` |

---

## 💰 Gestión de Ventas (`VentaRouter`)
| Endpoint | Método | Descripción | Permisos |
| :--- | :---: | :--- | :--- |
| `/ventas` | `GET` | Lista todas las ventas registradas. | `MANAGEMENT` |
| `/ventas/estadisticas` | `GET` | Obtiene estadísticas de ventas. | `MANAGEMENT` |
| `/ventas/fechas` | `GET` | Busca ventas por rango de fechas. | Autenticado |
| `/ventas/sds/:sds` | `GET` | Busca venta por código SDS. | Autenticado |
| `/ventas/sap/:sap` | `GET` | Busca venta por código SAP. | Autenticado |
| `/ventas/vendedor/:vendedor` | `GET` | Lista ventas de un vendedor. | Autenticado |
| `/ventas/cliente/:cliente` | `GET` | Lista ventas de un cliente. | Autenticado |
| `/ventas/plan/:plan` | `GET` | Lista ventas por ID de plan. | Autenticado |
| `/ventas/:id` | `GET` | Obtiene detalles de una venta. | Autenticado |
| `/ventas` | `POST` | Crea una nueva venta completa. | Autenticado |
| `/ventas/:id` | `PUT` | Actualiza datos de una venta. | `ADMIN` |
| `/ventas/:id` | `DELETE` | Elimina una venta del sistema. | `ADMIN` |

---

## 📧 Gestión de Correos (`CorreoRouter`)
| Endpoint | Método | Descripción | Permisos |
| :--- | :---: | :--- | :--- |
| `/correos` | `GET` | Lista todos los correos registrados. | `MANAGEMENT` |
| `/correos/stats` | `GET` | Estadísticas de envíos. | `MANAGEMENT` |
| `/correos/proximos-vencer`| `GET` | Envíos próximos a vencer (3 días). | `MANAGEMENT` |
| `/correos/vencidos` | `GET` | Lista de envíos ya vencidos. | `MANAGEMENT` |
| `/correos/search/sap` | `GET` | Busca envío por código SAP. | `MANAGEMENT` |
| `/correos/search/localidad`| `GET` | Busca envíos por localidad. | `MANAGEMENT` |
| `/correos/search/departamento`| `GET` | Busca envíos por departamento. | `MANAGEMENT` |
| `/correos/:id` | `GET` | Detalle de envío por SAP ID. | `MANAGEMENT` |
| `/correos` | `POST` | Registra un nuevo envío. | Autenticado |
| `/correos/:id` | `PUT` | Actualiza un registro de envío. | `MANAGEMENT` |
| `/correos/:id` | `DELETE` | Elimina registro (Permanente). | `SUPERADMIN` |

---

## 📈 Tracking de Correo (`EstadoCorreoRouter`)
| Endpoint | Método | Descripción | Permisos |
| :--- | :---: | :--- | :--- |
| `/estados-correo` | `GET` | Lista todos los estados de seguimiento. | `MANAGEMENT` |
| `/estados-correo/stats` | `GET` | Estadísticas de estados de tracking. | `MANAGEMENT` |
| `/estados-correo/entregados`| `GET` | Lista de envíos entregados. | `MANAGEMENT` |
| `/estados-correo/no-entregados`| `GET` | Lista de envíos no entregados. | `MANAGEMENT` |
| `/estados-correo/devueltos`| `GET` | Lista de envíos devueltos. | `MANAGEMENT` |
| `/estados-correo/en-transito`| `GET` | Lista de envíos en tránsito. | `MANAGEMENT` |
| `/estados-correo/search/sap`| `GET` | Historial completo de estados por SAP. | `VENDEDOR+` |
| `/estados-correo/search/sap/ultimo`| `GET` | Último estado registrado por SAP. | `VENDEDOR+` |
| `/estados-correo/search/fecha-rango`| `GET` | Tracking en rango de fechas. | `MANAGEMENT` |
| `/estados-correo` | `POST` | Crea un nuevo hito de seguimiento. | `ADMIN` |
| `/estados-correo/:id/marcar-entregado`| `PATCH` | Marca envío como ENTREGADO. | `ADMIN` |

---

## 🏷️ Estados de Venta (`EstadoVentaRouter`)
| Endpoint | Método | Descripción | Permisos |
| :--- | :---: | :--- | :--- |
| `/estados` | `GET` | Lista todos los cambios de estado. | Autenticado |
| `/estados/ultimos` | `GET` | Último estado de cada venta. | Autenticado |
| `/estados/buscar` | `GET` | Filtros avanzados (venta, estado, fecha). | Autenticado |
| `/estados/venta/:venta_id` | `GET` | Historial de una venta específica. | Autenticado |
| `/estados` | `POST` | Registra un nuevo estado de venta. | `MANAGEMENT` |
| `/estados/:id` | `DELETE` | Elimina un registro de estado. | `ADMIN` |

---

## 🤝 Clientes (`ClienteRouter`)
| Endpoint | Método | Descripción | Permisos |
| :--- | :---: | :--- | :--- |
| `/clientes` | `GET` | Lista todos los clientes básicos. | Autenticado |
| `/clientes/completo` | `GET` | Lista clientes con datos de persona. | Autenticado |
| `/clientes/buscar` | `GET` | Busca por tipo y número de documento. | Autenticado |
| `/clientes/:id` | `GET` | Detalle completo de un cliente. | Autenticado |
| `/clientes` | `POST` | Crea un nuevo cliente. | `ADMIN` |
| `/clientes/:id` | `DELETE` | Elimina un cliente. | `ADMIN` |

---

## 🏢 Empresas Origen (`EmpresaOrigenRouter`)
| Endpoint | Método | Descripción | Permisos |
| :--- | :---: | :--- | :--- |
| `/empresa-origen` | `GET` | Lista empresas de origen. | Autenticado |
| `/empresa-origen/:id` | `GET` | Detalle por ID. | Autenticado |
| `/empresa-origen` | `POST` | Crea nueva empresa origen. | `ADMIN` |
| `/empresa-origen/:id` | `PUT` | Actualiza empresa origen. | `ADMIN` |
| `/empresa-origen/:id` | `DELETE` | Elimina empresa origen. | `ADMIN` |

---

## 📱 Líneas Nuevas (`LineaNuevaRouter`)
| Endpoint | Método | Descripción | Permisos |
| :--- | :---: | :--- | :--- |
| `/linea-nueva` | `GET` | Lista todas las líneas nuevas. | Autenticado |
| `/linea-nueva/:venta_id` | `GET` | Detalle por ID de venta. | Autenticado |
| `/linea-nueva/estadisticas`| `GET` | Estadísticas de líneas nuevas. | Autenticado |
| `/linea-nueva` | `POST` | Crea registro de línea nueva. | Autenticado |
| `/linea-nueva/:venta_id` | `PUT` | Actualiza línea nueva. | `ADMIN` |

---

## 📲 Portabilidad (`PortabilidadRouter`)
| Endpoint | Método | Descripción | Permisos |
| :--- | :---: | :--- | :--- |
| `/portabilidad` | `GET` | Lista todas las portabilidades. | Autenticado |
| `/portabilidad/:venta_id` | `GET` | Detalle por ID de venta. | Autenticado |
| `/portabilidad/estadisticas`| `GET` | Estadísticas de portabilidad. | Autenticado |
| `/portabilidad` | `POST` | Crea registro de portabilidad. | Autenticado |

---

## 🎁 Promociones (`PromocionRouter`)
| Endpoint | Método | Descripción | Permisos |
| :--- | :---: | :--- | :--- |
| `/promociones` | `GET` | Lista todas las promociones. | Autenticado |
| `/promociones/empresa/:empresa`| `GET` | Lista promos por empresa. | Autenticado |
| `/promociones/:id` | `GET` | Detalle por ID. | Autenticado |
| `/promociones` | `POST` | Crea nueva promoción. | `ADMIN` |

---

## ✉️ Mensajería y Alertas (`MensajeRouter`)
| Endpoint | Método | Descripción | Permisos |
| :--- | :---: | :--- | :--- |
| `/mensajes/inbox` | `GET` | Inbox del usuario actual. | Autenticado |
| `/mensajes/no-leidos` | `GET` | Cuenta mensajes pendientes. | Autenticado |
| `/mensajes/alertas-pendientes`| `GET` | Lista alertas sin resolver. | `SUPERVISOR+` |
| `/mensajes/referencia/:id` | `GET` | Alertas vinculadas a una venta. | Autenticado |
| `/mensajes` | `POST` | Envía notificación o alerta. | Autenticado |
| `/mensajes/:id/leido` | `PATCH` | Marca mensaje como LEÍDO. | Autenticado |
| `/mensajes/:id/resolver` | `PATCH` | Marca alerta como RESUELTA. | `SUPERVISOR+` |

---

## 🔄 Procesos Masivos (`ActulizarRouter`)
| Endpoint | Método | Descripción | Permisos |
| :--- | :---: | :--- | :--- |
| `/actualizar/correo` | `POST` | Carga masiva tracking correo (CSV). | `MANAGEMENT` |
| `/actualizar/estado-venta`| `POST` | Carga masiva estados de venta (CSV). | `MANAGEMENT` |
| `/actualizar/seguimiento-linea`| `POST` | Carga masiva seguimiento (CSV). | `MANAGEMENT` |

---

> [!IMPORTANT]
> Todos los endpoints protegidos requieren un encabezado `Authorization: Bearer <token>`. 
> Los roles permitidos siguen la jerarquía: `VENDEDOR` < `SUPERVISOR` < `ADMIN` < `SUPERADMIN`.
