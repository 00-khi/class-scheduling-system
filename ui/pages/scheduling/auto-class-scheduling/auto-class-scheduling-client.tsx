"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/shadcn/components/ui/card";
import SelectSection from "../../../components/select-section";
import { Button } from "@/shadcn/components/ui/button";
import { Zap } from "lucide-react";
import { Progress } from "@/shadcn/components/ui/progress";

export default function AutoClassSchedulingClient() {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [generateKey, setGenerateKey] = useState(false);
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!generateKey) return;

    let progress = 0;
    setValue(0);

    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      setValue(progress);
    }, 300);

    return () => clearInterval(interval);
  }, [generateKey]);

  useEffect(() => {
    if (!generateKey) return;

    const timer = setTimeout(() => {
      setGenerateKey(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [generateKey]);

  const triggerGenerate = () => {
    setGenerateKey(true);
    setValue(0);
  };

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-card-foreground">Select Section</CardTitle>
        </CardHeader>
        <CardContent>
          <SelectSection onSectionChange={setSelectedSection} />
        </CardContent>
      </Card>

      <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-card-foreground">
              Section Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[70vh] max-h-[70vh] overflow-y-auto py-4 border-y">
            <div className="space-y-4">
              <Card className="bg-secondary border-0 shadow-none">
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-muted-foreground">Section:</p>
                      <p>{selectedSection ? `ID: ${selectedSection}` : "--"}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-muted-foreground">
                        Unscheduled Subjects:
                      </p>
                      <p>{selectedSection ? "wala pa inaayos ko pa" : "--"}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-muted-foreground">Selected Days:</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-muted-foreground">
                        Ano pa pwede idagdag?
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Button
                disabled={generateKey || !selectedSection}
                onClick={triggerGenerate}
                className="w-full"
              >
                <Zap
                  className={`-ms-1 opacity-60 ${
                    generateKey && "animate-spin"
                  }`}
                  size={16}
                />
                {generateKey ? "Generating Schedule..." : "Generate Schedule"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-card-foreground">
              Generation Results
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[70vh] max-h-[70vh] overflow-y-auto py-4 border-y">
            {generateKey ? (
              <div className="flex flex-col gap-2 items-center justify-center">
                <span className="text-sm text-muted-foreground">
                  Generating schedule, please wait...
                </span>
                <div className="w-full max-w-sm space-y-2 text-muted-foreground">
                  <Progress value={value} />
                  <p className="text-sm text-center">
                    {value === 100 ? "Almost there..." : `${value}%`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <span className="text-sm text-muted-foreground">
                  Click the button to generate the schedule.
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
