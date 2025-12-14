"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { LuSun, LuMoon, LuMonitor } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * 테마 전환 컴포넌트
 * 
 * 라이트 모드, 다크 모드, 시스템 설정을 선택할 수 있는 드롭다운 메뉴를 제공합니다.
 * 접근성을 고려하여 ARIA 레이블과 키보드 네비게이션을 지원합니다.
 */
export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // SSR 하이드레이션 이슈 방지를 위한 플레이스홀더
  if (!mounted) {
    return (
      <Button 
        variant="ghost" 
        size="icon"
        aria-label="테마 전환"
        aria-haspopup="true"
        aria-expanded="false"
      >
        <LuSun className="size-4" />
        <span className="sr-only">테마 전환</span>
      </Button>
    );
  }

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <LuSun className="size-4" aria-hidden="true" />;
      case "dark":
        return <LuMoon className="size-4" aria-hidden="true" />;
      case "system":
      default:
        return <LuMonitor className="size-4" aria-hidden="true" />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case "light":
        return "라이트 모드";
      case "dark":
        return "다크 모드";
      case "system":
      default:
        return "시스템 설정";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          aria-label={`테마 전환 (현재: ${getThemeLabel()})`}
          aria-haspopup="true"
          title={`테마 전환: ${getThemeLabel()}`}
        >
          {getThemeIcon()}
          <span className="sr-only">테마 전환</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" aria-label="테마 선택">
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          aria-label="라이트 모드로 전환"
          role="menuitemradio"
          aria-checked={theme === "light"}
        >
          <LuSun className="mr-2 size-4" aria-hidden="true" />
          <span>라이트</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          aria-label="다크 모드로 전환"
          role="menuitemradio"
          aria-checked={theme === "dark"}
        >
          <LuMoon className="mr-2 size-4" aria-hidden="true" />
          <span>다크</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          aria-label="시스템 설정 따르기"
          role="menuitemradio"
          aria-checked={theme === "system"}
        >
          <LuMonitor className="mr-2 size-4" aria-hidden="true" />
          <span>시스템</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
