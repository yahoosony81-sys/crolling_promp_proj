"use client";

import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import { LuUser, LuLogOut } from "react-icons/lu";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Profile() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  if (!isLoaded) {
    return (
      <Button variant="ghost" size="icon" className="rounded-full" disabled>
        <LuUser className="h-5 w-5" />
      </Button>
    );
  }

  if (!isSignedIn || !user) {
    return (
      <Button variant="ghost" asChild>
        <Link href="/login">Login</Link>
      </Button>
    );
  }

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="size-8">
            <AvatarImage
              src={user.imageUrl}
              alt={user.emailAddresses[0]?.emailAddress ?? "User avatar"}
            />
            <AvatarFallback>
              {user.emailAddresses[0]?.emailAddress ? (
                getInitials(user.emailAddresses[0].emailAddress)
              ) : (
                <LuUser className="size-4" />
              )}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Account</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.emailAddresses[0]?.emailAddress}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex w-full items-center">
            <LuUser className="mr-2 size-4" />
            프로필 관리
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account" className="flex w-full items-center">
            <LuUser className="mr-2 size-4" />
            내 계정
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LuLogOut className="mr-2 size-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
