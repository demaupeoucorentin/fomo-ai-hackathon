import { Users } from "lucide-react";
import { Wip } from "../_components/wip";

export default function DashboardLeads() {
  return (
    <Wip
      title="Leads"
      icon={Users}
      note="Persistent table of all leads"
      action={{ label: "Start detection", href: "/onboarding" }}
    />
  );
}
