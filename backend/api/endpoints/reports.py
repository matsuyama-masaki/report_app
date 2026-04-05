from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from db.session import get_session
from models.report import Report, ReportCreate

router = APIRouter()

@router.post(
    "/",
    summary="レポートの新規作成",
    description="フロントエンドから届いたデータをバリデーションし、DBに保存します。"
)
def create_report(
    report_in: ReportCreate,
    session: Session = Depends(get_session)
) -> Report:
    """
    [処理詳細]
    1. ReportCreateモデルで入力バリデーション
    2. SQLModelのmodel_validateでDB用モデルへ変換
    3. DBへ保存し、最新の状態（ID等）をリフレッシュして返す
    """
    db_report = Report.model_validate(report_in)
    session.add(db_report)
    session.commit()
    session.refresh(db_report)
    return db_report

@router.get(
    "/",
    response_model=list[Report],
    summary="全レポートの取得",
    description="データベースに登録されているすべてのレポートを、作成日時の降順（新しい順）で取得します。"
)
def read_reports(
    session: Session = Depends(get_session)
)-> list[Report]:
    """
    登録済みのレポート全件をリスト形式で返します。
    データが存在しない場合は空のリスト [] を返します。
    """
    stm = select(Report).order_by(Report.created_at.desc())
    reports: list[Report] = session.exec(stm).all()
    return reports