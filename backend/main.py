from fastapi import FastAPI
from contextlib import asynccontextmanager
from api.endpoints import reports
from fastapi.middleware.cors import CORSMiddleware

# 起動時と終了時の処理を管理する「lifespan」
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    アプリケーションの起動時と終了時のライフサイクルイベントを管理します。
    DB接続の確認や外部サービスの初期化などに利用します。
    """
    print("🚀 Startup complete")
    yield
    print("🛑 Shutting down...")

# lifespanをセットして初期化
app = FastAPI(
    title="Report Management API",
    description="レポートの作成・管理を行うバックエンドサービスです。",
    version="1.0.0",
    lifespan=lifespan
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.jsのURLを許可
    allow_credentials=True,
    allow_methods=["*"],  # GET, POST, PUT, DELETEすべて許可
    allow_headers=["*"],
)

@app.get(
    "/health", 
    tags=["system"], 
    summary="ヘルスチェック",
    description="サービスの稼働状態を確認するためのエンドポイントです。Liveness Probe等で使用します。"
)
def health_check():
    """
    サーバーが正常にリクエストを受け付けられる状態であれば {'status': 'ok'} を返します。
    """
    return {"status": "ok"}

# ルーターの集約
app.include_router(reports.router, prefix="/reports", tags=["reports"])