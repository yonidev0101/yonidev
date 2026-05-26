import MobileChrome from "@/components/admin/MobileChrome";
import AdminToaster from "@/components/admin/AdminToaster";

export default function AdminAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MobileChrome>{children}</MobileChrome>
      <AdminToaster />
    </>
  );
}
