import { useState, useEffect } from 'react';
import { socket } from './socket';

export default function Survey() {
  const [voted, setVoted] = useState(false);
  const [isZalo, setIsZalo] = useState(false);
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    // Detect Zalo browser
    if (/Zalo/i.test(navigator.userAgent)) {
      setIsZalo(true);
    }

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  const handleVote = (choice: 'math' | 'literature' | 'both') => {
    if (!isConnected) {
      alert('Chưa kết nối được tới máy chủ. Vui lòng bấm dấu 3 chấm (⋮) góc trên bên phải và chọn "Mở bằng trình duyệt" (Chrome/Safari) để bình chọn.');
      return;
    }
    socket.emit('vote', choice);
    setVoted(true);
  };

  if (voted) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Cảm ơn bạn!</h2>
          <p className="text-slate-500">
            Lựa chọn của bạn đã được ghi nhận vào hệ thống.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      {isZalo && (
        <div className="bg-amber-100 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl mb-6 max-w-md w-full text-sm shadow-sm">
          <p className="font-semibold mb-1">⚠️ Đang mở bằng Zalo</p>
          <p>Trình duyệt Zalo có thể chặn kết nối. Nếu không bấm được, vui lòng bấm nút <strong>3 chấm (⋮)</strong> ở góc trên bên phải và chọn <strong>"Mở bằng trình duyệt"</strong> (Chrome/Safari).</p>
        </div>
      )}

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 max-w-md w-full">
        <h1 className="text-2xl font-bold text-slate-800 mb-6 text-center">
          Khảo sát sở thích học tập
        </h1>
        <p className="text-slate-600 mb-8 text-center">
          Bạn thích học môn nào nhất? Hãy chọn một trong các phương án dưới đây.
        </p>

        <div className="space-y-4">
          <button
            onClick={() => handleVote('math')}
            className="w-full py-4 px-6 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-2xl transition-colors border border-blue-200 flex items-center justify-between group"
          >
            <span>Thích học môn Toán</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
          </button>

          <button
            onClick={() => handleVote('literature')}
            className="w-full py-4 px-6 bg-pink-50 hover:bg-pink-100 text-pink-700 font-semibold rounded-2xl transition-colors border border-pink-200 flex items-center justify-between group"
          >
            <span>Thích học môn Văn</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
          </button>

          <button
            onClick={() => handleVote('both')}
            className="w-full py-4 px-6 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold rounded-2xl transition-colors border border-purple-200 flex items-center justify-between group"
          >
            <span>Thích cả 2 môn Toán và Văn</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
          </button>
        </div>

        {!isConnected && (
          <p className="text-red-500 text-xs text-center mt-6 animate-pulse">
            Đang kết nối tới máy chủ... (Nếu quá lâu, hãy mở bằng Chrome/Safari)
          </p>
        )}
      </div>
    </div>
  );
}
