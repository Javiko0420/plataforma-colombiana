import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BusinessForm from "@/components/forms/business-form"; // Asegúrate de que la ruta sea correcta

export default async function EditBusinessPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await getServerSession(authOptions);
  const slug = (await params).slug; // Next.js 15 await

  if (!session) {
    redirect("/auth/signin");
  }

  // Buscar el negocio
  const business = await prisma.business.findUnique({
    where: { slug },
  });

  // Validaciones de Seguridad 🛡️
  if (!business) {
    notFound();
  }

  if (business.ownerId !== session.user.id) {
    // Si intentas editar el negocio de otro, te manda a la home
    redirect("/"); 
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Renderizamos el formulario con los datos cargados */}
        <BusinessForm 
          initialData={{
            ...business,
            // Aseguramos que los nulos sean strings vacíos para el form
            city: business.city || "Sydney",     // 👈 Ciudad por defecto
            website: business.website || "",
            instagram: business.instagram || "",
            whatsapp: business.whatsapp || "",
            facebook: business.facebook || "",
            address: business.address || "",
            // Aseguramos que las imágenes sean un array
            images: business.images || [],
          }} 
        />
      </div>
    </div>
  );
}
