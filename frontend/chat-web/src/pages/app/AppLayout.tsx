import Header from "../../components/app/Header.tsx"
import Sidebar from "../../components/app/SideBar.tsx"
import ChatWindow from "../../components/app/ChatWindow.tsx"

const AppLayout = () => {
  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      <Header />
      <main className="flex flex-1 overflow-hidden">
        <Sidebar />
        <ChatWindow />
      </main>
    </div>
  )
}

export default AppLayout
