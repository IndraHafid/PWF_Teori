"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useMounted } from "@/hooks/use-mounted"
import { useProfileStore } from "@/stores/profile"
import { useSearchStore } from "@/stores/search"
import type { Session } from "next-auth"
import { signOut } from "next-auth/react"
import { toast } from "react-hot-toast"

import { siteConfig } from "@/config/site"
import { api } from "@/lib/api/api"
import { searchShows } from "@/lib/fetchers"
import { cn } from "@/lib/utils"
import { DebouncedInput } from "@/components/debounced-input"
import { Icons } from "@/components/icons"
import { MainNav } from "@/components/layouts/main-nav"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"

interface SiteHeaderProps {
  session: Session | null
}

const SiteHeader = ({ session }: SiteHeaderProps) => {
  const router = useRouter()
  const path = usePathname()
  const mounted = useMounted()
  const [isScrolled, setIsScrolled] = React.useState(false)

  // change background color on scroll
  React.useEffect(() => {
    const changeBgColor = () => {
      window.scrollY > 0 ? setIsScrolled(true) : setIsScrolled(false)
    }
    window.addEventListener("scroll", changeBgColor)
    return () => window.removeEventListener("scroll", changeBgColor)
  }, [isScrolled])

  // search shows by query
  async function searchShowsByQuery(value: string) {
    searchStore.setQuery(value)
    const shows = await searchShows(value)
    void searchStore.setShows(shows.results)
  }

  // stores
  const searchStore = useSearchStore()
  const profileStore = useProfileStore()

  // Debug: log profile state
  React.useEffect(() => {
    console.log("Profile state:", profileStore.profile)
    console.log("Session:", session?.user)
    if (profileStore.profile?.icon?.href) {
      console.log("Profile icon href:", profileStore.profile.icon.href)
    } else {
      console.log("Profile icon href is missing or null.")
    }
  }, [profileStore.profile, session])

  // other profiles query
  const otherProfilesQuery = profileStore.profile
    ? api.profile.getOthers.useQuery(profileStore.profile.id, {
        enabled: !!session?.user && !!profileStore.profile,
      })
    : null

  return (
    <header
      aria-label="Header"
      className={cn(
        "sticky top-0 z-40 w-full",
        isScrolled ? "bg-neutral-900 shadow-md" : "bg-transparent"
      )}
    >
      <nav className="container flex h-16 max-w-screen-2xl items-center justify-between space-x-4 sm:space-x-0">
        <MainNav items={siteConfig.mainNav} />
        <div className="flex items-center space-x-1.5">
          {mounted ? (
            <DebouncedInput
              containerClassName={cn(
                path === "/login" || path === "/login/plans" ? "hidden" : "flex"
              )}
              setQuery={searchStore.setQuery}
              setData={searchStore.setShows}
              value={searchStore.query}
              onChange={(value) => void searchShowsByQuery(value.toString())}
            />
          ) : (
            <Skeleton className="aspect-square h-7 bg-neutral-700" />
          )}
          {mounted ? (
            <Button
              aria-label="Notifications"
              variant="ghost"
              className="hidden h-auto rounded-full p-1 hover:bg-transparent dark:hover:bg-transparent lg:flex"
              onClick={() =>
                toast.success("Do a kickflip", {
                  icon: "🛹",
                })
              }
            >
              <Icons.bell
                className="h-5 w-5 cursor-pointer text-white transition-opacity hover:opacity-75 active:scale-95"
                aria-hidden="true"
              />
            </Button>
          ) : (
            <Skeleton className="aspect-square h-7 bg-neutral-700" />
          )}
          {mounted ? (
            session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    aria-label="Account menu trigger"
                    variant="ghost"
                    className="h-auto shrink-0 px-2 py-1.5 text-base hover:bg-transparent focus:ring-0 hover:dark:bg-neutral-800 [&[data-state=open]>svg]:rotate-180"
                  >
                    {profileStore.profile?.icon?.href ? (
                      <div className="relative">
                        <Image
                          src={profileStore.profile.icon.href}
                          alt={profileStore.profile.icon.title || "Profile"}
                          width={28}
                          height={28}
                          className="rounded-sm object-cover transition-opacity hover:opacity-80"
                          loading="lazy"
                          onError={(e) => {
                            console.error("Profile image load error:", e);
                            console.log("Failed image src:", profileStore.profile?.icon?.href);
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                          onLoad={() => {
                            console.log("Profile image loaded successfully:", profileStore.profile?.icon?.href);
                          }}
                        />
                        <span className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full"></span>
                      </div>
                    ) : (
                      <div className="aspect-square h-7 rounded-sm bg-neutral-600 flex items-center justify-center relative">
                        <Icons.user className="h-4 w-4 text-neutral-400" />
                        <span className="absolute -bottom-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                        {profileStore.profile ? (
                          <span className="absolute -top-1 -left-1 h-2 w-2 bg-yellow-500 rounded-full"></span>
                        ) : (
                          <span className="absolute -top-1 -left-1 h-2 w-2 bg-orange-500 rounded-full"></span>
                        )}
                      </div>
                    )}
                    <Icons.chevronDown className="ml-2 hidden h-4 w-4 transition-transform duration-200 lg:inline-block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={20}
                  className="w-52 overflow-y-auto overflow-x-hidden rounded-sm bg-neutral-800/90 text-slate-200 dark:bg-neutral-800/90 dark:text-slate-200"
                >
                  {otherProfilesQuery?.data?.map((profile) => (
                    <DropdownMenuItem
                      key={profile.id}
                      asChild
                      className="hover:bg-neutral-700 focus:bg-neutral-700 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                    >
                      <Button
                        aria-label={profile.name}
                        variant="ghost"
                        className="h-auto w-full justify-between space-x-2 px-2 hover:bg-transparent focus:ring-0 focus:ring-offset-0 active:scale-100 dark:hover:bg-transparent"
                        onClick={() => {
                          router.push("/")
                          useProfileStore.setState({
                            profile,
                            pinForm: profile.pin ? true : false,
                          })
                        }}
                      >
                        <div className="flex items-center gap-2">
                          {profile.icon ? (
                            <Image
                              src={profile.icon.href}
                              alt={profile.icon.title || "Profile"}
                              width={28}
                              height={28}
                              className="rounded object-cover"
                              loading="lazy"
                              onError={(e) => {
                                console.error("Dropdown profile image load error:", e);
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="aspect-square h-7 bg-neutral-700 flex items-center justify-center">
                              <Icons.user className="h-3 w-3 text-neutral-400" />
                            </div>
                          )}
                          <p>{profile.name}</p>
                        </div>
                        {profile.pin && (
                          <Icons.lock
                            className="h-3.5 w-3.5 text-slate-400"
                            aria-label="Private profile"
                          />
                        )}
                      </Button>
                    </DropdownMenuItem>
                  ))}
                  {siteConfig.profileDropdownItems.map(
                    (item, index) =>
                      item.title !== "Sign Out of Netflix" &&
                      (item.href ? (
                        <DropdownMenuItem
                          key={index}
                          asChild
                          className="hover:bg-neutral-700 focus:bg-neutral-700 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                        >
                          <Link href={item.href}>
                            {item.icon && (
                              <item.icon
                                className="mr-3 h-4 w-4 text-slate-400"
                                aria-hidden="true"
                              />
                            )}
                            <span className="line-clamp-1">{item.title}</span>
                          </Link>
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          key={index}
                          asChild
                          className="hover:bg-neutral-700 focus:bg-neutral-700 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                        >
                          <span onClick={item.onClick}>
                            {item.icon && (
                              <item.icon
                                className="mr-3 h-4 w-4 text-slate-400"
                                aria-hidden="true"
                              />
                            )}
                            <span className="line-clamp-1">{item.title}</span>
                          </span>
                        </DropdownMenuItem>
                      ))
                  )}
                  <DropdownMenuSeparator />
                  {siteConfig.profileDropdownItems.map(
                    (item, index) =>
                      item.title === "Sign Out of Netflix" && (
                        <DropdownMenuItem
                          key={index}
                          asChild
                          className="hover:bg-neutral-700 focus:bg-neutral-700 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                        >
                          <span
                            className="line-clamp-1 grid place-items-center"
                            onClick={() => void signOut()}
                          >
                            {item.title}
                          </span>
                        </DropdownMenuItem>
                      )
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                aria-label="Sign in"
                href="/login"
                className={cn(
                  buttonVariants({
                    variant: "brand",
                    //variant: "blue"
//blue:"bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700",
                    size: "auto",
                    className: "h-auto rounded",
                  })
                )}
              >
                Sign In
              </Link>
            )
          ) : (
            <Skeleton className="h-7 w-10 bg-neutral-700" />
          )}
        </div>
      </nav>
    </header>
  )
}

export default SiteHeader
