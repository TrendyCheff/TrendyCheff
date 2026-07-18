import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu as MenuIcon, X, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const navigate = useNavigate();
  const { user, profile, isAdmin, signOut } = useAuth();

  const linkCls = ({ isActive }) =>
    `px-3 py-2 text-base font-semibold transition ${
      isActive ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
    }`;

  const handleSignOut = async () => {
    await signOut();
    setAccountOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur">
      <nav className="mx-auto grid max-w-7xl grid-cols-3 items-center px-4 py-3 sm:px-6">
        <Link
          to="/"
          className="
            flex items-center gap-1 justify-self-start
            text-3xl font-display font-bold tracking-tight
          "
        >
          <span className="text-gray-900">Trendy</span>
          <span className="text-primary-500">Cheff</span>
        </Link>

        <div
          className="
            hidden items-center gap-1 justify-self-center
            md:flex
          "
        >
          <NavLink to="/" end className={linkCls}>
            Home
          </NavLink>
          <NavLink to="/menu" className={linkCls}>
            Menu
          </NavLink>
          <a href="#about-chef" className={linkCls}>
            About the Chef
          </a>
          <NavLink to="/reviews" className={linkCls}>
            Reviews
          </NavLink>
        </div>

        <div className="flex items-center justify-self-end gap-2">
          <button
            onClick={() => navigate('/catering')}
            className="
              hidden rounded-lg bg-primary-500 px-6 py-2.5
              text-base font-semibold text-white shadow-sm
              transition hover:bg-primary-600
              md:block
            "
          >
            Order Now
          </button>

          {user ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setAccountOpen(!accountOpen)}
                className="
                  flex items-center gap-2 rounded-lg px-4 py-2.5
                  text-base font-semibold text-gray-700
                  hover:bg-gray-100
                "
              >
                <User size={18} />
                {profile?.full_name || user.email?.split('@')[0]}
              </button>
              {accountOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white shadow-lg ring-1 ring-gray-200 z-50">
                  <Link
                    to="/my-orders"
                    onClick={() => setAccountOpen(false)}
                    className="block px-4 py-2.5 text-sm hover:bg-gray-50"
                  >
                    My Orders
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setAccountOpen(false)}
                      className="block px-4 py-2.5 text-sm hover:bg-gray-50"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="
                      w-full text-left flex items-center gap-2 px-4 py-2.5
                      text-sm text-red-600 hover:bg-red-50
                    "
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/signin"
              className="
                hidden rounded-lg px-4 py-2.5
                text-base font-semibold text-gray-700
                hover:bg-gray-100
                md:block
              "
            >
              Sign In
            </Link>
          )}

          <button
            onClick={() => setOpen(!open)}
            className="text-gray-900 md:hidden"
          >
            {open ? <X size={26} /> : <MenuIcon size={26} />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="flex flex-col gap-1 px-4 py-3">
            <NavLink
              to="/"
              end
              onClick={() => setOpen(false)}
              className={linkCls}
            >
              Home
            </NavLink>
            <NavLink
              to="/menu"
              onClick={() => setOpen(false)}
              className={linkCls}
            >
              Menu
            </NavLink>
            <a
              href="#about-chef"
              onClick={() => setOpen(false)}
              className={linkCls}
            >
              About the Chef
            </a>
            <NavLink
              to="/reviews"
              onClick={() => setOpen(false)}
              className={linkCls}
            >
              Reviews
            </NavLink>
            {user ? (
              <>
                <NavLink
                  to="/my-orders"
                  onClick={() => setOpen(false)}
                  className={linkCls}
                >
                  My Orders
                </NavLink>
                {isAdmin && (
                  <NavLink
                    to="/admin"
                    onClick={() => setOpen(false)}
                    className={linkCls}
                  >
                    Admin Dashboard
                  </NavLink>
                )}
                <button
                  onClick={async () => {
                    await signOut();
                    setOpen(false);
                    navigate('/');
                  }}
                  className="
                    mt-2 rounded-lg border border-red-300 px-4 py-2.5
                    text-base font-semibold text-red-600
                  "
                >
                  Sign Out
                </button>
              </>
            ) : (
              <NavLink
                to="/signin"
                onClick={() => setOpen(false)}
                className={linkCls}
              >
                Sign In
              </NavLink>
            )}
            <button
              onClick={() => {
                setOpen(false);
                navigate('/catering');
              }}
              className="
                mt-2 rounded-lg bg-primary-500 px-6 py-2.5
                text-base font-semibold text-white
              "
            >
              Order Now
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
