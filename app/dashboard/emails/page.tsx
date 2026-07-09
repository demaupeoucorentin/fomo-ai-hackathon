import { Mail } from "lucide-react";
import { Wip } from "../_components/wip";

export default function DashboardEmails() {
  return (
    <Wip
      title="Emails"
      icon={Mail}
      note="Emails générés, planifiés et envoyés"
      action={{ label: "Lancer une détection", href: "/onboarding" }}
    />
  );
}
