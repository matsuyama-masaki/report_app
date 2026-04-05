"use client";

import { useState, useEffect } from 'react';
import { Report } from "../types/report";

/**
 * [Component: ReportCard]
 * 各レポートをカード形式で表示するUIコンポーネント。
 */
function ReportCard({
  report,
  onDelete,
  onEdit
}: {
  report: Report,
  onDelete: (id: number) => void,
  onEdit: (report: Report) => void
}) {
  return (
    // groupクラス: 子要素のホバーイベントを制御するために親に付与
    <article className="group relative bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
      {/* 操作ボタンエリア: カード右上に配置 */}
      <div className="absolute top-4 right-4 flex gap-2">
        {/* ✎ 編集ボタン: opacity-0 で初期は隠し、親ホバー時に表示 */}
        <button 
          onClick={() => onEdit(report)}
          className="opacity-0 group-hover:opacity-100 bg-blue-50 hover:bg-blue-500 hover:text-white text-blue-500 p-2 rounded-lg transition-all"
          title="編集する"
        >
          ✎
        </button>
        {/* 🗑 削除ボタン */}
        <button 
          onClick={() => onDelete(report.id)}
          className="opacity-0 group-hover:opacity-100 bg-red-50 hover:bg-red-500 hover:text-white text-red-500 p-2 rounded-lg transition-all"
          title="削除する"
        >
          ✕
        </button>
      </div>

      <h2 className="text-xl font-bold text-blue-600 mb-3">{report.title}</h2>
      {/* whitespace-pre-wrap: 改行コードをそのまま表示に反映させる設定 */}
      <p className="text-gray-700 leading-relaxed break-words whitespace-pre-wrap">{report.content}</p>
      
      {/* メタ情報エリア: 日付と投稿者 */}
      <div className="mt-5 pt-4 border-t border-gray-50 flex items-center gap-6 text-sm text-gray-500">
        {/* 投稿者名 */}
        <span className="flex items-center gap-1 font-medium text-gray-700">👤 {report.author}</span>
        {/* 作成日時と更新日時が異なる場合（＝更新済み）は「更新」と表示 */}
        <span className="flex items-center gap-1">
          📅 {report.updated_at && report.updated_at !== report.created_at ? "更新: " : "作成: "}
          {/* 日付表示: バックエンドからJST（日本時間）の「生データ」を表示 */}
          {new Date(report.updated_at || report.created_at).toLocaleString("ja-JP")}
        </span>
      </div>
    </article>
  );
}

/**
 * [Page: Home]
 * メイン画面。状態管理とAPI通信を担当。
 */
export default function Home() {
  // --- States ---
  const [reports, setReports] = useState<Report[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  
  // 編集モード管理: 編集中のIDを保持。nullなら「新規作成モード」
  const [editingId, setEditingId] = useState<number | null>(null);

  /**
   * [API GET] レポート一覧取得
   */
  const fetchReports = async () => {
    try {
      const res = await fetch("http://localhost:8000/reports", { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    }
  };

  /**
   * [API DELETE] レポート削除
   */
  const handleDelete = async (id: number) => {
    if (!confirm("このレポートを削除してもよろしいですか？")) return;
    try {
      const res = await fetch(`http://localhost:8000/reports/${id}`, { method: "DELETE" });
      if (res.ok) fetchReports();
    } catch (error) {
      console.error("Failed to delete report:", error);
    }
  };

  /**
   * 編集モードへの切り替え
   * フォームに値をセットし、ユーザーが気づきやすいよう最上部へスクロール
   */
  const handleEdit = (report: Report) => {
    setEditingId(report.id);
    setTitle(report.title);
    setContent(report.content);
    setAuthor(report.author);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * フォームのリセット (新規投稿状態に戻す)
   */
  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setAuthor('');
  };

  // 初回レンダリング時に一覧を取得
  useEffect(() => {
    fetchReports();
  }, []);

  /**
   * [API POST/PATCH] フォーム送信処理
   */
  const handleSubmit = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();

    // 編集モードの有無でURLとメソッドを動的に切り替え
    const url = editingId 
      ? `http://localhost:8000/reports/${editingId}` 
      : "http://localhost:8000/reports";
    const method = editingId ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, author }),
      });

      if (res.ok) {
        resetForm();
        fetchReports();
      }
    } catch (error) {
      console.error("Failed to post report:", error);
    }
  };

  return (
    /* [最外周のdiv] 
       onClick: 編集モード中に背景をクリックしたらキャンセルする役割。
    */
    <div
      className="min-h-screen bg-gray-50"
      onClick={() => {
        if (editingId) resetForm();
      }}
    >
      {/* [コンテンツ・ラッパー]
         max-w-4xl: コンテンツ幅を制限して中央寄せ
         stopPropagation: ここをクリックしても親の「キャンセル処理」が動かないようにブロック
      */}
      <div 
        className="max-w-4xl mx-auto px-6 py-12"
        onClick={(e) => e.stopPropagation()} 
      >
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">📋 Report Dashboard</h1>
          <p className="text-gray-500 mt-2">業務進捗の共有と確認がリアルタイムに行えます</p>
        </header>

        {/* 入力フォームセクション */}
        <section className="mb-12 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold mb-4 text-gray-800">
            {editingId ? "📝 レポートを編集" : "✍️ 新規レポート投稿"}
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input 
              className="p-3 rounded-lg border focus:ring-2 focus:ring-blue-400 outline-none transition-all" 
              placeholder="レポートタイトル" 
              value={title} onChange={(e) => setTitle(e.target.value)} required 
            />
            <input 
              className="p-3 rounded-lg border focus:ring-2 focus:ring-blue-400 outline-none transition-all" 
              placeholder="投稿者名" 
              value={author} onChange={(e) => setAuthor(e.target.value)} required 
            />
            <textarea 
              className="p-3 rounded-lg border h-24 focus:ring-2 focus:ring-blue-400 outline-none transition-all" 
              placeholder="業務内容や詳細を入力してください" 
              value={content} onChange={(e) => setContent(e.target.value)} required 
            />
            <button 
              type="submit" 
              className="bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-md shadow-blue-100"
            >
              {editingId ? "この内容で更新する" : "この内容で報告する"}
            </button>
          </form>
        </section>

        {/* レポート一覧表示メインエリア */}
        <main>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">最新の報告</h2>
          <div className="grid gap-6">
            {reports.length > 0 ? (
              reports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))
            ) : (
              <p className="text-center text-gray-400 py-10">レポートはまだありません。</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}