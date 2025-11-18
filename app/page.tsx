"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface ideasType {
  id: number;
  content: string;
  created_at: string;
}

const Home = () => {
  const [ideasData, setIdeasData] = useState<ideasType[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [firstLoading, setFirstLoading] = useState(true);

  useEffect(() => {
    const fetchIdeas = async () => {
      const { data, error } = await supabase
        .from("ideas")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("取得資料失敗:", error);
      } else {
        setFirstLoading(false);
        setIdeasData(data || []);
      }
    };

    fetchIdeas();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("ideas")
      .insert([{ content: input.trim() }])
      .select()
      .single();

    if (error) {
      console.error("新增失敗:", error);
    } else if (data) {
      setIdeasData((prev) => [data, ...prev]);
      setInput("");
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm("確定要刪除這筆想法嗎")) {
      const { error } = await supabase.from("ideas").delete().eq("id", id);

      if (error) {
        console.error("刪除失敗:", error);
        alert("刪除失敗，請再試一次");
      } else {
        setIdeasData((prev) => prev.filter((idea) => idea.id !== id));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-indigo-800 mb-10">
          留言版
        </h1>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="今天有什麼新想法？"
                disabled={loading}
                className="w-full max-w-lg px-6 py-4 text-lg border-2 border-indigo-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
              />
            </div>

            <div className="text-center">
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="cursor-pointer px-8 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-semibold text-lg rounded-xl shadow-md hover:from-indigo-600 hover:to-blue-700 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200"
              >
                {loading ? "送出中..." : "發布想法"}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          {ideasData.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-gray-500">
                {firstLoading
                  ? "載入中..."
                  : "還沒有任何想法，快來分享第一筆吧"}
              </p>
            </div>
          ) : (
            ideasData.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-indigo-50"
              >
                <div className="p-6">
                  <p className="text-lg text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {item.content}
                  </p>
                  <div className="mt-4 flex justify-between items-center">
                    <p className="text-sm text-indigo-500 font-medium">
                      {new Date(item.created_at).toLocaleString("zh-TW", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="cursor-pointer px-3 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold rounded-xl shadow-md hover:from-red-600 hover:to-rose-700 active:scale-95 transform transition-all duration-200 flex items-center gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      刪除
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
