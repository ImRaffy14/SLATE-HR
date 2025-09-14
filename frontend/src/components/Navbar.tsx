import { 
    Bell, 
    HelpCircle
} from "lucide-react";

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from "@/context/authContext";

function Navbar() {

    const { user } = useAuth()

    return (
        <div className="px-6 py-3 flex items-center justify-end">

            <div className="flex items-center gap-4">
                <Button size="icon" className="bg-slate-800 hover:bg-slate-400">
                    <Bell size={20} className="text-white"/>
                </Button>
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
