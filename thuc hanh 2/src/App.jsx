import React, { useState } from "react";
import SearchForm from "./components/SearchForm.jsx";
import AddUser from "./components/AddUser.jsx";
import ResultTable from "./components/ResultTable.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import SearchSummary from "./components/SearchSummary.jsx";

export default function App() {
  const [keyword, setKeyword] = useState("");
  const [newUser, setNewUser] = useState(null);
  const [filteredCount, setFilteredCount] = useState(0); // ← state chia sẻ

  return (
    <div className="app-shell">
      <Header />

      <main className="app-main">
        <div className="app-content">
          {/* SearchForm CHỈ gọi setKeyword do App truyền xuống */}
          <SearchForm keyword={keyword} onChangeValue={setKeyword} />

          {/* SearchSummary CHỈ nhận dữ liệu từ App */}
          <SearchSummary
            keyword={keyword}
            filteredCount={filteredCount}
          />

          {/* AddUser CHỈ gọi setNewUser do App truyền xuống */}
          <AddUser onAdd={setNewUser} />

          {/* ResultTable:
              - đọc keyword, newUser
              - báo ngược lên App về số kết quả lọc */}
          <ResultTable
            keyword={keyword}
            newUser={newUser}
            onAdded={() => setNewUser(null)}
            onFilteredCountChange={setFilteredCount} // ← state lifting
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
