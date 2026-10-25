import { AppShell } from "~/features/shell";

// Full-screen surfaces: no site header, but the same sign-in rule.
export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <>
      <AppShell header={false} />
      {children}
    </>
  );
}
