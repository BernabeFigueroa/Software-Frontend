import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import Input from '../../shared/components/Input';
import Button from '../../shared/components/Button';
import useAuth from '../hook/useAuth';
import { handleApiError } from '../../shared/helpers/errorMessages';

function LoginForm() {
  const [errorMessage, setErrorMessage] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { username: '', password: '' } });

  const navigate = useNavigate();

  const { singin, role: userRole } = useAuth();

  const onValid = async (formData) => {
    try {
      const { error } = await singin(formData.username, formData.password);

      if (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error al iniciar sesión',
          text: error,
          confirmButtonColor: '#3085d6',
        });
        return;
      }

      Swal.fire({
        icon: 'success',
        title: '¡Bienvenido!',
        text: 'Inicio de sesión exitoso',
        timer: 1500,
        showConfirmButton: false,
      });

      setTimeout(() => {
        // Obtener el rol del localStorage después del login
        const role = localStorage.getItem('role');
        
        // Redirigir según el rol
        if (role === 'Administrador') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }, 1500);
    } catch (error) {
      const message = handleApiError(error);
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        confirmButtonColor: '#3085d6',
      });
    }
  };

  return (
    <form className='
        flex
        flex-col
        gap-20
        bg-white
        p-8
        sm:w-md
        sm:gap-4
        sm:rounded-lg
        sm:shadow-lg
      '
    onSubmit={handleSubmit(onValid)}
    >
      <Input
        label='Usuario'
        { ...register('username', {
          required: 'Usuario es obligatorio',
        }) }
        error={errors.username?.message}
      />
      <Input
        label='Contraseña'
        { ...register('password', {
          required: 'Contraseña es obligatorio',
        }) }
        type='password'
        error={errors.password?.message}
      />

      <Button type='submit'>Iniciar Sesión</Button>
      
      <div className='flex flex-col gap-2 items-center'>
        <p className='text-gray-600 text-sm'>¿No tienes cuenta?</p>
        <Link to='/signup' className='w-full'>
          <Button type='button' className='w-full bg-green-500 hover:bg-green-600'>
            Registrarse
          </Button>
        </Link>
      </div>
    </form>
  );
};

export default LoginForm;
