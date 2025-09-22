import { ReactNode } from "react";

interface CompoundProps {
  children: ReactNode;
}

function MainSectionRoot({ children }: CompoundProps) {
  return <main className="space-y-8">{children}</main>;
}

function Section({ children }: CompoundProps) {
  return <div className="space-y-2">{children}</div>;
}

function Title({ children }: CompoundProps) {
  return <div className="text-base font-medium">{children}</div>;
}

function Content({ children }: CompoundProps) {
  return <div>{children}</div>;
}

export const MainSection = Object.assign(MainSectionRoot, {
  Section,
  Title,
  Content,
});
