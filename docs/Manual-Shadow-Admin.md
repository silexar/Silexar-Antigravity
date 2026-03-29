# 👻 Manual de Uso - Shadow Admin (God Mode)

> **CLASIFICACIÓN: ULTRA SECRETO**  
> Este documento contiene información crítica de seguridad.

---

## 📋 Índice

1. [¿Qué es Shadow Admin?](#qué-es-shadow-admin)
2. [Cuándo Usar Shadow Admin](#cuándo-usar-shadow-admin)
3. [Requisitos de Acceso](#requisitos-de-acceso)
4. [Proceso de Acceso](#proceso-de-acceso)
5. [Acciones Disponibles](#acciones-disponibles)
6. [Protocolos de Emergencia](#protocolos-de-emergencia)
7. [Configuración Inicial](#configuración-inicial)

---

## ¿Qué es Shadow Admin?

Shadow Admin es un **usuario de emergencia completamente oculto** diseñado para recuperar el control del sistema en caso de que los administradores sean hackeados.

| Característica         | Descripción                                   |
| ---------------------- | --------------------------------------------- |
| **Invisibilidad**      | No aparece en ningún listado de usuarios      |
| **Logs encriptados**   | Las acciones se registran con AES-256-GCM     |
| **Acceso restringido** | Solo desde IPs pre-autorizadas                |
| **Multi-factor**       | Requiere credenciales + código + hardware key |
| **Sesión corta**       | Máximo 15 minutos por sesión                  |

---

## Cuándo Usar Shadow Admin

### ✅ Usar cuando:

- Un administrador ha sido hackeado
- Se detecta acceso no autorizado masivo
- Las credenciales de admin fueron comprometidas
- Se necesita hacer lockdown del sistema

### ❌ NO usar para:

- Tareas administrativas normales
- Revisar datos de usuarios
- Pruebas del sistema

---

## Requisitos de Acceso

### 1. Credenciales Secretas

| Elemento              | Requisito                                        |
| --------------------- | ------------------------------------------------ |
| **Username**          | Mínimo 10 caracteres, conocido solo por el dueño |
| **Password**          | Mínimo 32 caracteres, 5+ símbolos, 5+ números    |
| **Código Emergencia** | Código mensual que cambia el día 1               |

### 2. Hardware Key

- YubiKey 5, FIDO2 compatible
- Backup key en caja fuerte

### 3. IP Autorizada

- Red de oficina principal
- VPN corporativa

---

## Proceso de Acceso

### Paso 1: URL Secreta

```
https://app.silexar.com/__emergency__/godmode/access
```

### Paso 2: Credenciales

1. Identificador Shadow
2. Clave de Acceso (32+ caracteres)
3. Código de Emergencia

### Paso 3: Hardware Key

1. Inserte YubiKey
2. Toque cuando parpadee

### Paso 4: Ejecutar acciones (15 minutos máximo)

---

## Acciones Disponibles

### 🔐 Resetear Contraseña Admin

```
1. Gestión de Usuarios → Buscar admin
2. Reset Password → Generar nueva
3. Comunicar por canal seguro (NO email)
```

### 🚫 Revocar Sesiones

```
1. Seguridad → Revocar Todas
2. Seleccionar usuario o TODOS
3. Confirmar
```

### 🔒 Deshabilitar Usuario

```
1. Gestión → Buscar usuario
2. Deshabilitar → Ingresar razón
```

### 🚨 System Lockdown

```
1. Seguridad → Lockdown
2. Nivel: Parcial o Total
3. Confirmar con hardware key
```

---

## Protocolos de Emergencia

### Protocolo Alpha: Admin Hackeado

1. Acceder como Shadow Admin
2. Revocar sesiones del admin
3. Resetear contraseña
4. Deshabilitar cuenta temporal
5. Contactar admin por teléfono

### Protocolo Bravo: Ataque Masivo

1. Activar Lockdown TOTAL
2. Generar backup emergencia
3. Contactar equipo seguridad

---

## Configuración Inicial

### Variables de Entorno

```env
SHADOW_USERNAME_HASH=<sha256>
SHADOW_PASSWORD_HASH=<sha512>
SHADOW_EMERGENCY_CODE=EMERGENCY_2025_01
SHADOW_ENCRYPTION_KEY=<64-chars>
SHADOW_ALLOWED_IPS=192.168.1.100
```

### Generar Credenciales

```bash
echo -n "mi_username" | sha256sum
echo -n "mi_password_32_chars" | sha512sum
openssl rand -hex 32
```

### Guardar Credenciales

1. Escribir en papel físico
2. Guardar en caja fuerte
3. NO guardar en digital
4. Hacer 2 copias

---

> **Última actualización**: Diciembre 2025
