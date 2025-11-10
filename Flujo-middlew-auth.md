## 🧩 Middleware de Autenticación y Autorización

## 🔍 1. Qué hace este middleware

Este archivo exporta tres middlewares principales:

authenticate → valida el token JWT y agrega los datos del usuario al req.

isPasante → autoriza solo a pasantes.

isEmpresa → autoriza solo a empresas.

El middleware authenticate se ejecuta antes de llegar al controlador, es decir, intercepta la petición para comprobar que el usuario esté autenticado.

## ⚙️ Paso a paso de authenticate

```javascript
export const authenticate = async (req, res, next) => {
    try {
        // 1️⃣ Obtiene el token de las cookies
        const token = req.cookies.token;
```

👉 El token JWT se guarda en una cookie (llamada token) cuando el usuario inicia sesión correctamente.
Cada vez que el frontend hace una petición al backend (por ejemplo, /api/pasante/me), el navegador envía automáticamente la cookie junto con la request.

## // 2️⃣ Si no hay token, no está autenticado

```javascript
if (!token) {
    return res.status(401).json({ 
        error: 'No autenticado. Token no proporcionado' 
    });
}
```

👉 Si el usuario no tiene cookie o está vacía, se corta la petición y se responde con un 401 (no autenticado).

## // 3️⃣ Verifica que el token sea válido

```javascript
const decoded = verifyToken(token);
```

👉 verifyToken es una función que decodifica el JWT y confirma que no haya sido modificado ni esté vencido.
El JWT contiene datos “encriptados” (firmados), por ejemplo:

{
  "id": "6567abc123...",
  "userType": "pasante",
  "iat": 1730732963,
  "exp": 1730736563
}


Esto se obtiene gracias a la función jwt.verify() (de la librería jsonwebtoken), que valida el token usando una clave secreta (process.env.JWT_SECRET).

```javascript
if (!decoded) {
    return res.status(401).json({ 
        error: 'Token inválido o expirado' 
    });
}
```

👉 Si el token no es válido o está vencido, se corta el proceso.

## // 4️⃣ Verifica que el usuario realmente exista en la base

```javascript
const user = await User.findById(decoded.id);

if (!user || !user.isActive) {
    return res.status(401).json({ 
        error: 'Usuario no encontrado o inactivo' 
    });
}
```

👉 Esto evita que un usuario borrado o desactivado use un token viejo para entrar.
Se busca el usuario en la base de datos con el id que venía dentro del token.

## // 5️⃣ Agregar información del usuario al request

```javascript
req.user = {
    id: decoded.id,
    userType: decoded.userType
};
```

👉 Este paso es clave:

Se crea una nueva propiedad llamada user dentro del objeto req (que representa la petición HTTP).
De esta manera, los controladores pueden saber quién hizo la petición, sin tener que volver a verificar el token.

Por ejemplo, si en un controlador hacés esto:

const empresa = await Empresa.findOne({ userId: req.user.id });


Significa:

“Buscá la empresa cuyo campo userId coincida con el usuario que hizo esta petición.”

✅ Así el backend sabe qué registro pertenece a qué usuario logueado.
✅ Evita que alguien actualice o vea los datos de otro usuario.

## // 6️⃣ Si todo va bien, pasa al siguiente middleware o controlador

```javascript
next();
```

👉 next() permite que el flujo continúe al siguiente paso (por ejemplo, al controlador que maneja la ruta /api/empresa/me).

👥 Middlewares de rol: isPasante y isEmpresa

Estos middlewares limitan el acceso por tipo de usuario, aprovechando el userType que guardamos en el JWT y que agregamos a req.user.

```javascript
export const isPasante = (req, res, next) => {
    if (req.user.userType !== 'pasante') {
        return res.status(403).json({ 
            error: 'Acceso denegado. Solo para pasantes' 
        });
    }
    next();
};
```

👉 Si el usuario autenticado no tiene userType: "pasante", se deniega el acceso con un 403 (prohibido).
Por ejemplo, si una empresa intenta acceder a una ruta exclusiva para pasantes.

## 🔄 Flujo completo de autenticación y autorización

## 🧾 1. Inicio de sesión

El usuario ingresa con email y contraseña.

El backend valida y genera un JWT con sus datos básicos:

```javascript
const token = jwt.sign(
  { id: user._id, userType: user.role }, // payload
  process.env.JWT_SECRET,               // clave secreta
  { expiresIn: '2h' }                   // duración
);
```

Ese token se guarda en una cookie:

```javascript
res.cookie('token', token, { httpOnly: true });
```

## 📡 2. Petición autenticada

El frontend hace una petición (por ejemplo, /api/pasante/me).

El navegador envía automáticamente la cookie con el token.

El middleware authenticate:

Extrae el token de la cookie.

Lo verifica con verifyToken().

Si es válido, agrega los datos decodificados a req.user.

## ⚙️ 3. Controlador

El controlador ya puede acceder a req.user.id para saber quién hizo la petición, por ejemplo:

```javascript
const perfil = await Pasante.findOne({ userId: req.user.id });
```

✅ Solo devuelve la información del usuario logueado.
✅ No necesita volver a leer o decodificar el token.

## 🔐 4. Middlewares de rol

Si la ruta requiere un tipo específico de usuario:

```javascript
router.get('/empresa/me', authenticate, isEmpresa, EmpresaController.getPerfil);
```

authenticate verifica que esté logueado.
isEmpresa asegura que el rol sea empresa.

## 🧠 En resumen

| Concepto              | Qué hace                                                       | Ejemplo                                    |
| --------------------- | -------------------------------------------------------------- | ------------------------------------------ |
| **JWT**               | Guarda la identidad y rol del usuario de forma segura          | `{ id: "abc123", userType: "pasante" }`    |
| **req.user**          | Se agrega dinámicamente al request después de validar el token | `req.user.id`                              |
| **req.user.id**       | Identifica al usuario logueado en la BD                        | `findOne({ userId: req.user.id })`         |
| **req.user.userType** | Permite saber si es pasante o empresa                          | `if (req.user.userType === 'empresa') ...` |
