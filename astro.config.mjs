import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap'; // 余裕あれば

export default defineConfig({
  site: 'https://bakabo2st.github.io',   // ←自分のユーザー名に変更
  base: '/my-gadget-site',                   // ★ プロジェクト名（そのまま）
  integrations: [sitemap()],                 // 任意（Search Console用に便利）
});