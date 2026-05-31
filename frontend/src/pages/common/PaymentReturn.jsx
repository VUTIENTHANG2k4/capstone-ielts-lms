import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import api from '../../api/axios';

export default function PaymentReturn() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading|success|failed
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const qs = params.toString();
    api.get(`/payment/vnpay-return?${qs}`)
      .then(res => {
        if (res.data.success) { setStatus('success'); setMsg(res.data.message || 'Thanh toán thành công.'); }
        else { setStatus('failed'); setMsg(res.data.message || 'Thanh toán thất bại.'); }
      })
      .catch(err => { setStatus('failed'); setMsg(err.response?.data?.message || 'Có lỗi xảy ra'); });
  }, [params]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Đang xác nhận giao dịch...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h2>
            <p className="text-gray-500 mb-6">{msg}</p>
            <Link to="/student/my-packages" className="btn-primary">Xem gói của tôi</Link>
          </>
        )}
        {status === 'failed' && (
          <>
            <XCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán không thành công</h2>
            <p className="text-gray-500 mb-6">{msg}</p>
            <Link to="/student/packages" className="btn-primary">Thử lại</Link>
          </>
        )}
      </div>
    </div>
  );
}
