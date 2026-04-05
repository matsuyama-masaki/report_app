# レポートの状態定義
class ReportStatus:
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"

# システム制限
MAX_REPORT_TITLE_LENGTH = 100
DEFAULT_PAGE_SIZE = 20

# 共通メッセージ
ERROR_REPORT_NOT_FOUND = "指定されたレポートが見つかりません。"