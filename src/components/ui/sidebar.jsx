import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { PanelLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

// Constants
const SIDEBAR_COOKIE_NAME = "sidebar:state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

// Context
const SidebarContext = React.createContext({});

// Styles
const sidebarVariants = cva(
  "h-full flex flex-col bg-background border-r border-border transition-all duration-300",
  {
    variants: {
      variant: {
        default: "w-[var(--sidebar-width)]",
        collapsed: "w-[var(--sidebar-width-icon)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Sidebar = React.forwardRef(({ 
  className, 
  variant = "default", 
  children, 
  ...props 
}, ref) => {
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  
  React.useEffect(() => {
    // Handle mobile state
    if (isMobile) {
      setIsCollapsed(true);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>
      <div
        ref={ref}
        className={cn(
          sidebarVariants({ variant: isCollapsed ? "collapsed" : "default" }),
          className
        )}
        style={{
          '--sidebar-width': isMobile ? SIDEBAR_WIDTH_MOBILE : SIDEBAR_WIDTH,
          '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
        }}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
});

Sidebar.displayName = "Sidebar";

const SidebarHeader = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex h-16 items-center px-4 border-b border-border", className)}
    {...props}
  >
    {children}
  </div>
));

SidebarHeader.displayName = "SidebarHeader";

const SidebarContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 overflow-y-auto p-2", className)}
    {...props}
  >
    {children}
  </div>
));

SidebarContent.displayName = "SidebarContent";

const SidebarFooter = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-4 border-t border-border", className)}
    {...props}
  >
    {children}
  </div>
));

SidebarFooter.displayName = "SidebarFooter";

const SidebarToggle = React.forwardRef(({ className, ...props }, ref) => {
  const { toggleSidebar } = React.useContext(SidebarContext);
  
  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8 p-0", className)}
      onClick={toggleSidebar}
      {...props}
    >
      <PanelLeft className="h-4 w-4" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
});

SidebarToggle.displayName = "SidebarToggle";

export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarToggle,
};