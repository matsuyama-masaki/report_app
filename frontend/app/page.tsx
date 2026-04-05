"use client";

import { useState, useEffect } from 'react';
import { Report } from "../types/report";

/**
 * [Component: ReportCard]
 * 各レポートをカード形式で表示するUIコンポーネントです。
 * データの「表示」に関するロジックをここにカプセル化しています。
 */
function ReportCard({ report }: { report: Report }) {
  return (
    <article className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
      <h2 className="text-xl font-bold text-blue-600 mb-3">{report.title}</h2>
      <p className="text-gray-700 leading-relaxed break-words whitespace-pre-wrap">{report.content}</p>
      
      {/* メタ情報エリア: 日付は日本時間(ja-JP)に変換して表示 */}
      <div className="mt-5 pt-4 border-t border-gray-50 flex items-center gap-6 text-sm text-gray-500">
        <span className="flex items-center gap-1 font-medium text-gray-700">👤 {report.author}</span>
        <span className="flex items-center gap-1">📅 {new Date(report.created_at).toLocaleString("ja-JP")}</span>
      </div>
    </article>
  );
}

/**
 * [Page: Home]
 * レポートの一覧表示と新規投稿を管理するメインページです。
 * フロントエンドの状態（State）管理とAPI通信を集約しています。
 */
export default function Home() {
  // --- States: フォーム入力と一覧データ ---
  const [reports, setReports] = useState<Report[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');

  /**
   * [API GET] サーバーからレポート一覧を取得
   * cache: 'no-store' を指定し、常に最新のDB状態をフェッチします。
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

  // コンポーネントのマウント時（初回表示時）にデータを取得
  useEffect(() => {
    fetchReports();
  }, []);

  /**
   * [API POST] レポートの新規投稿処理
   * フォーム送信時に実行され、完了後に一覧を再取得します。
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // ブラウザのデフォルトのページリロードを阻止

    try {
      const res = await fetch("http://localhost:8000/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, author }),
      });

      if (res.ok) {
        // 送信成功時にフォームを初期化し、一覧を最新の状態にする
        setTitle(''); 
        setContent(''); 
        setAuthor('');
        fetchReports();
      }
    } catch (error) {
      console.error("Failed to post report:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">📋 Report Dashboard</h1>
        <p className="text-gray-500 mt-2">業務進捗の共有と確認がリアルタイムに行えます</p>
      </header>

      {/* 投稿フォーム: 直感的に入力できるよう背景色を分けています */}
      <section className="mb-12 bg-gray-50 p-6 rounded-2xl border border-gray-200">
        <h2 className="text-lg font-bold mb-4 text-gray-800">✍️ 新規レポート投稿</h2>
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
            この内容で報告する
          </button>
        </form>
      </section>

      {/* レポート一覧表示エリア */}
      <main>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">最新の報告</h2>
        <div className="grid gap-6">
          {reports.length > 0 ? (
            reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))
          ) : (
            <p className="text-center text-gray-400 py-10">レポートはまだありません。</p>
          )}
        </div>
      </main>
    </div>
  );
}