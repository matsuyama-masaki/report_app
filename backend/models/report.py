from datetime import datetime, timedelta, timezone
from sqlmodel import SQLModel, Field

# 日本標準時 (JST) の定義
JST = timezone(timedelta(hours=9))

def get_now_jst():
    """現在時刻を日本時間で取得するユーティリティ"""
    return datetime.now(JST).replace(tzinfo=None)

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
    id: int | None = Field(
        default=None,
        primary_key=True,
        ge=1
    )
    created_at: datetime = Field(
        default_factory=get_now_jst,
        nullable=False,
        description="作成日時（JST）"
    )
    updated_at: datetime = Field(
        default_factory=get_now_jst,
        sa_column_kwargs={"onupdate": get_now_jst},
        description="更新日時（JST）"
    )

    model_config = {
        "json_schema_extra": {
            "example": {}
        },
        # JSON変換時にタイムゾーンを保持したまま文字列にする設定
        "json_encoders": {
            datetime: lambda v: v.isoformat() if v.tzinfo else v.replace(tzinfo=timezone(timedelta(hours=9))).isoformat()
        }
    }

class ReportUpdate(SQLModel):
    title: str | None = None
    content: str | None = None
    author: str | None = None