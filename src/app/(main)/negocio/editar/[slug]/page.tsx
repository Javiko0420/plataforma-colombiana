import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BusinessForm from "@/components/forms/business-form";

export default async function EditBusinessPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await getServerSession(authOptions);
  const slug = (await params).slug;

  if (!session) {
    redirect("/auth/signin");
  }

  const business = await prisma.business.findUnique({
    where: { slug },
  });

  if (!business) {
    notFound();
  }

  const userRole = session.user.role ?? 'USER'
  const isOwner = business.ownerId === session.user.id
  const isPrivileged = userRole === 'ADMIN' || userRole === 'MODERATOR'

  if (!isOwner && !isPrivileged) {
    redirect("/")
  }

  return (
    <div style={{ background: 'var(--lh-bg)', minHeight: '100vh', fontFamily: 'var(--lh-font)' }}>
      <div className="lh-container" style={{ maxWidth: 880, paddingTop: 40, paddingBottom: 64 }}>
        <BusinessForm
          initialData={{
            ...business,
            city: business.city || "Sydney",
            website: business.website || "",
            instagram: business.instagram || "",
            whatsapp: business.whatsapp || "",
            facebook: business.facebook || "",
            address: business.address || "",
            images: business.images || [],
          }}
        />
      </div>
    </div>
  );
}
