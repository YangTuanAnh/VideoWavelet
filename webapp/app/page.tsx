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
  InputGroupInput,
} from "@/components/ui/input-group"
import { SearchIcon } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import Image from "next/image"

type Frames = {
  id: number
  video: string
  scene: number
  frame: number
  image_path: string | null
}

const columns: ColumnDef<Frames>[] = [
  {
    accessorKey: "video",
    header: "Video",
  },
  {
    accessorKey: "scene",
    header: "Scene",
  },
  {
    accessorKey: "frame",
    header: "Frame",
  },
]
export default function Home() {
  const mockData: Frames[] = [
        {id: 0, video: "L01_V001", scene: 1, frame: 161, image_path: null},
        {id: 1, video: "L01_V001", scene: 2, frame: 350, image_path: null},
        {id: 2, video: "L01_V001", scene: 3, frame: 395, image_path: null}
    ]
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
                  <InputGroupInput placeholder="Search..." />
                  <InputGroupAddon>
                      <SearchIcon />
                  </InputGroupAddon>
              </InputGroup>
          </SidebarGroup>
          <SidebarGroup>
              <DataTable columns={columns} data={mockData} />
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <Button>
              Export
          </Button>
        </SidebarFooter>
      </Sidebar>
        <SidebarTrigger />
      <Image width={256} height={256} src="C:\Users\admin\Documents\VideoWavelet\data\frames\L01_V001\Scene-001-161.jpg"/>
    </SidebarProvider>
  )
}