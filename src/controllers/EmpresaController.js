// Importamos los modelos que usaremos para acceder a la base de datos
import Empresa from '../model/Empresa.js';
import User from '../model/User.js';

// Clase que agrupa todas las acciones relacionadas con el perfil y gestión de empresas
export class EmpresaController {

    // =====================================
    // 🔹 Obtener perfil de la empresa autenticada
    // =====================================
    static getMyProfile = async (req, res) => {
        try {
            // Buscamos la empresa asociada al usuario logueado (req.user.id viene del middleware JWT)
            const empresa = await Empresa.findOne({ userId: req.user.id });

            // Si no existe, devolvemos un error
            if (!empresa) {
                return res.status(404).json({ 
                    error: 'Perfil de empresa no encontrado' 
                });
            }

            // Si existe, devolvemos la información de la empresa
            return res.status(200).json({ empresa });
        } catch (error) {
            // Manejamos cualquier error interno del servidor
            return res.status(500).json({ 
                error: 'Error al obtener perfil',
                details: error.message 
            });
        }
    };

    // =====================================
    // 🔹 Actualizar perfil de la empresa autenticada
    // =====================================
    static updateMyProfile = async (req, res) => {
        try {
            // Definimos los campos que pueden actualizarse (para seguridad y control)
            const allowedUpdates = [
                'nombre',
                'razonSocial',
                'sector',
                'descripcion',
                'sitioWeb',
                'provincia',
                'localidad',
                'calle',
                'numero',
                'codigoPostal',
                'telefono',
                'modalidadTrabajo',
                'cantidadEmpleados',
                'logo'
            ];

            // Filtramos el cuerpo del request para incluir solo los campos permitidos
            const updates = {};
            Object.keys(req.body).forEach(key => {
                if (allowedUpdates.includes(key)) {
                    updates[key] = req.body[key];
                }
            });

            // Buscamos la empresa asociada al usuario y actualizamos los datos
            const empresa = await Empresa.findOneAndUpdate(
                { userId: req.user.id },
                updates,
                { new: true, runValidators: true } // Devuelve la empresa actualizada y valida los tipos de datos
            );

            // Si no se encuentra la empresa, devolvemos error
            if (!empresa) {
                return res.status(404).json({ 
                    error: 'Perfil de empresa no encontrado' 
                });
            }

            // Devolvemos mensaje de éxito y la empresa actualizada
            return res.status(200).json({
                message: 'Perfil actualizado exitosamente',
                empresa
            });
        } catch (error) {
            return res.status(500).json({ 
                error: 'Error al actualizar perfil',
                details: error.message 
            });
        }
    };

    // =====================================
    // 🔹 Obtener todas las empresas (público)
    // =====================================
    static getAllEmpresas = async (req, res) => {
        try {
            // Extraemos filtros y paginación desde los parámetros de la URL
            const { 
                page = 1, 
                limit = 10, 
                provincia, 
                sector,
                cantidadEmpleados
            } = req.query;

            // Creamos un objeto para construir la consulta dinámica
            const query = {};
            
            // Agregamos filtros si existen
            if (provincia) query.provincia = provincia;
            if (sector) query.sector = new RegExp(sector, 'i'); // Búsqueda parcial y no sensible a mayúsculas
            if (cantidadEmpleados) query.cantidadEmpleados = cantidadEmpleados;

            // Consultamos las empresas aplicando filtros, paginación y orden
            const empresas = await Empresa.find(query)
                .select('-userId -cuit') // Excluimos campos sensibles
                .limit(limit * 1) // Convertimos a número
                .skip((page - 1) * limit) // Saltamos los registros previos según la página actual
                .sort({ createdAt: -1 }); // Mostramos las más recientes primero

            // Obtenemos el total de empresas que cumplen los filtros
            const count = await Empresa.countDocuments(query);

            // Respondemos con los resultados y la información de paginación
            return res.status(200).json({
                empresas,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                total: count
            });
        } catch (error) {
            return res.status(500).json({ 
                error: 'Error al obtener empresas',
                details: error.message 
            });
        }
    };

    // =====================================
    // 🔹 Obtener una empresa por ID (público)
    // =====================================
    static getEmpresaById = async (req, res) => {
        try {
            // Extraemos el id desde los parámetros de la URL
            const { id } = req.params;

            // Buscamos la empresa por su _id
            const empresa = await Empresa.findById(id).select('-userId -cuit');

            // Si no existe, devolvemos error
            if (!empresa) {
                return res.status(404).json({ 
                    error: 'Empresa no encontrada' 
                });
            }

            // Devolvemos la empresa encontrada
            return res.status(200).json({ empresa });
        } catch (error) {
            return res.status(500).json({ 
                error: 'Error al obtener empresa',
                details: error.message 
            });
        }
    };

    // =====================================
    // 🔹 Eliminar cuenta de empresa
    // =====================================
    static deleteMyAccount = async (req, res) => {
        try {
            // 1️⃣ Eliminamos el documento del perfil de empresa asociado al usuario
            await Empresa.findOneAndDelete({ userId: req.user.id });

            // 2️⃣ Desactivamos el usuario base (en lugar de eliminarlo completamente)
            await User.findByIdAndUpdate(req.user.id, { isActive: false });

            // 3️⃣ Limpiamos la cookie del token para cerrar la sesión
            res.clearCookie('token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });

            // 4️⃣ Respondemos confirmando que se eliminó la cuenta
            return res.status(200).json({
                message: 'Cuenta eliminada exitosamente'
            });
        } catch (error) {
            return res.status(500).json({ 
                error: 'Error al eliminar cuenta',
                details: error.message 
            });
        }
    };
}
