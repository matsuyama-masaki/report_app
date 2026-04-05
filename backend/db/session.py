import os
from sqlmodel import create_engine, Session, SQLModel

# docker-compose.yml で設定した環境変数を取得
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL, echo=True)  # echo=TrueでSQLをログ出力

def get_session():
    """
    データベースセッションを生成し、処理終了後に自動でクローズするジェネレータ。
    
    [動作詳細]
    - FastAPIのDepends経由で呼び出され、各リクエストごとに新しいセッションを割り当てます。
    - 'yield' を使用することで、APIの処理が終わった後に自動的にセッションを閉じ、
      DB接続リソース（コネクション）を解放します。
    """
    with Session(engine) as session:
        yield session