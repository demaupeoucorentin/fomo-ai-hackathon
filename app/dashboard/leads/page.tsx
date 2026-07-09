import { Users } from "lucide-react";
import { Wip } from "../_components/wip";

export default function DashboardLeads() {
  return (
    <Wip
      title="Leads"
      icon={Users}
      note="Table persistante de tous les leads"
      action={{ label: "Lancer une détection", href: "/onboarding" }}
    />
  );
}
