"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import type { ActivityItem } from "@/features/dashboard/types";
import {
  UserPlus,
  UserCheck,
  CheckCircle2,
  FileText,
  RotateCcw,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

const activityIcons: Record<string, React.ReactNode> = {
  lead_created: <UserPlus className="h-4 w-4 text-blue-500" />,
  lead_updated: <FileText className="h-4 w-4 text-yellow-500" />,
  lead_deleted: <AlertCircle className="h-4 w-4 text-red-500" />,
  lead_converted: <UserCheck className="h-4 w-4 text-green-500" />,
  customer_created: <UserPlus className="h-4 w-4 text-purple-500" />,
  customer_updated: <FileText className="h-4 w-4 text-yellow-500" />,
  deal_created: <TrendingUp className="h-4 w-4 text-indigo-500" />,
  deal_updated: <RotateCcw className="h-4 w-4 text-orange-500" />,
  task_created: <FileText className="h-4 w-4 text-slate-500" />,
  task_completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  status_change: <RotateCcw className="h-4 w-4 text-blue-500" />,
  note: <FileText className="h-4 w-4 text-gray-500" />,
};

interface ActivityFeedProps {
  activities: ActivityItem[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No recent activity
              </p>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="flex gap-3">
                  <div className="mt-0.5 shrink-0">
                    {activityIcons[activity.type] || (
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm leading-snug">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{activity.actor?.name || "System"}</span>
                      <span>·</span>
                      <span>
                        {format(new Date(activity.createdAt), "MMM d, h:mm a")}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
