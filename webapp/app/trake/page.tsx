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
    InputGroupButton,
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Menubar, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";
import Link from "next/link";

type SequenceResult = {
    score: number
    video: string
    scenes: number[]
    frames: number[]
    subtitles: string[]
}

const columns: ColumnDef<SequenceResult>[] = [
    {
        accessorKey: "video",
        header: "Video",
    },
    {
        accessorKey: "scenes",
        header: "Scenes",
        cell: ({ row }) =>
            row.original.scenes.join(" → "),
    },
    {
        accessorKey: "frames",
        header: "Frames",
        cell: ({ row }) =>
            row.original.frames.join(" → "),
    },
]

export default function Home() {
    const [K, setK] = useState<number>(20)
    const [queriesText, setQueriesText] = useState("")
    const [loading, setLoading] = useState<boolean>(false);
    const [answers, setAnswers] = useState<SequenceResult[]>([])
    const [subtitleFilter, setSubtitleFilter] = useState("")

    const [selectedSequences, setSelectedSequences] =
        useState<Set<string>>(new Set())
    const sequenceId = (sequence: SequenceResult) =>
        `${sequence.video}-${sequence.scenes.join("-")}`

    const BACKEND_URL = new URL("http://localhost:8000")
    const filteredAnswers = answers.filter(
        (a) =>
            subtitleFilter === "" ||
            a.subtitles.some((s) =>
                s.toLowerCase().includes(
                    subtitleFilter.toLowerCase()
                )
            )
    )

    const toggleSequence = (
        sequence: SequenceResult
    ) => {
        const id = sequenceId(sequence)

        setSelectedSequences(prev => {
            const next = new Set(prev)

            if (next.has(id))
                next.delete(id)
            else
                next.add(id)

            return next
        })
    }

    const fetchSequenceData = async (
        queries: string[],
        k: number
    ) => {
        try {
            setLoading(true)

            const response = await fetch(
                new URL("search_sequence", BACKEND_URL),
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        queries: queries.filter(Boolean),
                        k,
                    }),
                }
            )

            const data = await response.json()

            setAnswers(data)
        } finally {
            setLoading(false)
        }
    }

    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader>
                    <Menubar className="w-full">
                        <MenubarMenu>
                            <MenubarTrigger>
                                <Link href="/">KIS</Link>
                            </MenubarTrigger>
                        </MenubarMenu>
                        <MenubarMenu>
                            <MenubarTrigger>
                                <Link href="/vqa">VQA</Link>
                            </MenubarTrigger>
                        </MenubarMenu>
                        <MenubarMenu>
                            <MenubarTrigger>
                                <Link href="/trake">TRAKE</Link>
                            </MenubarTrigger>
                        </MenubarMenu>
                    </Menubar>
                    <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
                        Video Wavelet V1 <i className="text-sm">TRAKE</i>
                    </h1>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <Textarea
                            placeholder={`Event 1\nEvent 2\nEvent 3`}
                            value={queriesText}
                            onChange={(e) =>
                                setQueriesText(e.target.value)
                            }
                            rows={6}
                        />
                    </SidebarGroup>
                    <SidebarGroup>
                        <div className="flex">
                            <Button
                                variant="outline"
                                disabled={loading}
                                className="flex-grow"
                                onClick={() =>
                                    fetchSequenceData(
                                        queriesText
                                            .split("\n")
                                            .map((q) => q.trim())
                                            .filter(Boolean),
                                        K
                                    )}>
                                Search Sequence
                            </Button>
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
                        </div>

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
                            <Button
                                variant="outline"
                                disabled={selectedSequences.size === 0}
                                onClick={() => {
                                    setAnswers(prev => {
                                        const selected = prev.filter(seq =>
                                            selectedSequences.has(
                                                sequenceId(seq)
                                            )
                                        )

                                        const rest = prev.filter(seq =>
                                            !selectedSequences.has(
                                                sequenceId(seq)
                                            )
                                        )

                                        return [...selected, ...rest]
                                    })
                                }}
                            >
                                Top
                            </Button>
                            <Button
                                variant="destructive"
                                disabled={selectedSequences.size === 0}
                                onClick={() => {
                                    setAnswers(prev =>
                                        prev.filter(
                                            seq =>
                                                !selectedSequences.has(
                                                    sequenceId(seq)
                                                )
                                        )
                                    )

                                    setSelectedSequences(new Set())
                                }}
                            >
                                Delete
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
                            ...Object.fromEntries(
                                item.frames.map((frame, idx) => [
                                    `kf${idx + 1}`,
                                    frame,
                                ])
                            ),
                        }))}
                        text="Export"
                        className={buttonVariants()}
                    />
                </SidebarFooter>
            </Sidebar>
            <SidebarTrigger />
            <div className="flex flex-col gap-4">
                {filteredAnswers.map((sequence) => (
                    <div
                        key={sequenceId(sequence)}
                        onClick={() => toggleSequence(sequence)}
                        className={cn(
                            "grid grid-cols-5 rounded cursor-pointer",
                            selectedSequences.has(
                                sequenceId(sequence)
                            ) && "border-10"
                        )}
                    >
                        {sequence.scenes.map((scene, idx) => (
                            <HoverCard
                                key={`${sequence.video}-${scene}`}
                            >
                                <HoverCardTrigger>
                                    <img
                                        src={new URL(
                                            `frame?video=${sequence.video}&scene=${scene}`,
                                            BACKEND_URL
                                        ).toString()}
                                        alt={`${sequence.video} Scene ${scene}`}
                                        className="w-full"
                                    />
                                </HoverCardTrigger>

                                <HoverCardContent>
                                    <div className="font-semibold">
                                        Score: {sequence.score}
                                    </div>
                                    <div>Video: {sequence.video}</div>
                                    <div>Scene: {scene}</div>
                                    <div>Frame: {sequence.frames[idx]}</div>
                                    <div className="mt-1 text-xs text-muted-foreground">
                                        {sequence.subtitles[idx]}
                                    </div>
                                </HoverCardContent>
                            </HoverCard>
                        ))}
                    </div>
                ))}
            </div>
        </SidebarProvider>
    )
}