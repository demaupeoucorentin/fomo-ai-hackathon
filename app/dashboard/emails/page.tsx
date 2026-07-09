import { Mail } from "lucide-react";
import { Wip } from "../_components/wip";

export default function DashboardEmails() {
  return (
    <Wip
      title="Emails"
      icon={Mail}
      note="Generated, scheduled and sent emails"
      action={{ label: "Start detection", href: "/onboarding" }}
    />
  );
}
