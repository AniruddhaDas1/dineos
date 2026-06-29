// Temporary boot screen. Replaced by the full WelcomePage in Task 10.
export function SplashPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <p className="font-serif text-4xl text-accent">DineFlow</p>
      <p className="mt-2 text-sm text-muted">Saffron &amp; Smoke</p>
      <p className="mt-8 max-w-xs text-xs text-muted">
        Scaffolding complete. The full ordering experience is built in the next tasks.
      </p>
    </div>
  );
}
