import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import JobForm from "@/components/jobs/JobForm";

export default async function PublicarEmpleoPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/signin?callbackUrl=/empleos/publicar");
  }

  return (
    <div style={{ background: 'var(--lh-bg)', minHeight: '100vh', fontFamily: 'var(--lh-font)', paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <div className="lh-container" style={{ maxWidth: 760 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 className="lh-h1" style={{ fontSize: 'clamp(30px,4.5vw,42px)' }}>Publica una oportunidad</h1>
          <p style={{ fontSize: 17, color: 'var(--lh-fg2)', margin: '14px auto 0', maxWidth: 520, lineHeight: 1.55 }}>
            Comparte vacantes con la comunidad latina. Ayuda a otros a crecer profesionalmente en Australia.
          </p>
        </div>

        <div className="lh-card" style={{ padding: 'clamp(22px,4vw,32px)' }}>
          <JobForm />
        </div>
      </div>
    </div>
  );
}
