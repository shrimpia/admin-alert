# shrimpia-admin-alert

Misskey の System Webhook を Discord Webhook にブリッジする Cloudflare Workers アプリ。

## 対応イベント

| イベント | 内容 |
|---|---|
| `abuseReport` | 新規通報 |
| `abuseReportResolved` | 通報解決 |
| `userCreated` | 新規ユーザー登録 |
| `inactiveModeratorsWarning` | モデレーター非アクティブ警告 |
| `inactiveModeratorsInvitationOnlyChanged` | 招待制設定変更 |

---

## セットアップ

### 1. 依存パッケージのインストール

```bash
pnpm install
```

### 2. シークレットの設定

以下の2つのシークレットを Cloudflare Workers に登録する。

```bash
pnpm dlx wrangler secret put DISCORD_WEBHOOK_URL
pnpm dlx wrangler secret put MISSKEY_HOOK_SECRET
```

| シークレット | 説明 |
|---|---|
| `DISCORD_WEBHOOK_URL` | 通知を送る Discord チャンネルの Webhook URL |
| `MISSKEY_HOOK_SECRET` | Misskey の System Webhook 設定画面で設定したシークレット文字列 |

**Discord Webhook URL の取得手順：**
1. Discord のチャンネル設定 → 「連携サービス」→「ウェブフック」
2. 「新しいウェブフック」を作成
3. 「ウェブフック URL をコピー」

**Misskey Hook Secret の設定手順：**
1. Misskey 管理画面 → 「システム Webhook」→「作成」
2. 「シークレット」欄に任意の文字列を入力（`wrangler secret put` で設定した値と同じもの）
3. Webhook URL に `https://<your-worker>.workers.dev/webhook` を設定

### 3. Misskey 側の Webhook 設定

Misskey 管理画面の「システム Webhook」で以下を設定する。

| 項目 | 設定値 |
|---|---|
| URL | `https://<your-worker>.workers.dev/webhook` |
| シークレット | `MISSKEY_HOOK_SECRET` に設定した文字列 |
| イベント | 通知したいイベントにチェック |

---

## ローカル開発

```bash
pnpm dev
```

`http://localhost:8787` で起動する。ローカル実行時のシークレットは `.dev.vars` ファイルで管理する。

```ini
# .dev.vars（Gitにコミットしないこと）
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
MISSKEY_HOOK_SECRET=your-secret
```

### 動作確認（curl）

```bash
# userCreated イベントのテスト
curl -X POST http://localhost:8787/webhook \
  -H "Content-Type: application/json" \
  -H "X-Misskey-Hook-Secret: your-secret" \
  -d '{
    "server": "https://example.com",
    "hookId": "xxx",
    "eventId": "yyy",
    "createdAt": 1234567890,
    "type": "userCreated",
    "body": {
      "id": "uid",
      "name": "テストユーザー",
      "username": "testuser",
      "host": null,
      "avatarUrl": null,
      "avatarBlurhash": null,
      "isBot": false,
      "isCat": false,
      "emojis": {},
      "onlineStatus": "unknown",
      "badgeRoles": []
    }
  }'
```

```bash
# abuseReport イベントのテスト
curl -X POST http://localhost:8787/webhook \
  -H "Content-Type: application/json" \
  -H "X-Misskey-Hook-Secret: your-secret" \
  -d '{
    "server": "https://example.com",
    "hookId": "xxx",
    "eventId": "yyy",
    "createdAt": 1234567890,
    "type": "abuseReport",
    "body": {
      "id": "report1",
      "targetUserId": "uid1",
      "targetUser": {"id":"uid1","name":"標的ユーザー","username":"target","host":null,"avatarUrl":null,"avatarBlurhash":null,"isBot":false,"isCat":false,"emojis":{},"onlineStatus":"unknown","badgeRoles":[]},
      "reporterId": "uid2",
      "reporter": {"id":"uid2","name":"通報者","username":"reporter","host":null,"avatarUrl":null,"avatarBlurhash":null,"isBot":false,"isCat":false,"emojis":{},"onlineStatus":"unknown","badgeRoles":[]},
      "assigneeId": null,
      "assignee": null,
      "comment": "スパム行為をしています",
      "forwarded": false
    }
  }'
```

---

## デプロイ

```bash
pnpm deploy
```

---

## カスタマイズ

`config.json` を編集することでイベントごとの表示をカスタマイズできる。

```json
{
  "events": {
    "abuseReport": {
      "enabled": true,         // false にするとこのイベントをスキップ
      "title": "🚨 新規通報",  // Discord embed のタイトル
      "color": 15548997,       // Discord embed の色（10進数）
      "mentionRoleId": null    // メンションするロールID（不要なら null）
    }
  },
  "labels": {
    "targetUser": "対象ユーザー"  // フィールドラベルの文言
  }
}
```

### ロールメンションの設定

特定イベントで Discord のロールをメンションしたい場合、`mentionRoleId` にロール ID を設定する。

```json
"abuseReport": {
  "mentionRoleId": "123456789012345678"
}
```

ロール ID は Discord でロールを右クリック →「ID をコピー」で取得できる（開発者モードが必要）。

### embed の色

[Discord カラーピッカー](https://www.spycolor.com/) などで 16 進数カラーコードを確認し、10 進数に変換して設定する。

| 色 | 16進数 | 10進数 |
|---|---|---|
| 赤（通報） | `#ED4245` | `15548997` |
| 緑（解決） | `#57F287` | `5763719` |
| 青（登録） | `#5865F2` | `5793266` |
| 黄（警告） | `#FEE75C` | `16776960` |
| グレー（設定変更） | `#99AAB5` | `10070709` |
