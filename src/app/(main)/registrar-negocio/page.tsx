import BusinessForm from "@/components/forms/business-form";

export default function RegisterBusinessPage() {
  return (
    <div style={{ background: 'var(--lh-bg)', minHeight: '100vh', fontFamily: 'var(--lh-font)' }}>
      <div className="lh-container" style={{ maxWidth: 880, paddingTop: 40, paddingBottom: 64 }}>
        <BusinessForm />
      </div>
    </div>
  );
}
