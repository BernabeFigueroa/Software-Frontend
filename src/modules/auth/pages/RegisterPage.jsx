import RegisterForm from '../components/RegisterForm';

function RegisterPage() {
  return (
    <div className='
      flex
      flex-col
      justify-center
      min-h-screen
      bg-gradient-to-br
      from-blue-500
      to-purple-600
      items-center
      p-4
    '>
      <RegisterForm />
    </div>
  );
}

export default RegisterPage;
