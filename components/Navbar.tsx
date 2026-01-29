
import React from 'react';
import { AuthState } from '../types';

interface NavbarProps {
  auth: AuthState;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ auth, onLogout }) => {
  return (
    <nav className="bg-emerald-800 text-white shadow-lg py-4 px-6">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
             <span className="text-emerald-800 font-bold text-xl">GHS</span>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold nastaliq">گورنمنٹ ہائی سکول چراغ دین والا، قصور</h1>
            <p className="text-sm opacity-80">تعلیم سب کے لیے</p>
          </div>
        </div>

        {auth.user && (
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-left">
              <p className="font-semibold">{auth.user.name}</p>
              <p className="text-xs opacity-75">
                {auth.user.role === 'ADMIN' ? 'ایڈمنسٹریٹر' : auth.user.role === 'TEACHER' ? 'استاد' : 'طالب علم'}
              </p>
            </div>
            <button 
              onClick={onLogout}
              className="bg-red-600 hover:bg-red-700 transition px-4 py-2 rounded-lg text-sm font-bold"
            >
              لاگ آؤٹ
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
