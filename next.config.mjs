/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 视频作品集的封面图已经是压缩好的 JPG，无需 Next 再压缩；
  // 关闭图片优化后也能直接做纯静态导出（output: 'export'）。
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
