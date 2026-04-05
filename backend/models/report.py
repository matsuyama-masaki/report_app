from datetime import datetime, timezone
from sqlmodel import SQLModel, Field

class ReportBase(SQLModel):
    """
    レポートの基本構造。
    フロントエンドとバックエンドで共通して使う項目を定義。
    """
    title: str = Field(description="レポートのタイトル", max_length=20)
    content: str = Field(description="レポートの本文", max_length=5000)
    author: str = Field(description="作成者の名前", max_length=10)

class ReportCreate(ReportBase):
    """
    [入力用] レポート作成時にクライアントから受け取るデータ。
    IDや日付は自動生成するため、ここでは定義しない。
    """
    pass

class Report(ReportBase, table=True):
    """
    [DB保存用] 実際にデータベースのテーブル（report）になるモデル。
    """
    id: int | None = Field(default=None, primary_key=True, ge=1)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="作成日時（UTC）"
        )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="更新日時（UTC）"
        )