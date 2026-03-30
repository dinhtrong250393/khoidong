import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'motion/react';
import { socket } from './socket';

interface SurveyData {
  mathOnly: number;
  literatureOnly: number;
  both: number;
}

export default function Dashboard() {
  const [data, setData] = useState<SurveyData>({
    mathOnly: 0,
    literatureOnly: 0,
    both: 0,
  });

  useEffect(() => {
    socket.on('survey-data', (newData: SurveyData) => {
      setData(newData);
    });

    return () => {
      socket.off('survey-data');
    };
  }, []);

  // Determine the correct public URL for the QR code
  let host = window.location.origin;
  
  // If the origin is aistudio (e.g. inside the editor iframe), it will require Google Auth and fail in Zalo.
  // We must use the public Cloud Run URL instead.
  if (!host.includes('run.app')) {
    if (process.env.APP_URL && process.env.APP_URL !== 'MY_APP_URL' && process.env.APP_URL.includes('run.app')) {
      host = process.env.APP_URL;
    } else {
      // Fallback to the known dev URL from the environment context
      host = 'https://ais-dev-osssqmxri7hw4gmxkuovni-617354947455.asia-east1.run.app';
    }
  }

  const surveyUrl = `${host}/survey`;

  const total = data.mathOnly + data.literatureOnly + data.both;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 font-sans">
      <h1 className="text-4xl font-bold text-slate-800 mb-2 text-center">
        Khảo sát sở thích học tập
      </h1>
      <p className="text-slate-500 mb-12 text-center">
        Quét mã QR để tham gia khảo sát. Kết quả sẽ được cập nhật trực tiếp.
      </p>

      <div className="flex flex-col lg:flex-row gap-8 items-stretch justify-center w-full max-w-7xl">
        {/* QR Code Section - Left Side */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center w-full lg:w-1/3">
          <h2 className="text-xl font-semibold text-slate-700 mb-6 text-center">Tham gia khảo sát</h2>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <QRCodeSVG value={surveyUrl} size={220} level="H" includeMargin />
          </div>
          <p className="mt-6 text-sm font-medium text-slate-500 uppercase tracking-wider text-center">
            Quét mã QR để bình chọn
          </p>
          <p className="mt-2 text-xs text-amber-600 text-center max-w-[200px] bg-amber-50 p-2 rounded-lg border border-amber-100">
            * Khuyên dùng Camera mặc định (Zalo có thể chặn kết nối)
          </p>
          <a
            href={surveyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 text-blue-500 hover:text-blue-600 underline text-sm text-center break-all"
          >
            {surveyUrl}
          </a>
        </div>

        {/* Venn Diagram Section - Center/Right */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex-1 flex flex-col items-center justify-center min-h-[500px]">
          <h2 className="text-2xl font-semibold text-slate-700 mb-2">
            Kết quả bình chọn
          </h2>
          <p className="text-slate-500 mb-8">Tổng số học sinh tham gia: <span className="font-bold text-slate-700">{total}</span></p>

          <div className="relative flex items-center justify-center w-full h-96 overflow-hidden">
            {/* Math Circle */}
            <motion.div
              animate={{ x: data.both > 0 ? -80 : -160 }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              className="absolute w-72 h-72 rounded-full bg-blue-400/60 mix-blend-multiply flex items-center justify-center border-2 border-blue-500 shadow-lg"
            >
              <div className="absolute left-12 flex flex-col items-center">
                <span className="text-xl font-bold text-blue-800 mb-1">Thích Toán</span>
                <span className="text-5xl font-black text-blue-900">
                  {data.mathOnly}
                </span>
              </div>
            </motion.div>

            {/* Literature Circle */}
            <motion.div
              animate={{ x: data.both > 0 ? 80 : 160 }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              className="absolute w-72 h-72 rounded-full bg-pink-400/60 mix-blend-multiply flex items-center justify-center border-2 border-pink-500 shadow-lg"
            >
              <div className="absolute right-12 flex flex-col items-center">
                <span className="text-xl font-bold text-pink-800 mb-1">Thích Văn</span>
                <span className="text-5xl font-black text-pink-900">
                  {data.literatureOnly}
                </span>
              </div>
            </motion.div>

            {/* Intersection */}
            {data.both > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.1 }}
                className="absolute z-10 flex flex-col items-center justify-center"
              >
                <span className="text-sm font-bold text-purple-900 bg-white/60 px-3 py-1 rounded-full backdrop-blur-sm mb-2 shadow-sm">
                  Thích cả 2
                </span>
                <span className="text-5xl font-black text-purple-900 drop-shadow-md">
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
