import type { NextConfig } from "next";

// next-pwa는 내부적으로 CommonJS를 사용하므로 require로 가져옵니다.
const withPWA = require("next-pwa")({
  dest: "public",         // 서비스 워커 파일이 생성될 위치
  disable: process.env.NODE_ENV === "development", // 개발 환경에서는 PWA 기능을 끔
  register: true,         // 서비스 워커를 자동으로 등록
  skipWaiting: true,      // 새로운 서비스 워커가 대기하지 않고 즉시 활성화
});

const nextConfig: NextConfig = {
  /* 기존 설정 옵션 유지 */
  devIndicators: false,
  reactCompiler: true,
  experimental: {
    // allowedDevOrigins: ["192.168.35.83"],
  },
};

// 기존 설정을 withPWA로 감싸서 내보냅니다.
export default withPWA(nextConfig);