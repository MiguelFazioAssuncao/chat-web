import BackgroundBlue from "../../components/auth/BackgroundBlue";
import RegisterForm from "../../components/auth/RegisterForm";

const Register = () => {
  return (
    <div className="flex min-h-screen w-full">
      <RegisterForm />
      <BackgroundBlue />
    </div>
  );
};

export default Register;
