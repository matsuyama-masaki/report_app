from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db.session import get_session
from models.report import Report, ReportCreate, ReportUpdate

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

@router.delete(
    "/{report_id}",
    response_model=Report,
    summary="レポートの削除",
    response_description="削除成功メッセージ"
)
def delete_report(
    report_id: int,
    db: Session = Depends(get_session)
)-> Report:
    """
    指定された ID のレポートを物理削除します。
    """
    db_report = db.get(Report, report_id)
    if not db_report:
        # 存在しない ID だったら 404 エラーを返す
        raise HTTPException(status_code=404, detail="指定されたレポートが見つかりません。")
    
    db.delete(db_report)
    db.commit()
    return db_report

@router.patch(
    "/{report_id}", 
    response_model=Report,
    summary="レポートの部分更新",
    description="指定されたIDのレポートを更新します。送信されたフィールドのみが変更され、その他の値は保持されます。"
)
def update_report(
    report_id: int,
    report_in: ReportUpdate,
    session: Session = Depends(get_session)
) -> Report:
    """
    [処理詳細]
    1. 指定された ID のレポートが DB に存在するか確認。
    2. 存在しない場合は 404 HTTPException を送出。
    3. `model_dump(exclude_unset=True)` を使用し、リクエストに含まれる項目のみを抽出。
    4. 抽出したデータで既存の DB モデルを動的に更新（setattr）。
    5. 変更内容をコミットし、更新後のデータを返す。
    """
    # 既存のデータを取得
    db_report = session.get(Report, report_id)
    # 存在しない ID だったら 404 エラーを返す
    if not db_report:
        raise HTTPException(status_code=404, detail="指定されたレポートが見つかりません。")

    # 送られてきたデータのみを抽出
    update_data = report_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        # 既存のモデルオブジェクト(db_report)の各属性を動的に上書き
        setattr(db_report, key, value)

    # 保存して最新状態を返す
    session.add(db_report)
    session.commit()
    session.refresh(db_report)
    return db_report