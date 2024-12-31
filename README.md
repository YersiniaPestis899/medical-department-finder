# びょういんナビ 🏥

症状から適切な診療科を提案するAI搭載WEBアプリケーション

![Version](https://img.shields.io/badge/version-0.0.1-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📝 概要

「びょういんナビ」は、ユーザーの症状と年齢から最適な診療科を提案するWEBアプリケーションです。
Claude（AWS Bedrock）を活用した診療科推論エンジンにより、より適切な診療科を提案します。

### 🎯 主な機能

- 年齢に応じたインターフェース提供
- 部位別症状選択
- AIによる診療科推論
- アニメーションによる親しみやすいUI

## 🚀 技術スタック

- **Frontend**
  - React 18.2.0
  - Tailwind CSS 3.3.3
  - Framer Motion 10.16.0

- **Backend/AI**
  - AWS Bedrock
  - Claude

## 🔧 開発環境のセットアップ

### 必要要件

- Node.js 16.x以上
- npm 8.x以上
- AWS アカウント（Bedrockの利用）

### インストール手順

1. リポジトリのクローン
```bash
git clone https://github.com/YersiniaPestis899/medical-department-finder.git
cd medical-department-finder
```

2. 依存関係のインストール
```bash
npm install
```

3. 環境変数の設定
`.env.example`ファイルを`.env`にコピーし、必要な環境変数を設定します：
```bash
cp .env.example .env
```

必要な環境変数:
```env
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

4. 開発サーバーの起動
```bash
npm run dev
```

## 📁 プロジェクト構造

```
medical-department-finder/
├── src/
│   ├── components/     # UIコンポーネント
│   ├── data/          # 症状データ
│   ├── utils/         # ユーティリティ関数
│   └── App.jsx        # メインアプリケーション
├── public/            # 静的ファイル
└── ...
```

## 🔍 使用方法

1. 年齢を選択
2. 症状を選択（複数選択可能）
3. 「びょういんをさがす」ボタンをクリック
4. AIが最適な診療科を提案

## 🤝 コントリビューション

1. Forkする
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. Pull Requestを作成

## 📝 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 👥 作者

- GitHub: [@YersiniaPestis899](https://github.com/YersiniaPestis899)
- Qiita: [プログラミング超初心者がAIと二人三脚でWEBアプリ作ってみた](https://qiita.com/YersiniaPestis899/items/dc73d0c42a3592c11587)
