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
import { Input } from "@/components/ui/input";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

type Frame = {
  score: number
  index: number
  video: string
  scene: number
  frame: number
  subtitles: string
  filtered: boolean
}

const columns: ColumnDef<Frame>[] = [
  { accessorKey: "video", header: "Video", },
  { accessorKey: "scene", header: "Scene", },
  { accessorKey: "frame", header: "Frame", },
]

export default function Home() {
  const [K, setK] = useState<number>(20)
  const [query, setQuery] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false);
  const [answers, setAnswers] = useState<Frame[]>([])
  const [subtitleFilter, setSubtitleFilter] = useState("")

  const [sceneFrames, setSceneFrames] = useState<Frame[]>([])
  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null)

  const [imageFile, setImageFile] = useState<File | null>(null)

  const BACKEND_URL = new URL("http://localhost:8000")
  const RANGE = 2
  const filteredAnswers = answers.filter((a) =>
    a.subtitles.toLowerCase().includes(subtitleFilter.toLowerCase()) && a.filtered == false
  )

  const fetchData = async (query: string, k: number) => {
    try {
      setLoading(true);
      setSelectedFrame(null);

      const response = await fetch(new URL(`search_text?query=${query}&k=${k}`, BACKEND_URL));
      if (!response.ok) throw new Error('Failed to fetch data');

      const data = await response.json();
      setAnswers(
        data.map((e: any) => ({
          score: e.score,
          index: e.index,
          video: e.video,
          scene: e.scene,
          frame: e.frame,
          subtitles: e.subtitles ?? "",
          filtered: false,
        }))
      )

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDataImageUpload = async (
    file: File | null,
    k: number
  ) => {
    try {
      setLoading(true)
      setSelectedFrame(null)

      if (!file) throw new Error("No file found")
      const formData = new FormData()
      formData.append("image", file)

      const response = await fetch(
        new URL(`search_image?k=${k}`, BACKEND_URL),
        {
          method: "POST",
          body: formData,
        }
      )

      if (!response.ok)
        throw new Error("Failed to fetch data")

      const data = await response.json()

      setAnswers(
        data.map((e: any) => ({
          ...e,
          filtered: false,
        }))
      )
    } finally {
      setLoading(false)
    }
  }

  const fetchRangeData = async (selectedFrame: Frame | null) => {
    try {
      setLoading(true);

      if (!selectedFrame) throw new Error('No frame selected');
      const response = await fetch(new URL(`scene_range?video=${selectedFrame.video}&scene=${selectedFrame.scene}&range=${RANGE}`, BACKEND_URL));
      if (!response.ok) throw new Error('Failed to fetch data');

      const data = await response.json();
      setSceneFrames(
        data.map((e: any) => ({
          score: e.score,
          index: e.index,
          video: e.video,
          scene: e.scene,
          frame: e.frame,
          subtitles: e.subtitles ?? "",
          filtered: false,
        }))
      )

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

            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  setImageFile(file)
                }
              }}
            />

            {imageFile && (
              <img
                src={URL.createObjectURL(imageFile)}
                className="mt-2 rounded border max-h-32 object-contain"
                alt="preview"
              />
            )}

            <Button
              disabled={!imageFile}
              onClick={() => fetchDataImageUpload(imageFile, K)}
            >
              Search Image
            </Button>
          </SidebarGroup>
          <SidebarGroup>
            <Input
              placeholder="Subtitles Filter..."
              value={subtitleFilter}
              onChange={(e) => setSubtitleFilter(e.target.value)}
            />
          </SidebarGroup>
          <SidebarGroup>
            <div className="flex gap-2">
              <Drawer>
                <DrawerTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={!selectedFrame}
                    className="flex-auto"
                    onClick={() => fetchRangeData(selectedFrame)}
                  >Range View</Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle> Range View </DrawerTitle>
                    <DrawerDescription>
                      From Video {selectedFrame?.video} Scene {sceneFrames[0]?.scene} to Scene {sceneFrames[sceneFrames.length - 1]?.scene}
                    </DrawerDescription>
                  </DrawerHeader>

                  <div className={`grid grid-cols-${RANGE * 2 + 1} h-fit`}>
                    {
                      sceneFrames.map(data => {
                        return (
                          <HoverCard key={`${data.video} Scene ${data.scene} Frame ${data.frame}`}>
                            <HoverCardTrigger>
                              <img
                                src={new URL(`frame?video=${data.video}&scene=${data.scene}`, BACKEND_URL).toString()}
                                alt={`${data.video} Scene ${data.scene} Frame ${data.frame}`}
                                className={data == selectedFrame ? 'border-10' : ''}
                              />
                            </HoverCardTrigger>
                            <HoverCardContent>
                              <div className="font-semibold">Score: {data.score}</div>
                              <div>Video: {data.video}</div>
                              <div>Scene: {data.scene}</div>
                              <div>Frame: {data.frame}</div>
                              <div className="mt-1 text-xs text-muted-foreground">
                                {data.subtitles}
                              </div>
                            </HoverCardContent>

                          </HoverCard>
                        )
                      })
                    }
                  </div>
                  <DrawerFooter>
                    <DrawerClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </DrawerContent>

              </Drawer>
              <Button
                variant="outline"
                disabled={!selectedFrame}
                className="flex-auto"
                onClick={() => {
                  if (!selectedFrame) return

                  setAnswers((prev) => {
                    return [
                      selectedFrame, ...prev.filter(
                        (e) => e.index !== selectedFrame.index
                      ),
                    ]
                  })
                }}
              >
                Top
              </Button>
              <Button
                variant="destructive"
                disabled={!selectedFrame}
                className="flex-auto"
                onClick={() => {
                  setAnswers(
                    answers.map(
                      (e) => e === selectedFrame ? { ...e, filtered: true } : e)
                  )
                  setSelectedFrame(null)
                }}
              >Delete
              </Button>
            </div>
          </SidebarGroup>
          <SidebarGroup>
            <DataTable columns={columns} data={filteredAnswers} />
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <CsvDownloader
            filename="answer.csv"
            datas={filteredAnswers.map((item) => ({
              video_id: item.video,
              frame_id: item.frame,
            }))}
            text="Export"
            className={buttonVariants()}
          />
        </SidebarFooter>
      </Sidebar>
      <SidebarTrigger />
      <div className="grid grid-cols-5 h-fit">
        {
          filteredAnswers.map(data => {
            return (
              <HoverCard key={`${data.video} Scene ${data.scene} Frame ${data.frame}`}>
                <HoverCardTrigger onClick={e => setSelectedFrame(selectedFrame == data ? null : data)}>
                  <img
                    src={new URL(`frame?video=${data.video}&scene=${data.scene}`, BACKEND_URL).toString()}
                    alt={`${data.video} Scene ${data.scene} Frame ${data.frame}`}
                    className={data == selectedFrame ? 'border-10' : ''}
                  />
                </HoverCardTrigger>
                <HoverCardContent>
                  <div className="font-semibold">Score: {data.score}</div>
                  <div>Video: {data.video}</div>
                  <div>Scene: {data.scene}</div>
                  <div>Frame: {data.frame}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {data.subtitles}
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