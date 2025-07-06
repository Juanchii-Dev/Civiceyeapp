import { Button } from "@/components/ui/button"
import { Shell } from "@/components/ui/shell"
import { Sidebar } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Main } from "@/components/ui/main"
import { Link } from "@nextui-org/link"
import { Bell } from "lucide-react"

export default function AdminPage() {
  return (
    <Shell>
      <Sidebar>
        <Link href="/admin">
          <Button variant="ghost" className="w-full justify-start">
            Dashboard
          </Button>
        </Link>
        <Separator />
        <Link href="/admin/notificaciones">
          <Button variant="ghost" className="w-full justify-start">
            <Bell className="w-4 h-4 mr-2" />
            Notificaciones
          </Button>
        </Link>
      </Sidebar>
      <Main>
        <div>Admin Page</div>
      </Main>
    </Shell>
  )
}
