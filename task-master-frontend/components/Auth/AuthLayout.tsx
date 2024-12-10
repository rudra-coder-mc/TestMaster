import { AuthLayoutProps } from "@/types/auth.type";
import { StyledCard, AuthContainer, Title } from "../styles";

export default function AuthLayout({ children, title }: AuthLayoutProps) {
  return (
    <AuthContainer>
      <StyledCard>
        <Title>{title}</Title>
        {children}
      </StyledCard>
    </AuthContainer>
  );
}
