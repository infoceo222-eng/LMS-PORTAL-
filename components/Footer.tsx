
import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-slate-900 text-slate-400 py-8 px-6 mt-12">
      <div className="container mx-auto text-center">
        <p className="nastaliq text-lg mb-2">گورنمنٹ ہائی سکول چراغ دین والا قصور</p>
        <p className="text-sm">کاپی رائٹ © {currentYear} گورنمنٹ ہائی سکول چراغ دین والا آئی ٹی برانچ۔ تمام حقوق محفوظ ہیں۔</p>
        <div className="mt-4 flex justify-center gap-4 opacity-50">
          <span className="text-xs">LMS ورژن 1.0</span>
          <span>|</span>
          <span className="text-xs">تیار کردہ: آئی ٹی برانچ</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
