'use client';

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { FilterIcon } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { Button, buttonVariants } from "@/components/ui/button"
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import CsvDownloader from 'react-csv-downloader';

type Frame = {
  score: number
  id: number
  video: string
  scene: number
  frame: number
}

const columns: ColumnDef<Frame>[] = [
  { accessorKey: "video", header: "Video", },
  { accessorKey: "scene", header: "Scene", },
  { accessorKey: "frame", header: "Frame", },
]

export default function Home() {
  const [K, setK] = useState<number>(10)
  const [query, setQuery] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false);
  const [answers, setAnswers] = useState<Frame[]>([])
  const BACKEND_URL = new URL("http://localhost:8000")
  const fetchData = async (query: string, k: number) => {
    try {
      setLoading(true);
      const response = await fetch(new URL(`search?query=${query}&k=${k}`, BACKEND_URL));
      if (!response.ok) throw new Error('Failed to fetch data');

      const data = await response.json();
      setAnswers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
            Video Wavelet V1
          </h1>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <InputGroup>
              <InputGroupInput placeholder="Search..." onKeyDown={(e) => {
                if (e.key === "Enter") {
                  fetchData(e.currentTarget.value, K);
                }
                setQuery(e.currentTarget.value)
              }} />
              <InputGroupAddon align="inline-end">
                {loading ? <Spinner /> : <Popover>
                  <PopoverTrigger asChild>
                    <InputGroupButton
                      aria-label="Filter"
                      title="Filter"
                      size="icon-xs">
                      <FilterIcon />
                    </InputGroupButton>
                  </PopoverTrigger>
                  <PopoverContent>
                    <PopoverHeader>
                      <PopoverTitle>Top K</PopoverTitle>
                      <PopoverDescription>10, 20, 50, 100.</PopoverDescription>
                    </PopoverHeader>
                    <RadioGroup
                      defaultValue={String(K)}
                      onValueChange={(value) => setK(Number(value))}
                    >
                      {[10, 20, 50, 100].map((e) => (
                        <div key={e} className="flex items-center gap-3">
                          <RadioGroupItem value={String(e)} id={String(e)} />
                          <Label htmlFor={String(e)}>{e}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </PopoverContent>
                </Popover>
                }
              </InputGroupAddon>
            </InputGroup>
          </SidebarGroup>
          <SidebarGroup>
            <Button variant="outline" onClick={() => fetchData(query, K)}>Search</Button>
          </SidebarGroup>
          <SidebarGroup>
            <DataTable columns={columns} data={answers} />
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <CsvDownloader
            filename="answer.csv"
            datas={answers.map((item) => ({
              video_id: item.video,
              frame_id: item.frame,
            }))}
            text="Export"
            className={buttonVariants()}
          />
        </SidebarFooter>
      </Sidebar>
      <SidebarTrigger />
      <div className="grid grid-cols-5">
        {
          answers.map(data => {
            return (
              <HoverCard key={`${data.video} Scene ${data.scene} Frame ${data.frame}`}>
                <HoverCardTrigger>
                  <img
                    src={new URL(`frame?video=${data.video}&scene=${data.scene}`, BACKEND_URL).toString()}
                    alt={`${data.video} Scene ${data.scene} Frame ${data.frame}`}
                  />
                </HoverCardTrigger>
                <HoverCardContent>
                  <div className="font-semibold">Score: {data.score}</div>
                  <div>Video: {data.video}</div>
                  <div>Scene: {data.scene}</div>
                  <div>Frame: {data.frame}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    "insert subtitles later"
                  </div>
                </HoverCardContent>

              </HoverCard>
            )
          })
        }
      </div>
    </SidebarProvider>
  )
}