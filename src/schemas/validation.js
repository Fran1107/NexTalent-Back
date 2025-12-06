
import { z } from 'zod';

// Schema para registro de pasante
export const registerPasanteSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
    telefono: z.string().min(8, 'El teléfono es inválido'),
    provincia: z.string().min(2, 'La provincia es requerida'),
    localidad: z.string().min(2, 'La localidad es requerida'),
    fechaNacimiento: z.string().refine(date => !isNaN(Date.parse(date)), 'Fecha inválida'),
    carrera: z.string().min(2, 'La carrera es requerida'),
    linkedinUrl: z.string().url('URL de LinkedIn inválida').optional().or(z.literal('')),
    sobreMi: z.string().max(1000, 'Máximo 1000 caracteres').optional()
});

// Schema para registro de empresa
export const registerEmpresaSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    nombre: z.string().min(2, 'El nombre de la empresa es requerido'),
    cuit: z.string().min(11, 'El CUIT debe tener al menos 11 caracteres'),
    sector: z.string().min(2, 'El sector es requerido'),
    descripcion: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
    sitioWeb: z.string().url('URL del sitio web inválida').optional().or(z.literal('')),
    provincia: z.string().min(2, 'La provincia es requerida'),
    calle: z.string().min(2, 'La calle es requerida'),
    numero: z.string().min(1, 'El número es requerido'),
    codigoPostal: z.string().min(4, 'El código postal es inválido'),
    telefono: z.string().min(8, 'El teléfono es inválido')
});

// Schema para login
export const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'La contraseña es requerida'),
    userType: z.enum(['pasante', 'empresa'], {
        errorMap: () => ({ message: 'Tipo de usuario inválido' })
    })
});

// Schema para actualizar pasante
export const updatePasanteSchema = z.object({
    nombre: z.string().min(2).optional(),
    apellido: z.string().min(2).optional(),
    telefono: z.string().min(8).optional(),
    provincia: z.string().min(2).optional(),
    localidad: z.string().min(2).optional(),
    linkedinUrl: z.string().url().optional().or(z.literal('')),
    carrera: z.string().min(2).optional(),
    sobreMi: z.string().max(1000).optional(),
    habilidades: z.array(z.string()).optional(),
    disponibilidad: z.enum(['tiempo_completo', 'medio_tiempo', 'flexible']).optional()
});

// Schema para actualizar empresa
export const updateEmpresaSchema = z.object({
    nombre: z.string().min(2).optional(),
    sector: z.string().min(2).optional(),
    descripcion: z.string().min(10).optional(),
    sitioWeb: z.string().url().optional().or(z.literal('')),
    provincia: z.string().min(2).optional(),
    calle: z.string().min(2).optional(),
    numero: z.string().min(1).optional(),
    codigoPostal: z.string().min(4).optional(),
    telefono: z.string().min(8).optional(),
    cantidadEmpleados: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']).optional()
});

// // Schema para resena segun funcionalidad 5 (SIN EFECTO)


// export const crearResenaSchema = z.object({
//   empresaId: z.string().min(1, "Empresa requerida."),
//   rating: z.number().min(1).max(5),
//   titulo: z.string().max(100).optional(),
//   comentario: z.string().min(5, "El comentario debe tener al menos 5 caracteres.")
// });

// export const actualizarResenaSchema = z.object({
//   rating: z.number().min(1).max(5).optional(),
//   titulo: z.string().max(100).optional(),
//   comentario: z.string().min(5, "El comentario debe tener al menos 5 caracteres.").optional()
// });