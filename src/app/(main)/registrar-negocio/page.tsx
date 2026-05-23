import BusinessForm from "@/components/forms/business-form";
import { LtPageShell } from "@/components/lt";

export default function RegisterBusinessPage() {
  return (
    <LtPageShell maxWidth="5xl">
      <BusinessForm />
    </LtPageShell>
  );
}
