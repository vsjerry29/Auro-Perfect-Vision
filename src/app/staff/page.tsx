import { redirect } from "next/navigation";
import { getCurrentStaffSession } from "@/lib/server/auth";

export default async function StaffPage() {
  const session = await getCurrentStaffSession();
  if (!session) {
    redirect("/staff/login");
  }
  if (session.role === "admin") {
    redirect("/admin");
  } else {
    redirect("/therapist");
  }
}
