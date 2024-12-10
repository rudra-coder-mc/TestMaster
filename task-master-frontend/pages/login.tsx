import Link from "next/link";
import AuthLayout from "../components/Auth/AuthLayout";
import LoginForm from "../components/Auth/LoginForm";
import { FormLink, SignUpText } from "../components/styles";

const Login = () => {
  return (
    <AuthLayout title="Sign in to TastMaster">
      <SignUpText>
        Don&apos;t have an account?{" "}
        <Link href="/signup" passHref legacyBehavior>
          <FormLink>Sign up</FormLink>
        </Link>
      </SignUpText>
      <div className="space-y-6 ">
        <LoginForm />
      </div>
    </AuthLayout>
  );
};

export default Login;
