"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/shadcn/components/ui/card";
import SelectSection from "../../../components/select-section";
import { Button } from "@/shadcn/components/ui/button";
import { Loader2, Zap } from "lucide-react";
import Image from "next/image";

export default function AutoClassSchedulingClient() {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [generateKey, setGenerateKey] = useState(false);
  const [showImage, setShowImage] = useState(false);

  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  useEffect(() => {
    if (generateKey) {
      setShowImage(false);

      const timer = setTimeout(() => {
        setGenerateKey(false);
        setShowImage(true);
      }, 3000);

      return () => clearTimeout(timer); // Clean up
    }
  }, [generateKey]);

  const triggerGenerate = () => {
    setGenerateKey(true);
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
                      <p className="text-muted-foreground">
                        Selected Days:
                      </p>
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
            {showImage ? (
              <Image
                src="/images/mock_image_1.jpg"
                alt="Generated Schedule"
                width={1000}
                height={1000}
              />
            ) : generateKey ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Generating schedule, please wait...
                </span>
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
