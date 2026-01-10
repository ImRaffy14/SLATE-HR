import { 
    Bell, 
    HelpCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from "@/context/authContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { getNotifications, getUnreadNotificationCount, markNotificationRead } from "@/api/ess";

function Navbar() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isEmployee = user?.role === "EMPLOYEE";

    // Fetch unread count for employees
    const { data: unreadCount = 0 } = useQuery({
        queryKey: ["ess-notifications-unread-count"],
        queryFn: getUnreadNotificationCount,
        enabled: isEmployee,
        refetchInterval: 30000, // Refetch every 30 seconds
    });

    // Fetch recent notifications for dropdown
    const { data: notificationsData } = useQuery({
        queryKey: ["ess-notifications-recent"],
        queryFn: () => getNotifications({ limit: 10 }),
        enabled: isEmployee,
    });

    const markReadMutation = useMutation({
        mutationFn: markNotificationRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ess-notifications-unread-count"] });
            queryClient.invalidateQueries({ queryKey: ["ess-notifications-recent"] });
            queryClient.invalidateQueries({ queryKey: ["ess-notifications"] });
        },
    });

    const handleNotificationClick = (notification: any) => {
        if (!notification.isRead) {
            markReadMutation.mutate(notification.id);
        }
        // Navigate based on notification type
        if (notification.metadata?.courseId) {
            navigate("/ess/learning");
        } else if (notification.metadata?.trainingId) {
            navigate("/ess/trainings");
        }
    };

    const notifications = notificationsData?.notifications || [];
    const unreadNotifications = notifications.filter((n: any) => !n.isRead);

    return (
        <div className="px-6 py-3 flex items-center justify-end">
            <div className="flex items-center gap-4">
                {isEmployee && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="icon" className="bg-slate-800 hover:bg-slate-400 relative">
                                <Bell size={20} className="text-white"/>
                                {unreadCount > 0 && (
                                    <Badge 
                                        variant="destructive" 
                                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                                    >
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </Badge>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80">
                            <DropdownMenuLabel>
                                Notifications
                                {unreadCount > 0 && (
                                    <Badge variant="secondary" className="ml-2">
                                        {unreadCount} unread
                                    </Badge>
                                )}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <div className="max-h-[400px] overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-gray-500">
                                        No notifications
                                    </div>
                                ) : (
                                    <>
                                        {notifications.map((notification: any) => (
                                            <DropdownMenuItem
                                                key={notification.id}
                                                className={`cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''}`}
                                                onClick={() => handleNotificationClick(notification)}
                                            >
                                                <div className="flex flex-col gap-1 w-full">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1">
                                                            <p className={`text-sm ${!notification.isRead ? 'font-semibold' : ''}`}>
                                                                {notification.message}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {new Date(notification.createdAt).toLocaleString()}
                                                            </p>
                                                        </div>
                                                        {!notification.isRead && (
                                                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                                                        )}
                                                    </div>
                                                </div>
                                            </DropdownMenuItem>
                                        ))}
                                        {notifications.length >= 10 && (
                                            <>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="cursor-pointer justify-center"
                                                    onClick={() => navigate("/ess/notifications")}
                                                >
                                                    View All Notifications
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
                {!isEmployee && (
                    <Button size="icon" className="bg-slate-800 hover:bg-slate-400">
                        <Bell size={20} className="text-white"/>
                    </Button>
                )}
                <Button size="icon" className="bg-slate-800 hover:bg-slate-400">
                    <HelpCircle size={20} className="text-white"/>
                </Button>
                <Avatar className="h-11 w-11">
                    <AvatarImage src={user?.image.imageUrl} alt="User" />
                    <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
                </Avatar>
            </div>
        </div>
    )
}

export default Navbar
