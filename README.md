# mimicryptFriendCode

フレンドコードを元の形式を保ったまま安全に暗号化・復号するシステム。

## 特徴

- **形式保持**: 数字のみのコードは暗号化後も数字のみ
- **統一パスワード**: 1つのマスターパスワードで全てのフレンドコードを管理
- **加法暗号**: 数学的に確実な可逆暗号化
- **日本語対応**: 日本語パスワードに完全対応
- **静的サイト対応**: GitHub Actions + S3で自動デプロイ
- **リアルタイム復号**: パスワード入力と同時に自動復号

## セットアップ

1. 依存関係のインストール
```bash
npm install
```

2. .envファイルの設定
```bash
cp .env.example .env
# .envファイルを編集してマスターパスワードとフレンドコードを設定
```

3. 暗号化の実行
```bash
npm run encrypt
```

4. 静的サイトのビルド
```bash
npm run build
```

## .envファイルの形式

```
# マスターパスワード（全フレンドコード共通）
MASTER_PASSWORD=your_secure_master_password_here

# フレンドコード設定
IDENTIFIER_FC=フレンドコード

# 例
NINTENDO_FC=1234567890123456
DISCORD_FC=username#1234
GAME_FC=987654321
```

## 使用方法

1. `.env`ファイルにマスターパスワードとフレンドコードを設定
2. `npm run encrypt`で暗号化データを生成
3. `npm run build`で静的サイトを生成
4. `dist/index.html`をブラウザで開く
5. マスターパスワードを入力すると自動的に復号される

## デプロイ設定

### AWS S3バケットの作成

1. **S3バケットの作成**
   - AWS ConsoleでS3サービスを開く
   - 「バケットを作成」をクリック
   - バケット名を入力（例: `my-mimicryptfriendcode-site`）
   - リージョンを選択（例: `ap-northeast-1`）
   - 「バケットを作成」をクリック

2. **静的ウェブサイトホスティングの有効化**
   - 作成したバケットを選択
   - 「プロパティ」タブをクリック
   - 「静的ウェブサイトホスティング」を「有効」に設定
   - インデックスドキュメント: `index.html`
   - 「変更を保存」をクリック

3. **バケットポリシーの設定**
   - 「アクセス許可」タブをクリック
   - 「バケットポリシー」を編集
   - 以下のポリシーを追加（`YOUR_BUCKET_NAME`を実際のバケット名に変更）:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
       }
     ]
   }
   ```

### AWS IAMユーザーの作成

1. **IAMユーザーの作成**
   - AWS ConsoleでIAMサービスを開く
   - 「ユーザー」→「ユーザーを追加」
   - ユーザー名を入力（例: `mimicryptfriendcode-deploy`）
   - 「アクセスキー - プログラムによるアクセス」をチェック
   - 「次のステップ」をクリック

2. **権限の設定**
   - 「既存のポリシーを直接アタッチ」を選択
   - 「AmazonS3FullAccess」を検索して選択
   - 「次のステップ」をクリック
   - 「ユーザーの作成」をクリック

3. **アクセスキーの取得**
   - 作成完了画面で「アクセスキーID」と「シークレットアクセスキー」をメモ
   - **重要**: この画面でのみ確認可能なので必ず保存

### GitHub Secretsの設定

1. **GitHubリポジトリの設定**
   - GitHubのリポジトリページを開く
   - 「Settings」→「Secrets and variables」→「Actions」

2. **以下のSecretsを追加**
   - `ENV_FILE`: .envファイルの内容全体
     ```
     MASTER_PASSWORD=your_secure_master_password_here
     NINTENDO_FC=1234567890123456
     DISCORD_FC=username#1234
     ```
   - `AWS_ACCESS_KEY_ID`: IAMユーザーのアクセスキーID
   - `AWS_SECRET_ACCESS_KEY`: IAMユーザーのシークレットアクセスキー
   - `AWS_REGION`: S3バケットのリージョン（例: `ap-northeast-1`）
   - `S3_BUCKET_NAME`: S3バケット名

### デプロイの実行

1. **自動デプロイ**
   - `main`ブランチにプッシュすると自動的にデプロイが実行されます
   - GitHub Actionsの「Actions」タブで実行状況を確認できます

2. **手動デプロイ**
   - GitHub Actionsの「Actions」タブを開く
   - 「Deploy to S3」ワークフローを選択
   - 「Run workflow」をクリック

3. **サイトの確認**
   - S3バケットの静的ウェブサイトURLでアクセス可能
   - URL形式: `http://YOUR_BUCKET_NAME.s3-website-REGION.amazonaws.com`

## 対応フォーマット

- `numeric`: 数字のみ (0-9)
- `alphanumeric_lower`: 小文字英数字 (0-9, a-z)
- `alphanumeric_upper`: 大文字英数字 (0-9, A-Z)
- `alphanumeric_mixed`: 大小文字英数字 (0-9, a-z, A-Z)

## セキュリティ

- マスターパスワードは暗号化されたデータに含まれない
- 加法暗号で元の形式を完全に保持
- SHA-256ハッシュベースの鍵生成
- 日本語パスワードの完全サポート

## 技術仕様

- **暗号化方式**: 加法暗号 `(original + key) % charset_length`
- **復号方式**: 減法復号 `(encrypted - key + charset_length) % charset_length`
- **鍵生成**: SHA-256ハッシュベース
- **文字エンコーディング**: UTF-8