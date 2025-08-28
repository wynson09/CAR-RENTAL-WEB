import React from 'react';
import { Icon } from '@iconify/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Settings } from '@/components/svg';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useUserStore } from '@/store';
const FooterMenu = () => {
  const { data: session } = useSession();
  const { user } = useUserStore();

  // Use Zustand store data as primary source, fallback to session
  const userImage = user?.image || session?.user?.image;
  const userName = user?.name || session?.user?.name || 'User';

  return (
    <div className="space-y-5 flex flex-col items-center justify-center pb-6">
      <button className="w-11 h-11  mx-auto text-default-500 flex items-center justify-center  rounded-md transition-all duration-200 hover:bg-primary hover:text-primary-foreground">
        <Settings className=" h-8 w-8" />
      </button>
      <div>
        <Avatar className="w-9 h-9">
          <AvatarImage src={userImage || ''} alt={userName} />
          <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
            {userName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};
export default FooterMenu;
