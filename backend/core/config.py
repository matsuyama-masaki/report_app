from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # インフラ接続設定
    POSTGRES_SERVER: str = "db"
    POSTGRES_USER: str = "report_admin"
    POSTGRES_PASSWORD: str = "password"
    POSTGRES_DB: str = "report_db"
    
    # アプリケーション設定
    PROJECT_NAME: str = "Report App"
    API_V1_STR: str = "/api"

    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}/{self.POSTGRES_DB}"

settings = Settings()