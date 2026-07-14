# Road Trip Drive

Three.js CDN版の軽量一本道ドライブゲームです。

## 操作
- W / ↑: 加速
- S / ↓: ブレーキ・後退
- A D / ← →: 操舵
- マウスドラッグ: カメラ回転
- マウスホイール: ズーム
- C: カメラ初期化

## エリア
1. 街（朝・舗装路）
2. 草原（昼・草路）
3. 山（夕方・岩路）
4. キャンプ場（夜・土路）

## テールランプ形状
`vehicle/Vehicle.js` の `this.tailLampShape` を変更します。
- `bar`
- `round`
- `double`

GitHub PagesなどHTTPサーバー上で実行してください。
