"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import type { FaqItem } from "../articles";

interface HelpAccordionProps {
  items: FaqItem[];
  defaultValue?: string;
}

export function HelpAccordion({ items, defaultValue }: HelpAccordionProps) {
  return (
    <Accordion type="single" collapsible className="w-full" defaultValue={defaultValue}>
      {items.map((item) => (
        <AccordionItem key={item.question} value={item.question}>
          <AccordionTrigger className="text-left text-base font-semibold">
            {item.question}
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export default HelpAccordion;
