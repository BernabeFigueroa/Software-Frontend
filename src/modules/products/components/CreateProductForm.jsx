import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Button from '../../shared/components/Button';
import Card from '../../shared/components/Card';
import Input from '../../shared/components/Input';
import { createProduct } from '../services/create';

function CreateProductForm() {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    defaultValues: {
      sku: '',
      cui: '',
      name: '',
      description: '',
      price: 0,
      stock: 0,
      imageUrl: '',
    },
  });

  const navigate = useNavigate();

  const onValid = async (formData) => {
    const { data, error } = await createProduct(formData);

    if (error) {
      // Mensaje más específico si el error contiene información sobre SKU o código duplicado
      const errorTitle = error.toLowerCase().includes('sku') || error.toLowerCase().includes('internalcode') || error.toLowerCase().includes('ya existe')
        ? 'SKU o Código Interno duplicado'
        : 'Error al crear producto';
      
      Swal.fire({
        icon: 'error',
        title: errorTitle,
        text: error,
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    Swal.fire({
      icon: 'success',
      title: 'Producto creado',
      text: 'El producto se ha creado exitosamente',
      timer: 1500,
      showConfirmButton: false,
    });

    setTimeout(() => {
      navigate('/admin/products');
    }, 1500);
  };

  return (
    <Card>
      <form
        className='flex flex-col gap-4 p-8'
        onSubmit={handleSubmit(onValid)}
      >
        <div>
          <Input
            label='SKU'
            error={errors.sku?.message}
            {...register('sku', {
              required: 'SKU es requerido',
              minLength: {
                value: 1,
                message: 'El SKU debe tener al menos 1 carácter',
              },
              validate: (value) => {
                if (!value.trim()) {
                  return 'El SKU no puede estar vacío';
                }
                return true;
              },
            })}
          />
          <p className="text-xs text-gray-500 mt-1">
            ⚠️ El SKU debe ser único en el sistema
          </p>
        </div>
        <div>
          <Input
            label='Código Único'
            error={errors.cui?.message}
            {...register('cui', {
              required: 'Código Único es requerido',
              minLength: {
                value: 1,
                message: 'El código único debe tener al menos 1 carácter',
              },
              validate: (value) => {
                if (!value.trim()) {
                  return 'El código único no puede estar vacío';
                }
                return true;
              },
            })}
          />
          <p className="text-xs text-gray-500 mt-1">
            ⚠️ El código único debe ser único en el sistema
          </p>
        </div>
        <Input
          label='Nombre'
          error={errors.name?.message}
          {...register('name', {
            required: 'Nombre es requerido',
            minLength: {
              value: 3,
              message: 'El nombre debe tener al menos 3 caracteres',
            },
            validate: (value) => {
              if (!value.trim()) {
                return 'El nombre no puede estar vacío';
              }
              return true;
            },
          })}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción
          </label>
          <textarea
            {...register('description', {
              minLength: {
                value: 10,
                message: 'La descripción debe tener al menos 10 caracteres',
              },
              validate: (value) => {
                if (value && !value.trim()) {
                  return 'La descripción no puede estar vacía';
                }
                return true;
              },
            })}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            rows="3"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>
        <Input
          label='Precio'
          type='number'
          step='0.01'
          error={errors.price?.message}
          {...register('price', {
            required: 'Precio es requerido',
            valueAsNumber: true,
            min: {
              value: 0.01,
              message: 'El precio debe ser mayor a 0',
            },
            validate: (value) => {
              if (isNaN(value) || value <= 0) {
                return 'El precio debe ser un número mayor a 0';
              }
              return true;
            },
          })}
        />
        <Input
          label='Stock'
          type='number'
          error={errors.stock?.message}
          {...register('stock', {
            required: 'Stock es requerido',
            valueAsNumber: true,
            min: {
              value: 0,
              message: 'El stock no puede ser negativo',
            },
            validate: (value) => {
              if (isNaN(value) || value < 0) {
                return 'El stock debe ser un número mayor o igual a 0';
              }
              if (!Number.isInteger(value)) {
                return 'El stock debe ser un número entero';
              }
              return true;
            },
          })}
        />
        <Input
          label='URL de Imagen (opcional)'
          type='url'
          error={errors.imageUrl?.message}
          placeholder='https://ejemplo.com/imagen.jpg'
          {...register('imageUrl', {
            validate: (value) => {
              if (value && value.trim()) {
                // Validar que sea una URL válida con http o https
                const urlPattern = /^https?:\/\/.+/i;
                if (!urlPattern.test(value.trim())) {
                  return 'Debe ser una URL válida que comience con http:// o https://';
                }
                if (value.length > 500) {
                  return 'La URL no puede exceder los 500 caracteres';
                }
              }
              return true;
            },
          })}
        />
        <p className="text-xs text-gray-500 -mt-3">
          💡 Puedes usar servicios como Imgur, Picsum o URLs directas a imágenes
        </p>
        <div className='sm:text-end'>
          <Button type='submit' className='w-full sm:w-fit'>Crear Producto</Button>
        </div>
      </form>
    </Card>
  );
};

export default CreateProductForm;
