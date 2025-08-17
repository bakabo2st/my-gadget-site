// scripts/fetch-rakuten.js
// 使い方：
//   node scripts/fetch-rakuten.js ranking <genreId> <outFile> <APP_ID>
//   node scripts/fetch-rakuten.js search  "<keyword>" <outFile> <APP_ID>
//
// 例：search（キーワード上位5件、レビュー数多い順）
//   node scripts/fetch-rakuten.js search "モバイルバッテリー" src/data/batteries.json あなたのAPP_ID
//
// 例：ranking（ジャンルID指定で上位5件）
//   node scripts/fetch-rakuten.js ranking 0 src/data/batteries.json あなたのAPP_ID

import fs from 'node:fs/promises';

const mode = process.argv[2];           // 'ranking' | 'search'
const arg  = process.argv[3];           // genreId | "keyword"
const out  = process.argv[4] || 'src/data/out.json';
const appId = process.env.RAKUTEN_APP_ID || process.argv[5];

if (!appId) {
  console.error('RAKUTEN_APP_ID が未設定です。第5引数 or 環境変数で指定してください。');
  process.exit(1);
}

let url = '';
if (mode === 'ranking') {
  const endpoint = 'https://app.rakuten.co.jp/services/api/IchibaItem/Ranking/20170628';
  const genreId  = encodeURIComponent(arg || '0'); // 未指定なら総合
  url = `${endpoint}?applicationId=${appId}&genreId=${genreId}&format=json`;
} else if (mode === 'search') {
  const endpoint = 'https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706';
  const keyword  = encodeURIComponent(arg || '');
  url = `${endpoint}?applicationId=${appId}&format=json&keyword=${keyword}&sort=-reviewCount`;
} else {
  console.error('Usage: node scripts/fetch-rakuten.js <ranking|search> <genreId|\"keyword\"> <outFile> <APP_ID>');
  process.exit(1);
}

const res = await fetch(url);
if (!res.ok) {
  console.error('Rakuten API error:', res.status, await res.text());
  process.exit(1);
}
const json = await res.json();

const rawItems = json?.Items ?? [];
const items = rawItems.slice(0, 5).map(({ Item }) => ({
  name: Item.itemName,
  price: Item.itemPrice,                               // 数値
  url: Item.itemUrl,                                   // ※後でアフィURLに置換OK
  image: Item.mediumImageUrls?.[0]?.imageUrl || '',    // 画像（あれば）
  shop: Item.shopName || '',
}));

await fs.mkdir('src/data', { recursive: true });
await fs.writeFile(out, JSON.stringify(items, null, 2), 'utf8');
console.log('Saved:', out);
