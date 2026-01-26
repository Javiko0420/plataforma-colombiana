import BusinessForm from "@/components/forms/business-form";

export default function RegisterBusinessPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <BusinessForm />
      </div>
    </div>
  );
}
