import { StyledCard, AuthContainer, Title } from "../styles";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthLayout({ children, title }: AuthLayoutProps) {
  return (
    <AuthContainer>
      <StyledCard>
        {/* <LogoContainer> */}
        {/*   <LogoCircle /> */}
        {/*   <LogoText>Saaspage</LogoText> */}
        {/* </LogoContainer> */}
        <Title>{title}</Title>
        {children}
      </StyledCard>
    </AuthContainer>
  );
}
