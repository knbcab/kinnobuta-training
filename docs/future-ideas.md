# Future Ideas & Research Notes

## Loyverse API 調査メモ

### 書き込みできるもの
- Items, Categories, Customers, Inventory: 作成・更新OK
- Receipts（売上記録）: 書き換え不可

### Composite Item
- CSV import経由は確実に可能
- API直接書き込みは要テスト（不明確）

### CSV import自体のAPI
- なし
- ブラウザ自動化（Playwright等）で擬似実現可能

### GAS管理
- `clasp clone` でローカルに引っ張る
- Claude Codeで編集して `clasp push` で反映
