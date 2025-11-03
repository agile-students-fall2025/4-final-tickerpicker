// gives all the necessary routes
import React from "react";

import { Routes, Route, BrowserRouter } from "react-router-dom";
import TopNavbar from "./components/TopNavbar.jsx";
import LeftNavbar from "./components/LeftNavbar.jsx";

import { useAuth } from "./context/AuthContext.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";

import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import LogoutPage from "./pages/LogoutPage.jsx";
import WatchlistPage from "./pages/WatchlistPage.jsx";
import TickerPickerPage from "./pages/TickerPickerPage.jsx";
import StockPage from "./pages/StockPage.jsx";
// Here I wrote these just for the team's convenience. If screener and watchlist gets
//implemented and linked by routes then these can be commented out

export default function App() {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-tp-bg">
        <TopNavbar />{" "}
        {/* if want to have a pure login page, just comment this top navbar out */}
        <div className="flex flex-1 min-h-[calc(100vh-4rem)]">
          <div className="flex flex-1 max-w-6xl mx-auto w-full">
            <main className="flex-1 min-w-0 flex items-center justify-center">
              <div className="w-full max-w-md">
                <Routes>
                  {/* <Route path="/" element={<HomePage />} /> */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                </Routes>
              </div>
            </main>
          </div>
        </div>
        {/* <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">

                </main> */}
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col bg-tp-bg">
      <TopNavbar />
      <div className="flex flex-1 min-h-[calc(100vh-4rem)]">
        <div className="flex flex-1 max-w-6xl mx-auto w-full">
          <div className="flex w-40 shrink-0 border-r border-tp-border">
            <div className="pt-8 pt-6 pb-12">
              <LeftNavbar />
            </div>
          </div>
          <main className="flex-1 min-w-0 flex items-start justify-center">
            <div className="w-full px-20 py-20 justify-center items-center">
              <Routes>
                <Route
                  path="/home"
                  element={
                    <ProtectedRoute>
                      <HomePage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/watchlist"
                  element={
                    <ProtectedRoute>
                      <WatchlistPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <TickerPickerPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/logout"
                  element={
                    <ProtectedRoute>
                      <LogoutPage />
                    </ProtectedRoute>
                  }
                />

              <Route
                  path="/stock"
                  element={
                    <ProtectedRoute>
                      <StockPage />
                    </ProtectedRoute>
                  }
                />

              </Routes>
            </div>
          </main>
        </div>
      </div>
      {/* <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">
            </main> */}
    </div>
  );
}
