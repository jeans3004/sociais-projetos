import { ReactNode } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type HelpCenterFaqItem = {
  id: string;
  question: string;
  answer: ReactNode;
};

type HelpCenterFaqAccordionProps = {
  items: HelpCenterFaqItem[];
};

export function HelpCenterFaqAccordion({ items }: HelpCenterFaqAccordionProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      {items.map((item) => (
        <AccordionItem key={item.id} value={item.id}>
          <AccordionTrigger className="text-left text-base font-semibold">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
