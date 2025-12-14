"use client";

import * as React from "react";
import { BREAKPOINTS, DEVICE_BREAKPOINTS, type DeviceType } from "@/lib/constants/breakpoints";

/**
 * 현재 화면 크기가 특정 브레이크포인트보다 큰지 확인하는 훅
 */
export function useBreakpoint(breakpoint: keyof typeof BREAKPOINTS) {
  const [matches, setMatches] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${BREAKPOINTS[breakpoint]}px)`);
    const onChange = () => {
      setMatches(mql.matches);
    };
    
    mql.addEventListener("change", onChange);
    setMatches(mql.matches);
    
    return () => mql.removeEventListener("change", onChange);
  }, [breakpoint]);

  return matches ?? false;
}

/**
 * 현재 디바이스 타입을 감지하는 훅
 */
export function useDeviceType(): DeviceType | undefined {
  const [deviceType, setDeviceType] = React.useState<DeviceType | undefined>(undefined);

  React.useEffect(() => {
    const updateDeviceType = () => {
      const width = window.innerWidth;
      
      if (width < DEVICE_BREAKPOINTS.tablet.min) {
        setDeviceType("mobile");
      } else if (width < DEVICE_BREAKPOINTS.desktop.min) {
        setDeviceType("tablet");
      } else {
        setDeviceType("desktop");
      }
    };

    updateDeviceType();
    window.addEventListener("resize", updateDeviceType);
    
    return () => window.removeEventListener("resize", updateDeviceType);
  }, []);

  return deviceType;
}

/**
 * 모바일 여부를 확인하는 훅 (기존 useIsMobile 개선)
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${BREAKPOINTS.md - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < BREAKPOINTS.md);
    };
    
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < BREAKPOINTS.md);
    
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}

/**
 * 태블릿 여부를 확인하는 훅
 */
export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(
      `(min-width: ${BREAKPOINTS.sm}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`
    );
    const onChange = () => {
      const width = window.innerWidth;
      setIsTablet(width >= BREAKPOINTS.sm && width < BREAKPOINTS.lg);
    };
    
    mql.addEventListener("change", onChange);
    const width = window.innerWidth;
    setIsTablet(width >= BREAKPOINTS.sm && width < BREAKPOINTS.lg);
    
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isTablet;
}

