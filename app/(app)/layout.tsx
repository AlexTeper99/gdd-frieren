export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // TODO: Add auth check — redirect to /login if no session
  // TODO: Redirect to /onboarding if onboardingDone is false
  return <>{children}</>
}
