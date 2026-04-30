import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import {
  LogOut,
  MessageSquare,
  Plus,
  Settings,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";

function SidebarNav() {
  const { conversationId } = useParams();
  const conversations = useQuery(api.conversations.list) || [];
  const createConversation = useMutation(api.conversations.create);
  const removeConversation = useMutation(api.conversations.remove);
  const navigate = useNavigate();
  const { setOpenMobile } = useSidebar();

  const handleNew = async () => {
    const id = await createConversation({});
    navigate(`/chat/${id}`);
    setOpenMobile(false);
  };

  const handleDelete = async (id: Id<"conversations">, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await removeConversation({ id });
    if (conversationId === id) {
      navigate("/chat");
    }
  };

  return (
    <SidebarContent>
      <SidebarGroup>
        <div className="px-2 mb-2">
          <Button
            onClick={handleNew}
            variant="outline"
            className="w-full justify-start gap-2 border-[rgba(255,255,255,0.08)] hover:bg-[#1A1A24] hover:border-[#E91E8C]/30"
          >
            <Plus className="size-4" />
            New Chat
          </Button>
        </div>
        <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Recent
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {conversations.map((conv) => (
              <SidebarMenuItem key={conv._id}>
                <SidebarMenuButton
                  asChild
                  isActive={conversationId === conv._id}
                  className="group"
                >
                  <Link
                    to={`/chat/${conv._id}`}
                    onClick={() => setOpenMobile(false)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <MessageSquare className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate text-sm">{conv.title}</span>
                    </div>
                    <button
                      onClick={(e) => handleDelete(conv._id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-all"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            {conversations.length === 0 && (
              <p className="px-3 py-2 text-xs text-muted-foreground">No conversations yet</p>
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}

function SidebarUserMenu() {
  const user = useQuery(api.auth.currentUser);
  const { signOut } = useAuthActions();
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarFooter className="border-t border-sidebar-border">
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton size="lg">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-[#E91E8C] text-white text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm font-medium truncate">
                    {user?.name || "User"}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </span>
                </div>
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="start"
              className="w-[--radix-dropdown-menu-trigger-width]"
            >
              <DropdownMenuItem asChild>
                <Link to="/settings" onClick={() => setOpenMobile(false)}>
                  <Settings className="size-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut()}
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <LogOut className="size-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}

function SidebarHeaderContent() {
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarHeader className="border-b border-sidebar-border">
      <Link
        to="/chat"
        onClick={() => setOpenMobile(false)}
        className="flex items-center gap-2.5 px-2 py-1 font-semibold text-lg"
      >
        <div className="size-8 rounded-lg bg-gradient-to-br from-[#E91E8C] to-[#C0186F] flex items-center justify-center">
          <Sparkles className="size-4 text-white" />
        </div>
        <span>Centillion AI</span>
      </Link>
    </SidebarHeader>
  );
}

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeaderContent />
      <SidebarNav />
      <SidebarUserMenu />
    </Sidebar>
  );
}
