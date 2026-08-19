import { useEffect } from "react";
import { Megaphone } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useMarketingStore } from "@/stores/marketing.store";
import { useOutreachStore } from "@/stores/outreach.store";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { CampaignList } from "./CampaignList";
import { AutomationList } from "./AutomationList";
import { TemplateLibrary } from "./TemplateLibrary";
import { MessageActivity } from "./MessageActivity";
import { VoiceCallPanel } from "./VoiceCallPanel";
import { AppointmentPanel } from "./AppointmentPanel";

export function MarketingPage() {
  const refresh = useMarketingStore((s) => s.refresh);
  const loading = useMarketingStore((s) => s.loading);
  const refreshOutreach = useOutreachStore((s) => s.refresh);
  const outreachLoading = useOutreachStore((s) => s.loading);

  useEffect(() => {
    refresh();
    refreshOutreach();
  }, [refresh, refreshOutreach]);

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15">
          <Megaphone className="h-6 w-6 text-accent" />
        </div>
        <div>
          <h1 className="font-serif text-3xl">Marketing Automations</h1>
          <p className="mt-1 text-sm text-muted">
            Reach customers via WhatsApp, SMS, Email, AI voice calls, and appointment booking.
          </p>
        </div>
      </div>

      {loading || outreachLoading ? (
        <div className="mt-6 space-y-4">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      ) : (
        <Tabs defaultValue="overview" className="mt-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="automations">Automations</TabsTrigger>
            <TabsTrigger value="voice">Voice Calls</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          <TabsContent value="overview"><AnalyticsDashboard /></TabsContent>
          <TabsContent value="campaigns"><CampaignList /></TabsContent>
          <TabsContent value="automations"><AutomationList /></TabsContent>
          <TabsContent value="voice"><VoiceCallPanel /></TabsContent>
          <TabsContent value="appointments"><AppointmentPanel /></TabsContent>
          <TabsContent value="templates"><TemplateLibrary /></TabsContent>
          <TabsContent value="activity"><MessageActivity /></TabsContent>
        </Tabs>
      )}
    </div>
  );
}
