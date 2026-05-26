interface PlaceholderPageProps {
  title: string
}

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-6 text-text-primary">
      <section className="w-full max-w-md rounded-card border border-border bg-surface p-6">
        <p className="text-sm text-text-secondary">Meme Platform</p>
        <h1 className="mt-2 text-2xl font-semibold">{title}</h1>
        <p className="mt-3 text-sm text-text-secondary">
          Foundation scaffold is running.
        </p>
      </section>
    </main>
  )
}
