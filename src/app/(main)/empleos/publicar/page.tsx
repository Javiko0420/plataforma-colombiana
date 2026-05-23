import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import JobForm from "@/components/jobs/JobForm";
import { LtPageShell, LtPanel } from "@/components/lt";

export default async function PublicarEmpleoPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/signin?callbackUrl=/empleos/publicar");
  }

  return (
    <LtPageShell maxWidth="2xl">
      <div className="text-center mb-8 space-y-2">
        <h1
          className="text-3xl md:text-4xl font-extrabold tracking-tight"
          style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
        >
          Publica una{' '}
          <span style={{ color: 'var(--lt-terracota)' }}>oportunidad</span>
        </h1>
        <p
          className="text-lg"
          style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}
        >
          Comparte vacantes con la comunidad latina. Ayuda a otros a crecer profesionalmente en Australia.
        </p>
      </div>

      <LtPanel className="p-6 md:p-8">
        <JobForm />
      </LtPanel>
    </LtPageShell>
  );
}
