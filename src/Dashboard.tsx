import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { socket } from './socket';

interface SurveyData {
  mathOnly: number;
  literatureOnly: number;
  both: number;
  neither: number;
}

export default function Dashboard() {
  const [data, setData] = useState<SurveyData>({
    mathOnly: 0,
    literatureOnly: 0,
    both: 0,
    neither: 0,
  });
  const [voted, setVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    socket.on('survey-data', (newData: SurveyData) => {
      setData(newData);
    });

    return () => {
      socket.off('survey-data');
    };
  }, []);

  const handleVote = async (choice: 'math' | 'literature' | 'both' | 'neither') => {
    if (isVoting || voted) return;
    setIsVoting(true);
    try {
      await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ choice }),
      });
      setVoted(true);
    } catch (error) {
      alert('Có lỗi xảy ra khi gửi lựa chọn. Vui lòng thử lại.');
    } finally {
      setIsVoting(false);
    }
  };

  const total = data.mathOnly + data.literatureOnly + data.both + data.neither;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 font-sans">
      <h1 className="text-4xl font-bold text-slate-800 mb-2 text-center">
        Khảo sát sở thích học tập
      </h1>
      <p className="text-slate-500 mb-12 text-center">
        Hãy chọn môn học bạn yêu thích nhất.
      </p>

      <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-stretch justify-center w-full max-w-5xl">
        {/* Left Side: Voting */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col w-full lg:w-1/2">
          <h2 className="text-xl font-semibold text-slate-700 mb-6 text-center">Bạn thích môn nào?</h2>
          
          {voted ? (
            <div className="bg-green-50 border border-green-200 text-green-700 p-6 rounded-2xl text-center flex-1 flex flex-col justify-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-bold text-xl mb-2">Cảm ơn bạn!</p>
              <p className="text-sm">Lựa chọn của bạn đã được ghi nhận vào biểu đồ.</p>
            </div>
          ) : (
            <div className="space-y-4 flex-1 flex flex-col justify-center">
              <button
                onClick={() => handleVote('math')}
                disabled={isVoting}
                className="w-full py-4 px-6 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-xl transition-colors border border-blue-200 flex justify-between items-center disabled:opacity-50"
              >
                <span>Chỉ thích Toán</span><span>→</span>
              </button>
              <button
                onClick={() => handleVote('literature')}
                disabled={isVoting}
                className="w-full py-4 px-6 bg-pink-50 hover:bg-pink-100 text-pink-700 font-semibold rounded-xl transition-colors border border-pink-200 flex justify-between items-center disabled:opacity-50"
              >
                <span>Chỉ thích Văn</span><span>→</span>
              </button>
              <button
                onClick={() => handleVote('both')}
                disabled={isVoting}
                className="w-full py-4 px-6 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold rounded-xl transition-colors border border-purple-200 flex justify-between items-center disabled:opacity-50"
              >
                <span>Thích cả 2 môn</span><span>→</span>
              </button>
              <button
                onClick={() => handleVote('neither')}
                disabled={isVoting}
                className="w-full py-4 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors border border-slate-200 flex justify-between items-center disabled:opacity-50"
              >
                <span>Không thích cả 2</span><span>→</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Venn Diagram */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex-1 flex flex-col items-center justify-center w-full lg:w-1/2">
          <h2 className="text-2xl font-semibold text-slate-700 mb-2">
            Kết quả bình chọn
          </h2>
          <p className="text-slate-500 mb-8">Tổng số học sinh: <span className="font-bold text-slate-700">{total}</span></p>

          {/* The Universal Set (Square Box) */}
          <div className="relative w-full max-w-[500px] h-[350px] bg-slate-50 border-2 border-slate-300 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner">
            
            {/* Neither (Outside circles, inside square) */}
            <div className="absolute top-4 left-4 z-0">
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Không thích cả 2</span>
              <div className="text-3xl font-black text-slate-700 mt-1">{data.neither}</div>
            </div>

            {/* Math Circle */}
            <motion.div
              animate={{ x: data.both > 0 ? -50 : -120 }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              className="absolute w-48 h-48 sm:w-52 sm:h-52 rounded-full bg-blue-400/60 mix-blend-multiply flex items-center justify-center border-2 border-blue-500 shadow-sm"
            >
              <motion.div 
                animate={{ x: data.both > 0 ? -30 : 0 }}
                className="flex flex-col items-center"
              >
                <span className="text-base sm:text-lg font-bold text-blue-900 mb-1">Toán</span>
                <span className="text-3xl sm:text-4xl font-black text-blue-950">{data.mathOnly}</span>
              </motion.div>
            </motion.div>

            {/* Literature Circle */}
            <motion.div
              animate={{ x: data.both > 0 ? 50 : 120 }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              className="absolute w-48 h-48 sm:w-52 sm:h-52 rounded-full bg-pink-400/60 mix-blend-multiply flex items-center justify-center border-2 border-pink-500 shadow-sm"
            >
              <motion.div 
                animate={{ x: data.both > 0 ? 30 : 0 }}
                className="flex flex-col items-center"
              >
                <span className="text-base sm:text-lg font-bold text-pink-900 mb-1">Văn</span>
                <span className="text-3xl sm:text-4xl font-black text-pink-950">{data.literatureOnly}</span>
              </motion.div>
            </motion.div>

            {/* Intersection (Both) */}
            {data.both > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                className="absolute z-10 flex flex-col items-center justify-center pointer-events-none"
              >
                <span className="text-xs sm:text-sm font-bold text-purple-900 bg-white/60 px-2 py-0.5 rounded-full backdrop-blur-sm mb-1 shadow-sm">
                  Cả 2
                </span>
                <span className="text-3xl sm:text-4xl font-black text-purple-950 drop-shadow-md">
                  {data.both}
                </span>
              </motion.div>
            )}
          </div>

          <button
            onClick={() => socket.emit('reset')}
            className="mt-8 px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full text-sm font-medium transition-colors"
          >
            Làm mới dữ liệu
          </button>
        </div>
      </div>
    </div>
  );
}
