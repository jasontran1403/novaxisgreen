import Logo from '../assets/Logo.png';

function AuthHeader({ title, subtitle }) {
  return (
    <div className="text-center">
      <div className="flex justify-center mb-4">
        <img src={Logo} alt="Logo" className="h-16 w-auto" />
      </div>
      <h2 className="text-3xl font-bold text-white dark:text-gray-100">
        {title}
      </h2>
      <p className="mt-2 text-sm text-gray-400 dark:text-gray-400">
        {subtitle}
      </p>
    </div>
  );
}

export default AuthHeader;

