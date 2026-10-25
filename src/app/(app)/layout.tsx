import { AppShell } from "~/features/shell";

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <>
      <AppShell />
      {children}
    </>
  );
}
