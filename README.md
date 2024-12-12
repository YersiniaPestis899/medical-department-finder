# びょういんナビ 🏥

## 概要

AWS Bedrock上のClaude 3.5 Sonnetを活用した症状分析による診療科推奨システムです。子供から大人まで、症状に応じて最適な診療科を提案します。

## 主な機能 🌟

### 1. インテリジェントな診療科推奨
- 年齢に応じた適切な診療科の提案
- 複数症状の関連性分析
- 緊急度の自動判定

### 2. ユーザーフレンドリーなインターフェース
- 子供向けのわかりやすいUI
- 症状の視覚的な選択機能
- アニメーションによる直感的な操作

### 3. 詳細な医療情報提供
- 一般向けの基本情報表示
- 保護者向けの詳細な医学的説明
- 受診時の注意点やアドバイス

## 技術スタック 🛠️

### フロントエンド
- React + Vite
- TailwindCSS
- Framer Motion

### バックエンド
- AWS Bedrock
- Claude 3.5 Sonnet

## セットアップ 🚀

### 必要条件
- Node.js 16.0.0以上
- AWS アカウント
- Bedrock APIアクセス権限

### インストール
```bash
# リポジトリのクローン
git clone https://github.com/YourUsername/medical-department-finder.git

# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
# .envファイルを編集してAWS認証情報を設定
```

### 開発サーバーの起動
```bash
npm run dev
```

## 環境変数の設定 ⚙️

必要な環境変数:
```env
VITE_AWS_REGION=your_region
VITE_AWS_ACCESS_KEY_ID=your_access_key
VITE_AWS_SECRET_ACCESS_KEY=your_secret_key
```

## 使用方法 📝

1. 年齢を選択
2. 症状を選択（複数選択可能）
3. カスタム症状の入力（必要な場合）
4. 診断結果の確認
   - 推奨診療科
   - 緊急度
   - 注意点
   - 医学的説明

## デプロイ 🌐

Vercelを使用したデプロイ:

1. Vercelアカウントの作成
2. GitHubリポジトリとの連携
3. 環境変数の設定
4. デプロイの実行

## ライセンス 📄

MIT License - 詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 貢献 🤝

1. このリポジトリをFork
2. 新しいFeatureブランチを作成
3. 変更をCommit
4. ブランチにPush
5. Pull Requestを作成

## サポート 💬

問題や質問がある場合は、GitHubのIssueを作成してください。

---

**Note**: このアプリケーションは医療アドバイスを提供するものではありません。深刻な症状がある場合は、必ず医療専門家に相談してください。