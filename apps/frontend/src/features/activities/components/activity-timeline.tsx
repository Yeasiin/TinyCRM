"use client";

import { useActivities } from "@/features/activities/api/use-activities";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import {
  UserPlus,
  UserCheck,
  CheckCircle2,
  FileText,
  RotateCcw,
  TrendingUp,
  AlertCircle,
  StickyNote,
} from "lucide-react";

interface ActivityTimelineProps {
  leadId?: string;
  customerId?: string;
}

const activityIcons: Record<string, { icon: typeof FileText; color: string }> = {
  lead_created: { icon: UserPlus, color: "text-blue-500 bg-blue-100 dark:bg-blue-900" },
  lead_updated: { icon: FileText, color: "text-yellow-500 bg-yellow-100 dark:bg-yellow-900" },
  lead_deleted: { icon: AlertCircle, color: "text-red-500 bg-red-100 dark:bg-red-900" },
  lead_converted: { icon: UserCheck, color: "text-green-500 bg-green-100 dark:bg-green-900" },
  customer_created: { icon: UserPlus, color: "text-purple-500 bg-purple-100 dark:bg-purple-900" },
  customer_updated: { icon: FileText, color: "text-yellow-500 bg-yellow-100 dark:bg-yellow-900" },
  deal_created: { icon: TrendingUp, color: "text-indigo-500 bg-indigo-100 dark:bg-indigo-900" },
  deal_updated: { icon: RotateCcw, color: "text-orange-500 bg-orange-100 dark:bg-orange-900" },
  task_created: { icon: FileText, color: "text-slate-500 bg-slate-100 dark:bg-slate-900" },
  task_completed: { icon: CheckCircle2, color: "text-green-500 bg-green-100 dark:bg-green-900" },
  status_change: { icon: RotateCcw, color: "text-blue-500 bg-blue-100 dark:bg-blue-900" },
  note: { icon: StickyNote, color: "text-gray-500 bg-gray-100 dark:bg-gray-900" },
};

export function ActivityTimeline({ leadId, customerId }: ActivityTimelineProps) {
  const { data, isLoading } = useActivities({ leadId, customerId });

  return (
    <ScrollArea className="h-[400px]">
      <div className="relative pl-6 space-y-6">
        {/* Vertical line */}
        <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />

        {isLoading ? (
          <div className="text-sm text-muted-foreground text-center py-8">
            Loading activity...
          </div>
        ) : data?.data.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-8">
            No activity yet
          </div>
        ) : (
          data?.data.map((activity) => {
            const config = activityIcons[activity.type] || {
              icon: FileText,
              color: "text-muted-foreground bg-muted",
            };
            const Icon = config.icon;

            return (
              <div key={activity.id} className="relative flex gap-3">
                {/* Timeline dot */}
                <div
                  className={`absolute -left-6 top-0.5 flex h-8 w-8 items-center justify-center rounded-full ${config.color}`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <div className="flex-1 space-y-1">
                  <p className="text-sm leading-snug">{activity.description}</p>
                  {activity.metadata && (
                    <div className="text-xs text-muted-foreground bg-muted rounded px-2 py-1 inline-block">
                      {JSON.stringify(activity.metadata)}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{activity.actor?.name || "System"}</span>
                    <span>·</span>
                    <span>
                      {format(new Date(activity.createdAt), "MMM d, h:mm a")}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </ScrollArea>
  );
}
