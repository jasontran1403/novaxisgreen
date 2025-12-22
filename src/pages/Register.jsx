import AuthHeader from '../components/AuthHeader';
import RegisterForm from '../components/RegisterForm';

function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8">
        <AuthHeader 
          title="Create Account"
          subtitle="Create a new account to get started"
        />
        <RegisterForm />
      </div>
    </div>
  );
}

export default Register;

