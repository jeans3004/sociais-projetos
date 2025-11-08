import { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type HelpCenterCalloutProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export function HelpCenterCallout({ title, description, children }: HelpCenterCalloutProps) {
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p>{description}</p>
        {children}
      </CardContent>
    </Card>
  );
}
